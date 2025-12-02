using Merchello.Core.Payments.Models;
using Merchello.Core.Payments.Providers;
using Merchello.Core.Payments.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Merchello.Controllers;

/// <summary>
/// Public controller for receiving payment provider webhooks
/// </summary>
[ApiController]
[Route("umbraco/merchello/webhooks/payments")]
[AllowAnonymous]
public class PaymentWebhookController : ControllerBase
{
    private readonly IPaymentProviderManager _providerManager;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentWebhookController> _logger;

    public PaymentWebhookController(
        IPaymentProviderManager providerManager,
        IPaymentService paymentService,
        ILogger<PaymentWebhookController> logger)
    {
        _providerManager = providerManager;
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>
    /// Receive webhook from payment provider
    /// </summary>
    [HttpPost("{providerAlias}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> HandleWebhook(
        string providerAlias,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Received webhook for provider: {Provider}", providerAlias);

        // Get the provider
        var registeredProvider = await _providerManager.GetProviderAsync(
            providerAlias,
            requireEnabled: false, // Allow webhooks even if provider is disabled
            cancellationToken);

        if (registeredProvider == null)
        {
            _logger.LogWarning("Webhook received for unknown provider: {Provider}", providerAlias);
            return NotFound($"Provider '{providerAlias}' not found.");
        }

        // Read the raw body
        string payload;
        using (var reader = new StreamReader(Request.Body))
        {
            payload = await reader.ReadToEndAsync(cancellationToken);
        }

        if (string.IsNullOrEmpty(payload))
        {
            _logger.LogWarning("Empty webhook payload received for provider: {Provider}", providerAlias);
            return BadRequest("Empty payload.");
        }

        // Extract headers
        var headers = Request.Headers
            .ToDictionary(
                h => h.Key,
                h => h.Value.ToString(),
                StringComparer.OrdinalIgnoreCase);

        // Validate webhook signature
        bool isValid;
        try
        {
            isValid = await registeredProvider.Provider.ValidateWebhookAsync(payload, headers, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating webhook signature for provider: {Provider}", providerAlias);
            return BadRequest("Webhook validation failed.");
        }

        if (!isValid)
        {
            _logger.LogWarning("Invalid webhook signature for provider: {Provider}", providerAlias);
            return BadRequest("Invalid webhook signature.");
        }

        // Process the webhook
        WebhookProcessingResult result;
        try
        {
            result = await registeredProvider.Provider.ProcessWebhookAsync(payload, headers, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook for provider: {Provider}", providerAlias);
            return BadRequest("Webhook processing failed.");
        }

        if (!result.Success)
        {
            _logger.LogWarning(
                "Webhook processing failed for provider: {Provider}. Error: {Error}",
                providerAlias,
                result.ErrorMessage);
            return BadRequest(result.ErrorMessage);
        }

        if (result.AlreadyProcessed)
        {
            _logger.LogInformation(
                "Webhook already processed for provider: {Provider}, TransactionId: {TransactionId}",
                providerAlias,
                result.TransactionId);
            return Ok(new { message = "Already processed" });
        }

        // Handle the event based on type
        await HandleWebhookEventAsync(providerAlias, result, cancellationToken);

        _logger.LogInformation(
            "Webhook processed successfully for provider: {Provider}, Event: {Event}, TransactionId: {TransactionId}",
            providerAlias,
            result.EventType,
            result.TransactionId);

        return Ok(new { message = "Webhook processed", eventType = result.EventType?.ToString() });
    }

    private async Task HandleWebhookEventAsync(
        string providerAlias,
        WebhookProcessingResult result,
        CancellationToken cancellationToken)
    {
        switch (result.EventType)
        {
            case WebhookEventType.PaymentCompleted:
                if (result.InvoiceId.HasValue && !string.IsNullOrEmpty(result.TransactionId) && result.Amount.HasValue)
                {
                    // Check if payment already exists (idempotency)
                    var existingPayment = await _paymentService.GetPaymentByTransactionIdAsync(
                        result.TransactionId,
                        cancellationToken);

                    if (existingPayment == null)
                    {
                        await _paymentService.RecordPaymentAsync(
                            result.InvoiceId.Value,
                            providerAlias,
                            result.TransactionId,
                            result.Amount.Value,
                            $"Payment via {providerAlias} webhook",
                            null,
                            cancellationToken);

                        _logger.LogInformation(
                            "Payment recorded from webhook: InvoiceId={InvoiceId}, Amount={Amount}, TransactionId={TransactionId}",
                            result.InvoiceId,
                            result.Amount,
                            result.TransactionId);
                    }
                    else
                    {
                        _logger.LogInformation(
                            "Payment already exists for TransactionId={TransactionId}",
                            result.TransactionId);
                    }
                }
                break;

            case WebhookEventType.PaymentFailed:
                _logger.LogWarning(
                    "Payment failed event received: InvoiceId={InvoiceId}, TransactionId={TransactionId}",
                    result.InvoiceId,
                    result.TransactionId);
                // Could update invoice status or send notification
                break;

            case WebhookEventType.PaymentCancelled:
                _logger.LogInformation(
                    "Payment cancelled event received: InvoiceId={InvoiceId}, TransactionId={TransactionId}",
                    result.InvoiceId,
                    result.TransactionId);
                break;

            case WebhookEventType.RefundCompleted:
                _logger.LogInformation(
                    "Refund completed event received: TransactionId={TransactionId}, Amount={Amount}",
                    result.TransactionId,
                    result.Amount);
                // Refunds are typically initiated from backoffice, so already recorded
                break;

            case WebhookEventType.DisputeOpened:
                _logger.LogWarning(
                    "Dispute opened event received: TransactionId={TransactionId}",
                    result.TransactionId);
                // Could send notification or update status
                break;

            case WebhookEventType.DisputeResolved:
                _logger.LogInformation(
                    "Dispute resolved event received: TransactionId={TransactionId}",
                    result.TransactionId);
                break;

            case WebhookEventType.Unknown:
            default:
                _logger.LogDebug(
                    "Unknown webhook event type received from {Provider}",
                    providerAlias);
                break;
        }
    }
}


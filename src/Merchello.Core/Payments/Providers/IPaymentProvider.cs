using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Merchello.Core.Payments.Models;

namespace Merchello.Core.Payments.Providers;

/// <summary>
/// Contract that payment provider plugins must implement.
/// </summary>
public interface IPaymentProvider
{
    /// <summary>
    /// Provider metadata - alias is immutable and set on the class.
    /// </summary>
    PaymentProviderMetadata Metadata { get; }

    /// <summary>
    /// Get the configuration fields required by this provider (for UI).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Field definitions for dynamic configuration UI.</returns>
    ValueTask<IEnumerable<PaymentProviderConfigurationField>> GetConfigurationFieldsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Configure the provider with saved settings.
    /// </summary>
    /// <param name="configuration">The stored configuration (if any).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    ValueTask ConfigureAsync(
        PaymentProviderConfiguration? configuration,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Initiate a payment - returns redirect URL for hosted checkout.
    /// </summary>
    /// <param name="request">Payment request details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result containing redirect URL or error information.</returns>
    Task<PaymentInitiationResult> InitiatePaymentAsync(
        PaymentRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Capture an authorized payment (for auth-then-capture flow).
    /// </summary>
    /// <param name="transactionId">The transaction ID to capture.</param>
    /// <param name="amount">Optional amount to capture (for partial capture).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result of the capture operation.</returns>
    Task<PaymentCaptureResult> CapturePaymentAsync(
        string transactionId,
        decimal? amount = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Process a refund.
    /// </summary>
    /// <param name="request">Refund request details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result of the refund operation.</returns>
    Task<RefundResult> RefundPaymentAsync(
        RefundRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate an incoming webhook signature.
    /// </summary>
    /// <param name="payload">Raw webhook payload.</param>
    /// <param name="headers">HTTP headers from the webhook request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the webhook signature is valid.</returns>
    Task<bool> ValidateWebhookAsync(
        string payload,
        IDictionary<string, string> headers,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Process a validated webhook payload.
    /// </summary>
    /// <param name="payload">Raw webhook payload.</param>
    /// <param name="headers">HTTP headers from the webhook request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result of webhook processing.</returns>
    Task<WebhookProcessingResult> ProcessWebhookAsync(
        string payload,
        IDictionary<string, string> headers,
        CancellationToken cancellationToken = default);
}


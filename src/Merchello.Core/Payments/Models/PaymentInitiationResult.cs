namespace Merchello.Core.Payments.Models;

/// <summary>
/// Result of initiating a payment.
/// </summary>
public class PaymentInitiationResult
{
    /// <summary>
    /// Whether the initiation was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// URL to redirect the customer to for payment.
    /// Only set if Success is true and provider uses redirect checkout.
    /// </summary>
    public string? RedirectUrl { get; init; }

    /// <summary>
    /// Transaction ID from the payment provider.
    /// </summary>
    public string? TransactionId { get; init; }

    /// <summary>
    /// Client secret for client-side payment confirmation (e.g., Stripe Elements).
    /// </summary>
    public string? ClientSecret { get; init; }

    /// <summary>
    /// Error message if Success is false.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Error code from the payment provider.
    /// </summary>
    public string? ErrorCode { get; init; }

    /// <summary>
    /// Creates a successful result with a redirect URL.
    /// </summary>
    public static PaymentInitiationResult SuccessWithRedirect(string redirectUrl, string? transactionId = null) => new()
    {
        Success = true,
        RedirectUrl = redirectUrl,
        TransactionId = transactionId
    };

    /// <summary>
    /// Creates a successful result with a client secret (for embedded checkout).
    /// </summary>
    public static PaymentInitiationResult SuccessWithClientSecret(string clientSecret, string transactionId) => new()
    {
        Success = true,
        ClientSecret = clientSecret,
        TransactionId = transactionId
    };

    /// <summary>
    /// Creates a failure result.
    /// </summary>
    public static PaymentInitiationResult Failure(string errorMessage, string? errorCode = null) => new()
    {
        Success = false,
        ErrorMessage = errorMessage,
        ErrorCode = errorCode
    };
}


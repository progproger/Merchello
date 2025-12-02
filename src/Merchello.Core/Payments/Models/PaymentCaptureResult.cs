namespace Merchello.Core.Payments.Models;

/// <summary>
/// Result of capturing an authorized payment.
/// </summary>
public class PaymentCaptureResult
{
    /// <summary>
    /// Whether the capture was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Transaction ID of the capture.
    /// </summary>
    public string? TransactionId { get; init; }

    /// <summary>
    /// Amount that was captured.
    /// </summary>
    public decimal? AmountCaptured { get; init; }

    /// <summary>
    /// Error message if Success is false.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Error code from the payment provider.
    /// </summary>
    public string? ErrorCode { get; init; }

    /// <summary>
    /// Creates a successful capture result.
    /// </summary>
    public static PaymentCaptureResult Successful(string transactionId, decimal amount) => new()
    {
        Success = true,
        TransactionId = transactionId,
        AmountCaptured = amount
    };

    /// <summary>
    /// Creates a failure result.
    /// </summary>
    public static PaymentCaptureResult Failure(string errorMessage, string? errorCode = null) => new()
    {
        Success = false,
        ErrorMessage = errorMessage,
        ErrorCode = errorCode
    };
}


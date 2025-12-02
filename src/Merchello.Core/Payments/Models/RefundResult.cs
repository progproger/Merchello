namespace Merchello.Core.Payments.Models;

/// <summary>
/// Result of processing a refund.
/// </summary>
public class RefundResult
{
    /// <summary>
    /// Whether the refund was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Refund transaction ID from the payment provider.
    /// </summary>
    public string? RefundTransactionId { get; init; }

    /// <summary>
    /// Amount that was refunded.
    /// </summary>
    public decimal? AmountRefunded { get; init; }

    /// <summary>
    /// Error message if Success is false.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Error code from the payment provider.
    /// </summary>
    public string? ErrorCode { get; init; }

    /// <summary>
    /// Creates a successful refund result.
    /// </summary>
    public static RefundResult Successful(string refundTransactionId, decimal amount) => new()
    {
        Success = true,
        RefundTransactionId = refundTransactionId,
        AmountRefunded = amount
    };

    /// <summary>
    /// Creates a failure result.
    /// </summary>
    public static RefundResult Failure(string errorMessage, string? errorCode = null) => new()
    {
        Success = false,
        ErrorMessage = errorMessage,
        ErrorCode = errorCode
    };
}


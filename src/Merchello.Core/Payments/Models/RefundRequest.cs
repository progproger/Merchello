namespace Merchello.Core.Payments.Models;

/// <summary>
/// Request model for processing a refund.
/// </summary>
public class RefundRequest
{
    /// <summary>
    /// The original payment ID to refund.
    /// </summary>
    public required Guid PaymentId { get; init; }

    /// <summary>
    /// The transaction ID from the payment provider.
    /// </summary>
    public required string TransactionId { get; init; }

    /// <summary>
    /// Amount to refund. If null, refunds the full amount.
    /// </summary>
    public decimal? Amount { get; init; }

    /// <summary>
    /// Reason for the refund.
    /// </summary>
    public string? Reason { get; init; }

    /// <summary>
    /// Additional metadata to pass to the payment provider.
    /// </summary>
    public Dictionary<string, string>? Metadata { get; init; }
}


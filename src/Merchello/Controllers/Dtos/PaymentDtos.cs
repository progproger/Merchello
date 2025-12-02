using Merchello.Core.Payments.Models;

namespace Merchello.Controllers.Dtos;

/// <summary>
/// Payment record DTO
/// </summary>
public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentProviderAlias { get; set; }
    public PaymentType PaymentType { get; set; }
    public string? TransactionId { get; set; }
    public string? Description { get; set; }
    public bool PaymentSuccess { get; set; }
    public string? RefundReason { get; set; }
    public Guid? ParentPaymentId { get; set; }
    public DateTime DateCreated { get; set; }

    /// <summary>
    /// Child refund payments (if any)
    /// </summary>
    public List<PaymentDto>? Refunds { get; set; }

    /// <summary>
    /// Calculated refundable amount (original amount minus existing refunds)
    /// </summary>
    public decimal RefundableAmount { get; set; }
}

/// <summary>
/// Invoice payment status response
/// </summary>
public class PaymentStatusDto
{
    public Guid InvoiceId { get; set; }
    public InvoicePaymentStatus Status { get; set; }
    public string StatusDisplay { get; set; } = string.Empty;
    public decimal InvoiceTotal { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalRefunded { get; set; }
    public decimal NetPayment { get; set; }
    public decimal BalanceDue { get; set; }
}

/// <summary>
/// Request to record a manual/offline payment
/// </summary>
public class RecordManualPaymentDto
{
    /// <summary>
    /// Payment amount
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Payment method description (e.g., "Cash", "Check", "Bank Transfer")
    /// </summary>
    public required string PaymentMethod { get; set; }

    /// <summary>
    /// Optional description/notes
    /// </summary>
    public string? Description { get; set; }
}

/// <summary>
/// Request to process a refund
/// </summary>
public class ProcessRefundDto
{
    /// <summary>
    /// Amount to refund. If null or 0, refunds the full refundable amount.
    /// </summary>
    public decimal? Amount { get; set; }

    /// <summary>
    /// Reason for the refund (required)
    /// </summary>
    public required string Reason { get; set; }

    /// <summary>
    /// If true, records a manual refund without calling the provider.
    /// Use when refund has already been processed externally.
    /// </summary>
    public bool IsManualRefund { get; set; }
}

/// <summary>
/// Request to initiate a payment
/// </summary>
public class InitiatePaymentDto
{
    /// <summary>
    /// The payment provider alias to use
    /// </summary>
    public required string ProviderAlias { get; set; }

    /// <summary>
    /// URL to redirect to after successful payment
    /// </summary>
    public required string ReturnUrl { get; set; }

    /// <summary>
    /// URL to redirect to if payment is cancelled
    /// </summary>
    public required string CancelUrl { get; set; }
}

/// <summary>
/// Response from payment initiation
/// </summary>
public class PaymentInitiationResponseDto
{
    /// <summary>
    /// Whether the initiation was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// URL to redirect customer to for payment
    /// </summary>
    public string? RedirectUrl { get; set; }

    /// <summary>
    /// Transaction ID from the payment provider
    /// </summary>
    public string? TransactionId { get; set; }

    /// <summary>
    /// Client secret for embedded checkout (e.g., Stripe Elements)
    /// </summary>
    public string? ClientSecret { get; set; }

    /// <summary>
    /// Error message if not successful
    /// </summary>
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Payment method available for checkout
/// </summary>
public class PaymentMethodDto
{
    public required string Alias { get; set; }
    public required string DisplayName { get; set; }
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public bool UsesRedirectCheckout { get; set; }
    public int SortOrder { get; set; }
}

/// <summary>
/// Query parameters for payment return/cancel handling
/// </summary>
public class PaymentReturnQuery
{
    /// <summary>
    /// Invoice ID
    /// </summary>
    public Guid? InvoiceId { get; set; }

    /// <summary>
    /// Transaction ID from the provider
    /// </summary>
    public string? TransactionId { get; set; }

    /// <summary>
    /// Session ID (provider-specific)
    /// </summary>
    public string? SessionId { get; set; }

    /// <summary>
    /// Provider alias
    /// </summary>
    public string? Provider { get; set; }
}

/// <summary>
/// Payment return/cancel response
/// </summary>
public class PaymentReturnResponseDto
{
    /// <summary>
    /// Whether the payment was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Status message
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Invoice ID if available
    /// </summary>
    public Guid? InvoiceId { get; set; }

    /// <summary>
    /// Payment ID if payment was recorded
    /// </summary>
    public Guid? PaymentId { get; set; }
}


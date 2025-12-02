namespace Merchello.Core.Payments.Models;

/// <summary>
/// Payment status of an invoice, calculated from payment records.
/// </summary>
public enum InvoicePaymentStatus
{
    /// <summary>
    /// No payments have been made.
    /// </summary>
    Unpaid = 0,

    /// <summary>
    /// Customer has been redirected to payment gateway but not yet returned.
    /// </summary>
    AwaitingPayment = 10,

    /// <summary>
    /// Some payment has been received but less than the invoice total.
    /// </summary>
    PartiallyPaid = 20,

    /// <summary>
    /// Invoice has been fully paid.
    /// </summary>
    Paid = 30,

    /// <summary>
    /// Invoice was paid but has been partially refunded.
    /// </summary>
    PartiallyRefunded = 40,

    /// <summary>
    /// Invoice was paid but has been fully refunded.
    /// </summary>
    Refunded = 50
}


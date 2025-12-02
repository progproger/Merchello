namespace Merchello.Core.Payments.Models;

/// <summary>
/// Type of payment record.
/// </summary>
public enum PaymentType
{
    /// <summary>
    /// A standard payment (positive amount).
    /// </summary>
    Payment = 0,

    /// <summary>
    /// A full refund (negative amount).
    /// </summary>
    Refund = 10,

    /// <summary>
    /// A partial refund (negative amount, less than original payment).
    /// </summary>
    PartialRefund = 20
}


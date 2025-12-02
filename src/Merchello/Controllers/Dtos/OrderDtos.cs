using Merchello.Core.Accounting.Models;

namespace Merchello.Controllers.Dtos;

/// <summary>
/// Order list item for the orders grid view
/// </summary>
public class OrderListItemDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime DateCreated { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string FulfillmentStatus { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public string DeliveryStatus { get; set; } = string.Empty;
    public string DeliveryMethod { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
}

/// <summary>
/// Full order detail for the order detail view
/// </summary>
public class OrderDetailDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime DateCreated { get; set; }
    public string Channel { get; set; } = string.Empty;

    // Financial
    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public decimal AmountPaid { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string FulfillmentStatus { get; set; } = string.Empty;

    // Addresses
    public AddressDto? BillingAddress { get; set; }
    public AddressDto? ShippingAddress { get; set; }

    // Orders (fulfillment units)
    public List<FulfillmentOrderDto> Orders { get; set; } = new();

    // Timeline/Notes
    public List<InvoiceNoteDto> Notes { get; set; } = new();
}

/// <summary>
/// Address DTO for billing/shipping addresses
/// </summary>
public class AddressDto
{
    public string? Name { get; set; }
    public string? Company { get; set; }
    public string? AddressOne { get; set; }
    public string? AddressTwo { get; set; }
    public string? TownCity { get; set; }
    public string? CountyState { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? CountryCode { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

/// <summary>
/// Fulfillment order (warehouse-level order)
/// </summary>
public class FulfillmentOrderDto
{
    public Guid Id { get; set; }
    public OrderStatus Status { get; set; }
    public List<LineItemDto> LineItems { get; set; } = new();
    public List<ShipmentDto> Shipments { get; set; } = new();
    public string DeliveryMethod { get; set; } = string.Empty;
    public decimal ShippingCost { get; set; }
}

/// <summary>
/// Line item DTO
/// </summary>
public class LineItemDto
{
    public Guid Id { get; set; }
    public string? Sku { get; set; }
    public string? Name { get; set; }
    public int Quantity { get; set; }
    public decimal Amount { get; set; }
    public decimal? OriginalAmount { get; set; }
    public string? ImageUrl { get; set; }
}

/// <summary>
/// Shipment DTO
/// </summary>
public class ShipmentDto
{
    public Guid Id { get; set; }
    public string? TrackingNumber { get; set; }
    public string? TrackingUrl { get; set; }
    public string? Carrier { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
}

/// <summary>
/// Invoice note DTO for timeline
/// </summary>
public class InvoiceNoteDto
{
    public DateTime Date { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? Author { get; set; }
}

/// <summary>
/// Paginated response for order list
/// </summary>
public class OrderListResponse
{
    public List<OrderListItemDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
}

/// <summary>
/// Query parameters for order list
/// </summary>
public class OrderListQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public string? Status { get; set; }
    public string? PaymentStatus { get; set; }
    public string? FulfillmentStatus { get; set; }
    public string? Search { get; set; }
    public string SortBy { get; set; } = "date";
    public string SortDir { get; set; } = "desc";
}

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
/// Order statistics for dashboard
/// </summary>
public class OrderStatsDto
{
    public int OrdersToday { get; set; }
    public int ItemsOrderedToday { get; set; }
    public int OrdersFulfilledToday { get; set; }
    public int OrdersDeliveredToday { get; set; }
}

/// <summary>
/// Dashboard statistics with monthly metrics and percentage changes
/// </summary>
public class DashboardStatsDto
{
    public int OrdersThisMonth { get; set; }
    public decimal OrdersChangePercent { get; set; }

    public decimal RevenueThisMonth { get; set; }
    public decimal RevenueChangePercent { get; set; }

    public int ProductCount { get; set; }
    public int ProductCountChange { get; set; }

    public int CustomerCount { get; set; }
    public int CustomerCountChange { get; set; }
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

// ============================================
// Fulfillment DTOs
// ============================================

/// <summary>
/// Request to create a new shipment
/// </summary>
public class CreateShipmentRequestDto
{
    /// <summary>
    /// Line items to include in shipment. Key: LineItemId, Value: Quantity
    /// </summary>
    public Dictionary<Guid, int> LineItems { get; set; } = new();

    /// <summary>
    /// Carrier name (e.g., "UPS", "FedEx", "DHL")
    /// </summary>
    public string? Carrier { get; set; }

    /// <summary>
    /// Tracking number for the shipment
    /// </summary>
    public string? TrackingNumber { get; set; }

    /// <summary>
    /// URL to track the shipment
    /// </summary>
    public string? TrackingUrl { get; set; }
}

/// <summary>
/// Request to update shipment tracking info
/// </summary>
public class UpdateShipmentRequestDto
{
    public string? Carrier { get; set; }
    public string? TrackingNumber { get; set; }
    public string? TrackingUrl { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
}

/// <summary>
/// Summary of fulfillment state for the entire invoice (used in fulfillment dialog)
/// </summary>
public class FulfillmentSummaryDto
{
    public Guid InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string OverallStatus { get; set; } = "Unfulfilled"; // Unfulfilled, Partial, Fulfilled
    public List<OrderFulfillmentDto> Orders { get; set; } = new();
}

/// <summary>
/// Order fulfillment state showing shipped vs unshipped items
/// </summary>
public class OrderFulfillmentDto
{
    public Guid OrderId { get; set; }
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public string DeliveryMethod { get; set; } = string.Empty;
    public List<FulfillmentLineItemDto> LineItems { get; set; } = new();
    public List<ShipmentDetailDto> Shipments { get; set; } = new();
}

/// <summary>
/// Line item with fulfillment quantities
/// </summary>
public class FulfillmentLineItemDto
{
    public Guid Id { get; set; }
    public string? Sku { get; set; }
    public string? Name { get; set; }
    public int OrderedQuantity { get; set; }
    public int ShippedQuantity { get; set; }
    public int RemainingQuantity => OrderedQuantity - ShippedQuantity;
    public string? ImageUrl { get; set; }
    public decimal Amount { get; set; }
}

/// <summary>
/// Full shipment details for display
/// </summary>
public class ShipmentDetailDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string? Carrier { get; set; }
    public string? TrackingNumber { get; set; }
    public string? TrackingUrl { get; set; }
    public DateTime DateCreated { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public List<ShipmentLineItemDto> LineItems { get; set; } = new();
}

/// <summary>
/// Line item within a shipment
/// </summary>
public class ShipmentLineItemDto
{
    public Guid Id { get; set; }
    public Guid LineItemId { get; set; }
    public string? Sku { get; set; }
    public string? Name { get; set; }
    public int Quantity { get; set; }
    public string? ImageUrl { get; set; }
}

// Order types matching the API DTOs

export interface OrderListItemDto {
  id: string;
  invoiceNumber: string;
  dateCreated: string;
  customerName: string;
  channel: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  itemCount: number;
  deliveryStatus: string;
  deliveryMethod: string;
  tags: string[];
}

export interface OrderDetailDto {
  id: string;
  invoiceNumber: string;
  dateCreated: string;
  channel: string;
  subTotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  amountPaid: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  billingAddress: AddressDto | null;
  shippingAddress: AddressDto | null;
  orders: FulfillmentOrderDto[];
  notes: InvoiceNoteDto[];
}

export interface AddressDto {
  name: string | null;
  company: string | null;
  addressOne: string | null;
  addressTwo: string | null;
  townCity: string | null;
  countyState: string | null;
  postalCode: string | null;
  country: string | null;
  countryCode: string | null;
  email: string | null;
  phone: string | null;
}

export interface FulfillmentOrderDto {
  id: string;
  status: OrderStatus;
  lineItems: LineItemDto[];
  shipments: ShipmentDto[];
  deliveryMethod: string;
  shippingCost: number;
}

export interface LineItemDto {
  id: string;
  sku: string | null;
  name: string | null;
  quantity: number;
  amount: number;
  originalAmount: number | null;
  imageUrl: string | null;
}

export interface ShipmentDto {
  id: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  carrier: string | null;
  actualDeliveryDate: string | null;
}

export interface InvoiceNoteDto {
  date: string;
  text: string;
  author: string | null;
}

export interface OrderListResponse {
  items: OrderListItemDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface OrderStatsDto {
  ordersToday: number;
  itemsOrderedToday: number;
  ordersFulfilledToday: number;
  ordersDeliveredToday: number;
}

export interface DashboardStatsDto {
  ordersThisMonth: number;
  ordersChangePercent: number;
  revenueThisMonth: number;
  revenueChangePercent: number;
  productCount: number;
  productCountChange: number;
  customerCount: number;
  customerCountChange: number;
}

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}

export enum OrderStatus {
  Pending = 0,
  AwaitingStock = 10,
  ReadyToFulfill = 20,
  Processing = 30,
  PartiallyShipped = 40,
  Shipped = 50,
  Completed = 60,
  Cancelled = 70,
  OnHold = 80,
}

// Entity types for workspace routing
export const MERCHELLO_ORDERS_ENTITY_TYPE = "merchello-orders";
export const MERCHELLO_ORDER_ENTITY_TYPE = "merchello-order";

// ============================================
// Fulfillment Types
// ============================================

/** Request to create a new shipment */
export interface CreateShipmentRequest {
  /** Line items to include in shipment. Key: LineItemId, Value: Quantity */
  lineItems: Record<string, number>;
  /** Carrier name (e.g., "UPS", "FedEx", "DHL") */
  carrier?: string;
  /** Tracking number for the shipment */
  trackingNumber?: string;
  /** URL to track the shipment */
  trackingUrl?: string;
}

/** Request to update shipment tracking info */
export interface UpdateShipmentRequest {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  actualDeliveryDate?: string;
}

/** Summary of fulfillment state for the entire invoice (used in fulfillment dialog) */
export interface FulfillmentSummaryDto {
  invoiceId: string;
  invoiceNumber: string;
  overallStatus: "Unfulfilled" | "Partial" | "Fulfilled";
  orders: OrderFulfillmentDto[];
}

/** Order fulfillment state showing shipped vs unshipped items */
export interface OrderFulfillmentDto {
  orderId: string;
  warehouseId: string;
  warehouseName: string;
  status: OrderStatus;
  deliveryMethod: string;
  lineItems: FulfillmentLineItemDto[];
  shipments: ShipmentDetailDto[];
}

/** Line item with fulfillment quantities */
export interface FulfillmentLineItemDto {
  id: string;
  sku: string | null;
  name: string | null;
  orderedQuantity: number;
  shippedQuantity: number;
  remainingQuantity: number;
  imageUrl: string | null;
  amount: number;
}

/** Full shipment details for display */
export interface ShipmentDetailDto {
  id: string;
  orderId: string;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  dateCreated: string;
  actualDeliveryDate: string | null;
  lineItems: ShipmentLineItemDto[];
}

/** Line item within a shipment */
export interface ShipmentLineItemDto {
  id: string;
  lineItemId: string;
  sku: string | null;
  name: string | null;
  quantity: number;
  imageUrl: string | null;
}

/** For tracking items being added to a new shipment in the UI */
export interface PendingShipmentItem {
  lineItemId: string;
  name: string;
  sku: string | null;
  quantity: number;
  maxQuantity: number;
  imageUrl: string | null;
}

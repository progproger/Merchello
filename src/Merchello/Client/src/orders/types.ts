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

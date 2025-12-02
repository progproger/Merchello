// Payment types matching the API DTOs

/** Payment type enum */
export enum PaymentType {
  Payment = 0,
  Refund = 10,
  PartialRefund = 20,
}

/** Invoice payment status enum */
export enum InvoicePaymentStatus {
  Unpaid = 0,
  AwaitingPayment = 10,
  PartiallyPaid = 20,
  Paid = 30,
  PartiallyRefunded = 40,
  Refunded = 50,
}

/** Payment record DTO */
export interface PaymentDto {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod?: string;
  paymentProviderAlias?: string;
  paymentType: PaymentType;
  transactionId?: string;
  description?: string;
  paymentSuccess: boolean;
  refundReason?: string;
  parentPaymentId?: string;
  dateCreated: string;
  /** Child refund payments (if any) */
  refunds?: PaymentDto[];
  /** Calculated refundable amount (original amount minus existing refunds) */
  refundableAmount: number;
}

/** Invoice payment status response */
export interface PaymentStatusDto {
  invoiceId: string;
  status: InvoicePaymentStatus;
  statusDisplay: string;
  invoiceTotal: number;
  totalPaid: number;
  totalRefunded: number;
  netPayment: number;
  balanceDue: number;
}

/** Request to record a manual/offline payment */
export interface RecordManualPaymentDto {
  /** Payment amount */
  amount: number;
  /** Payment method description (e.g., "Cash", "Check", "Bank Transfer") */
  paymentMethod: string;
  /** Optional description/notes */
  description?: string;
}

/** Request to process a refund */
export interface ProcessRefundDto {
  /** Amount to refund. If null or 0, refunds the full refundable amount. */
  amount?: number;
  /** Reason for the refund (required) */
  reason: string;
  /** If true, records a manual refund without calling the provider. */
  isManualRefund?: boolean;
}


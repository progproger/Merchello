# Payment Providers - Development Plan

## Overview

This document outlines the development plan for implementing a pluggable payment provider system in Merchello. The system allows third-party developers to create payment providers (Stripe, PayPal, Braintree, etc.) as NuGet packages that are automatically discovered and configurable through the Merchello backoffice.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PAYMENT PROVIDER SYSTEM                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  Stripe Provider │    │  PayPal Provider │    │ Braintree etc.  │         │
│  │   (NuGet Pkg)    │    │   (NuGet Pkg)    │    │   (NuGet Pkg)   │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           └──────────────────────┼──────────────────────┘                   │
│                                  ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    IPaymentProvider Interface                         │  │
│  │  - Metadata (Alias, Name, Icon, SupportsRefunds, etc.)               │  │
│  │  - GetConfigurationFieldsAsync() → Field definitions for UI          │  │
│  │  - ConfigureAsync() → Load saved config                              │  │
│  │  - InitiatePaymentAsync() → Create checkout session, return URL      │  │
│  │  - CapturePaymentAsync() → Capture authorized payment                │  │
│  │  - RefundPaymentAsync() → Process refund                             │  │
│  │  - ValidateWebhookAsync() → Validate incoming webhook signature      │  │
│  │  - ProcessWebhookAsync() → Handle webhook payload                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│                                  ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    PaymentProviderManager                             │  │
│  │  - Discovers providers via ExtensionManager (assembly scanning)      │  │
│  │  - Loads configurations from merchelloPaymentProviders table         │  │
│  │  - Manages provider lifecycle and caching                            │  │
│  │  - Provides GetProvider(alias), GetAllProviders(), GetEnabled()      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│                                  ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      Database Tables                                  │  │
│  │                                                                       │  │
│  │  merchelloPaymentProviders          merchelloPayments (existing)      │  │
│  │  ├─ Id (Guid)                       ├─ Id (Guid)                      │  │
│  │  ├─ ProviderAlias (string)          ├─ InvoiceId (Guid)               │  │
│  │  ├─ DisplayName (string)            ├─ Amount (decimal)               │  │
│  │  ├─ IsEnabled (bool)                ├─ PaymentProviderAlias (NEW)     │  │
│  │  ├─ Configuration (JSON)            ├─ PaymentType (NEW: enum)        │  │
│  │  ├─ SortOrder (int)                 ├─ TransactionId (string)         │  │
│  │  └─ DateCreated/Updated             ├─ RefundReason (NEW: string)     │  │
│  │                                     ├─ ParentPaymentId (NEW: Guid?)   │  │
│  │                                     └─ ... existing fields            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Provider Discovery
- Uses existing `ExtensionManager` for assembly scanning (same pattern as `IShippingProvider`)
- Providers define immutable `Alias` property on the class (cannot be changed after installation)
- Providers are registered in `merchelloPaymentProviders` table when enabled by admin

### 2. Configuration Storage
- Provider settings (API keys, secrets, webhook URLs) stored as JSON in `Configuration` column
- Each provider defines its required fields via `GetConfigurationFieldsAsync()`
- Sensitive data stored encrypted (implementation detail for provider)

### 3. Refunds as Negative Payments
- Refunds are stored as `Payment` records with negative `Amount`
- New `PaymentType` enum: `Payment`, `Refund`, `PartialRefund`
- `RefundReason` field for audit trail
- `ParentPaymentId` links refund to original payment

### 4. Webhook Handling
- Custom `PaymentWebhookController` for receiving provider callbacks
- NOT using Umbraco's webhook system (it's outbound-only)
- Each provider validates its own webhook signatures
- Idempotency handled via `TransactionId` uniqueness

### 5. Invoice Payment Status
- New `InvoicePaymentStatus` enum: `Unpaid`, `AwaitingPayment`, `PartiallyPaid`, `Paid`, `Refunded`, `PartiallyRefunded`
- Calculated from Payment records but can be cached on Invoice

---

## Sprint Tasks

### Phase 1: Core Infrastructure

#### 1.1 Payment Provider Interface & Base Classes

**Files to create:**
- `src/Merchello.Core/Payments/Providers/IPaymentProvider.cs`
- `src/Merchello.Core/Payments/Providers/PaymentProviderBase.cs`
- `src/Merchello.Core/Payments/Providers/PaymentProviderMetadata.cs`
- `src/Merchello.Core/Payments/Providers/PaymentProviderConfigurationField.cs`

```csharp
// IPaymentProvider.cs
public interface IPaymentProvider
{
    /// <summary>
    /// Provider metadata - alias is immutable and set on the class
    /// </summary>
    PaymentProviderMetadata Metadata { get; }

    /// <summary>
    /// Get the configuration fields required by this provider (for UI)
    /// </summary>
    ValueTask<IEnumerable<PaymentProviderConfigurationField>> GetConfigurationFieldsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Configure the provider with saved settings
    /// </summary>
    ValueTask ConfigureAsync(
        PaymentProviderConfiguration? configuration,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Initiate a payment - returns redirect URL for hosted checkout
    /// </summary>
    Task<PaymentInitiationResult> InitiatePaymentAsync(
        PaymentRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Capture an authorized payment (for auth-then-capture flow)
    /// </summary>
    Task<PaymentCaptureResult> CapturePaymentAsync(
        string transactionId,
        decimal? amount = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Process a refund
    /// </summary>
    Task<RefundResult> RefundPaymentAsync(
        RefundRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate an incoming webhook signature
    /// </summary>
    Task<bool> ValidateWebhookAsync(
        string payload,
        IDictionary<string, string> headers,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Process a validated webhook payload
    /// </summary>
    Task<WebhookProcessingResult> ProcessWebhookAsync(
        string payload,
        IDictionary<string, string> headers,
        CancellationToken cancellationToken = default);
}

// PaymentProviderMetadata.cs
public class PaymentProviderMetadata
{
    /// <summary>
    /// Unique alias for the provider (immutable, set on class)
    /// e.g., "stripe", "paypal", "braintree"
    /// </summary>
    public required string Alias { get; init; }

    /// <summary>
    /// Display name shown in UI
    /// </summary>
    public required string DisplayName { get; init; }

    /// <summary>
    /// Optional icon URL or CSS class
    /// </summary>
    public string? Icon { get; init; }

    /// <summary>
    /// Description of the provider
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Whether this provider supports refunds
    /// </summary>
    public bool SupportsRefunds { get; init; } = true;

    /// <summary>
    /// Whether this provider supports partial refunds
    /// </summary>
    public bool SupportsPartialRefunds { get; init; } = true;

    /// <summary>
    /// Whether this provider uses redirect-based checkout
    /// </summary>
    public bool UsesRedirectCheckout { get; init; } = true;

    /// <summary>
    /// Whether this provider supports authorization-then-capture
    /// </summary>
    public bool SupportsAuthAndCapture { get; init; } = false;

    /// <summary>
    /// Webhook endpoint path for this provider
    /// </summary>
    public string WebhookPath => $"/umbraco/merchello/webhooks/payments/{Alias}";
}

// PaymentProviderConfigurationField.cs
public class PaymentProviderConfigurationField
{
    public required string Key { get; init; }
    public required string Label { get; init; }
    public string? Description { get; init; }
    public required ConfigurationFieldType FieldType { get; init; }
    public bool IsRequired { get; init; } = true;
    public bool IsSensitive { get; init; } = false; // For API keys, secrets
    public string? DefaultValue { get; init; }
    public string? Placeholder { get; init; }
    public IEnumerable<SelectOption>? Options { get; init; } // For dropdowns
}

public enum ConfigurationFieldType
{
    Text,
    Password,
    Textarea,
    Checkbox,
    Select,
    Url
}
```

#### 1.2 Payment Models & Enums

**Files to create:**
- `src/Merchello.Core/Payments/Models/PaymentType.cs`
- `src/Merchello.Core/Payments/Models/InvoicePaymentStatus.cs`
- `src/Merchello.Core/Payments/Models/PaymentProviderSetting.cs`
- `src/Merchello.Core/Payments/Models/PaymentRequest.cs`
- `src/Merchello.Core/Payments/Models/PaymentResult.cs`
- `src/Merchello.Core/Payments/Models/RefundRequest.cs`
- `src/Merchello.Core/Payments/Models/RefundResult.cs`
- `src/Merchello.Core/Payments/Models/WebhookProcessingResult.cs`

**Files to modify:**
- `src/Merchello.Core/Accounting/Models/Payment.cs` - Add new fields

```csharp
// PaymentType.cs
public enum PaymentType
{
    Payment = 0,
    Refund = 10,
    PartialRefund = 20
}

// InvoicePaymentStatus.cs
public enum InvoicePaymentStatus
{
    Unpaid = 0,
    AwaitingPayment = 10,      // Redirected to payment gateway
    PartiallyPaid = 20,
    Paid = 30,
    PartiallyRefunded = 40,
    Refunded = 50
}

// PaymentProviderSetting.cs (Entity for DB)
public class PaymentProviderSetting
{
    public Guid Id { get; set; } = GuidExtensions.NewSequentialGuid;
    public required string ProviderAlias { get; set; }
    public required string DisplayName { get; set; }
    public bool IsEnabled { get; set; }
    public string? Configuration { get; set; } // JSON
    public int SortOrder { get; set; }
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    public DateTime DateUpdated { get; set; } = DateTime.UtcNow;
}

// PaymentRequest.cs
public class PaymentRequest
{
    public required Guid InvoiceId { get; init; }
    public required decimal Amount { get; init; }
    public required string Currency { get; init; }
    public required string ReturnUrl { get; init; }
    public required string CancelUrl { get; init; }
    public string? WebhookUrl { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerName { get; init; }
    public string? Description { get; init; }
    public Dictionary<string, string>? Metadata { get; init; }
}

// Payment.cs modifications
public class Payment
{
    // ... existing fields ...

    /// <summary>
    /// The payment provider alias used (e.g., "stripe", "paypal")
    /// </summary>
    public string? PaymentProviderAlias { get; set; }

    /// <summary>
    /// Type of payment record
    /// </summary>
    public PaymentType PaymentType { get; set; } = PaymentType.Payment;

    /// <summary>
    /// Reason for refund (if PaymentType is Refund/PartialRefund)
    /// </summary>
    public string? RefundReason { get; set; }

    /// <summary>
    /// Parent payment ID (for refunds linking to original payment)
    /// </summary>
    public Guid? ParentPaymentId { get; set; }

    /// <summary>
    /// Navigation to parent payment (for refunds)
    /// </summary>
    public Payment? ParentPayment { get; set; }

    /// <summary>
    /// Child refund payments
    /// </summary>
    public virtual ICollection<Payment>? Refunds { get; set; }
}
```

#### 1.3 Database Mappings & Migrations

**Files to create:**
- `src/Merchello.Core/Payments/Mapping/PaymentProviderSettingDbMapping.cs`

**Files to modify:**
- `src/Merchello.Core/Accounting/Mapping/PaymentDbMapping.cs`
- `src/Merchello.Core/Data/MerchelloDbContext.cs`

```csharp
// PaymentProviderSettingDbMapping.cs
public class PaymentProviderSettingDbMapping : IEntityTypeConfiguration<PaymentProviderSetting>
{
    public void Configure(EntityTypeBuilder<PaymentProviderSetting> builder)
    {
        builder.ToTable("merchelloPaymentProviders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ProviderAlias).IsRequired().HasMaxLength(100);
        builder.Property(x => x.DisplayName).IsRequired().HasMaxLength(250);
        builder.Property(x => x.Configuration).HasMaxLength(4000);
        builder.HasIndex(x => x.ProviderAlias).IsUnique();
    }
}

// PaymentDbMapping.cs - Add new columns
builder.Property(x => x.PaymentProviderAlias).HasMaxLength(100);
builder.Property(x => x.PaymentType).HasDefaultValue(PaymentType.Payment);
builder.Property(x => x.RefundReason).HasMaxLength(1000);
builder.HasOne(x => x.ParentPayment)
    .WithMany(x => x.Refunds)
    .HasForeignKey(x => x.ParentPaymentId)
    .OnDelete(DeleteBehavior.Restrict);

// MerchelloDbContext.cs - Add DbSet
public DbSet<PaymentProviderSetting> PaymentProviderSettings => Set<PaymentProviderSetting>();
```

**Create migrations:**
```bash
# In Merchello.Core.SqlServer project
dotnet ef migrations add AddPaymentProviderSupport

# In Merchello.Core.Sqlite project
dotnet ef migrations add AddPaymentProviderSupport
```

---

### Phase 2: Provider Management

#### 2.1 Payment Provider Manager

**Files to create:**
- `src/Merchello.Core/Payments/Providers/IPaymentProviderManager.cs`
- `src/Merchello.Core/Payments/Providers/PaymentProviderManager.cs`
- `src/Merchello.Core/Payments/Providers/PaymentProviderConfiguration.cs`

```csharp
// IPaymentProviderManager.cs
public interface IPaymentProviderManager
{
    /// <summary>
    /// Get all discovered payment providers (from assemblies)
    /// </summary>
    Task<IEnumerable<IPaymentProvider>> GetAvailableProvidersAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all enabled/configured payment providers
    /// </summary>
    Task<IEnumerable<IPaymentProvider>> GetEnabledProvidersAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a specific provider by alias
    /// </summary>
    Task<IPaymentProvider?> GetProviderAsync(
        string alias,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get provider settings from database
    /// </summary>
    Task<IEnumerable<PaymentProviderSetting>> GetProviderSettingsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Save provider settings
    /// </summary>
    Task<CrudResult<PaymentProviderSetting>> SaveProviderSettingAsync(
        PaymentProviderSetting setting,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enable/disable a provider
    /// </summary>
    Task<CrudResult<bool>> SetProviderEnabledAsync(
        Guid settingId,
        bool enabled,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Refresh provider cache
    /// </summary>
    void RefreshCache();
}
```

#### 2.2 Payment Service

**Files to create:**
- `src/Merchello.Core/Payments/Services/IPaymentService.cs`
- `src/Merchello.Core/Payments/Services/PaymentService.cs`

```csharp
// IPaymentService.cs
public interface IPaymentService
{
    /// <summary>
    /// Initiate a payment for an invoice
    /// </summary>
    Task<PaymentInitiationResult> InitiatePaymentAsync(
        Guid invoiceId,
        string providerAlias,
        string returnUrl,
        string cancelUrl,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Record a successful payment (called from webhook or return URL)
    /// </summary>
    Task<CrudResult<Payment>> RecordPaymentAsync(
        Guid invoiceId,
        string providerAlias,
        string transactionId,
        decimal amount,
        string? description = null,
        string? fraudResponse = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Process a refund
    /// </summary>
    Task<CrudResult<Payment>> ProcessRefundAsync(
        Guid paymentId,
        decimal amount,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payments for an invoice
    /// </summary>
    Task<IEnumerable<Payment>> GetPaymentsForInvoiceAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get payment by ID
    /// </summary>
    Task<Payment?> GetPaymentAsync(
        Guid paymentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate invoice payment status
    /// </summary>
    Task<InvoicePaymentStatus> GetInvoicePaymentStatusAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Record a manual/offline payment (backoffice)
    /// </summary>
    Task<CrudResult<Payment>> RecordManualPaymentAsync(
        Guid invoiceId,
        decimal amount,
        string paymentMethod,
        string? description = null,
        CancellationToken cancellationToken = default);
}
```

---

### Phase 3: API Controllers

#### 3.1 Payment Provider Settings API (Backoffice)

**Files to create:**
- `src/Merchello/Controllers/PaymentProvidersApiController.cs`
- `src/Merchello/Controllers/Dtos/PaymentProviderDtos.cs`

```csharp
// PaymentProvidersApiController.cs
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "Merchello")]
public class PaymentProvidersApiController : MerchelloApiControllerBase
{
    // GET /api/v1/payment-providers/available
    // Returns all discovered providers from assemblies

    // GET /api/v1/payment-providers
    // Returns all configured provider settings from DB

    // GET /api/v1/payment-providers/{id}
    // Returns a specific provider setting

    // GET /api/v1/payment-providers/{alias}/fields
    // Returns configuration fields for a provider

    // POST /api/v1/payment-providers
    // Create new provider setting (enable a provider)

    // PUT /api/v1/payment-providers/{id}
    // Update provider setting (configuration, enabled, sort order)

    // DELETE /api/v1/payment-providers/{id}
    // Delete provider setting (disable provider)

    // PUT /api/v1/payment-providers/{id}/toggle
    // Enable/disable provider

    // PUT /api/v1/payment-providers/reorder
    // Reorder providers
}
```

#### 3.2 Payments API (Backoffice)

**Files to create:**
- `src/Merchello/Controllers/PaymentsApiController.cs`
- `src/Merchello/Controllers/Dtos/PaymentDtos.cs`

```csharp
// PaymentsApiController.cs
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "Merchello")]
public class PaymentsApiController : MerchelloApiControllerBase
{
    // GET /api/v1/invoices/{invoiceId}/payments
    // Get all payments for an invoice

    // GET /api/v1/payments/{id}
    // Get a specific payment

    // POST /api/v1/invoices/{invoiceId}/payments/manual
    // Record a manual/offline payment

    // POST /api/v1/payments/{id}/refund
    // Process a refund

    // GET /api/v1/invoices/{invoiceId}/payment-status
    // Get calculated payment status
}
```

#### 3.3 Payment Webhook Controller (Public)

**Files to create:**
- `src/Merchello/Controllers/PaymentWebhookController.cs`

```csharp
// PaymentWebhookController.cs
[ApiController]
[Route("umbraco/merchello/webhooks/payments")]
[AllowAnonymous] // Webhooks must be public
public class PaymentWebhookController : ControllerBase
{
    // POST /umbraco/merchello/webhooks/payments/{providerAlias}
    // Receives webhook from payment provider
    // 1. Get provider by alias
    // 2. Validate webhook signature
    // 3. Process webhook payload
    // 4. Return appropriate HTTP status
}
```

#### 3.4 Checkout API (Frontend)

**Files to create:**
- `src/Merchello/Controllers/CheckoutPaymentsApiController.cs`

```csharp
// CheckoutPaymentsApiController.cs - Public API for frontend
[ApiController]
[Route("api/merchello/checkout")]
[AllowAnonymous] // Or custom auth for customers
public class CheckoutPaymentsApiController : ControllerBase
{
    // GET /api/merchello/checkout/payment-methods
    // Get available payment methods for checkout

    // POST /api/merchello/checkout/{invoiceId}/pay
    // Initiate payment - returns redirect URL

    // GET /api/merchello/checkout/return
    // Handle return from payment gateway

    // GET /api/merchello/checkout/cancel
    // Handle cancel from payment gateway
}
```

---

### Phase 4: Backoffice UI

#### 4.1 TypeScript API Client Updates

**Files to modify:**
- `src/Merchello/Client/src/api/merchello-api.ts`

```typescript
// Add payment provider API methods
MerchelloApi.getAvailablePaymentProviders()
MerchelloApi.getPaymentProviders()
MerchelloApi.getPaymentProviderFields(alias)
MerchelloApi.createPaymentProvider(data)
MerchelloApi.updatePaymentProvider(id, data)
MerchelloApi.deletePaymentProvider(id)
MerchelloApi.togglePaymentProvider(id, enabled)
MerchelloApi.reorderPaymentProviders(ids)

MerchelloApi.getInvoicePayments(invoiceId)
MerchelloApi.recordManualPayment(invoiceId, data)
MerchelloApi.processRefund(paymentId, data)
MerchelloApi.getPaymentStatus(invoiceId)
```

#### 4.2 Payment Providers Settings Section

**Files to create:**
- `src/Merchello/Client/src/payment-providers/` (new directory)
  - `types.ts`
  - `payment-providers-section.element.ts`
  - `payment-provider-list.element.ts`
  - `payment-provider-editor.element.ts`
  - `payment-provider-config-modal.element.ts`

**Functionality:**
- List all available providers (from assembly scan)
- List configured/enabled providers
- Enable provider → show configuration modal with dynamic fields
- Edit provider configuration
- Enable/disable providers
- Reorder providers (drag and drop)
- Delete provider configuration

#### 4.3 Order/Invoice Payment Panel

**Files to modify:**
- `src/Merchello/Client/src/orders/order-detail.element.ts`

**Files to create:**
- `src/Merchello/Client/src/orders/payment-panel.element.ts`
- `src/Merchello/Client/src/orders/refund-modal.element.ts`
- `src/Merchello/Client/src/orders/manual-payment-modal.element.ts`

**Functionality:**
- Show payment status badge on order detail
- List all payments and refunds
- "Record Payment" button → manual payment modal
- "Refund" button on each payment → refund modal
- Refund modal allows partial refund amount and reason

---

### Phase 5: Sample Provider Implementation

#### 5.1 Manual/Offline Payment Provider

**Files to create:**
- `src/Merchello.Core/Payments/Providers/ManualPaymentProvider.cs`

A built-in provider for recording manual/offline payments (cash, check, bank transfer, etc.)

```csharp
public class ManualPaymentProvider : PaymentProviderBase
{
    public override PaymentProviderMetadata Metadata => new()
    {
        Alias = "manual",
        DisplayName = "Manual Payment",
        Description = "Record offline payments (cash, check, bank transfer)",
        SupportsRefunds = true,
        SupportsPartialRefunds = true,
        UsesRedirectCheckout = false
    };

    // No configuration fields needed
    // No webhook handling
    // Simple record payment flow
}
```

---

## Implementation Order

1. **Phase 1.1-1.2**: Core interfaces, models, enums (foundation)
2. **Phase 1.3**: Database changes and migrations
3. **Phase 2.1**: PaymentProviderManager
4. **Phase 2.2**: PaymentService
5. **Phase 5.1**: ManualPaymentProvider (for testing)
6. **Phase 3.1-3.2**: Backoffice API controllers
7. **Phase 4.1**: TypeScript API client updates
8. **Phase 4.2-4.3**: Backoffice UI components
9. **Phase 3.3-3.4**: Webhook and checkout API controllers

---

## File Structure Summary

```
src/Merchello.Core/
├── Payments/
│   ├── Providers/
│   │   ├── IPaymentProvider.cs
│   │   ├── PaymentProviderBase.cs
│   │   ├── PaymentProviderMetadata.cs
│   │   ├── PaymentProviderConfigurationField.cs
│   │   ├── PaymentProviderConfiguration.cs
│   │   ├── IPaymentProviderManager.cs
│   │   ├── PaymentProviderManager.cs
│   │   └── ManualPaymentProvider.cs
│   ├── Models/
│   │   ├── PaymentType.cs
│   │   ├── InvoicePaymentStatus.cs
│   │   ├── PaymentProviderSetting.cs
│   │   ├── PaymentRequest.cs
│   │   ├── PaymentInitiationResult.cs
│   │   ├── PaymentCaptureResult.cs
│   │   ├── RefundRequest.cs
│   │   ├── RefundResult.cs
│   │   └── WebhookProcessingResult.cs
│   ├── Services/
│   │   ├── IPaymentService.cs
│   │   └── PaymentService.cs
│   └── Mapping/
│       └── PaymentProviderSettingDbMapping.cs

src/Merchello/
├── Controllers/
│   ├── PaymentProvidersApiController.cs
│   ├── PaymentsApiController.cs
│   ├── PaymentWebhookController.cs
│   ├── CheckoutPaymentsApiController.cs
│   └── Dtos/
│       ├── PaymentProviderDtos.cs
│       └── PaymentDtos.cs
└── Client/src/
    ├── api/
    │   └── merchello-api.ts (modified)
    ├── payment-providers/
    │   ├── types.ts
    │   ├── payment-providers-section.element.ts
    │   ├── payment-provider-list.element.ts
    │   ├── payment-provider-editor.element.ts
    │   └── payment-provider-config-modal.element.ts
    └── orders/
        ├── order-detail.element.ts (modified)
        ├── payment-panel.element.ts
        ├── refund-modal.element.ts
        └── manual-payment-modal.element.ts
```

---

## Third-Party Provider Development Guide

Third-party developers can create payment providers by:

1. Create a new .NET Class Library project
2. Reference `Merchello.Core`
3. Implement `IPaymentProvider` or extend `PaymentProviderBase`
4. Package as NuGet package
5. When installed, Merchello discovers the provider automatically

```csharp
// Example: Stripe Payment Provider
public class StripePaymentProvider : PaymentProviderBase
{
    private string? _secretKey;
    private string? _webhookSecret;

    public override PaymentProviderMetadata Metadata => new()
    {
        Alias = "stripe",
        DisplayName = "Stripe",
        Icon = "icon-credit-card",
        Description = "Accept payments via Stripe",
        SupportsRefunds = true,
        SupportsPartialRefunds = true,
        UsesRedirectCheckout = true,
        SupportsAuthAndCapture = true
    };

    public override ValueTask<IEnumerable<PaymentProviderConfigurationField>>
        GetConfigurationFieldsAsync(CancellationToken ct = default)
    {
        return ValueTask.FromResult<IEnumerable<PaymentProviderConfigurationField>>(new[]
        {
            new PaymentProviderConfigurationField
            {
                Key = "secretKey",
                Label = "Secret Key",
                FieldType = ConfigurationFieldType.Password,
                IsSensitive = true,
                IsRequired = true
            },
            new PaymentProviderConfigurationField
            {
                Key = "publishableKey",
                Label = "Publishable Key",
                FieldType = ConfigurationFieldType.Text,
                IsRequired = true
            },
            new PaymentProviderConfigurationField
            {
                Key = "webhookSecret",
                Label = "Webhook Signing Secret",
                FieldType = ConfigurationFieldType.Password,
                IsSensitive = true,
                IsRequired = true
            },
            new PaymentProviderConfigurationField
            {
                Key = "testMode",
                Label = "Test Mode",
                FieldType = ConfigurationFieldType.Checkbox,
                DefaultValue = "true"
            }
        });
    }

    public override ValueTask ConfigureAsync(
        PaymentProviderConfiguration? config,
        CancellationToken ct = default)
    {
        _secretKey = config?.GetValue("secretKey");
        _webhookSecret = config?.GetValue("webhookSecret");
        return ValueTask.CompletedTask;
    }

    public override async Task<PaymentInitiationResult> InitiatePaymentAsync(
        PaymentRequest request,
        CancellationToken ct = default)
    {
        // Create Stripe Checkout Session
        // Return redirect URL
    }

    public override async Task<RefundResult> RefundPaymentAsync(
        RefundRequest request,
        CancellationToken ct = default)
    {
        // Call Stripe Refund API
    }

    public override async Task<bool> ValidateWebhookAsync(
        string payload,
        IDictionary<string, string> headers,
        CancellationToken ct = default)
    {
        // Validate Stripe signature
        var signature = headers.GetValueOrDefault("Stripe-Signature");
        return StripeWebhookUtility.VerifySignature(payload, signature, _webhookSecret);
    }

    public override async Task<WebhookProcessingResult> ProcessWebhookAsync(
        string payload,
        IDictionary<string, string> headers,
        CancellationToken ct = default)
    {
        // Parse Stripe event
        // Return payment confirmation or failure
    }
}
```

---

## Testing Checklist

- [ ] Provider discovery finds all `IPaymentProvider` implementations
- [ ] Provider configuration saves/loads correctly
- [ ] Payment initiation returns valid redirect URL
- [ ] Webhook signature validation works
- [ ] Webhook processing updates payment status
- [ ] Refunds create negative payment records
- [ ] Partial refunds calculate correctly
- [ ] Invoice payment status calculates correctly
- [ ] Backoffice UI shows all payment info
- [ ] Manual payment recording works
- [ ] Provider enable/disable works
- [ ] Provider ordering works

---

## Notes

- Sensitive configuration values (API keys) should be encrypted at rest
- Webhook endpoints must be publicly accessible (no auth)
- Consider rate limiting on webhook endpoints
- Log all webhook events for debugging
- Consider idempotency keys to prevent duplicate payments

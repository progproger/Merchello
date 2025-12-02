import { html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement } from "@umbraco-cms/backoffice/modal";
import { MerchelloApi } from "../../api/merchello-api.js";
import type {
  FulfillmentSummaryDto,
  OrderFulfillmentDto,
  FulfillmentLineItemDto,
  CreateShipmentRequest,
  OrderStatus,
} from "../types.js";
import type { FulfillmentModalData, FulfillmentModalValue } from "./fulfillment-modal.token.js";

interface SelectedItem {
  lineItemId: string;
  quantity: number;
  maxQuantity: number;
  name: string;
  sku: string | null;
}

@customElement("merchello-fulfillment-modal")
export class MerchelloFulfillmentModalElement extends UmbModalBaseElement<
  FulfillmentModalData,
  FulfillmentModalValue
> {
  @state() private _summary: FulfillmentSummaryDto | null = null;
  @state() private _loading = true;
  @state() private _error: string | null = null;
  @state() private _creating = false;
  @state() private _shipmentsCreated = 0;

  // Selection state per order
  @state() private _selectedItems: Map<string, Map<string, SelectedItem>> = new Map();

  // Tracking form state
  @state() private _showTrackingForm = false;
  @state() private _carrier = "";
  @state() private _trackingNumber = "";
  @state() private _trackingUrl = "";

  // Which order is currently being worked on
  @state() private _activeOrderId: string | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadFulfillmentSummary();
  }

  private async _loadFulfillmentSummary(): Promise<void> {
    this._loading = true;
    this._error = null;

    const { data, error } = await MerchelloApi.getFulfillmentSummary(this.data!.invoiceId);

    if (error) {
      this._error = error.message;
      this._loading = false;
      return;
    }

    this._summary = data ?? null;
    this._loading = false;

    // Initialize selection state for each order
    if (this._summary) {
      for (const order of this._summary.orders) {
        this._selectedItems.set(order.orderId, new Map());
      }
      // Set first order as active if there's only one
      if (this._summary.orders.length === 1) {
        this._activeOrderId = this._summary.orders[0].orderId;
      }
    }
  }

  private _getStatusLabel(status: OrderStatus): string {
    const statusMap: Record<number, string> = {
      0: "Pending",
      10: "Awaiting Stock",
      20: "Ready to Fulfill",
      30: "Processing",
      40: "Partially Shipped",
      50: "Shipped",
      60: "Completed",
      70: "Cancelled",
      80: "On Hold",
    };
    return statusMap[status as number] || "Unknown";
  }

  private _getStatusClass(status: OrderStatus): string {
    const statusNum = status as number;
    if (statusNum >= 50) return "shipped";
    if (statusNum >= 40) return "partial";
    if (statusNum >= 20) return "ready";
    return "pending";
  }

  private _toggleItemSelection(orderId: string, item: FulfillmentLineItemDto): void {
    const orderSelections = this._selectedItems.get(orderId) ?? new Map();

    if (orderSelections.has(item.id)) {
      orderSelections.delete(item.id);
    } else {
      orderSelections.set(item.id, {
        lineItemId: item.id,
        quantity: item.remainingQuantity,
        maxQuantity: item.remainingQuantity,
        name: item.name ?? "Unknown",
        sku: item.sku,
      });
    }

    this._selectedItems.set(orderId, orderSelections);
    this._selectedItems = new Map(this._selectedItems); // Trigger reactivity
  }

  private _updateItemQuantity(orderId: string, lineItemId: string, quantity: number): void {
    const orderSelections = this._selectedItems.get(orderId);
    if (!orderSelections) return;

    const item = orderSelections.get(lineItemId);
    if (!item) return;

    const clampedQuantity = Math.max(1, Math.min(quantity, item.maxQuantity));
    orderSelections.set(lineItemId, { ...item, quantity: clampedQuantity });

    this._selectedItems = new Map(this._selectedItems); // Trigger reactivity
  }

  private _selectAllItems(orderId: string): void {
    const order = this._summary?.orders.find((o) => o.orderId === orderId);
    if (!order) return;

    const orderSelections = new Map<string, SelectedItem>();
    for (const item of order.lineItems) {
      if (item.remainingQuantity > 0) {
        orderSelections.set(item.id, {
          lineItemId: item.id,
          quantity: item.remainingQuantity,
          maxQuantity: item.remainingQuantity,
          name: item.name ?? "Unknown",
          sku: item.sku,
        });
      }
    }

    this._selectedItems.set(orderId, orderSelections);
    this._selectedItems = new Map(this._selectedItems);
  }

  private _clearSelection(orderId: string): void {
    this._selectedItems.set(orderId, new Map());
    this._selectedItems = new Map(this._selectedItems);
  }

  private _getSelectedCount(orderId: string): number {
    return this._selectedItems.get(orderId)?.size ?? 0;
  }

  private _getTotalSelectedQuantity(orderId: string): number {
    const orderSelections = this._selectedItems.get(orderId);
    if (!orderSelections) return 0;
    return Array.from(orderSelections.values()).reduce((sum, item) => sum + item.quantity, 0);
  }

  private async _createShipment(orderId: string): Promise<void> {
    const orderSelections = this._selectedItems.get(orderId);
    if (!orderSelections || orderSelections.size === 0) return;

    this._creating = true;

    const lineItems: Record<string, number> = {};
    for (const [lineItemId, item] of orderSelections) {
      lineItems[lineItemId] = item.quantity;
    }

    const request: CreateShipmentRequest = {
      lineItems,
      carrier: this._carrier || undefined,
      trackingNumber: this._trackingNumber || undefined,
      trackingUrl: this._trackingUrl || undefined,
    };

    const { error } = await MerchelloApi.createShipment(orderId, request);

    this._creating = false;

    if (error) {
      this._error = error.message;
      return;
    }

    this._shipmentsCreated++;
    this._clearSelection(orderId);
    this._carrier = "";
    this._trackingNumber = "";
    this._trackingUrl = "";
    this._showTrackingForm = false;

    // Reload the summary to show updated state
    await this._loadFulfillmentSummary();
  }

  private async _deleteShipment(shipmentId: string): Promise<void> {
    if (!confirm("Are you sure you want to delete this shipment? Items will be released back to unfulfilled.")) {
      return;
    }

    const { error } = await MerchelloApi.deleteShipment(shipmentId);

    if (error) {
      this._error = error.message;
      return;
    }

    // Reload the summary
    await this._loadFulfillmentSummary();
  }

  private _handleClose(): void {
    this.modalContext?.setValue({ shipmentsCreated: this._shipmentsCreated });
    this.modalContext?.submit();
  }

  private _formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  private _renderUnfulfilledItems(order: OrderFulfillmentDto): unknown {
    const unfulfilledItems = order.lineItems.filter((li) => li.remainingQuantity > 0);
    if (unfulfilledItems.length === 0) {
      return html`<div class="empty-message">All items have been shipped</div>`;
    }

    const orderSelections = this._selectedItems.get(order.orderId) ?? new Map();

    return html`
      <div class="section-header">
        <span>Unfulfilled Items</span>
        <div class="section-actions">
          <uui-button
            look="secondary"
            compact
            label="Select All"
            @click=${() => this._selectAllItems(order.orderId)}
          >
            Select All
          </uui-button>
          ${orderSelections.size > 0
            ? html`
                <uui-button
                  look="secondary"
                  compact
                  label="Clear"
                  @click=${() => this._clearSelection(order.orderId)}
                >
                  Clear
                </uui-button>
              `
            : nothing}
        </div>
      </div>
      <div class="items-list">
        ${unfulfilledItems.map((item) => {
          const isSelected = orderSelections.has(item.id);
          const selectedItem = orderSelections.get(item.id);

          return html`
            <div class="item-row ${isSelected ? "selected" : ""}">
              <input
                type="checkbox"
                .checked=${isSelected}
                @change=${() => this._toggleItemSelection(order.orderId, item)}
              />
              <div class="item-image">
                ${item.imageUrl
                  ? html`<img src="${item.imageUrl}" alt="${item.name}" />`
                  : html`<div class="placeholder-image"></div>`}
              </div>
              <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-sku">${item.sku || "No SKU"}</div>
              </div>
              <div class="item-quantity">
                ${isSelected
                  ? html`
                      <input
                        type="number"
                        min="1"
                        max="${item.remainingQuantity}"
                        .value=${String(selectedItem?.quantity ?? item.remainingQuantity)}
                        @input=${(e: Event) =>
                          this._updateItemQuantity(
                            order.orderId,
                            item.id,
                            parseInt((e.target as HTMLInputElement).value) || 1
                          )}
                      />
                      <span class="qty-label">/ ${item.remainingQuantity} remaining</span>
                    `
                  : html`<span class="qty-label">${item.remainingQuantity} remaining</span>`}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderExistingShipments(order: OrderFulfillmentDto): unknown {
    if (order.shipments.length === 0) {
      return nothing;
    }

    return html`
      <div class="shipments-section">
        <div class="section-header">
          <span>Existing Shipments (${order.shipments.length})</span>
        </div>
        <div class="shipments-list">
          ${order.shipments.map(
            (shipment) => html`
              <div class="shipment-card">
                <div class="shipment-header">
                  <span class="shipment-carrier">${shipment.carrier || "No carrier"}</span>
                  ${shipment.trackingNumber
                    ? html`<span class="tracking-number">${shipment.trackingNumber}</span>`
                    : nothing}
                  <span class="shipment-date">${this._formatDate(shipment.dateCreated)}</span>
                </div>
                <div class="shipment-items">
                  ${shipment.lineItems.map(
                    (li) => html`
                      <span class="shipment-item">${li.name} × ${li.quantity}</span>
                    `
                  )}
                </div>
                <div class="shipment-actions">
                  ${shipment.trackingUrl
                    ? html`
                        <a href="${shipment.trackingUrl}" target="_blank" class="track-link">
                          Track
                        </a>
                      `
                    : nothing}
                  <uui-button
                    look="secondary"
                    color="danger"
                    compact
                    label="Delete"
                    @click=${() => this._deleteShipment(shipment.id)}
                  >
                    Delete
                  </uui-button>
                </div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _renderOrderCard(order: OrderFulfillmentDto): unknown {
    const selectedCount = this._getSelectedCount(order.orderId);
    const isExpanded = this._activeOrderId === order.orderId || this._summary?.orders.length === 1;

    return html`
      <div class="order-card">
        <div
          class="order-header"
          @click=${() => {
            this._activeOrderId = this._activeOrderId === order.orderId ? null : order.orderId;
          }}
        >
          <div class="order-info">
            <span class="warehouse-name">${order.warehouseName}</span>
            <span class="status-badge ${this._getStatusClass(order.status)}">
              ${this._getStatusLabel(order.status)}
            </span>
          </div>
          <div class="order-summary">
            <span class="delivery-method">${order.deliveryMethod}</span>
            <uui-icon name="${isExpanded ? "icon-navigation-up" : "icon-navigation-down"}"></uui-icon>
          </div>
        </div>

        ${isExpanded
          ? html`
              <div class="order-content">
                ${this._renderUnfulfilledItems(order)}
                ${this._renderExistingShipments(order)}

                ${selectedCount > 0
                  ? html`
                      <div class="create-shipment-section">
                        <div
                          class="tracking-toggle"
                          @click=${() => (this._showTrackingForm = !this._showTrackingForm)}
                        >
                          <uui-icon
                            name="${this._showTrackingForm ? "icon-navigation-down" : "icon-navigation-right"}"
                          ></uui-icon>
                          Add Tracking Info (optional)
                        </div>

                        ${this._showTrackingForm
                          ? html`
                              <div class="tracking-form">
                                <div class="form-row">
                                  <label>
                                    Carrier
                                    <input
                                      type="text"
                                      placeholder="e.g., UPS, FedEx, DHL"
                                      .value=${this._carrier}
                                      @input=${(e: Event) =>
                                        (this._carrier = (e.target as HTMLInputElement).value)}
                                    />
                                  </label>
                                  <label>
                                    Tracking Number
                                    <input
                                      type="text"
                                      placeholder="e.g., 1Z999AA10123456784"
                                      .value=${this._trackingNumber}
                                      @input=${(e: Event) =>
                                        (this._trackingNumber = (e.target as HTMLInputElement).value)}
                                    />
                                  </label>
                                </div>
                                <div class="form-row">
                                  <label class="full-width">
                                    Tracking URL
                                    <input
                                      type="text"
                                      placeholder="https://..."
                                      .value=${this._trackingUrl}
                                      @input=${(e: Event) =>
                                        (this._trackingUrl = (e.target as HTMLInputElement).value)}
                                    />
                                  </label>
                                </div>
                              </div>
                            `
                          : nothing}

                        <div class="create-action">
                          <span class="selected-summary">
                            ${this._getTotalSelectedQuantity(order.orderId)} items selected
                          </span>
                          <uui-button
                            look="primary"
                            label="Create Shipment"
                            ?disabled=${this._creating}
                            @click=${() => this._createShipment(order.orderId)}
                          >
                            ${this._creating ? "Creating..." : "Create Shipment"}
                          </uui-button>
                        </div>
                      </div>
                    `
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  render() {
    return html`
      <umb-body-layout headline="Fulfil Order ${this._summary?.invoiceNumber ?? ""}">
        <div id="main">
          ${this._loading
            ? html`
                <div class="loading">
                  <uui-loader></uui-loader>
                </div>
              `
            : this._error
              ? html`
                  <div class="error">
                    <uui-icon name="icon-alert"></uui-icon>
                    ${this._error}
                    <uui-button look="secondary" @click=${this._loadFulfillmentSummary}>
                      Retry
                    </uui-button>
                  </div>
                `
              : this._summary
                ? html`
                    <div class="status-bar">
                      <span class="status-label">Overall Status:</span>
                      <span
                        class="status-badge ${this._summary.overallStatus.toLowerCase()}"
                      >
                        ${this._summary.overallStatus}
                      </span>
                    </div>

                    <div class="orders-list">
                      ${this._summary.orders.map((order) => this._renderOrderCard(order))}
                    </div>
                  `
                : html`<div class="empty-message">No order data available</div>`}
        </div>

        <div slot="actions">
          <uui-button look="secondary" label="Close" @click=${this._handleClose}>
            Close
          </uui-button>
        </div>
      </umb-body-layout>
    `;
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    #main {
      padding: var(--uui-size-layout-1);
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: var(--uui-size-layout-2);
    }

    .error {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-space-4);
      background: #f8d7da;
      color: #721c24;
      border-radius: var(--uui-border-radius);
    }

    .status-bar {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      margin-bottom: var(--uui-size-space-4);
      padding: var(--uui-size-space-3);
      background: var(--uui-color-surface);
      border-radius: var(--uui-border-radius);
    }

    .status-label {
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.unfulfilled {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.partial {
      background: #cce5ff;
      color: #004085;
    }

    .status-badge.fulfilled,
    .status-badge.shipped {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.ready {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-badge.pending {
      background: #f8f9fa;
      color: #6c757d;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-4);
    }

    .order-card {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      overflow: hidden;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--uui-size-space-3) var(--uui-size-space-4);
      background: var(--uui-color-surface-alt);
      cursor: pointer;
    }

    .order-header:hover {
      background: var(--uui-color-surface-emphasis);
    }

    .order-info {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    .warehouse-name {
      font-weight: 600;
    }

    .order-summary {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      color: var(--uui-color-text-alt);
    }

    .order-content {
      padding: var(--uui-size-space-4);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--uui-size-space-3);
      font-weight: 500;
    }

    .section-actions {
      display: flex;
      gap: var(--uui-size-space-2);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
    }

    .item-row {
      display: grid;
      grid-template-columns: auto 50px 1fr auto;
      gap: var(--uui-size-space-3);
      align-items: center;
      padding: var(--uui-size-space-2);
      border-radius: var(--uui-border-radius);
    }

    .item-row.selected {
      background: var(--uui-color-selected);
    }

    .item-image img,
    .placeholder-image {
      width: 50px;
      height: 50px;
      border-radius: var(--uui-border-radius);
      object-fit: cover;
    }

    .placeholder-image {
      background: var(--uui-color-surface-alt);
    }

    .item-name {
      font-weight: 500;
    }

    .item-sku {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    .item-quantity input {
      width: 60px;
      padding: var(--uui-size-space-1);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      text-align: center;
    }

    .qty-label {
      font-size: 0.875rem;
      color: var(--uui-color-text-alt);
    }

    .empty-message {
      padding: var(--uui-size-space-4);
      text-align: center;
      color: var(--uui-color-text-alt);
      font-style: italic;
    }

    .shipments-section {
      margin-top: var(--uui-size-space-4);
      padding-top: var(--uui-size-space-4);
      border-top: 1px solid var(--uui-color-border);
    }

    .shipments-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
    }

    .shipment-card {
      padding: var(--uui-size-space-3);
      background: var(--uui-color-surface-alt);
      border-radius: var(--uui-border-radius);
    }

    .shipment-header {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      margin-bottom: var(--uui-size-space-2);
    }

    .shipment-carrier {
      font-weight: 500;
    }

    .tracking-number {
      font-family: monospace;
      font-size: 0.875rem;
      background: var(--uui-color-surface);
      padding: 2px 6px;
      border-radius: var(--uui-border-radius);
    }

    .shipment-date {
      margin-left: auto;
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
    }

    .shipment-items {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-2);
      margin-bottom: var(--uui-size-space-2);
    }

    .shipment-item {
      font-size: 0.875rem;
      background: var(--uui-color-surface);
      padding: 2px 8px;
      border-radius: var(--uui-border-radius);
    }

    .shipment-actions {
      display: flex;
      gap: var(--uui-size-space-2);
    }

    .track-link {
      font-size: 0.875rem;
      color: var(--uui-color-interactive);
    }

    .create-shipment-section {
      margin-top: var(--uui-size-space-4);
      padding-top: var(--uui-size-space-4);
      border-top: 1px solid var(--uui-color-border);
    }

    .tracking-toggle {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      cursor: pointer;
      margin-bottom: var(--uui-size-space-3);
      color: var(--uui-color-interactive);
    }

    .tracking-form {
      margin-bottom: var(--uui-size-space-4);
    }

    .form-row {
      display: flex;
      gap: var(--uui-size-space-3);
      margin-bottom: var(--uui-size-space-3);
    }

    .form-row label {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      font-size: 0.875rem;
    }

    .form-row label.full-width {
      flex: 1;
    }

    .form-row input {
      padding: var(--uui-size-space-2);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
    }

    .create-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .selected-summary {
      color: var(--uui-color-text-alt);
    }
  `;
}

export default MerchelloFulfillmentModalElement;

declare global {
  interface HTMLElementTagNameMap {
    "merchello-fulfillment-modal": MerchelloFulfillmentModalElement;
  }
}

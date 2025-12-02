import { html as r, nothing as c, css as p, state as o, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as h } from "@umbraco-cms/backoffice/modal";
import { M as m } from "./merchello-api-Il9xQut5.js";
var v = Object.defineProperty, f = Object.getOwnPropertyDescriptor, l = (e, t, a, i) => {
  for (var s = i > 1 ? void 0 : i ? f(t, a) : t, u = e.length - 1, d; u >= 0; u--)
    (d = e[u]) && (s = (i ? d(t, a, s) : d(s)) || s);
  return i && s && v(t, a, s), s;
};
let n = class extends h {
  constructor() {
    super(...arguments), this._summary = null, this._loading = !0, this._error = null, this._creating = !1, this._shipmentsCreated = 0, this._selectedItems = /* @__PURE__ */ new Map(), this._showTrackingForm = !1, this._carrier = "", this._trackingNumber = "", this._trackingUrl = "", this._activeOrderId = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadFulfillmentSummary();
  }
  async _loadFulfillmentSummary() {
    this._loading = !0, this._error = null;
    const { data: e, error: t } = await m.getFulfillmentSummary(this.data.invoiceId);
    if (t) {
      this._error = t.message, this._loading = !1;
      return;
    }
    if (this._summary = e ?? null, this._loading = !1, this._summary) {
      for (const a of this._summary.orders)
        this._selectedItems.set(a.orderId, /* @__PURE__ */ new Map());
      this._summary.orders.length === 1 && (this._activeOrderId = this._summary.orders[0].orderId);
    }
  }
  _getStatusLabel(e) {
    return {
      0: "Pending",
      10: "Awaiting Stock",
      20: "Ready to Fulfill",
      30: "Processing",
      40: "Partially Shipped",
      50: "Shipped",
      60: "Completed",
      70: "Cancelled",
      80: "On Hold"
    }[e] || "Unknown";
  }
  _getStatusClass(e) {
    const t = e;
    return t >= 50 ? "shipped" : t >= 40 ? "partial" : t >= 20 ? "ready" : "pending";
  }
  _toggleItemSelection(e, t) {
    const a = this._selectedItems.get(e) ?? /* @__PURE__ */ new Map();
    a.has(t.id) ? a.delete(t.id) : a.set(t.id, {
      lineItemId: t.id,
      quantity: t.remainingQuantity,
      maxQuantity: t.remainingQuantity,
      name: t.name ?? "Unknown",
      sku: t.sku
    }), this._selectedItems.set(e, a), this._selectedItems = new Map(this._selectedItems);
  }
  _updateItemQuantity(e, t, a) {
    const i = this._selectedItems.get(e);
    if (!i) return;
    const s = i.get(t);
    if (!s) return;
    const u = Math.max(1, Math.min(a, s.maxQuantity));
    i.set(t, { ...s, quantity: u }), this._selectedItems = new Map(this._selectedItems);
  }
  _selectAllItems(e) {
    const t = this._summary?.orders.find((i) => i.orderId === e);
    if (!t) return;
    const a = /* @__PURE__ */ new Map();
    for (const i of t.lineItems)
      i.remainingQuantity > 0 && a.set(i.id, {
        lineItemId: i.id,
        quantity: i.remainingQuantity,
        maxQuantity: i.remainingQuantity,
        name: i.name ?? "Unknown",
        sku: i.sku
      });
    this._selectedItems.set(e, a), this._selectedItems = new Map(this._selectedItems);
  }
  _clearSelection(e) {
    this._selectedItems.set(e, /* @__PURE__ */ new Map()), this._selectedItems = new Map(this._selectedItems);
  }
  _getSelectedCount(e) {
    return this._selectedItems.get(e)?.size ?? 0;
  }
  _getTotalSelectedQuantity(e) {
    const t = this._selectedItems.get(e);
    return t ? Array.from(t.values()).reduce((a, i) => a + i.quantity, 0) : 0;
  }
  async _createShipment(e) {
    const t = this._selectedItems.get(e);
    if (!t || t.size === 0) return;
    this._creating = !0;
    const a = {};
    for (const [u, d] of t)
      a[u] = d.quantity;
    const i = {
      lineItems: a,
      carrier: this._carrier || void 0,
      trackingNumber: this._trackingNumber || void 0,
      trackingUrl: this._trackingUrl || void 0
    }, { error: s } = await m.createShipment(e, i);
    if (this._creating = !1, s) {
      this._error = s.message;
      return;
    }
    this._shipmentsCreated++, this._clearSelection(e), this._carrier = "", this._trackingNumber = "", this._trackingUrl = "", this._showTrackingForm = !1, await this._loadFulfillmentSummary();
  }
  async _deleteShipment(e) {
    if (!confirm("Are you sure you want to delete this shipment? Items will be released back to unfulfilled."))
      return;
    const { error: t } = await m.deleteShipment(e);
    if (t) {
      this._error = t.message;
      return;
    }
    await this._loadFulfillmentSummary();
  }
  _handleClose() {
    this.modalContext?.setValue({ shipmentsCreated: this._shipmentsCreated }), this.modalContext?.submit();
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }
  _renderUnfulfilledItems(e) {
    const t = e.lineItems.filter((i) => i.remainingQuantity > 0);
    if (t.length === 0)
      return r`<div class="empty-message">All items have been shipped</div>`;
    const a = this._selectedItems.get(e.orderId) ?? /* @__PURE__ */ new Map();
    return r`
      <div class="section-header">
        <span>Unfulfilled Items</span>
        <div class="section-actions">
          <uui-button
            look="secondary"
            compact
            label="Select All"
            @click=${() => this._selectAllItems(e.orderId)}
          >
            Select All
          </uui-button>
          ${a.size > 0 ? r`
                <uui-button
                  look="secondary"
                  compact
                  label="Clear"
                  @click=${() => this._clearSelection(e.orderId)}
                >
                  Clear
                </uui-button>
              ` : c}
        </div>
      </div>
      <div class="items-list">
        ${t.map((i) => {
      const s = a.has(i.id), u = a.get(i.id);
      return r`
            <div class="item-row ${s ? "selected" : ""}">
              <input
                type="checkbox"
                .checked=${s}
                @change=${() => this._toggleItemSelection(e.orderId, i)}
              />
              <div class="item-image">
                ${i.imageUrl ? r`<img src="${i.imageUrl}" alt="${i.name}" />` : r`<div class="placeholder-image"></div>`}
              </div>
              <div class="item-details">
                <div class="item-name">${i.name}</div>
                <div class="item-sku">${i.sku || "No SKU"}</div>
              </div>
              <div class="item-quantity">
                ${s ? r`
                      <input
                        type="number"
                        min="1"
                        max="${i.remainingQuantity}"
                        .value=${String(u?.quantity ?? i.remainingQuantity)}
                        @input=${(d) => this._updateItemQuantity(
        e.orderId,
        i.id,
        parseInt(d.target.value) || 1
      )}
                      />
                      <span class="qty-label">/ ${i.remainingQuantity} remaining</span>
                    ` : r`<span class="qty-label">${i.remainingQuantity} remaining</span>`}
              </div>
            </div>
          `;
    })}
      </div>
    `;
  }
  _renderExistingShipments(e) {
    return e.shipments.length === 0 ? c : r`
      <div class="shipments-section">
        <div class="section-header">
          <span>Existing Shipments (${e.shipments.length})</span>
        </div>
        <div class="shipments-list">
          ${e.shipments.map(
      (t) => r`
              <div class="shipment-card">
                <div class="shipment-header">
                  <span class="shipment-carrier">${t.carrier || "No carrier"}</span>
                  ${t.trackingNumber ? r`<span class="tracking-number">${t.trackingNumber}</span>` : c}
                  <span class="shipment-date">${this._formatDate(t.dateCreated)}</span>
                </div>
                <div class="shipment-items">
                  ${t.lineItems.map(
        (a) => r`
                      <span class="shipment-item">${a.name} × ${a.quantity}</span>
                    `
      )}
                </div>
                <div class="shipment-actions">
                  ${t.trackingUrl ? r`
                        <a href="${t.trackingUrl}" target="_blank" class="track-link">
                          Track
                        </a>
                      ` : c}
                  <uui-button
                    look="secondary"
                    color="danger"
                    compact
                    label="Delete"
                    @click=${() => this._deleteShipment(t.id)}
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
  _renderOrderCard(e) {
    const t = this._getSelectedCount(e.orderId), a = this._activeOrderId === e.orderId || this._summary?.orders.length === 1;
    return r`
      <div class="order-card">
        <div
          class="order-header"
          @click=${() => {
      this._activeOrderId = this._activeOrderId === e.orderId ? null : e.orderId;
    }}
        >
          <div class="order-info">
            <span class="warehouse-name">${e.warehouseName}</span>
            <span class="status-badge ${this._getStatusClass(e.status)}">
              ${this._getStatusLabel(e.status)}
            </span>
          </div>
          <div class="order-summary">
            <span class="delivery-method">${e.deliveryMethod}</span>
            <uui-icon name="${a ? "icon-navigation-up" : "icon-navigation-down"}"></uui-icon>
          </div>
        </div>

        ${a ? r`
              <div class="order-content">
                ${this._renderUnfulfilledItems(e)}
                ${this._renderExistingShipments(e)}

                ${t > 0 ? r`
                      <div class="create-shipment-section">
                        <div
                          class="tracking-toggle"
                          @click=${() => this._showTrackingForm = !this._showTrackingForm}
                        >
                          <uui-icon
                            name="${this._showTrackingForm ? "icon-navigation-down" : "icon-navigation-right"}"
                          ></uui-icon>
                          Add Tracking Info (optional)
                        </div>

                        ${this._showTrackingForm ? r`
                              <div class="tracking-form">
                                <div class="form-row">
                                  <label>
                                    Carrier
                                    <input
                                      type="text"
                                      placeholder="e.g., UPS, FedEx, DHL"
                                      .value=${this._carrier}
                                      @input=${(i) => this._carrier = i.target.value}
                                    />
                                  </label>
                                  <label>
                                    Tracking Number
                                    <input
                                      type="text"
                                      placeholder="e.g., 1Z999AA10123456784"
                                      .value=${this._trackingNumber}
                                      @input=${(i) => this._trackingNumber = i.target.value}
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
                                      @input=${(i) => this._trackingUrl = i.target.value}
                                    />
                                  </label>
                                </div>
                              </div>
                            ` : c}

                        <div class="create-action">
                          <span class="selected-summary">
                            ${this._getTotalSelectedQuantity(e.orderId)} items selected
                          </span>
                          <uui-button
                            look="primary"
                            label="Create Shipment"
                            ?disabled=${this._creating}
                            @click=${() => this._createShipment(e.orderId)}
                          >
                            ${this._creating ? "Creating..." : "Create Shipment"}
                          </uui-button>
                        </div>
                      </div>
                    ` : c}
              </div>
            ` : c}
      </div>
    `;
  }
  render() {
    return r`
      <umb-body-layout headline="Fulfil Order ${this._summary?.invoiceNumber ?? ""}">
        <div id="main">
          ${this._loading ? r`
                <div class="loading">
                  <uui-loader></uui-loader>
                </div>
              ` : this._error ? r`
                  <div class="error">
                    <uui-icon name="icon-alert"></uui-icon>
                    ${this._error}
                    <uui-button look="secondary" @click=${this._loadFulfillmentSummary}>
                      Retry
                    </uui-button>
                  </div>
                ` : this._summary ? r`
                    <div class="status-bar">
                      <span class="status-label">Overall Status:</span>
                      <span
                        class="status-badge ${this._summary.overallStatus.toLowerCase()}"
                      >
                        ${this._summary.overallStatus}
                      </span>
                    </div>

                    <div class="orders-list">
                      ${this._summary.orders.map((e) => this._renderOrderCard(e))}
                    </div>
                  ` : r`<div class="empty-message">No order data available</div>`}
        </div>

        <div slot="actions">
          <uui-button look="secondary" label="Close" @click=${this._handleClose}>
            Close
          </uui-button>
        </div>
      </umb-body-layout>
    `;
  }
};
n.styles = p`
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
l([
  o()
], n.prototype, "_summary", 2);
l([
  o()
], n.prototype, "_loading", 2);
l([
  o()
], n.prototype, "_error", 2);
l([
  o()
], n.prototype, "_creating", 2);
l([
  o()
], n.prototype, "_shipmentsCreated", 2);
l([
  o()
], n.prototype, "_selectedItems", 2);
l([
  o()
], n.prototype, "_showTrackingForm", 2);
l([
  o()
], n.prototype, "_carrier", 2);
l([
  o()
], n.prototype, "_trackingNumber", 2);
l([
  o()
], n.prototype, "_trackingUrl", 2);
l([
  o()
], n.prototype, "_activeOrderId", 2);
n = l([
  g("merchello-fulfillment-modal")
], n);
const k = n;
export {
  n as MerchelloFulfillmentModalElement,
  k as default
};
//# sourceMappingURL=fulfillment-modal.element-CtQE6G9i.js.map

import { LitElement as k, nothing as h, html as t, css as C, state as u, customElement as S } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as D } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as M } from "@umbraco-cms/backoffice/workspace";
import { UmbModalToken as T, UMB_MODAL_MANAGER_CONTEXT as E } from "@umbraco-cms/backoffice/modal";
import { M as _ } from "./merchello-api-Il9xQut5.js";
const U = new T("Merchello.Fulfillment.Modal", {
  modal: {
    type: "sidebar",
    size: "large"
  }
}), F = new T("Merchello.ShipmentEdit.Modal", {
  modal: {
    type: "sidebar",
    size: "small"
  }
});
var I = Object.defineProperty, P = Object.getOwnPropertyDescriptor, L = (e) => {
  throw TypeError(e);
}, f = (e, i, a, s) => {
  for (var r = s > 1 ? void 0 : s ? P(i, a) : i, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(i, a, r) : n(r)) || r);
  return s && r && I(i, a, r), r;
}, A = (e, i, a) => i.has(e) || L("Cannot " + a), g = (e, i, a) => (A(e, i, "read from private field"), a ? a.call(e) : i.get(e)), x = (e, i, a) => i.has(e) ? L("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(e) : i.set(e, a), w = (e, i, a, s) => (A(e, i, "write to private field"), i.set(e, a), a), c, p;
let d = class extends D(k) {
  constructor() {
    super(), this._invoiceId = null, this._fulfillmentData = null, this._loading = !0, this._error = null, x(this, c), x(this, p), this.consumeContext(M, (e) => {
      w(this, c, e), this.observe(g(this, c).order, (i) => {
        i?.id && i.id !== this._invoiceId && (this._invoiceId = i.id, this._loadShipments());
      });
    }), this.consumeContext(E, (e) => {
      w(this, p, e);
    });
  }
  async _loadShipments() {
    if (!this._invoiceId) return;
    this._loading = !0, this._error = null;
    const { data: e, error: i } = await _.getFulfillmentSummary(this._invoiceId);
    i ? this._error = i.message : this._fulfillmentData = e ?? null, this._loading = !1;
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }
  async _handleEditShipment(e) {
    if (!g(this, p)) return;
    (await g(this, p).open(this, F, {
      data: { shipment: e }
    }).onSubmit().catch(() => {
    }))?.updated && this._loadShipments();
  }
  async _handleDeleteShipment(e) {
    if (!confirm(
      "Are you sure you want to delete this shipment? This will release the items back to unfulfilled."
    )) return;
    const { error: a } = await _.deleteShipment(e.id);
    if (a) {
      alert(a.message);
      return;
    }
    this._loadShipments(), this._invoiceId && g(this, c)?.load(this._invoiceId);
  }
  _renderShipmentCard(e, i) {
    const a = this._getCarrierClass(e.carrier);
    return t`
      <div class="shipment-card">
        <div class="shipment-header">
          <div class="header-left">
            ${e.carrier ? t`<span class="carrier-badge ${a}">${e.carrier}</span>` : t`<span class="carrier-badge">No carrier</span>`}
            <span class="shipment-date">Created ${this._formatDate(e.dateCreated)}</span>
          </div>
          <div class="header-right">
            <uui-button look="secondary" compact label="Edit" @click=${() => this._handleEditShipment(e)}>
              <uui-icon name="icon-edit"></uui-icon>
              Edit
            </uui-button>
            <uui-button
              look="secondary"
              compact
              label="Delete"
              color="danger"
              @click=${() => this._handleDeleteShipment(e)}
            >
              <uui-icon name="icon-delete"></uui-icon>
            </uui-button>
          </div>
        </div>

        <div class="shipment-details">
          <div class="detail-row">
            <span class="label">Warehouse:</span>
            <span class="value">${i}</span>
          </div>
          ${e.trackingNumber ? t`
                <div class="detail-row">
                  <span class="label">Tracking:</span>
                  <span class="value tracking-value">
                    ${e.trackingUrl ? t`<a href="${e.trackingUrl}" target="_blank" rel="noopener"
                          >${e.trackingNumber}</a
                        >` : e.trackingNumber}
                    <button
                      class="copy-btn"
                      title="Copy tracking number"
                      @click=${() => this._copyToClipboard(e.trackingNumber)}
                    >
                      <uui-icon name="icon-documents"></uui-icon>
                    </button>
                  </span>
                </div>
              ` : h}
          ${e.actualDeliveryDate ? t`
                <div class="detail-row">
                  <span class="label">Delivered:</span>
                  <span class="value delivered">${this._formatDate(e.actualDeliveryDate)}</span>
                </div>
              ` : h}
        </div>

        <div class="shipment-items">
          <h4>Items in shipment</h4>
          ${e.lineItems.map(
      (s) => t`
              <div class="item-row">
                <div class="item-image">
                  ${s.imageUrl ? t`<img src="${s.imageUrl}" alt="${s.name}" />` : t`<div class="placeholder-image"></div>`}
                </div>
                <div class="item-info">
                  <div class="item-name">${s.name || "Unknown item"}</div>
                  ${s.sku ? t`<div class="item-sku">${s.sku}</div>` : h}
                </div>
                <div class="item-qty">x${s.quantity}</div>
              </div>
            `
    )}
        </div>
      </div>
    `;
  }
  _getCarrierClass(e) {
    if (!e) return "";
    const i = e.toLowerCase();
    return i.includes("ups") ? "ups" : i.includes("fedex") ? "fedex" : i.includes("dhl") ? "dhl" : i.includes("usps") ? "usps" : i.includes("royal mail") ? "royalmail" : "";
  }
  async _copyToClipboard(e) {
    try {
      await navigator.clipboard.writeText(e);
    } catch (i) {
      console.error("Failed to copy to clipboard", i);
    }
  }
  render() {
    if (this._loading)
      return t`<div class="loading"><uui-loader></uui-loader></div>`;
    if (this._error)
      return t`
        <div class="error">
          <uui-icon name="icon-alert"></uui-icon>
          ${this._error}
        </div>
      `;
    if (!this._fulfillmentData)
      return t`<div class="empty">No order data available</div>`;
    const e = [];
    for (const i of this._fulfillmentData.orders)
      for (const a of i.shipments)
        e.push({ shipment: a, warehouseName: i.warehouseName });
    return e.length === 0 ? t`
        <div class="empty-state">
          <uui-icon name="icon-box"></uui-icon>
          <h3>No shipments yet</h3>
          <p>Use the "Fulfil" button on the Details tab to create shipments for this order.</p>
        </div>
      ` : t`
      <div class="shipments-view">
        <div class="header">
          <h2>Shipments</h2>
          <div class="summary">
            <span class="status-badge ${this._fulfillmentData.overallStatus.toLowerCase()}">
              ${this._fulfillmentData.overallStatus}
            </span>
            <span class="count">${e.length} shipment${e.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <div class="shipments-list">
          ${e.map(({ shipment: i, warehouseName: a }) => this._renderShipmentCard(i, a))}
        </div>
      </div>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakMap();
d.styles = C`
    :host {
      display: block;
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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-layout-4);
      text-align: center;
      color: var(--uui-color-text-alt);
    }

    .empty-state uui-icon {
      font-size: 48px;
      margin-bottom: var(--uui-size-space-4);
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 var(--uui-size-space-2);
      font-size: 1.25rem;
    }

    .empty-state p {
      margin: 0;
      max-width: 400px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--uui-size-space-4);
    }

    .header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .summary {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3);
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.fulfilled {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.partial {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.unfulfilled {
      background: #f8d7da;
      color: #721c24;
    }

    .count {
      color: var(--uui-color-text-alt);
      font-size: 0.875rem;
    }

    .shipments-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-4);
    }

    .shipment-card {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      padding: var(--uui-size-space-4);
    }

    .shipment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--uui-size-space-3);
      padding-bottom: var(--uui-size-space-3);
      border-bottom: 1px solid var(--uui-color-border);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3);
    }

    .header-right {
      display: flex;
      gap: var(--uui-size-space-2);
    }

    .carrier-badge {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      background: var(--uui-color-surface-alt);
      color: var(--uui-color-text);
    }

    .carrier-badge.ups {
      background: #351c15;
      color: #ffb500;
    }

    .carrier-badge.fedex {
      background: #4d148c;
      color: #ff6600;
    }

    .carrier-badge.dhl {
      background: #ffcc00;
      color: #d40511;
    }

    .carrier-badge.usps {
      background: #004b87;
      color: white;
    }

    .carrier-badge.royalmail {
      background: #e4002b;
      color: white;
    }

    .shipment-date {
      font-size: 0.875rem;
      color: var(--uui-color-text-alt);
    }

    .shipment-details {
      margin-bottom: var(--uui-size-space-3);
    }

    .detail-row {
      display: flex;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-space-1) 0;
      font-size: 0.875rem;
    }

    .detail-row .label {
      color: var(--uui-color-text-alt);
      min-width: 80px;
    }

    .detail-row .value {
      font-weight: 500;
    }

    .tracking-value {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    .tracking-value a {
      color: var(--uui-color-interactive);
    }

    .copy-btn {
      background: none;
      border: none;
      padding: 2px;
      cursor: pointer;
      color: var(--uui-color-text-alt);
      opacity: 0.6;
    }

    .copy-btn:hover {
      opacity: 1;
    }

    .delivered {
      color: #155724;
    }

    .shipment-items {
      background: var(--uui-color-surface-alt);
      border-radius: var(--uui-border-radius);
      padding: var(--uui-size-space-3);
    }

    .shipment-items h4 {
      margin: 0 0 var(--uui-size-space-2);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--uui-color-text-alt);
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3);
      padding: var(--uui-size-space-2) 0;
    }

    .item-row:not(:last-child) {
      border-bottom: 1px solid var(--uui-color-border);
    }

    .item-image img,
    .placeholder-image {
      width: 40px;
      height: 40px;
      border-radius: var(--uui-border-radius);
      object-fit: cover;
    }

    .placeholder-image {
      background: var(--uui-color-surface);
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .item-sku {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
    }

    .item-qty {
      font-weight: 600;
      font-size: 0.875rem;
    }
  `;
f([
  u()
], d.prototype, "_invoiceId", 2);
f([
  u()
], d.prototype, "_fulfillmentData", 2);
f([
  u()
], d.prototype, "_loading", 2);
f([
  u()
], d.prototype, "_error", 2);
d = f([
  S("merchello-shipments-view")
], d);
var R = Object.defineProperty, W = Object.getOwnPropertyDescriptor, N = (e) => {
  throw TypeError(e);
}, y = (e, i, a, s) => {
  for (var r = s > 1 ? void 0 : s ? W(i, a) : i, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(i, a, r) : n(r)) || r);
  return s && r && R(i, a, r), r;
}, O = (e, i, a) => i.has(e) || N("Cannot " + a), b = (e, i, a) => (O(e, i, "read from private field"), a ? a.call(e) : i.get(e)), z = (e, i, a) => i.has(e) ? N("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(e) : i.set(e, a), $ = (e, i, a, s) => (O(e, i, "write to private field"), i.set(e, a), a), m, v;
let l = class extends D(k) {
  constructor() {
    super(), this._order = null, this._loading = !0, this._activeTab = "details", z(this, m), z(this, v), this.consumeContext(M, (e) => {
      $(this, m, e), this.observe(b(this, m).order, (i) => {
        this._order = i ?? null, this._loading = !i;
      });
    }), this.consumeContext(E, (e) => {
      $(this, v, e);
    });
  }
  async _openFulfillmentModal() {
    if (!this._order || !b(this, v)) return;
    await b(this, v).open(this, U, {
      data: { invoiceId: this._order.id }
    }).onSubmit().catch(() => {
    }), b(this, m)?.load(this._order.id);
  }
  _formatDate(e) {
    const i = new Date(e);
    return i.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }) + " at " + i.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  _formatCurrency(e) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(e);
  }
  _formatAddress(e) {
    if (!e) return ["No address"];
    const i = [];
    e.name && i.push(e.name), e.addressOne && i.push(e.addressOne), e.addressTwo && i.push(e.addressTwo);
    const a = [e.townCity, e.countyState, e.postalCode].filter(Boolean).join(" ");
    return a && i.push(a), e.country && i.push(e.country), e.phone && i.push(e.phone), i;
  }
  _renderFulfillmentCard(e) {
    const i = this._getStatusLabel(e.status), a = this._order?.fulfillmentStatus === "Fulfilled", s = e.status >= 50 ? "shipped" : "unfulfilled";
    return t`
      <div class="card fulfillment-card">
        <div class="card-header">
          <span class="status-badge ${s}">${i}</span>
          <span class="shipping-method">${e.deliveryMethod}</span>
        </div>
        <div class="line-items">
          ${e.lineItems.map(
      (r) => t`
              <div class="line-item">
                <div class="item-image">
                  ${r.imageUrl ? t`<img src="${r.imageUrl}" alt="${r.name}" />` : t`<div class="placeholder-image"></div>`}
                </div>
                <div class="item-details">
                  <div class="item-name">${r.name}</div>
                  <div class="item-sku">${r.sku}</div>
                </div>
                <div class="item-price">${this._formatCurrency(r.amount)} x ${r.quantity}</div>
                <div class="item-total">${this._formatCurrency(r.amount * r.quantity)}</div>
              </div>
            `
    )}
        </div>
        <div class="card-footer">
          <uui-button
            look="${a ? "secondary" : "primary"}"
            label="${a ? "Fulfilled" : "Fulfil"}"
            ?disabled=${a}
            @click=${a ? h : this._openFulfillmentModal}
          >
            ${a ? "Fulfilled" : "Fulfil"}
          </uui-button>
        </div>
      </div>
    `;
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
  _handleTabClick(e) {
    this._activeTab = e;
  }
  render() {
    if (this._loading)
      return t`<div class="loading"><uui-loader></uui-loader></div>`;
    if (!this._order)
      return t`<div class="error">Order not found</div>`;
    const e = this._order;
    return t`
      <div class="order-detail">
        <!-- Header -->
        <div class="order-header">
          <div class="header-left">
            <h1>${e.invoiceNumber || "Order"}</h1>
            <span class="badge ${e.paymentStatus.toLowerCase()}">${e.paymentStatus}</span>
            <span class="badge ${e.fulfillmentStatus.toLowerCase().replace(" ", "-")}">${e.fulfillmentStatus}</span>
          </div>
          <div class="header-right">
            <uui-button look="secondary" label="Refund">Refund</uui-button>
            <uui-button look="secondary" label="Edit">Edit</uui-button>
            <uui-button look="secondary" label="More actions">More actions</uui-button>
          </div>
        </div>
        <div class="order-meta">
          ${this._formatDate(e.dateCreated)} from ${e.channel}
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button
            class="tab ${this._activeTab === "details" ? "active" : ""}"
            @click=${() => this._handleTabClick("details")}
          >
            Details
          </button>
          <button
            class="tab ${this._activeTab === "shipments" ? "active" : ""}"
            @click=${() => this._handleTabClick("shipments")}
          >
            Shipments
          </button>
        </div>

        <!-- Tab Content -->
        ${this._activeTab === "shipments" ? t`<merchello-shipments-view></merchello-shipments-view>` : t`
        <!-- Main Content -->
        <div class="order-content">
          <!-- Left Column -->
          <div class="main-column">
            <!-- Fulfillment Cards -->
            ${e.orders.map((i) => this._renderFulfillmentCard(i))}

            <!-- Payment Summary -->
            <div class="card payment-card">
              <div class="card-header">
                <input type="checkbox" checked disabled />
                <span>${e.paymentStatus}</span>
              </div>
              <div class="payment-summary">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>${e.orders.reduce((i, a) => i + a.lineItems.reduce((s, r) => s + r.quantity, 0), 0)} items</span>
                  <span>${this._formatCurrency(e.subTotal)}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span>${e.orders[0]?.deliveryMethod || "Standard"}</span>
                  <span>${this._formatCurrency(e.shippingCost)}</span>
                </div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span></span>
                  <span>${this._formatCurrency(e.total)}</span>
                </div>
                <div class="summary-row">
                  <span>Paid</span>
                  <span></span>
                  <span>${this._formatCurrency(e.amountPaid)}</span>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div class="card timeline-card">
              <h3>Timeline</h3>
              <div class="timeline-input">
                <input type="text" placeholder="Leave a comment..." />
                <div class="timeline-actions">
                  <button title="Emoji">:-)</button>
                  <button title="Mention">@</button>
                  <button title="Tag">#</button>
                  <button title="Link">/</button>
                  <button disabled>Post</button>
                </div>
                <div class="timeline-note">Only you and other staff can see comments</div>
              </div>
              <div class="timeline-events">
                ${e.notes.length === 0 ? t`<div class="no-notes">No timeline events yet</div>` : e.notes.map(
      (i) => t`
                        <div class="timeline-event">
                          <div class="event-time">${this._formatDate(i.date)}</div>
                          <div class="event-text">${i.text}</div>
                          ${i.author ? t`<div class="event-author">by ${i.author}</div>` : h}
                        </div>
                      `
    )}
              </div>
            </div>
          </div>

          <!-- Right Column (Sidebar) -->
          <div class="sidebar">
            <!-- Notes -->
            <div class="card">
              <div class="card-header-with-action">
                <h3>Notes</h3>
                <button class="edit-btn" title="Edit">
                  <uui-icon name="icon-edit"></uui-icon>
                </button>
              </div>
              <p class="muted">No notes from customer</p>
            </div>

            <!-- Customer -->
            <div class="card">
              <div class="card-header-with-action">
                <h3>Customer</h3>
                <button class="close-btn" title="Close">&times;</button>
              </div>
              <div class="customer-info">
                <a href="#" class="customer-name">${e.billingAddress?.name || "Unknown"}</a>
                <div class="muted">1 order</div>
              </div>
              <div class="section">
                <div class="section-header">
                  <span>Contact information</span>
                  <button class="edit-btn" title="Edit">
                    <uui-icon name="icon-edit"></uui-icon>
                  </button>
                </div>
                ${e.billingAddress?.email ? t`<a href="mailto:${e.billingAddress.email}">${e.billingAddress.email}</a>` : t`<span class="muted">No email</span>`}
              </div>
              <div class="section">
                <div class="section-header">
                  <span>Shipping address</span>
                  <button class="edit-btn" title="Edit">
                    <uui-icon name="icon-edit"></uui-icon>
                  </button>
                </div>
                <div class="address">
                  ${this._formatAddress(e.shippingAddress).map((i) => t`<div>${i}</div>`)}
                </div>
                <a href="#" class="view-map">View map</a>
              </div>
              <div class="section">
                <div class="section-header">
                  <span>Billing address</span>
                  <button class="edit-btn" title="Edit">
                    <uui-icon name="icon-edit"></uui-icon>
                  </button>
                </div>
                ${e.billingAddress === e.shippingAddress ? t`<span class="muted">Same as shipping address</span>` : t`
                      <div class="address">
                        ${this._formatAddress(e.billingAddress).map((i) => t`<div>${i}</div>`)}
                      </div>
                    `}
              </div>
            </div>

            <!-- Tags -->
            <div class="card">
              <div class="card-header-with-action">
                <h3>Tags</h3>
                <button class="edit-btn" title="Edit">
                  <uui-icon name="icon-edit"></uui-icon>
                </button>
              </div>
              <input type="text" placeholder="Add tags..." class="tags-input" />
            </div>
          </div>
        </div>
        `}
      </div>
    `;
  }
};
m = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
l.styles = C`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
      background: var(--uui-color-background);
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: var(--uui-size-layout-2);
    }

    .error {
      padding: var(--uui-size-space-4);
      background: #f8d7da;
      color: #721c24;
      border-radius: var(--uui-border-radius);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--uui-size-space-2);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    .header-left h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .header-right {
      display: flex;
      gap: var(--uui-size-space-2);
    }

    .order-meta {
      color: var(--uui-color-text-alt);
      font-size: 0.875rem;
      margin-bottom: var(--uui-size-space-4);
    }

    .tabs {
      display: flex;
      gap: var(--uui-size-space-1);
      border-bottom: 1px solid var(--uui-color-border);
      margin-bottom: var(--uui-size-space-4);
    }

    .tab {
      padding: var(--uui-size-space-2) var(--uui-size-space-4);
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--uui-color-text-alt);
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--uui-color-text);
    }

    .tab.active {
      color: var(--uui-color-text);
      border-bottom-color: var(--uui-color-current);
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge.paid {
      background: #d4edda;
      color: #155724;
    }

    .badge.unpaid {
      background: #f8d7da;
      color: #721c24;
    }

    .badge.fulfilled {
      background: #d4edda;
      color: #155724;
    }

    .badge.unfulfilled {
      background: #fff3cd;
      color: #856404;
    }

    .order-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: var(--uui-size-space-4);
    }

    @media (max-width: 1024px) {
      .order-content {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      padding: var(--uui-size-space-4);
      margin-bottom: var(--uui-size-space-4);
    }

    .card h3 {
      margin: 0 0 var(--uui-size-space-3);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      margin-bottom: var(--uui-size-space-3);
    }

    .card-header-with-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--uui-size-space-3);
    }

    .card-header-with-action h3 {
      margin: 0;
    }

    .card-footer {
      margin-top: var(--uui-size-space-3);
      padding-top: var(--uui-size-space-3);
      border-top: 1px solid var(--uui-color-border);
    }

    .status-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.shipped {
      background: #d4edda;
      color: #155724;
    }

    .shipping-method {
      font-size: 0.875rem;
      color: var(--uui-color-text-alt);
    }

    .line-items {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-3);
    }

    .line-item {
      display: grid;
      grid-template-columns: 50px 1fr auto auto;
      gap: var(--uui-size-space-3);
      align-items: center;
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

    .item-price,
    .item-total {
      font-size: 0.875rem;
    }

    .payment-summary {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
    }

    .summary-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: var(--uui-size-space-2);
      font-size: 0.875rem;
    }

    .summary-row.total {
      font-weight: 600;
      padding-top: var(--uui-size-space-2);
      border-top: 1px solid var(--uui-color-border);
    }

    .timeline-input {
      margin-bottom: var(--uui-size-space-4);
    }

    .timeline-input input {
      width: 100%;
      padding: var(--uui-size-space-2);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      margin-bottom: var(--uui-size-space-2);
    }

    .timeline-actions {
      display: flex;
      gap: var(--uui-size-space-2);
    }

    .timeline-actions button {
      padding: var(--uui-size-space-1) var(--uui-size-space-2);
      border: none;
      background: none;
      cursor: pointer;
      color: var(--uui-color-text-alt);
    }

    .timeline-actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .timeline-note {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
      margin-top: var(--uui-size-space-1);
    }

    .timeline-events {
      border-top: 1px solid var(--uui-color-border);
      padding-top: var(--uui-size-space-3);
    }

    .timeline-event {
      padding: var(--uui-size-space-2) 0;
      border-bottom: 1px solid var(--uui-color-border);
    }

    .event-time {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
    }

    .no-notes {
      color: var(--uui-color-text-alt);
      font-style: italic;
    }

    .sidebar .card {
      margin-bottom: var(--uui-size-space-3);
    }

    .muted {
      color: var(--uui-color-text-alt);
      font-size: 0.875rem;
    }

    .customer-name {
      color: var(--uui-color-interactive);
      text-decoration: none;
      font-weight: 500;
    }

    .section {
      margin-top: var(--uui-size-space-3);
      padding-top: var(--uui-size-space-3);
      border-top: 1px solid var(--uui-color-border);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--uui-size-space-2);
      font-weight: 500;
      font-size: 0.875rem;
    }

    .address {
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .view-map {
      display: inline-block;
      margin-top: var(--uui-size-space-2);
      color: var(--uui-color-interactive);
      font-size: 0.875rem;
    }

    .edit-btn,
    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--uui-size-space-1);
      color: var(--uui-color-text-alt);
    }

    .tags-input {
      width: 100%;
      padding: var(--uui-size-space-2);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
    }
  `;
y([
  u()
], l.prototype, "_order", 2);
y([
  u()
], l.prototype, "_loading", 2);
y([
  u()
], l.prototype, "_activeTab", 2);
l = y([
  S("merchello-order-detail")
], l);
const V = l;
export {
  l as MerchelloOrderDetailElement,
  V as default
};
//# sourceMappingURL=order-detail.element-D11fnDIE.js.map

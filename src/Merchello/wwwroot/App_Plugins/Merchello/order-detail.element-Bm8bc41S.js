import { LitElement as b, html as a, nothing as y, css as _, state as h, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as z } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as w } from "@umbraco-cms/backoffice/workspace";
import { UmbModalToken as $, UMB_MODAL_MANAGER_CONTEXT as C } from "@umbraco-cms/backoffice/modal";
const k = new $("Merchello.Fulfillment.Modal", {
  modal: {
    type: "sidebar",
    size: "large"
  }
});
var S = Object.defineProperty, M = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, p = (e, i, t, s) => {
  for (var r = s > 1 ? void 0 : s ? M(i, t) : i, u = e.length - 1, c; u >= 0; u--)
    (c = e[u]) && (r = (s ? c(i, t, r) : c(r)) || r);
  return s && r && S(i, t, r), r;
}, f = (e, i, t) => i.has(e) || g("Cannot " + t), l = (e, i, t) => (f(e, i, "read from private field"), t ? t.call(e) : i.get(e)), m = (e, i, t) => i.has(e) ? g("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(e) : i.set(e, t), v = (e, i, t, s) => (f(e, i, "write to private field"), i.set(e, t), t), n, d;
let o = class extends z(b) {
  constructor() {
    super(), this._order = null, this._loading = !0, m(this, n), m(this, d), this.consumeContext(w, (e) => {
      v(this, n, e), this.observe(l(this, n).order, (i) => {
        this._order = i ?? null, this._loading = !i;
      });
    }), this.consumeContext(C, (e) => {
      v(this, d, e);
    });
  }
  async _openFulfillmentModal() {
    if (!this._order || !l(this, d)) return;
    const i = await l(this, d).open(this, k, {
      data: { invoiceId: this._order.id }
    }).onSubmit().catch(() => {
    });
    i && i.shipmentsCreated > 0 && l(this, n)?.load(this._order.id);
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
    const t = [e.townCity, e.countyState, e.postalCode].filter(Boolean).join(" ");
    return t && i.push(t), e.country && i.push(e.country), e.phone && i.push(e.phone), i;
  }
  _renderFulfillmentCard(e) {
    const i = this._getStatusLabel(e.status);
    return a`
      <div class="card fulfillment-card">
        <div class="card-header">
          <span class="status-badge unfulfilled">${i}</span>
          <span class="shipping-method">${e.deliveryMethod}</span>
        </div>
        <div class="line-items">
          ${e.lineItems.map(
      (t) => a`
              <div class="line-item">
                <div class="item-image">
                  ${t.imageUrl ? a`<img src="${t.imageUrl}" alt="${t.name}" />` : a`<div class="placeholder-image"></div>`}
                </div>
                <div class="item-details">
                  <div class="item-name">${t.name}</div>
                  <div class="item-sku">${t.sku}</div>
                </div>
                <div class="item-price">${this._formatCurrency(t.amount)} x ${t.quantity}</div>
                <div class="item-total">${this._formatCurrency(t.amount * t.quantity)}</div>
              </div>
            `
    )}
        </div>
        <div class="card-footer">
          <uui-button look="primary" label="Fulfil" @click=${this._openFulfillmentModal}>Fulfil</uui-button>
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
  render() {
    if (this._loading)
      return a`<div class="loading"><uui-loader></uui-loader></div>`;
    if (!this._order)
      return a`<div class="error">Order not found</div>`;
    const e = this._order;
    return a`
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
                  <span>${e.orders.reduce((i, t) => i + t.lineItems.reduce((s, r) => s + r.quantity, 0), 0)} items</span>
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
                ${e.notes.length === 0 ? a`<div class="no-notes">No timeline events yet</div>` : e.notes.map(
      (i) => a`
                        <div class="timeline-event">
                          <div class="event-time">${this._formatDate(i.date)}</div>
                          <div class="event-text">${i.text}</div>
                          ${i.author ? a`<div class="event-author">by ${i.author}</div>` : y}
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
                ${e.billingAddress?.email ? a`<a href="mailto:${e.billingAddress.email}">${e.billingAddress.email}</a>` : a`<span class="muted">No email</span>`}
              </div>
              <div class="section">
                <div class="section-header">
                  <span>Shipping address</span>
                  <button class="edit-btn" title="Edit">
                    <uui-icon name="icon-edit"></uui-icon>
                  </button>
                </div>
                <div class="address">
                  ${this._formatAddress(e.shippingAddress).map((i) => a`<div>${i}</div>`)}
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
                ${e.billingAddress === e.shippingAddress ? a`<span class="muted">Same as shipping address</span>` : a`
                      <div class="address">
                        ${this._formatAddress(e.billingAddress).map((i) => a`<div>${i}</div>`)}
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
      </div>
    `;
  }
};
n = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakMap();
o.styles = _`
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
p([
  h()
], o.prototype, "_order", 2);
p([
  h()
], o.prototype, "_loading", 2);
o = p([
  x("merchello-order-detail")
], o);
const O = o;
export {
  o as MerchelloOrderDetailElement,
  O as default
};
//# sourceMappingURL=order-detail.element-Bm8bc41S.js.map

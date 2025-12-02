import { LitElement as y, nothing as h, html as t, css as x, state as u, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as z } from "@umbraco-cms/backoffice/workspace";
import { UmbModalToken as $, UMB_MODAL_MANAGER_CONTEXT as D } from "@umbraco-cms/backoffice/modal";
import { M as v } from "./merchello-api-Il9xQut5.js";
const S = new $("Merchello.ShipmentEdit.Modal", {
  modal: {
    type: "sidebar",
    size: "small"
  }
});
var C = Object.defineProperty, E = Object.getOwnPropertyDescriptor, b = (e) => {
  throw TypeError(e);
}, d = (e, i, a, r) => {
  for (var o = r > 1 ? void 0 : r ? E(i, a) : i, p = e.length - 1, m; p >= 0; p--)
    (m = e[p]) && (o = (r ? m(i, a, o) : m(o)) || o);
  return r && o && C(i, a, o), o;
}, _ = (e, i, a) => i.has(e) || b("Cannot " + a), c = (e, i, a) => (_(e, i, "read from private field"), a ? a.call(e) : i.get(e)), f = (e, i, a) => i.has(e) ? b("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(e) : i.set(e, a), g = (e, i, a, r) => (_(e, i, "write to private field"), i.set(e, a), a), l, n;
let s = class extends k(y) {
  constructor() {
    super(), this._invoiceId = null, this._fulfillmentData = null, this._loading = !0, this._error = null, f(this, l), f(this, n), this.consumeContext(z, (e) => {
      g(this, l, e), this.observe(c(this, l).order, (i) => {
        i?.id && i.id !== this._invoiceId && (this._invoiceId = i.id, this._loadShipments());
      });
    }), this.consumeContext(D, (e) => {
      g(this, n, e);
    });
  }
  async _loadShipments() {
    if (!this._invoiceId) return;
    this._loading = !0, this._error = null;
    const { data: e, error: i } = await v.getFulfillmentSummary(this._invoiceId);
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
    if (!c(this, n)) return;
    (await c(this, n).open(this, S, {
      data: { shipment: e }
    }).onSubmit().catch(() => {
    }))?.updated && this._loadShipments();
  }
  async _handleDeleteShipment(e) {
    if (!confirm(
      "Are you sure you want to delete this shipment? This will release the items back to unfulfilled."
    )) return;
    const { error: a } = await v.deleteShipment(e.id);
    if (a) {
      alert(a.message);
      return;
    }
    this._loadShipments(), this._invoiceId && c(this, l)?.load(this._invoiceId);
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
      (r) => t`
              <div class="item-row">
                <div class="item-image">
                  ${r.imageUrl ? t`<img src="${r.imageUrl}" alt="${r.name}" />` : t`<div class="placeholder-image"></div>`}
                </div>
                <div class="item-info">
                  <div class="item-name">${r.name || "Unknown item"}</div>
                  ${r.sku ? t`<div class="item-sku">${r.sku}</div>` : h}
                </div>
                <div class="item-qty">x${r.quantity}</div>
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
l = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakMap();
s.styles = x`
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
d([
  u()
], s.prototype, "_invoiceId", 2);
d([
  u()
], s.prototype, "_fulfillmentData", 2);
d([
  u()
], s.prototype, "_loading", 2);
d([
  u()
], s.prototype, "_error", 2);
s = d([
  w("merchello-shipments-view")
], s);
const O = s;
export {
  s as MerchelloShipmentsViewElement,
  O as default
};
//# sourceMappingURL=shipments-view.element-BTPi2SFV.js.map

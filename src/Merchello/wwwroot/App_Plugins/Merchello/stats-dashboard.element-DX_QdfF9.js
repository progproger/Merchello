import { LitElement as h, html as l, css as g, state as c, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
import { M as d } from "./merchello-api-Il9xQut5.js";
var v = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, u = (t, e, r, i) => {
  for (var a = i > 1 ? void 0 : i ? _(e, r) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (a = (i ? n(e, r, a) : n(a)) || a);
  return i && a && v(e, r, a), a;
};
let s = class extends b(h) {
  constructor() {
    super(...arguments), this._stats = null, this._recentOrders = [], this._loading = !0;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadData();
  }
  async _loadData() {
    this._loading = !0;
    const [t, e] = await Promise.all([
      d.getDashboardStats(),
      d.getOrders({ pageSize: 15, sortBy: "date", sortDir: "desc" })
    ]);
    t.data && (this._stats = t.data), e.data && (this._recentOrders = e.data.items), this._loading = !1;
  }
  _formatCurrency(t) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP"
    }).format(t);
  }
  _formatDate(t) {
    return new Date(t).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }
  _formatPercent(t) {
    return `${t >= 0 ? "+" : ""}${t}%`;
  }
  _getChangeClass(t) {
    return t > 0 ? "positive" : t < 0 ? "negative" : "neutral";
  }
  _getOrderHref(t) {
    return `section/merchello/workspace/merchello-order/edit/${t}`;
  }
  _getStatusBadgeColor(t) {
    switch (t.toLowerCase()) {
      case "fulfilled":
        return "positive";
      case "partial":
        return "warning";
      case "unfulfilled":
      default:
        return "default";
    }
  }
  _getPaymentBadgeColor(t) {
    return t.toLowerCase() === "paid" ? "positive" : "warning";
  }
  render() {
    return this._loading ? l`
        <div class="loading">
          <uui-loader></uui-loader>
        </div>
      ` : l`
      <div class="stats-grid">
        <uui-box headline="Orders">
          <div class="stat-value">${this._stats?.ordersThisMonth ?? 0}</div>
          <div class="stat-label">This Month</div>
          <div class="stat-change ${this._getChangeClass(this._stats?.ordersChangePercent ?? 0)}">
            ${this._formatPercent(this._stats?.ordersChangePercent ?? 0)} from last month
          </div>
        </uui-box>

        <uui-box headline="Revenue">
          <div class="stat-value">${this._formatCurrency(this._stats?.revenueThisMonth ?? 0)}</div>
          <div class="stat-label">This Month</div>
          <div class="stat-change ${this._getChangeClass(this._stats?.revenueChangePercent ?? 0)}">
            ${this._formatPercent(this._stats?.revenueChangePercent ?? 0)} from last month
          </div>
        </uui-box>

        <uui-box headline="Products">
          <div class="stat-value">${this._stats?.productCount ?? 0}</div>
          <div class="stat-label">Active Products</div>
          <div class="stat-change ${this._getChangeClass(this._stats?.productCountChange ?? 0)}">
            ${this._stats?.productCountChange !== 0 ? `${this._stats?.productCountChange > 0 ? "+" : ""}${this._stats?.productCountChange} this month` : "No change"}
          </div>
        </uui-box>

        <uui-box headline="Customers">
          <div class="stat-value">${this._stats?.customerCount ?? 0}</div>
          <div class="stat-label">Unique Customers</div>
          <div class="stat-change ${this._getChangeClass(this._stats?.customerCountChange ?? 0)}">
            ${this._stats?.customerCountChange !== 0 ? `+${this._stats?.customerCountChange} new this month` : "No new customers"}
          </div>
        </uui-box>
      </div>

      <uui-box headline="Recent Orders" class="wide">
        ${this._recentOrders.length === 0 ? l`<p class="no-data">No orders yet</p>` : l`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Order #</uui-table-head-cell>
                  <uui-table-head-cell>Customer</uui-table-head-cell>
                  <uui-table-head-cell>Date</uui-table-head-cell>
                  <uui-table-head-cell>Payment</uui-table-head-cell>
                  <uui-table-head-cell>Fulfillment</uui-table-head-cell>
                  <uui-table-head-cell>Total</uui-table-head-cell>
                </uui-table-head>
                ${this._recentOrders.map(
      (t) => l`
                    <uui-table-row>
                      <uui-table-cell>
                        <a href=${this._getOrderHref(t.id)}>#${t.invoiceNumber}</a>
                      </uui-table-cell>
                      <uui-table-cell>${t.customerName}</uui-table-cell>
                      <uui-table-cell>${this._formatDate(t.dateCreated)}</uui-table-cell>
                      <uui-table-cell>
                        <uui-badge color=${this._getPaymentBadgeColor(t.paymentStatus)}>
                          ${t.paymentStatus}
                        </uui-badge>
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-badge color=${this._getStatusBadgeColor(t.fulfillmentStatus)}>
                          ${t.fulfillmentStatus}
                        </uui-badge>
                      </uui-table-cell>
                      <uui-table-cell>${this._formatCurrency(t.total)}</uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
};
s.styles = [
  g`
      :host {
        display: block;
        padding: var(--uui-size-layout-1);
      }

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--uui-size-layout-1);
        margin-bottom: var(--uui-size-layout-1);
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--uui-color-text);
        margin-bottom: var(--uui-size-space-2);
      }

      .stat-label {
        font-size: var(--uui-type-small-size);
        color: var(--uui-color-text-alt);
        margin-bottom: var(--uui-size-space-2);
      }

      .stat-change {
        font-size: var(--uui-type-small-size);
      }

      .stat-change.positive {
        color: var(--uui-color-positive);
      }

      .stat-change.negative {
        color: var(--uui-color-danger);
      }

      .stat-change.neutral {
        color: var(--uui-color-text-alt);
      }

      .wide {
        grid-column: span 4;
      }

      uui-table {
        width: 100%;
      }

      uui-badge {
        vertical-align: middle;
        --uui-badge-inset: 0;
      }

      uui-table-cell a {
        color: var(--uui-color-interactive);
        text-decoration: none;
      }

      uui-table-cell a:hover {
        text-decoration: underline;
      }

      .no-data {
        text-align: center;
        color: var(--uui-color-text-alt);
        padding: var(--uui-size-layout-2);
      }
    `
];
u([
  c()
], s.prototype, "_stats", 2);
u([
  c()
], s.prototype, "_recentOrders", 2);
u([
  c()
], s.prototype, "_loading", 2);
s = u([
  m("merchello-stats-dashboard")
], s);
const y = s;
export {
  s as MerchelloStatsDashboardElement,
  y as default
};
//# sourceMappingURL=stats-dashboard.element-DX_QdfF9.js.map

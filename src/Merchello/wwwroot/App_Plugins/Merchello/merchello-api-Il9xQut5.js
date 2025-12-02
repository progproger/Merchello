const d = "/umbraco/api/v1";
let s = {
  token: void 0,
  baseUrl: "",
  credentials: "same-origin"
};
function w(e) {
  s = { ...s, ...e };
}
async function u() {
  const e = {
    "Content-Type": "application/json"
  };
  if (s.token) {
    const t = await s.token();
    t && (e.Authorization = `Bearer ${t}`);
  }
  return e;
}
async function o(e) {
  try {
    const t = await u(), n = s.baseUrl || "", r = await fetch(`${n}${d}/${e}`, {
      method: "GET",
      credentials: s.credentials,
      headers: t
    });
    if (!r.ok)
      return { error: new Error(`HTTP ${r.status}: ${r.statusText}`) };
    const a = r.headers.get("content-type") || "";
    let i;
    return a.includes("application/json") ? i = await r.json() : i = await r.text(), { data: i };
  } catch (t) {
    return { error: t instanceof Error ? t : new Error(String(t)) };
  }
}
async function l(e, t) {
  try {
    const n = await u(), r = s.baseUrl || "", a = await fetch(`${r}${d}/${e}`, {
      method: "POST",
      credentials: s.credentials,
      headers: n,
      body: t ? JSON.stringify(t) : void 0
    });
    if (!a.ok) {
      const c = await a.text();
      return { error: new Error(c || `HTTP ${a.status}: ${a.statusText}`) };
    }
    return (a.headers.get("content-type") || "").includes("application/json") ? { data: await a.json() } : { data: void 0 };
  } catch (n) {
    return { error: n instanceof Error ? n : new Error(String(n)) };
  }
}
async function h(e, t) {
  try {
    const n = await u(), r = s.baseUrl || "", a = await fetch(`${r}${d}/${e}`, {
      method: "PUT",
      credentials: s.credentials,
      headers: n,
      body: t ? JSON.stringify(t) : void 0
    });
    if (!a.ok) {
      const c = await a.text();
      return { error: new Error(c || `HTTP ${a.status}: ${a.statusText}`) };
    }
    return (a.headers.get("content-type") || "").includes("application/json") ? { data: await a.json() } : { data: void 0 };
  } catch (n) {
    return { error: n instanceof Error ? n : new Error(String(n)) };
  }
}
async function p(e) {
  try {
    const t = await u(), n = s.baseUrl || "", r = await fetch(`${n}${d}/${e}`, {
      method: "DELETE",
      credentials: s.credentials,
      headers: t
    });
    if (!r.ok) {
      const a = await r.text();
      return { error: new Error(a || `HTTP ${r.status}: ${r.statusText}`) };
    }
    return {};
  } catch (t) {
    return { error: t instanceof Error ? t : new Error(String(t)) };
  }
}
function f(e) {
  if (!e) return "";
  const t = new URLSearchParams();
  for (const [n, r] of Object.entries(e))
    r != null && r !== "" && t.append(n, String(r));
  return t.toString();
}
const T = {
  ping: () => o("ping"),
  whatsMyName: () => o("whatsMyName"),
  whatsTheTimeMrWolf: () => o("whatsTheTimeMrWolf"),
  whoAmI: () => o("whoAmI"),
  // Orders API
  getOrders: (e) => {
    const t = f(e);
    return o(`orders${t ? `?${t}` : ""}`);
  },
  getOrder: (e) => o(`orders/${e}`),
  getOrderStats: () => o("orders/stats"),
  getDashboardStats: () => o("orders/dashboard-stats"),
  // Fulfillment API
  /** Get fulfillment summary for an invoice (used in fulfillment dialog) */
  getFulfillmentSummary: (e) => o(`orders/${e}/fulfillment-summary`),
  /** Create a shipment for an order */
  createShipment: (e, t) => l(`orders/${e}/shipments`, t),
  /** Update shipment tracking information */
  updateShipment: (e, t) => h(`shipments/${e}`, t),
  /** Delete a shipment (releases items back to unfulfilled) */
  deleteShipment: (e) => p(`shipments/${e}`)
};
export {
  T as M,
  w as s
};
//# sourceMappingURL=merchello-api-Il9xQut5.js.map

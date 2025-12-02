const l = "/umbraco/api/v1";
let o = {
  token: void 0,
  baseUrl: "",
  credentials: "same-origin"
};
function f(r) {
  o = { ...o, ...r };
}
async function n(r) {
  try {
    const e = {
      "Content-Type": "application/json"
    };
    if (o.token) {
      const s = await o.token();
      s && (e.Authorization = `Bearer ${s}`);
    }
    const a = o.baseUrl || "", t = await fetch(`${a}${l}/${r}`, {
      method: "GET",
      credentials: o.credentials,
      headers: e
    });
    if (!t.ok)
      return { error: new Error(`HTTP ${t.status}: ${t.statusText}`) };
    const c = t.headers.get("content-type") || "";
    let i;
    return c.includes("application/json") ? i = await t.json() : i = await t.text(), { data: i };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}
function u(r) {
  if (!r) return "";
  const e = new URLSearchParams();
  for (const [a, t] of Object.entries(r))
    t != null && t !== "" && e.append(a, String(t));
  return e.toString();
}
const h = {
  ping: () => n("ping"),
  whatsMyName: () => n("whatsMyName"),
  whatsTheTimeMrWolf: () => n("whatsTheTimeMrWolf"),
  whoAmI: () => n("whoAmI"),
  // Orders API
  getOrders: (r) => {
    const e = u(r);
    return n(`orders${e ? `?${e}` : ""}`);
  },
  getOrder: (r) => n(`orders/${r}`)
};
export {
  h as M,
  f as s
};
//# sourceMappingURL=merchello-api-CdBya1Dq.js.map

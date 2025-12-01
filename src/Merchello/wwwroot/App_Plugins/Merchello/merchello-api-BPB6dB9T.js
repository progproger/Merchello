const l = "/umbraco/api/v1";
let n = {
  token: void 0,
  baseUrl: "",
  credentials: "same-origin"
};
function p(r) {
  n = { ...n, ...r };
}
async function o(r) {
  try {
    const e = {
      "Content-Type": "application/json"
    };
    if (n.token) {
      const s = await n.token();
      s && (e.Authorization = `Bearer ${s}`);
    }
    const i = n.baseUrl || "", t = await fetch(`${i}${l}/${r}`, {
      method: "GET",
      credentials: n.credentials,
      headers: e
    });
    if (!t.ok)
      return { error: new Error(`HTTP ${t.status}: ${t.statusText}`) };
    const c = t.headers.get("content-type") || "";
    let a;
    return c.includes("application/json") ? a = await t.json() : a = await t.text(), { data: a };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}
const h = {
  ping: () => o("ping"),
  whatsMyName: () => o("whatsMyName"),
  whatsTheTimeMrWolf: () => o("whatsTheTimeMrWolf"),
  whoAmI: () => o("whoAmI")
};
export {
  h as M,
  p as s
};
//# sourceMappingURL=merchello-api-BPB6dB9T.js.map

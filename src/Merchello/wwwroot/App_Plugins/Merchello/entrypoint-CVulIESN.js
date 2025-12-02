import { UMB_AUTH_CONTEXT as s } from "@umbraco-cms/backoffice/auth";
import { s as i } from "./merchello-api-Il9xQut5.js";
const l = (n, e) => {
  console.log("Hello from my extension 🎉"), n.consumeContext(s, async (t) => {
    const o = t?.getOpenApiConfiguration();
    i({
      token: o?.token,
      baseUrl: o?.base ?? "",
      credentials: o?.credentials ?? "same-origin"
    });
  });
}, m = (n, e) => {
  console.log("Goodbye from my extension 👋");
};
export {
  l as onInit,
  m as onUnload
};
//# sourceMappingURL=entrypoint-CVulIESN.js.map

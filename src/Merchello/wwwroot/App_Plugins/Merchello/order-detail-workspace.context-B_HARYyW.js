import { UmbControllerBase as s } from "@umbraco-cms/backoffice/class-api";
import { UMB_WORKSPACE_CONTEXT as t, UmbWorkspaceRouteManager as a } from "@umbraco-cms/backoffice/workspace";
import { UmbObjectState as i } from "@umbraco-cms/backoffice/observable-api";
import { M as l } from "./merchello-api-CdBya1Dq.js";
class m extends s {
  constructor(r) {
    super(r, t.toString()), this.workspaceAlias = "Merchello.Order.Detail.Workspace", this.#r = new i(void 0), this.order = this.#r.asObservable(), this.routes = new a(r), this.provideContext(t, this);
  }
  #e;
  #r;
  getEntityType() {
    return "merchello-order";
  }
  getUnique() {
    return this.#e;
  }
  async load(r) {
    this.#e = r;
    const { data: o, error: e } = await l.getOrder(r);
    if (e) {
      console.error("Failed to load order:", e);
      return;
    }
    this.#r.setValue(o);
  }
}
export {
  m as MerchelloOrderDetailWorkspaceContext,
  m as api
};
//# sourceMappingURL=order-detail-workspace.context-B_HARYyW.js.map

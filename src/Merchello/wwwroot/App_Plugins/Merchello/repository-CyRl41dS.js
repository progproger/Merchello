import { UmbTreeRepositoryBase as o } from "@umbraco-cms/backoffice/tree";
import { UmbControllerBase as s } from "@umbraco-cms/backoffice/class-api";
const n = "merchello-root";
class l extends s {
  async getRootItems(e) {
    const t = [
      {
        entityType: "merchello-orders",
        unique: "orders",
        name: "Orders",
        hasChildren: !1,
        isFolder: !1,
        icon: "icon-receipt-dollar",
        parent: { unique: null, entityType: "merchello-root" }
      },
      {
        entityType: "merchello-settings",
        unique: "settings",
        name: "Settings",
        hasChildren: !1,
        isFolder: !1,
        icon: "icon-settings",
        parent: { unique: null, entityType: "merchello-root" }
      }
    ];
    return { data: { items: t, total: t.length } };
  }
  async getChildrenOf(e) {
    return { data: { items: [], total: 0 } };
  }
  async getAncestorsOf(e) {
    return { data: [] };
  }
}
class c extends o {
  constructor(e) {
    super(e, l);
  }
  async requestTreeRoot() {
    return { data: {
      unique: null,
      entityType: n,
      name: "Merchello",
      hasChildren: !0,
      isFolder: !0
    } };
  }
}
export {
  c as MerchelloTreeRepository,
  c as api
};
//# sourceMappingURL=repository-CyRl41dS.js.map

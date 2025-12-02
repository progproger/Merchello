export const manifests: Array<UmbExtensionManifest> = [
  // Fulfillment modal for creating shipments
  {
    type: "modal",
    alias: "Merchello.Fulfillment.Modal",
    name: "Merchello Fulfillment Modal",
    js: () => import("./fulfillment/fulfillment-modal.element.js"),
  },

  // Shipment edit modal for updating tracking info
  {
    type: "modal",
    alias: "Merchello.ShipmentEdit.Modal",
    name: "Merchello Shipment Edit Modal",
    js: () => import("./shipments/shipment-edit-modal.element.js"),
  },

  // Workspace for orders list (when clicking "Orders" in tree)
  {
    type: "workspace",
    kind: "default",
    alias: "Merchello.Orders.Workspace",
    name: "Merchello Orders Workspace",
    meta: {
      entityType: "merchello-orders",
      headline: "Orders",
    },
  },

  // Workspace view - the orders list
  {
    type: "workspaceView",
    alias: "Merchello.Orders.ListView",
    name: "Orders List View",
    js: () => import("./orders-list.element.js"),
    weight: 100,
    meta: {
      label: "Orders",
      pathname: "list",
      icon: "icon-list",
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Merchello.Orders.Workspace",
      },
    ],
  },

  // Workspace for individual order detail (routable)
  {
    type: "workspace",
    kind: "routable",
    alias: "Merchello.Order.Detail.Workspace",
    name: "Order Detail Workspace",
    api: () => import("./order-detail-workspace.context.js"),
    meta: {
      entityType: "merchello-order",
    },
  },

  // Order detail view
  {
    type: "workspaceView",
    alias: "Merchello.Order.DetailView",
    name: "Order Detail View",
    js: () => import("./order-detail.element.js"),
    weight: 100,
    meta: {
      label: "Details",
      pathname: "details",
      icon: "icon-document",
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Merchello.Order.Detail.Workspace",
      },
    ],
  },

  // Shipments tab for viewing and managing shipments
  {
    type: "workspaceView",
    alias: "Merchello.Order.ShipmentsView",
    name: "Order Shipments View",
    js: () => import("./shipments/shipments-view.element.js"),
    weight: 90,
    meta: {
      label: "Shipments",
      pathname: "shipments",
      icon: "icon-truck",
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Merchello.Order.Detail.Workspace",
      },
    ],
  },
];

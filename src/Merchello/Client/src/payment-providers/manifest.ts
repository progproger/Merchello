export const manifests: Array<UmbExtensionManifest> = [
  // Workspace view for payment providers (under Settings workspace)
  {
    type: "workspaceView",
    alias: "Merchello.Settings.PaymentProviders.View",
    name: "Payment Providers View",
    js: () => import("./payment-providers-list.element.js"),
    weight: 90,
    meta: {
      label: "Payment Providers",
      pathname: "payment-providers",
      icon: "icon-credit-card",
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Merchello.Settings.Workspace",
      },
    ],
  },

  // Modal for configuring a payment provider
  {
    type: "modal",
    alias: "Merchello.PaymentProvider.Config.Modal",
    name: "Payment Provider Configuration Modal",
    js: () => import("./payment-provider-config-modal.element.js"),
  },
];


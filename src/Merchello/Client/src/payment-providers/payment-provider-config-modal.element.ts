import { html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement } from "@umbraco-cms/backoffice/modal";
import { MerchelloApi } from "../api/merchello-api.js";
import type { PaymentProviderFieldDto } from "./types.js";
import type {
  PaymentProviderConfigModalData,
  PaymentProviderConfigModalValue,
} from "./payment-provider-config-modal.token.js";

@customElement("merchello-payment-provider-config-modal")
export class MerchelloPaymentProviderConfigModalElement extends UmbModalBaseElement<
  PaymentProviderConfigModalData,
  PaymentProviderConfigModalValue
> {
  @state() private _fields: PaymentProviderFieldDto[] = [];
  @state() private _values: Record<string, string> = {};
  @state() private _displayName: string = "";
  @state() private _isEnabled: boolean = true;
  @state() private _loading = true;
  @state() private _saving = false;
  @state() private _error: string | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadFields();
  }

  private async _loadFields(): Promise<void> {
    this._loading = true;
    this._error = null;

    const provider = this.data?.provider;
    const setting = this.data?.setting;

    if (!provider) {
      this._error = "No provider specified";
      this._loading = false;
      return;
    }

    // Initialize display name and enabled state
    this._displayName = setting?.displayName ?? provider.displayName;
    this._isEnabled = setting?.isEnabled ?? true;

    // Load configuration fields
    const { data, error } = await MerchelloApi.getPaymentProviderFields(provider.alias);

    if (error) {
      this._error = error.message;
      this._loading = false;
      return;
    }

    this._fields = data ?? [];

    // Initialize values from existing configuration or defaults
    const existingConfig = setting?.configuration ?? {};
    this._values = {};

    for (const field of this._fields) {
      this._values[field.key] = existingConfig[field.key] ?? field.defaultValue ?? "";
    }

    this._loading = false;
  }

  private _handleValueChange(key: string, value: string): void {
    this._values = { ...this._values, [key]: value };
  }

  private _handleCheckboxChange(key: string, checked: boolean): void {
    this._values = { ...this._values, [key]: checked ? "true" : "false" };
  }

  private async _handleSave(): Promise<void> {
    const provider = this.data?.provider;
    const setting = this.data?.setting;

    if (!provider) return;

    this._saving = true;
    this._error = null;

    // Validate required fields
    for (const field of this._fields) {
      if (field.isRequired && !this._values[field.key]) {
        this._error = `${field.label} is required`;
        this._saving = false;
        return;
      }
    }

    try {
      if (setting) {
        // Update existing provider
        const { error } = await MerchelloApi.updatePaymentProvider(setting.id, {
          displayName: this._displayName,
          isEnabled: this._isEnabled,
          configuration: this._values,
        });

        if (error) {
          this._error = error.message;
          this._saving = false;
          return;
        }
      } else {
        // Create new provider
        const { error } = await MerchelloApi.createPaymentProvider({
          providerAlias: provider.alias,
          displayName: this._displayName,
          isEnabled: this._isEnabled,
          configuration: this._values,
        });

        if (error) {
          this._error = error.message;
          this._saving = false;
          return;
        }
      }

      this._saving = false;
      this.modalContext?.submit({ saved: true });
    } catch (err) {
      this._error = err instanceof Error ? err.message : "Failed to save configuration";
      this._saving = false;
    }
  }

  private _handleCancel(): void {
    this.modalContext?.reject();
  }

  private _renderField(field: PaymentProviderFieldDto): unknown {
    const value = this._values[field.key] ?? "";

    switch (field.fieldType) {
      case "Text":
      case "Url":
        return html`
          <div class="form-field">
            <label for="${field.key}">${field.label}${field.isRequired ? " *" : ""}</label>
            ${field.description
              ? html`<p class="field-description">${field.description}</p>`
              : nothing}
            <uui-input
              id="${field.key}"
              type="${field.fieldType === "Url" ? "url" : "text"}"
              .value=${value}
              placeholder="${field.placeholder ?? ""}"
              ?required=${field.isRequired}
              @input=${(e: Event) =>
                this._handleValueChange(field.key, (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
        `;

      case "Password":
        return html`
          <div class="form-field">
            <label for="${field.key}">${field.label}${field.isRequired ? " *" : ""}</label>
            ${field.description
              ? html`<p class="field-description">${field.description}</p>`
              : nothing}
            <uui-input
              id="${field.key}"
              type="password"
              .value=${value}
              placeholder="${field.placeholder ?? ""}"
              ?required=${field.isRequired}
              @input=${(e: Event) =>
                this._handleValueChange(field.key, (e.target as HTMLInputElement).value)}
            ></uui-input>
            ${field.isSensitive && value
              ? html`<small class="sensitive-note">Value is stored securely</small>`
              : nothing}
          </div>
        `;

      case "Textarea":
        return html`
          <div class="form-field">
            <label for="${field.key}">${field.label}${field.isRequired ? " *" : ""}</label>
            ${field.description
              ? html`<p class="field-description">${field.description}</p>`
              : nothing}
            <uui-textarea
              id="${field.key}"
              .value=${value}
              placeholder="${field.placeholder ?? ""}"
              ?required=${field.isRequired}
              @input=${(e: Event) =>
                this._handleValueChange(field.key, (e.target as HTMLTextAreaElement).value)}
            ></uui-textarea>
          </div>
        `;

      case "Checkbox":
        return html`
          <div class="form-field checkbox-field">
            <uui-checkbox
              id="${field.key}"
              ?checked=${value === "true"}
              @change=${(e: Event) =>
                this._handleCheckboxChange(field.key, (e.target as HTMLInputElement).checked)}
            >
              ${field.label}
            </uui-checkbox>
            ${field.description
              ? html`<p class="field-description">${field.description}</p>`
              : nothing}
          </div>
        `;

      case "Select":
        return html`
          <div class="form-field">
            <label for="${field.key}">${field.label}${field.isRequired ? " *" : ""}</label>
            ${field.description
              ? html`<p class="field-description">${field.description}</p>`
              : nothing}
            <uui-select
              id="${field.key}"
              .value=${value}
              ?required=${field.isRequired}
              @change=${(e: Event) =>
                this._handleValueChange(field.key, (e.target as HTMLSelectElement).value)}
            >
              <option value="">Select...</option>
              ${field.options?.map(
                (opt) => html`
                  <option value="${opt.value}" ?selected=${value === opt.value}>
                    ${opt.label}
                  </option>
                `
              )}
            </uui-select>
          </div>
        `;

      default:
        return nothing;
    }
  }

  render() {
    const provider = this.data?.provider;
    const isEditing = !!this.data?.setting;

    return html`
      <umb-body-layout headline="${isEditing ? "Configure" : "Enable"} ${provider?.displayName ?? "Provider"}">
        <div id="main">
          ${this._loading
            ? html`
                <div class="loading">
                  <uui-loader></uui-loader>
                  <span>Loading configuration...</span>
                </div>
              `
            : html`
                ${this._error
                  ? html`
                      <div class="error-message">
                        <uui-icon name="icon-alert"></uui-icon>
                        ${this._error}
                      </div>
                    `
                  : nothing}

                <div class="form-field">
                  <label for="displayName">Display Name *</label>
                  <p class="field-description">
                    The name shown to customers during checkout.
                  </p>
                  <uui-input
                    id="displayName"
                    .value=${this._displayName}
                    required
                    @input=${(e: Event) =>
                      (this._displayName = (e.target as HTMLInputElement).value)}
                  ></uui-input>
                </div>

                <div class="form-field checkbox-field">
                  <uui-checkbox
                    id="isEnabled"
                    ?checked=${this._isEnabled}
                    @change=${(e: Event) =>
                      (this._isEnabled = (e.target as HTMLInputElement).checked)}
                  >
                    Enabled
                  </uui-checkbox>
                  <p class="field-description">
                    When enabled, this payment method will be available during checkout.
                  </p>
                </div>

                ${this._fields.length > 0
                  ? html`
                      <hr />
                      <h3>Provider Configuration</h3>
                      ${this._fields.map((field) => this._renderField(field))}
                    `
                  : nothing}
              `}
        </div>

        <div slot="actions">
          <uui-button
            label="Cancel"
            look="secondary"
            @click=${this._handleCancel}
            ?disabled=${this._saving}
          >
            Cancel
          </uui-button>
          <uui-button
            label="${isEditing ? "Save" : "Enable Provider"}"
            look="primary"
            color="positive"
            @click=${this._handleSave}
            ?disabled=${this._loading || this._saving}
          >
            ${this._saving ? html`<uui-loader-circle></uui-loader-circle>` : nothing}
            ${isEditing ? "Save" : "Enable Provider"}
          </uui-button>
        </div>
      </umb-body-layout>
    `;
  }

  static styles = css`
    #main {
      padding: var(--uui-size-space-4);
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-layout-2);
      gap: var(--uui-size-space-4);
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-space-3);
      background: var(--uui-color-danger-standalone);
      color: var(--uui-color-danger-contrast);
      border-radius: var(--uui-border-radius);
      margin-bottom: var(--uui-size-space-4);
    }

    h3 {
      margin: var(--uui-size-space-4) 0;
      font-size: 1rem;
      font-weight: 600;
    }

    hr {
      border: none;
      border-top: 1px solid var(--uui-color-border);
      margin: var(--uui-size-space-5) 0;
    }

    .form-field {
      margin-bottom: var(--uui-size-space-4);
    }

    .form-field label {
      display: block;
      font-weight: 600;
      margin-bottom: var(--uui-size-space-1);
    }

    .field-description {
      margin: 0 0 var(--uui-size-space-2) 0;
      font-size: 0.875rem;
      color: var(--uui-color-text-alt);
    }

    .checkbox-field .field-description {
      margin-left: var(--uui-size-space-5);
    }

    .sensitive-note {
      display: block;
      margin-top: var(--uui-size-space-1);
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
    }

    uui-input,
    uui-textarea,
    uui-select {
      width: 100%;
    }

    [slot="actions"] {
      display: flex;
      gap: var(--uui-size-space-2);
      justify-content: flex-end;
    }
  `;
}

export default MerchelloPaymentProviderConfigModalElement;

declare global {
  interface HTMLElementTagNameMap {
    "merchello-payment-provider-config-modal": MerchelloPaymentProviderConfigModalElement;
  }
}


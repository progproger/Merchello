namespace Merchello.Core.Payments.Providers;

/// <summary>
/// Types of configuration fields for payment provider settings UI.
/// </summary>
public enum ConfigurationFieldType
{
    /// <summary>
    /// Single-line text input.
    /// </summary>
    Text,

    /// <summary>
    /// Password/masked text input.
    /// </summary>
    Password,

    /// <summary>
    /// Multi-line text input.
    /// </summary>
    Textarea,

    /// <summary>
    /// Boolean checkbox.
    /// </summary>
    Checkbox,

    /// <summary>
    /// Dropdown select.
    /// </summary>
    Select,

    /// <summary>
    /// URL input with validation.
    /// </summary>
    Url
}


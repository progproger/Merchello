namespace Merchello.Core.Payments.Providers;

/// <summary>
/// Represents an option in a dropdown/select configuration field.
/// </summary>
public class SelectOption
{
    /// <summary>
    /// The value stored when this option is selected.
    /// </summary>
    public required string Value { get; init; }

    /// <summary>
    /// The display text shown in the dropdown.
    /// </summary>
    public required string Label { get; init; }
}


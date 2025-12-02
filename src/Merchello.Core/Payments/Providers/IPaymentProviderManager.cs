using Merchello.Core.Payments.Models;
using Merchello.Core.Shared.Models;

namespace Merchello.Core.Payments.Providers;

/// <summary>
/// Manages payment provider discovery, configuration, and lifecycle.
/// </summary>
public interface IPaymentProviderManager
{
    /// <summary>
    /// Get all discovered payment providers (from assembly scanning).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>All available providers with their settings.</returns>
    Task<IReadOnlyCollection<RegisteredPaymentProvider>> GetAvailableProvidersAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all enabled/configured payment providers.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Enabled providers ordered by sort order.</returns>
    Task<IReadOnlyCollection<RegisteredPaymentProvider>> GetEnabledProvidersAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a specific provider by alias.
    /// </summary>
    /// <param name="alias">The provider alias.</param>
    /// <param name="requireEnabled">If true, only returns the provider if it is enabled.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The provider, or null if not found.</returns>
    Task<RegisteredPaymentProvider?> GetProviderAsync(
        string alias,
        bool requireEnabled = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all provider settings from database.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>All persisted provider settings.</returns>
    Task<IEnumerable<PaymentProviderSetting>> GetProviderSettingsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a specific provider setting by ID.
    /// </summary>
    /// <param name="id">The setting ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The setting, or null if not found.</returns>
    Task<PaymentProviderSetting?> GetProviderSettingAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Save provider settings (create or update).
    /// </summary>
    /// <param name="setting">The setting to save.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result containing the saved setting.</returns>
    Task<CrudResult<PaymentProviderSetting>> SaveProviderSettingAsync(
        PaymentProviderSetting setting,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete a provider setting.
    /// </summary>
    /// <param name="id">The setting ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result indicating success or failure.</returns>
    Task<CrudResult<bool>> DeleteProviderSettingAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enable or disable a provider.
    /// </summary>
    /// <param name="settingId">The setting ID.</param>
    /// <param name="enabled">Whether to enable the provider.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result indicating success or failure.</returns>
    Task<CrudResult<bool>> SetProviderEnabledAsync(
        Guid settingId,
        bool enabled,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Update the sort order of providers.
    /// </summary>
    /// <param name="orderedIds">Provider setting IDs in desired order.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result indicating success or failure.</returns>
    Task<CrudResult<bool>> UpdateProviderSortOrderAsync(
        IEnumerable<Guid> orderedIds,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Refresh the provider cache (forces re-discovery and re-configuration).
    /// </summary>
    void RefreshCache();
}


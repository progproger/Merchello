using Microsoft.EntityFrameworkCore;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace Merchello.Core.Data;

/// <summary>
/// Notification handler that runs Merchello EF Core migrations on Umbraco application startup
/// </summary>
public class RunMerchMigration : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
{
    private readonly MerchelloDbContext _merchDbContext;

    public RunMerchMigration(MerchelloDbContext merchDbContext)
    {
        _merchDbContext = merchDbContext;
    }

    public async Task HandleAsync(UmbracoApplicationStartedNotification notification, CancellationToken cancellationToken)
    {
        var pendingMigrations = await _merchDbContext.Database.GetPendingMigrationsAsync(cancellationToken);
        if (pendingMigrations.Any())
        {
            await _merchDbContext.Database.MigrateAsync(cancellationToken);
        }
    }
}

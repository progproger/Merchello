using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Merchello.Core.Data;

/// <summary>
/// Design-time factory for EF Core migrations.
/// This is only used by the EF Core CLI tools - at runtime, Umbraco's database provider is used.
/// </summary>
public class MerchelloDbContextFactory : IDesignTimeDbContextFactory<MerchelloDbContext>
{
    public MerchelloDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MerchelloDbContext>();

        // Use SQL Server for design-time migrations
        // The actual connection string doesn't matter for migration generation
        optionsBuilder.UseSqlServer("Server=.;Database=Merchello_Design;Trusted_Connection=True;TrustServerCertificate=True;");

        return new MerchelloDbContext(optionsBuilder.Options);
    }
}

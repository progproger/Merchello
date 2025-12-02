using System.Reflection;
using Merchello.Core.Accounting.Services;
using Merchello.Core.Accounting.Services.Interfaces;
using Merchello.Core.Checkout.Services;
using Merchello.Core.Checkout.Services.Interfaces;
using Merchello.Core.Data;
using Merchello.Core.Locality.Services;
using Merchello.Core.Locality.Services.Interfaces;
using Merchello.Core.Products.Factories;
using Merchello.Core.Products.Services;
using Merchello.Core.Products.Services.Interfaces;
using Merchello.Core.Shared.Extensions;
using Merchello.Core.Shared.Models;
using Merchello.Core.Shared.Options;
using Merchello.Core.Shared.Reflection;
using Merchello.Core.Shared.Services;
using Merchello.Core.Shipping.Factories;
using Merchello.Core.Shipping.Providers;
using Merchello.Core.Shipping.Services;
using Merchello.Core.Shipping.Services.Interfaces;
using Merchello.Core.Warehouses.Services;
using Merchello.Core.Warehouses.Services.Interfaces;
using Merchello.Core.Accounting.Factories;
using Merchello.Core.Locality.Factories;
using Merchello.Core.Warehouses.Factories;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Persistence.EFCore;
using Umbraco.Extensions;

namespace Merchello.Core;

public static class Startup
{
    /// <summary>
    /// Adds Merchello services to the Umbraco builder
    /// </summary>
    public static IUmbracoBuilder AddMerch(this IUmbracoBuilder builder, IEnumerable<Assembly>? pluginAssemblies = null)
    {
        // Register MerchelloDbContext with Umbraco's database provider (automatically uses same DB as Umbraco)
        // TODO: Update to new overload when upgrading to Umbraco 18
#pragma warning disable CS0618 // Type or member is obsolete
        builder.Services.AddUmbracoDbContext<MerchelloDbContext>((serviceProvider, options) =>
        {
            options.UseUmbracoDatabaseProvider(serviceProvider);
        });
#pragma warning restore CS0618

        // Configure Merch settings
        builder.Services.Configure<MerchSettings>(builder.Config.GetSection("Merch"));
        builder.Services.Configure<CacheOptions>(builder.Config.GetSection("Merch:Cache"));

        // Caching
        builder.Services.AddMemoryCache();
        builder.Services.AddHybridCache();

        builder.Services.AddSingleton<CacheService>();
        builder.Services.AddScoped<ExtensionManager>();
        builder.Services.AddSingleton<SlugHelper>();

        // Factories
        builder.Services.AddSingleton<TaxGroupFactory>();
        builder.Services.AddSingleton<ProductRootFactory>();
        builder.Services.AddSingleton<ProductFactory>();
        builder.Services.AddSingleton<ProductTypeFactory>();
        builder.Services.AddSingleton<ProductCategoryFactory>();
        builder.Services.AddSingleton<ProductFilterGroupFactory>();
        builder.Services.AddSingleton<ProductFilterFactory>();
        builder.Services.AddSingleton<ProductOptionFactory>();
        builder.Services.AddSingleton<ShippingOptionFactory>();
        builder.Services.AddSingleton<WarehouseFactory>();
        builder.Services.AddSingleton<LineItemFactory>();
        builder.Services.AddSingleton<AddressFactory>();

        // Database seeding
        builder.Services.AddScoped<DbSeeder>();

        // Services
        builder.Services.AddScoped<ILineItemService, LineItemService>();
        builder.Services.AddScoped<ICheckoutService, CheckoutService>();
        builder.Services.AddScoped<IOrderService, OrderService>();
        builder.Services.AddScoped<IInventoryService, InventoryService>();
        builder.Services.AddScoped<IOrderStatusHandler, DefaultOrderStatusHandler>();
        builder.Services.AddScoped<IShippingQuoteService, ShippingQuoteService>();
        builder.Services.AddScoped<IShippingProviderManager, ShippingProviderManager>();
        builder.Services.AddScoped<IShippingService, ShippingService>();
        builder.Services.AddScoped<IDeliveryDateService, DeliveryDateService>();
        builder.Services.AddScoped<IDeliveryDateProvider, DefaultDeliveryDateProvider>();
        builder.Services.AddScoped<IWarehouseService, WarehouseService>();
        builder.Services.AddScoped<ILocationsService, LocationsService>();
        builder.Services.AddSingleton<ILocalityCatalog, DefaultLocalityCatalog>();
        builder.Services.AddSingleton<ILocalityCacheInvalidator, LocalityCacheInvalidator>();
        builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        builder.Services.AddScoped<IProductService, ProductService>();
        builder.Services.AddScoped<ITaxService, TaxService>();

        // Plugin assemblies for extension scanning
        List<Assembly> assembliesToScan = (pluginAssemblies ?? [])
            .Distinct()
            .ToList();

        if (assembliesToScan.Count == 0)
        {
            assembliesToScan.Add(typeof(Startup).Assembly);
        }

        AssemblyManager.SetAssemblies(assembliesToScan.ToArray());

        return builder;
    }
}

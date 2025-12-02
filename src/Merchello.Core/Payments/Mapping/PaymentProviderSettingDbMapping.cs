using Merchello.Core.Payments.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Merchello.Core.Payments.Mapping;

/// <summary>
/// EF Core mapping configuration for PaymentProviderSetting entity.
/// </summary>
public class PaymentProviderSettingDbMapping : IEntityTypeConfiguration<PaymentProviderSetting>
{
    public void Configure(EntityTypeBuilder<PaymentProviderSetting> builder)
    {
        builder.ToTable("merchelloPaymentProviders");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProviderAlias)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.DisplayName)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(x => x.Configuration)
            .HasMaxLength(4000);

        builder.Property(x => x.DateCreated)
            .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Property(x => x.DateUpdated)
            .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        // Unique index on provider alias
        builder.HasIndex(x => x.ProviderAlias)
            .IsUnique();
    }
}


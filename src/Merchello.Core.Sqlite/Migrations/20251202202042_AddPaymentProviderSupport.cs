using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Merchello.Core.Sqlite.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentProviderSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentPaymentId",
                table: "merchelloPayments",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentProviderAlias",
                table: "merchelloPayments",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentType",
                table: "merchelloPayments",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RefundReason",
                table: "merchelloPayments",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "merchelloPaymentProviders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProviderAlias = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 250, nullable: false),
                    IsEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    Configuration = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: true),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DateUpdated = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_merchelloPaymentProviders", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_merchelloPayments_ParentPaymentId",
                table: "merchelloPayments",
                column: "ParentPaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_merchelloPaymentProviders_ProviderAlias",
                table: "merchelloPaymentProviders",
                column: "ProviderAlias",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_merchelloPayments_merchelloPayments_ParentPaymentId",
                table: "merchelloPayments",
                column: "ParentPaymentId",
                principalTable: "merchelloPayments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_merchelloPayments_merchelloPayments_ParentPaymentId",
                table: "merchelloPayments");

            migrationBuilder.DropTable(
                name: "merchelloPaymentProviders");

            migrationBuilder.DropIndex(
                name: "IX_merchelloPayments_ParentPaymentId",
                table: "merchelloPayments");

            migrationBuilder.DropColumn(
                name: "ParentPaymentId",
                table: "merchelloPayments");

            migrationBuilder.DropColumn(
                name: "PaymentProviderAlias",
                table: "merchelloPayments");

            migrationBuilder.DropColumn(
                name: "PaymentType",
                table: "merchelloPayments");

            migrationBuilder.DropColumn(
                name: "RefundReason",
                table: "merchelloPayments");
        }
    }
}

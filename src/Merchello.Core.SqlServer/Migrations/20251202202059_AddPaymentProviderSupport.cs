using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Merchello.Core.SqlServer.Migrations
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
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentProviderAlias",
                table: "merchelloPayments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentType",
                table: "merchelloPayments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RefundReason",
                table: "merchelloPayments",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "merchelloPaymentProviders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProviderAlias = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    Configuration = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
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

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Merchello.Core.SqlServer.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceAddressFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BillingAddressOne",
                table: "merchelloInvoices",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingAddressTwo",
                table: "merchelloInvoices",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingCompany",
                table: "merchelloInvoices",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingCountry",
                table: "merchelloInvoices",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingCountryCode",
                table: "merchelloInvoices",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingCountyStateCode",
                table: "merchelloInvoices",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingCountyStateName",
                table: "merchelloInvoices",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingEmail",
                table: "merchelloInvoices",
                type: "nvarchar(254)",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingName",
                table: "merchelloInvoices",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingPhone",
                table: "merchelloInvoices",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingPostalCode",
                table: "merchelloInvoices",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingTownCity",
                table: "merchelloInvoices",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Channel",
                table: "merchelloInvoices",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateCreated",
                table: "merchelloInvoices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DateUpdated",
                table: "merchelloInvoices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "InvoiceNumber",
                table: "merchelloInvoices",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingAddressOne",
                table: "merchelloInvoices",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingAddressTwo",
                table: "merchelloInvoices",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingCompany",
                table: "merchelloInvoices",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingCountry",
                table: "merchelloInvoices",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingCountryCode",
                table: "merchelloInvoices",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingCountyStateCode",
                table: "merchelloInvoices",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingCountyStateName",
                table: "merchelloInvoices",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingEmail",
                table: "merchelloInvoices",
                type: "nvarchar(254)",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingName",
                table: "merchelloInvoices",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingPhone",
                table: "merchelloInvoices",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingPostalCode",
                table: "merchelloInvoices",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingTownCity",
                table: "merchelloInvoices",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BillingAddressOne",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingAddressTwo",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingCompany",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingCountry",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingCountryCode",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingCountyStateCode",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingCountyStateName",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingEmail",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingName",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingPhone",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingPostalCode",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "BillingTownCity",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "Channel",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "DateCreated",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "DateUpdated",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "InvoiceNumber",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingAddressOne",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingAddressTwo",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingCompany",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingCountry",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingCountryCode",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingCountyStateCode",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingCountyStateName",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingEmail",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingName",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingPhone",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingPostalCode",
                table: "merchelloInvoices");

            migrationBuilder.DropColumn(
                name: "ShippingTownCity",
                table: "merchelloInvoices");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindMeBand_server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityApplicationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "OpportunitiesApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "OpportunitiesApplications");
        }
    }
}

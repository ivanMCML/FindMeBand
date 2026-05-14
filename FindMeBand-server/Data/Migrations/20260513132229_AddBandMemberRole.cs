using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindMeBand_server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBandMemberRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "BandMember",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "BandMember");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindMeBand_server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Profiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Bands",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Bands");
        }
    }
}

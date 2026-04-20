namespace FindMeBand_server.DTOs
{
    public class CreateOrganizerDTO
    {
        public string UserId { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Description { get; set; } = null!;
    }

    public class UpdateOrganizerDTO
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Description { get; set; } = null!;
    }
}

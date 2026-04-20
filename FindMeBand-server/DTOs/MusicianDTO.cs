namespace FindMeBand_server.DTOs
{
    public class CreateMusicianDTO
    {
        public string UserId { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Description { get; set; } = null!;
    }

    public class UpdateMusicianDTO
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Description { get; set; } = null!;
    }
}

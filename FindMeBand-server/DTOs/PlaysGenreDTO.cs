namespace FindMeBand_server.DTOs
{
    public class CreatePlaysGenreDTO
    {
        public int PerformerId { get; set; }
        public int GenreId { get; set; }
        public int SkillLevel { get; set; }
    }

    public class UpdatePlaysGenreDTO
    {
        public int SkillLevel { get; set; }
    }
}

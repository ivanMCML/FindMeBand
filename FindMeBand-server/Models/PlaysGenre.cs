namespace FindMeBand_server.Models
{
    public class PlaysGenre
    {
        public int Id { get; set; }
        
        public int GenreId { get; set; }
        public Genre Genre { get; set; } = null!;

        public int PerformerId { get; set; }
        public Performer Performer { get; set; } = null!;

        public int SkillLevel { get; set; } // 1 to 5
    }
}

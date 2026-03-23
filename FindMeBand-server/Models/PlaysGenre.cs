using System.ComponentModel.DataAnnotations;

namespace FindMeBand_server.Models
{
    public class PlaysGenre
    {
        public int Id { get; set; }
        
        public int GenreId { get; set; }
        public Genre Genre { get; set; } = null!;

        public int PerformerId { get; set; }
        public Performer Performer { get; set; } = null!;

        [Range(1, 5, ErrorMessage ="Skill level must be between 1 and 5!")]
        public int SkillLevel { get; set; }
    }
}

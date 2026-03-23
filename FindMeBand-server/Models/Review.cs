using System.ComponentModel.DataAnnotations;
namespace FindMeBand_server.Models
{
    public class Review
    {
        public int Id { get; set; }

        public int ReviewerId { get; set; }
        public Profile Reviewer { get; set; } = null!;

        public int PerformerId { get; set; }
        public Performer Performer { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
    }
}

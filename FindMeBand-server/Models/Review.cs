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

        public int Rating { get; set; } // 1 to 5
        public string Comment { get; set; } = null!;
    }
}

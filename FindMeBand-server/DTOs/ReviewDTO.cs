namespace FindMeBand_server.DTOs
{
    public class CreateReviewDTO
    {
        public int? ReviewerId { get; set; }
        public int PerformerId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
    }

    public class UpdateReviewDTO
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
    }

    public class ReviewResponseDTO
    {
        public int Id { get; set; }
        public int PerformerId { get; set; }
        public int? ReviewerId { get; set; }
        public string? ReviewerFirstName { get; set; }
        public string? ReviewerLastName { get; set; }
        public string? ReviewerUserName { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}

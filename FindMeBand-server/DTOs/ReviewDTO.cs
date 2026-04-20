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
}

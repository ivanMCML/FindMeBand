using FindMeBand_server.Enums;

namespace FindMeBand_server.DTOs
{
    public class CreateEventDTO
    {
        public int OrganizerId { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int? GenreId { get; set; }
        public string Location { get; set; } = null!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }
        public int? RequiredPerformers { get; set; }
        public PerformerType? PreferredPerformerType { get; set; }
        public int? MinReviewRequired { get; set; }
    }

    public class UpdateEventDTO
    {
        public DateTime ScheduledAt { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int? GenreId { get; set; }
        public string Location { get; set; } = null!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }
        public int? RequiredPerformers { get; set; }
        public PerformerType? PreferredPerformerType { get; set; }
        public int? MinReviewRequired { get; set; }
    }

    public class UpdateEventStatusDTO
    {
        public EventStatus Status { get; set; }
    }
}

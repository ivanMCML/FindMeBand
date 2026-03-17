using FindMeBand_server.Enums;

namespace FindMeBand_server.Models
{
    public class Event
    {
        public int Id { get; set; }

        public int OrganizerId { get; set; }
        public Organizer Organizer { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ScheduledAt { get; set; }

        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;

        public int? GenreId { get; set; }
        public Genre? Genre { get; set; }

        public string Location { get; set; } = null!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }

        public int? RequiredPerformers { get; set; }

        public PerformerType? PreferredPerformerType { get; set; }

        public int? MinReviewRequired { get; set; }

        public EventStatus Status { get; set; } = EventStatus.Open;

        public List<EventApplication> Applications { get; set; } = new List<EventApplication>();
    }
}

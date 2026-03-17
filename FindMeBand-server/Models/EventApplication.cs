using FindMeBand_server.Enums;

namespace FindMeBand_server.Models
{
    public class EventApplication
    {
        public int Id { get; set; }

        public int EventId { get; set; }
        public Event Event { get; set; } = null!;

        public int PerformerId { get; set; }
        public Performer Performer { get; set; } = null!;

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public string? Message { get; set; }

        public ApplicationStatus Status { get; set; }
    }
}

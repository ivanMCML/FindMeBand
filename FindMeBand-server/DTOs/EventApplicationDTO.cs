using FindMeBand_server.Enums;

namespace FindMeBand_server.DTOs
{
    public class CreateEventApplicationDTO
    {
        public int EventId { get; set; }
        public int PerformerId { get; set; }
        public string? Message { get; set; }
    }

    public class UpdateEventApplicationStatusDTO
    {
        public ApplicationStatus Status { get; set; }
    }

    public class EventApplicationResponseDTO
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public int PerformerId { get; set; }
        public string Status { get; set; } = null!;
        public string? Message { get; set; }
        public DateTime AppliedAt { get; set; }
        public string ApplicantName { get; set; } = null!;
        public string ApplicantType { get; set; } = null!;
    }
}

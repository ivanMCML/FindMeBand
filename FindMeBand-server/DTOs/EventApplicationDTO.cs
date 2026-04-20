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
}

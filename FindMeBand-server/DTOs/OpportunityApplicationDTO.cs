using FindMeBand_server.Enums;

namespace FindMeBand_server.DTOs
{
    public class CreateOpportunityApplicationDTO
    {
        public int OpportunityId { get; set; }
        public int ApplicantId { get; set; }
        public string? Message { get; set; }
    }

    public class UpdateOppAppStatusDTO
    {
        public ApplicationStatus Status { get; set; }
    }

    public class OppAppResponseDTO
    {
        public int Id { get; set; }
        public int OpportunityId { get; set; }
        public int ApplicantId { get; set; }
        public string Status { get; set; } = null!;
        public string? Message { get; set; }
        public DateTime AppliedAt { get; set; }
        public string ApplicantName { get; set; } = null!;
        public string ApplicantType { get; set; } = null!;
    }
}

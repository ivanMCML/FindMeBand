using FindMeBand_server.Enums;

namespace FindMeBand_server.Models
{
    public class OpportunityApplication
    {
        public int Id { get; set; }

        public int OpportunityId { get; set; }
        public Opportunity Opportunity { get; set; } = null!;

        public int ApplicantId { get; set; }
        public Performer Applicant { get; set; } = null!;

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
        public string? Message { get; set; }

        public ApplicationStatus Status { get; set; }
    }
}

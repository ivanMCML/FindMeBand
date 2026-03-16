namespace FindMeBand_server.Models
{
    public class OpportunityApplication
    {
        public int Id { get; set; }
        public int OpportunityId { get; set; }
        public Opportunity Opportunity { get; set; } = null!;
        public int ApplicantId { get; set; }
        public Performer Applicant { get; set; } = null!;
        public DateTime AppliedAt { get; set; }
        public string? Message { get; set; }
    }
}

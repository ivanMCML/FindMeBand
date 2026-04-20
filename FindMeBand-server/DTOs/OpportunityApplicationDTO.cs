namespace FindMeBand_server.DTOs
{
    public class CreateOpportunityApplicationDTO
    {
        public int OpportunityId { get; set; }
        public int ApplicantId { get; set; }
        public string? Message { get; set; }
    }
}

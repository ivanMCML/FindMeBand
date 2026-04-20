using FindMeBand_server.Enums;

namespace FindMeBand_server.DTOs
{
    public class CreateOpportunityDTO
    {
        public int AuthorId { get; set; }
        public int? InstrumentId { get; set; }
        public int? GenreId { get; set; }
        public OpportunityType Type { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateOpportunityDTO
    {
        public int? InstrumentId { get; set; }
        public int? GenreId { get; set; }
        public OpportunityType Type { get; set; }
        public string? Description { get; set; }
    }
}

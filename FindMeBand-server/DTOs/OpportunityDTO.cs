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

    public class OpportunityResponseDTO
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public int AuthorProfileId { get; set; }
        public string? AuthorName { get; set; }
        public string? AuthorUserName { get; set; }
        public string AuthorType { get; set; } = "musician";
        public string Type { get; set; } = null!;
        public string? Description { get; set; }
        public GenreSummaryDTO? Genre { get; set; }
        public InstrumentSummaryDTO? Instrument { get; set; }
        public int ApplicationCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

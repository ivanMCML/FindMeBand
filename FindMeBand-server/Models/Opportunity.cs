using FindMeBand_server.Enums;

namespace FindMeBand_server.Models
{
    public class Opportunity
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public Performer Author { get; set; } = null!;
        public OpportunityType Type { get; set; }
        public string? Description { get; set; }
        public int? InstrumentId { get; set; }
        public Instrument? Instrument { get; set; }
        public int? GenreId { get; set; }
        public Genre? Genre { get; set; }
    }
}

using FindMeBand_server.Enums;

namespace FindMeBand_server.Models
{
    public class Opportunity
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public Performer Author { get; set; } = null!;

        public int? InstrumentId { get; set; }
        public Instrument? Instrument { get; set; }

        public int? GenreId { get; set; }
        public Genre? Genre { get; set; }

        public OpportunityType Type { get; set; }
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<OpportunityApplication> Applications { get; set; } = new List<OpportunityApplication>();
    }
}

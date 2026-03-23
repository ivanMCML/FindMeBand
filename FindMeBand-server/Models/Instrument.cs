using FindMeBand_server.Enums;

namespace FindMeBand_server.Models
{
    public class Instrument
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public InstrumentType Type { get; set; }
        public List<PlaysInstrument> PlayedBy { get; set; } = new List<PlaysInstrument>();
        public List<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
    }
}

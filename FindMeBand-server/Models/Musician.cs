namespace FindMeBand_server.Models
{
    public class Musician : Profile
    {
        public int? PerformerId { get; set; }
        public Performer? Performer { get; set; }

        public List<BandMember> BandMemberships { get; set; } = new List<BandMember>();
        public List<PlaysInstrument> PlayedInstruments { get; set; } = new List<PlaysInstrument>();
    }
}

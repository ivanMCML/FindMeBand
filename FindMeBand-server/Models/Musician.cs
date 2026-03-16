namespace FindMeBand_server.Models
{
    public class Musician : Performer
    {
        public List<Genre> Genres { get; set; } = new List<Genre>();
        public List<BandMember> BandMemberships { get; set; } = new List<BandMember>();
        public List<PlaysInstrument> Instruments { get; set; } = new List<PlaysInstrument>();
    }
}

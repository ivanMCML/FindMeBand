namespace FindMeBand_server.Models
{
    public class BandMember
    {
        public int Id { get; set; }
        public int BandId { get; set; }
        public int MusicianId { get; set; }
        public int InstrumentId { get; set; }
        public DateTime JoinedDate { get; set; }
        public DateTime? LeftDate { get; set; }
        public Band Band { get; set; } = null!;
        public Musician Musician { get; set; } = null!;
        public Instrument Instrument { get; set; } = null!;
    }
}

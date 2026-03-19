namespace FindMeBand_server.Models
{
    public class PlaysInstrument
    {
        public int Id { get; set; }
        public int MusicianId { get; set; }
        public int InstrumentId { get; set; }
        public Musician Musician { get; set; } = null!;
        public Instrument Instrument { get; set; } = null!;
        public int SkillLevel { get; set; } // 1 to 5
        public int YearsOfExperience { get; set; }
        public bool IsPrimary { get; set; }

    }
}

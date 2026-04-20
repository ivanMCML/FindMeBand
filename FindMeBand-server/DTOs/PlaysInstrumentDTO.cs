namespace FindMeBand_server.DTOs
{
    public class CreatePlaysInstrumentDTO
    {
        public int MusicianId { get; set; }
        public int InstrumentId { get; set; }
        public int SkillLevel { get; set; }
        public int YearsOfExperience { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class UpdatePlaysInstrumentDTO
    {
        public int SkillLevel { get; set; }
        public int YearsOfExperience { get; set; }
        public bool IsPrimary { get; set; }
    }
}

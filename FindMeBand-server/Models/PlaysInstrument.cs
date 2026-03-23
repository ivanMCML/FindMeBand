using System.ComponentModel.DataAnnotations;
namespace FindMeBand_server.Models
{
    public class PlaysInstrument
    {
        public int Id { get; set; }

        public int MusicianId { get; set; }
        public Musician Musician { get; set; } = null!;

        public int InstrumentId { get; set; }
        public Instrument Instrument { get; set; } = null!;

        [Range(1, 5, ErrorMessage ="Skill level must be between 1 and 5.")]
        public int SkillLevel { get; set; }
        public int YearsOfExperience { get; set; }
        public bool IsPrimary { get; set; }

    }
}

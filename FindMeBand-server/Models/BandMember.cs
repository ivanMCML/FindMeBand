using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindMeBand_server.Models
{
    public class BandMember
    {
        public int Id { get; set; }

        public int BandId { get; set; }
        public Band Band { get; set; } = null!;

        public int MusicianId { get; set; }
        public Musician Musician { get; set; } = null!;

        public int? InstrumentId { get; set; }
        public Instrument? Instrument { get; set; } = null!;

        public DateTime JoinedDate { get; set; } = DateTime.UtcNow;
        public DateTime? LeftDate { get; set; }
        
    }
}

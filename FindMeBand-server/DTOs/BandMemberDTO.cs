using FindMeBand_server.Enums;

namespace FindMeBand_server.DTOs
{
    public class CreateBandMemberDTO
    {
        public int BandId { get; set; }
        public int MusicianId { get; set; }
        public int? InstrumentId { get; set; }
        public BandMemberRole Role { get; set; } = BandMemberRole.Member;
    }

    public class UpdateBandMemberDTO
    {
        public int? InstrumentId { get; set; }
        public BandMemberRole? Role { get; set; }
        public DateTime? LeftDate { get; set; }
    }
}

namespace FindMeBand_server.DTOs
{
    public class CreateBandMemberDTO
    {
        public int BandId { get; set; }
        public int MusicianId { get; set; }
        public int? InstrumentId { get; set; }
    }

    public class UpdateBandMemberDTO
    {
        public int? InstrumentId { get; set; }
        public DateTime? LeftDate { get; set; }
    }
}

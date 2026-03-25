namespace FindMeBand_server.Models
{
    public class Musician : Profile
    {
        public List<BandMember> BandMemberships { get; set; } = new List<BandMember>();
        public List<PlaysInstrument> PlayedInstruments { get; set; } = new List<PlaysInstrument>();
        public List<Review> GivenReviews { get; set; } = new List<Review>();
    }
}

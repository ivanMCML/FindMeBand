namespace FindMeBand_server.Models
{
    public class Band : Performer
    {
        public List<Genre> Genres { get; set; } = new List<Genre>();
        public List<BandMember> Members { get; set; } = new List<BandMember>();
    }
}

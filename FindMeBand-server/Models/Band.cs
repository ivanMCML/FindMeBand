namespace FindMeBand_server.Models
{
    public class Band : Performer
    {
        public List<BandMember> Members { get; set; } = new List<BandMember>();
    }
}

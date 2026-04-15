namespace FindMeBand_server.Models
{
    public class Band
    {
        public int Id { get; set; }

        public int? PerformerId { get; set; }
        public Performer? Performer { get; set; }

        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public List<BandMember> Members { get; set; } = new List<BandMember>();
        
        public List<Post> Posts { get; set; } = new List<Post>();
    }
}

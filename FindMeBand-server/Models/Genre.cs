namespace FindMeBand_server.Models
{
    public class Genre
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public List<PlaysGenre> Performers { get; set; } = new List<PlaysGenre>();
        public List<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
        public List<Event> Events { get; set; } = new List<Event>();
    }
}

namespace FindMeBand_server.Models
{
    public class Genre
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public List<PlaysGenre> Perforemers { get; set; } = new List<PlaysGenre>();

    }
}

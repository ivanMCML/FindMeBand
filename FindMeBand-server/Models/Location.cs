namespace FindMeBand_server.Models
{
    public class Location
    {
        public int Id { get; set; }

        public int PerformerId { get; set; }
        public Performer Performer { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }

    }
}

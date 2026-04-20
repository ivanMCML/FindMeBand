namespace FindMeBand_server.DTOs
{
    public class CreateLocationDTO
    {
        public int PerformerId { get; set; }
        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class UpdateLocationDTO
    {
        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}

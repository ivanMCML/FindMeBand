namespace FindMeBand_server.DTOs
{
    public class CreateBandDTO
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
    }

    public class UpdateBandDTO
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
    }
}

using FindMeBand_server.Enums;

namespace FindMeBand_server.DTOs
{
    public class InstrumentDTO
    {
        public string Name { get; set; } = null!;
        public InstrumentType Type { get; set; }
    }
}

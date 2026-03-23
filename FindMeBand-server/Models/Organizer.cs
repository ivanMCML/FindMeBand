namespace FindMeBand_server.Models
{
    public class Organizer : Profile
    {
        public List<Event> Events { get; set; } = new List<Event>();
    }
}

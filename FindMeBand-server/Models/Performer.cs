namespace FindMeBand_server.Models
{
    public class Performer : Profile
    {
        public double AverageRating { get; set; }
        public int NumberOfReviews { get; set; }
        public List<EventApplication> EventApplications { get; set; } = new List<EventApplication>();
        public List<Review> Reviews { get; set; } = new List<Review>();
        public List<Location> Locations { get; set; } = new List<Location>();
        public List<Genre> Genres { get; set; } = new List<Genre>();

    }
}

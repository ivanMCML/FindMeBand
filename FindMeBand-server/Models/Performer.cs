namespace FindMeBand_server.Models
{
    public class Performer : Profile
    {
        public double AverageRating { get; set; }
        public int NumberOfReviews { get; set; }
        public List<EventApplication> EventApplications { get; set; } = new List<EventApplication>();
        public List<Review> ReceivedReviews { get; set; } = new List<Review>();
        public List<Location> Locations { get; set; } = new List<Location>();
        public List<PlaysGenre> PlaysGenres { get; set; } = new List<PlaysGenre>();
        public List<Opportunity> AuthoredOpportunities { get; set; } = new List<Opportunity>();
        public List<OpportunityApplication> OpportunityApplications { get; set; } = new List<OpportunityApplication>();
    }
}

namespace FindMeBand_server.Models
{
    public class Profile
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public User User { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Post> Posts { get; set; } = new List<Post>();
        public List<Review> GivenReviews { get; set; } = new List<Review>();
        public List<Follow> Following { get; set; } = new List<Follow>();
        public List<Follow> Followers { get; set; } = new List<Follow>();
    }
}

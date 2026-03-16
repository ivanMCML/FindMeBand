namespace FindMeBand_server.Models
{
    public class Profile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public int FollowersCount { get; set; }
        public List<Post> Posts { get; set; } = new List<Post>();
    }
}

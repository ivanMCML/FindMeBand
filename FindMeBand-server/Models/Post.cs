namespace FindMeBand_server.Models
{
    public class Post
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public Profile Profile { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<PostMedia> Media { get; set; } = new List<PostMedia>();
    }
}

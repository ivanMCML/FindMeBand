namespace FindMeBand_server.Models
{
    public class Post
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public Profile Profile { get; set; } = null!;

        public int? BandId { get; set; }
        public Band? Band { get; set; }

        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<PostMedia> Media { get; set; } = new List<PostMedia>();
        public List<PostLike> Likes { get; set; } = new List<PostLike>();
        public List<PostComment> Comments { get; set; } = new List<PostComment>();
    }
}

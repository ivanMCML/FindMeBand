namespace FindMeBand_server.Models
{
    public class PostComment
    {
        public int Id { get; set; }

        public int PostId { get; set; }
        public Post Post { get; set; } = null!;

        public int ProfileId { get; set; }
        public Profile Profile { get; set; } = null!;

        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

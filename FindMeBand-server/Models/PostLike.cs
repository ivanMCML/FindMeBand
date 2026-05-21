namespace FindMeBand_server.Models
{
    public class PostLike
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public Post Post { get; set; } = null!;
        public int ProfileId { get; set; }
        public Profile Profile { get; set; } = null!;
        public DateTime LikedAt { get; set; } = DateTime.UtcNow;
    }
}

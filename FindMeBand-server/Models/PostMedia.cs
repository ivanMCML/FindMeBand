using MediaType = FindMeBand_server.Enums.MediaType;

namespace FindMeBand_server.Models
{
    public class PostMedia
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public Post Post { get; set; } = null!;
        public string Url { get; set; } = null!;
        public MediaType Type { get; set; }
    }
}

using MediaType = FindMeBand_server.Enums.MediaType;

namespace FindMeBand_server.Models
{
    public class PostMedia
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string Url { get; set; }
        public MediaType Type { get; set; }
        public Post Post { get; set; }
    }
}

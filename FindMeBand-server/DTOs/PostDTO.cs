using FindMeBand_server.Enums;

namespace FindMeBand_server.DTOs
{
    public class CreatePostDTO
    {
        public int ProfileId { get; set; }
        public int? BandId { get; set; }
        public string Content { get; set; } = null!;
        public List<PostMediaDTO> Media { get; set; } = new();
    }

    public class UpdatePostDTO
    {
        public string Content { get; set; } = null!;
    }

    public class PostMediaDTO
    {
        public string Url { get; set; } = null!;
        public MediaType Type { get; set; }
    }
}

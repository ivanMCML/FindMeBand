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

    public class PostResponseDTO
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string AuthorFirstName { get; set; } = null!;
        public string AuthorLastName { get; set; } = null!;
        public string AuthorUserName { get; set; } = null!;
        public string? AuthorAvatarUrl { get; set; }
        public int? BandId { get; set; }
        public string? BandName { get; set; }
        public string? BandAvatarUrl { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public List<PostMediaResponseDTO> Media { get; set; } = new();
        public int LikesCount { get; set; }
        public bool IsLiked { get; set; }
    }

    public class PostMediaResponseDTO
    {
        public int Id { get; set; }
        public string Url { get; set; } = null!;
        public string Type { get; set; } = null!;
    }
}

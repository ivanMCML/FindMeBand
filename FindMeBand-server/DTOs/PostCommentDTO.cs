namespace FindMeBand_server.DTOs
{
    public class CreatePostCommentDTO
    {
        public int PostId { get; set; }
        public int ProfileId { get; set; }
        public string Content { get; set; } = null!;
    }

    public class PostCommentResponseDTO
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public int ProfileId { get; set; }
        public string AuthorFirstName { get; set; } = null!;
        public string AuthorLastName { get; set; } = null!;
        public string AuthorUserName { get; set; } = null!;
        public string? AuthorAvatarUrl { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}

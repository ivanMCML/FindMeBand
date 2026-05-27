namespace FindMeBand_server.DTOs
{
    public class CreatePostLikeDTO
    {
        public int PostId { get; set; }
        public int ProfileId { get; set; }
    }

    public class PostLikeResponseDTO
    {
        public bool Liked { get; set; }
    }
}

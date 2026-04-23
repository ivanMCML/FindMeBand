namespace FindMeBand_server.DTOs
{
    public class CreateFollowDTO
    {
        public int FollowerId { get; set; }
        public int? FolloweeProfileId { get; set; }
        public int? FolloweeBandId { get; set; }
    }
}

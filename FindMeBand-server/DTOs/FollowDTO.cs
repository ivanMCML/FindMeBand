namespace FindMeBand_server.DTOs
{
    public class CreateFollowDTO
    {
        public int FollowerId { get; set; }
        public int? FolloweeProfileId { get; set; }
        public int? FolloweeBandId { get; set; }
    }

    public class FollowResponseDTO
    {
        public int Id { get; set; }
        public int FollowerId { get; set; }
        public string? FollowerFirstName { get; set; }
        public string? FollowerLastName { get; set; }
        public string? FollowerUserName { get; set; }
        public int? FolloweeProfileId { get; set; }
        public string? FolloweeProfileFirstName { get; set; }
        public string? FolloweeProfileLastName { get; set; }
        public string? FolloweeProfileUserName { get; set; }
        public string? FolloweeProfileDescription { get; set; }
        public int? FolloweeBandId { get; set; }
        public string? FolloweeBandName { get; set; }
        public DateTime FollowedAt { get; set; }
    }
}

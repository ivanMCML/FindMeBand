namespace FindMeBand_server.Models
{
    public class Follow
    {
        public int Id { get; set; }

        public int FollowerId { get; set; }
        public Profile Follower { get; set; } = null!;

        public int? FolloweeProfileId { get; set; }
        public Profile? FolloweeProfile { get; set; }

        public int? FolloweeBandId { get; set; }
        public Band? FolloweeBand { get; set; }

        public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
    }
}

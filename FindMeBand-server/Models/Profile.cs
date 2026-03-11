namespace FindMeBand_server.Models
{
    public class Profile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<Post> Posts { get; set; }
    }
}

namespace FindMeBand_server.Models
{
    public class Conversation
    {
        public int Id { get; set; }

        public int Profile1Id { get; set; }
        public Profile Profile1 { get; set; } = null!;

        public int Profile2Id { get; set; }
        public Profile Profile2 { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<DirectMessage> Messages { get; set; } = new();
    }
}

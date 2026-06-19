using FindMeBand_server.Enums;

namespace FindMeBand_server.Models
{
    public class Notification
    {
        public int Id { get; set; }

        public int RecipientProfileId { get; set; }
        public Profile Recipient { get; set; } = null!;

        public int? ActorProfileId { get; set; }
        public Profile? Actor { get; set; }

        public NotificationType Type { get; set; }
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? EventId { get; set; }
    }
}

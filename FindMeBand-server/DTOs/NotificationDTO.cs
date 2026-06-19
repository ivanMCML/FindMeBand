namespace FindMeBand_server.DTOs
{
    public class NotificationResponseDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = null!;
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? ActorProfileId { get; set; }
        public string? ActorName { get; set; }
        public int? EventId { get; set; }
    }
}

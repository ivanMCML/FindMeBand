namespace FindMeBand_server.DTOs
{
    public class ConversationSummaryDTO
    {
        public int Id { get; set; }
        public int OtherProfileId { get; set; }
        public string OtherFirstName { get; set; } = null!;
        public string OtherLastName { get; set; } = null!;
        public string OtherUserName { get; set; } = null!;
        public string OtherDescription { get; set; } = null!;
        public string? LastMessage { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public bool LastMessageIsOwn { get; set; }
        public int UnreadCount { get; set; }
    }

    public class DirectMessageDTO
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime SentAt { get; set; }
        public bool IsOwn { get; set; }
    }

    public class SendMessageDTO
    {
        public int SenderId { get; set; }
        public string Content { get; set; } = null!;
    }

    public class StartConversationDTO
    {
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
        public string? Content { get; set; }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ConversationController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ConversationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile/{profileId}")]
        public async Task<ActionResult<IEnumerable<ConversationSummaryDTO>>> GetConversations(int profileId)
        {
            var conversations = await _context.Conversations
                .Where(c => c.Profile1Id == profileId || c.Profile2Id == profileId)
                .Include(c => c.Profile1)
                .Include(c => c.Profile2)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .OrderByDescending(c => c.Messages.Max(m => (DateTime?)m.SentAt) ?? c.CreatedAt)
                .ToListAsync();

            return Ok(conversations.Select(c => ToSummaryDTO(c, profileId)));
        }

        [HttpGet("{id}/messages/{profileId}")]
        public async Task<ActionResult<IEnumerable<DirectMessageDTO>>> GetMessages(int id, int profileId)
        {
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == id &&
                    (c.Profile1Id == profileId || c.Profile2Id == profileId));

            if (conversation == null)
                return NotFound();

            var messages = await _context.DirectMessages
                .Where(m => m.ConversationId == id)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            // Mark unread messages as read
            var unread = messages.Where(m => m.SenderId != profileId && !m.IsRead).ToList();
            if (unread.Count > 0)
            {
                unread.ForEach(m => m.IsRead = true);
                await _context.SaveChangesAsync();
            }

            return Ok(messages.Select(m => new DirectMessageDTO
            {
                Id = m.Id,
                SenderId = m.SenderId,
                Content = m.Content,
                SentAt = m.SentAt,
                IsOwn = m.SenderId == profileId
            }));
        }

        [HttpPost]
        public async Task<ActionResult<ConversationSummaryDTO>> StartConversation(StartConversationDTO dto)
        {
            var senderExists = await _context.Profiles.AnyAsync(p => p.Id == dto.SenderId);
            var recipientExists = await _context.Profiles.AnyAsync(p => p.Id == dto.RecipientId);
            if (!senderExists || !recipientExists)
                return BadRequest("Profil nije pronađen.");

            if (dto.SenderId == dto.RecipientId)
                return BadRequest("Ne možete slati poruke sebi.");

            // Check if conversation already exists (in either direction)
            var existing = await _context.Conversations
                .Include(c => c.Profile1)
                .Include(c => c.Profile2)
                .FirstOrDefaultAsync(c =>
                    (c.Profile1Id == dto.SenderId && c.Profile2Id == dto.RecipientId) ||
                    (c.Profile1Id == dto.RecipientId && c.Profile2Id == dto.SenderId));

            if (existing != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.Content))
                {
                    var existingMsg = new DirectMessage
                    {
                        ConversationId = existing.Id,
                        SenderId = dto.SenderId,
                        Content = dto.Content
                    };
                    _context.DirectMessages.Add(existingMsg);
                    await _context.SaveChangesAsync();
                }

                var msgs = await _context.DirectMessages
                    .Where(m => m.ConversationId == existing.Id)
                    .OrderByDescending(m => m.SentAt)
                    .Take(1)
                    .ToListAsync();
                existing.Messages.Clear();
                existing.Messages.AddRange(msgs);

                return Ok(ToSummaryDTO(existing, dto.SenderId));
            }

            var conversation = new Conversation
            {
                Profile1Id = dto.SenderId,
                Profile2Id = dto.RecipientId
            };

            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(dto.Content))
            {
                var message = new DirectMessage
                {
                    ConversationId = conversation.Id,
                    SenderId = dto.SenderId,
                    Content = dto.Content
                };
                _context.DirectMessages.Add(message);
                await _context.SaveChangesAsync();
            }

            var created = await _context.Conversations
                .Include(c => c.Profile1)
                .Include(c => c.Profile2)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .FirstAsync(c => c.Id == conversation.Id);

            return Ok(ToSummaryDTO(created, dto.SenderId));
        }

        [HttpPost("{id}/message")]
        public async Task<ActionResult<DirectMessageDTO>> SendMessage(int id, SendMessageDTO dto)
        {
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == id &&
                    (c.Profile1Id == dto.SenderId || c.Profile2Id == dto.SenderId));

            if (conversation == null)
                return NotFound();

            var message = new DirectMessage
            {
                ConversationId = id,
                SenderId = dto.SenderId,
                Content = dto.Content
            };

            _context.DirectMessages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new DirectMessageDTO
            {
                Id = message.Id,
                SenderId = message.SenderId,
                Content = message.Content,
                SentAt = message.SentAt,
                IsOwn = true
            });
        }

        private static ConversationSummaryDTO ToSummaryDTO(Conversation c, int myProfileId)
        {
            var other = c.Profile1Id == myProfileId ? c.Profile2 : c.Profile1;
            var lastMsg = c.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();

            var unreadCount = 0;

            return new ConversationSummaryDTO
            {
                Id = c.Id,
                OtherProfileId = other.Id,
                OtherFirstName = other.FirstName,
                OtherLastName = other.LastName,
                OtherUserName = other.UserName,
                OtherDescription = other.Description,
                LastMessage = lastMsg?.Content,
                LastMessageAt = lastMsg?.SentAt,
                LastMessageIsOwn = lastMsg?.SenderId == myProfileId,
                UnreadCount = unreadCount
            };
        }
    }
}

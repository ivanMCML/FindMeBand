using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;
        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{profileId}")]
        public async Task<ActionResult<IEnumerable<NotificationResponseDTO>>> GetNotifications(int profileId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.RecipientProfileId == profileId)
                .Include(n => n.Actor)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();

            return Ok(notifications.Select(n => new NotificationResponseDTO
            {
                Id = n.Id,
                Type = n.Type.ToString(),
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                ActorProfileId = n.ActorProfileId,
                ActorName = n.Actor != null ? $"{n.Actor.FirstName} {n.Actor.LastName}" : null,
                EventId = n.EventId,
            }));
        }

        [Authorize]
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();
            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize]
        [HttpPatch("read-all/{profileId}")]
        public async Task<IActionResult> MarkAllRead(int profileId)
        {
            await _context.Notifications
                .Where(n => n.RecipientProfileId == profileId && !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
            return NoContent();
        }
    }
}

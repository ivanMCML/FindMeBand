using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EventController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            return await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Genre)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var ev = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Genre)
                .Include(e => e.Applications).ThenInclude(a => a.Performer)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (ev == null)
                return NotFound();

            return ev;
        }

        [HttpGet("organizer/{organizerId}")]
        public async Task<ActionResult<IEnumerable<Event>>> GetEventsByOrganizer(int organizerId)
        {
            return await _context.Events
                .Where(e => e.OrganizerId == organizerId)
                .Include(e => e.Genre)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Event>> CreateEvent(CreateEventDTO dto)
        {
            var organizer = await _context.Organizers.FindAsync(dto.OrganizerId);
            if (organizer == null)
                return BadRequest("Organizer not found.");

            var ev = new Event
            {
                OrganizerId = dto.OrganizerId,
                ScheduledAt = dto.ScheduledAt,
                Title = dto.Title,
                Description = dto.Description,
                GenreId = dto.GenreId,
                Location = dto.Location,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                BudgetMin = dto.BudgetMin,
                BudgetMax = dto.BudgetMax,
                RequiredPerformers = dto.RequiredPerformers,
                PreferredPerformerType = dto.PreferredPerformerType,
                MinReviewRequired = dto.MinReviewRequired
            };

            _context.Events.Add(ev);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent), new { id = ev.Id }, ev);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, UpdateEventDTO dto)
        {
            var ev = await _context.Events.FindAsync(id);
            if (ev == null)
                return NotFound();

            ev.ScheduledAt = dto.ScheduledAt;
            ev.Title = dto.Title;
            ev.Description = dto.Description;
            ev.GenreId = dto.GenreId;
            ev.Location = dto.Location;
            ev.Latitude = dto.Latitude;
            ev.Longitude = dto.Longitude;
            ev.BudgetMin = dto.BudgetMin;
            ev.BudgetMax = dto.BudgetMax;
            ev.RequiredPerformers = dto.RequiredPerformers;
            ev.PreferredPerformerType = dto.PreferredPerformerType;
            ev.MinReviewRequired = dto.MinReviewRequired;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateEventStatus(int id, UpdateEventStatusDTO dto)
        {
            var ev = await _context.Events.FindAsync(id);
            if (ev == null)
                return NotFound();

            ev.Status = dto.Status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var ev = await _context.Events.FindAsync(id);
            if (ev == null)
                return NotFound();

            _context.Events.Remove(ev);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

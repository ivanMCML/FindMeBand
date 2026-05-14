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
        public async Task<ActionResult<IEnumerable<EventResponseDTO>>> GetEvents()
        {
            var events = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Genre)
                .Include(e => e.Applications)
                .ToListAsync();

            return Ok(events.Select(ToResponseDTO));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventResponseDTO>> GetEvent(int id)
        {
            var ev = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Genre)
                .Include(e => e.Applications)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (ev == null)
                return NotFound();

            return Ok(ToResponseDTO(ev));
        }

        [HttpGet("organizer/{organizerId}")]
        public async Task<ActionResult<IEnumerable<EventResponseDTO>>> GetEventsByOrganizer(int organizerId)
        {
            var events = await _context.Events
                .Where(e => e.OrganizerId == organizerId)
                .Include(e => e.Organizer)
                .Include(e => e.Genre)
                .Include(e => e.Applications)
                .ToListAsync();

            return Ok(events.Select(ToResponseDTO));
        }

        [HttpPost]
        public async Task<ActionResult<EventResponseDTO>> CreateEvent(CreateEventDTO dto)
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

            var created = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Genre)
                .Include(e => e.Applications)
                .FirstAsync(e => e.Id == ev.Id);

            return CreatedAtAction(nameof(GetEvent), new { id = ev.Id }, ToResponseDTO(created));
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

        private static EventResponseDTO ToResponseDTO(Event e) => new()
        {
            Id = e.Id,
            OrganizerId = e.OrganizerId,
            OrganizerFirstName = e.Organizer.FirstName,
            OrganizerLastName = e.Organizer.LastName,
            OrganizerUserName = e.Organizer.UserName,
            Title = e.Title,
            Description = e.Description,
            Genre = e.Genre == null ? null : new GenreSummaryDTO
            {
                Id = e.Genre.Id,
                Name = e.Genre.Name
            },
            Location = e.Location,
            Latitude = e.Latitude,
            Longitude = e.Longitude,
            BudgetMin = e.BudgetMin,
            BudgetMax = e.BudgetMax,
            ScheduledAt = e.ScheduledAt,
            CreatedAt = e.CreatedAt,
            Status = e.Status.ToString(),
            RequiredPerformers = e.RequiredPerformers,
            PreferredPerformerType = e.PreferredPerformerType?.ToString(),
            MinReviewRequired = e.MinReviewRequired,
            ApplicationCount = e.Applications.Count
        };
    }
}

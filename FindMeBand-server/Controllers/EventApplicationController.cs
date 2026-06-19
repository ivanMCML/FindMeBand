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
    public class EventApplicationController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EventApplicationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<EventApplicationResponseDTO>>> GetApplicationsByEvent(int eventId)
        {
            var apps = await _context.EventsApplications
                .Where(a => a.EventId == eventId)
                .Include(a => a.Performer).ThenInclude(p => p.Musician)
                .Include(a => a.Performer).ThenInclude(p => p.Band)
                .ToListAsync();

            return apps.Select(a => new EventApplicationResponseDTO
            {
                Id = a.Id,
                EventId = a.EventId,
                PerformerId = a.PerformerId,
                Status = a.Status.ToString(),
                Message = a.Message,
                AppliedAt = a.AppliedAt,
                ApplicantName = a.Performer.Musician != null
                    ? $"{a.Performer.Musician.FirstName} {a.Performer.Musician.LastName}"
                    : (a.Performer.Band?.Name ?? "Nepoznat"),
                ApplicantType = a.Performer.Musician != null ? "Musician" : "Band",
            }).ToList();
        }

        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetApplicationsByPerformer(int performerId)
        {
            var apps = await _context.EventsApplications
                .Where(a => a.PerformerId == performerId)
                .ToListAsync();

            return apps.Select(a => (object)new
            {
                a.Id,
                a.EventId,
                a.PerformerId,
                Status = a.Status.ToString(),
                a.Message,
                a.AppliedAt,
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventApplication>> GetApplication(int id)
        {
            var application = await _context.EventsApplications
                .Include(a => a.Event)
                .Include(a => a.Performer)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
                return NotFound();

            return application;
        }

        [Authorize(Roles = "Musician")]
        [HttpPost]
        public async Task<ActionResult<EventApplication>> CreateApplication(CreateEventApplicationDTO dto)
        {
            var eventExists = await _context.Events.AnyAsync(e => e.Id == dto.EventId);
            if (!eventExists)
                return BadRequest("Event not found.");

            var performerExists = await _context.Performers.AnyAsync(p => p.Id == dto.PerformerId);
            if (!performerExists)
                return BadRequest("Performer not found.");

            var duplicate = await _context.EventsApplications
                .AnyAsync(a => a.EventId == dto.EventId && a.PerformerId == dto.PerformerId);
            if (duplicate)
                return Conflict("Application already exists.");

            var application = new EventApplication
            {
                EventId = dto.EventId,
                PerformerId = dto.PerformerId,
                Message = dto.Message
            };

            _context.EventsApplications.Add(application);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, application);
        }

        [Authorize(Roles = "Organizer")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateEventApplicationStatusDTO dto)
        {
            var application = await _context.EventsApplications.FindAsync(id);
            if (application == null)
                return NotFound();

            application.Status = dto.Status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Musician")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApplication(int id)
        {
            var application = await _context.EventsApplications.FindAsync(id);
            if (application == null)
                return NotFound();

            _context.EventsApplications.Remove(application);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

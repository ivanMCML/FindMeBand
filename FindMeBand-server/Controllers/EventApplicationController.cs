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
        public async Task<ActionResult<IEnumerable<EventApplication>>> GetApplicationsByEvent(int eventId)
        {
            return await _context.EventsApplications
                .Where(a => a.EventId == eventId)
                .Include(a => a.Performer)
                .ToListAsync();
        }

        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<EventApplication>>> GetApplicationsByPerformer(int performerId)
        {
            return await _context.EventsApplications
                .Where(a => a.PerformerId == performerId)
                .Include(a => a.Event)
                .ToListAsync();
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

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizerController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrganizerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Organizer>>> GetOrganizers()
        {
            return await _context.Organizers
                .Include(o => o.Events)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Organizer>> GetOrganizer(int id)
        {
            var organizer = await _context.Organizers
                .Include(o => o.Events)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (organizer == null)
                return NotFound();

            return organizer;
        }

        [HttpPost]
        public async Task<ActionResult<Organizer>> CreateOrganizer(CreateOrganizerDTO dto)
        {
            var organizer = new Organizer
            {
                UserId = dto.UserId,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                UserName = dto.UserName,
                Description = dto.Description
            };

            _context.Organizers.Add(organizer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrganizer), new { id = organizer.Id }, organizer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrganizer(int id, UpdateOrganizerDTO dto)
        {
            var organizer = await _context.Organizers.FindAsync(id);
            if (organizer == null)
                return NotFound();

            organizer.FirstName = dto.FirstName;
            organizer.LastName = dto.LastName;
            organizer.UserName = dto.UserName;
            organizer.Description = dto.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrganizer(int id)
        {
            var organizer = await _context.Organizers.FindAsync(id);
            if (organizer == null)
                return NotFound();

            _context.Organizers.Remove(organizer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

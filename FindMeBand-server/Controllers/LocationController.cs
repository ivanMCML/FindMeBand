using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationController : ControllerBase
    {
        private readonly AppDbContext _context;
        public LocationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<Location>>> GetLocationsByPerformer(int performerId)
        {
            return await _context.Locations
                .Where(l => l.PerformerId == performerId)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Location>> GetLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();

            return location;
        }

        [HttpPost]
        public async Task<ActionResult<Location>> CreateLocation(CreateLocationDTO dto)
        {
            var performerExists = await _context.Performers.AnyAsync(p => p.Id == dto.PerformerId);
            if (!performerExists)
                return BadRequest("Performer not found.");

            var location = new Location
            {
                PerformerId = dto.PerformerId,
                Name = dto.Name,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLocation), new { id = location.Id }, location);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLocation(int id, UpdateLocationDTO dto)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();

            location.Name = dto.Name;
            location.Address = dto.Address;
            location.Latitude = dto.Latitude;
            location.Longitude = dto.Longitude;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

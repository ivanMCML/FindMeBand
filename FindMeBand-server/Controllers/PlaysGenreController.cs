using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaysGenreController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PlaysGenreController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<PlaysGenre>>> GetByPerformer(int performerId)
        {
            return await _context.PlaysGenre
                .Where(pg => pg.PerformerId == performerId)
                .Include(pg => pg.Genre)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlaysGenre>> GetPlaysGenre(int id)
        {
            var playsGenre = await _context.PlaysGenre
                .Include(pg => pg.Genre)
                .Include(pg => pg.Performer)
                .FirstOrDefaultAsync(pg => pg.Id == id);

            if (playsGenre == null)
                return NotFound();

            return playsGenre;
        }

        [HttpPost]
        public async Task<ActionResult<PlaysGenre>> CreatePlaysGenre(CreatePlaysGenreDTO dto)
        {
            if (dto.SkillLevel < 1 || dto.SkillLevel > 5)
                return BadRequest("Skill level must be between 1 and 5.");

            var performerExists = await _context.Performers.AnyAsync(p => p.Id == dto.PerformerId);
            if (!performerExists)
                return BadRequest("Performer not found.");

            var genreExists = await _context.Genres.AnyAsync(g => g.Id == dto.GenreId);
            if (!genreExists)
                return BadRequest("Genre not found.");

            var duplicate = await _context.PlaysGenre
                .AnyAsync(pg => pg.PerformerId == dto.PerformerId && pg.GenreId == dto.GenreId);
            if (duplicate)
                return Conflict("Performer already has this genre assigned.");

            var playsGenre = new PlaysGenre
            {
                PerformerId = dto.PerformerId,
                GenreId = dto.GenreId,
                SkillLevel = dto.SkillLevel
            };

            _context.PlaysGenre.Add(playsGenre);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlaysGenre), new { id = playsGenre.Id }, playsGenre);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlaysGenre(int id, UpdatePlaysGenreDTO dto)
        {
            if (dto.SkillLevel < 1 || dto.SkillLevel > 5)
                return BadRequest("Skill level must be between 1 and 5.");

            var playsGenre = await _context.PlaysGenre.FindAsync(id);
            if (playsGenre == null)
                return NotFound();

            playsGenre.SkillLevel = dto.SkillLevel;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlaysGenre(int id)
        {
            var playsGenre = await _context.PlaysGenre.FindAsync(id);
            if (playsGenre == null)
                return NotFound();

            _context.PlaysGenre.Remove(playsGenre);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

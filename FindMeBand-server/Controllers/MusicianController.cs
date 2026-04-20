using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MusicianController : ControllerBase
    {
        private readonly AppDbContext _context;
        public MusicianController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Musician>>> GetMusicians()
        {
            return await _context.Musicians
                .Include(m => m.Performer)
                .Include(m => m.PlayedInstruments).ThenInclude(pi => pi.Instrument)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Musician>> GetMusician(int id)
        {
            var musician = await _context.Musicians
                .Include(m => m.Performer)
                    .ThenInclude(p => p!.PlaysGenres).ThenInclude(pg => pg.Genre)
                .Include(m => m.PlayedInstruments).ThenInclude(pi => pi.Instrument)
                .Include(m => m.BandMemberships).ThenInclude(bm => bm.Band)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (musician == null)
                return NotFound();

            return musician;
        }

        [HttpPost]
        public async Task<ActionResult<Musician>> CreateMusician(CreateMusicianDTO dto)
        {
            var musician = new Musician
            {
                UserId = dto.UserId,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                UserName = dto.UserName,
                Description = dto.Description
            };

            _context.Musicians.Add(musician);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMusician), new { id = musician.Id }, musician);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMusician(int id, UpdateMusicianDTO dto)
        {
            var musician = await _context.Musicians.FindAsync(id);
            if (musician == null)
                return NotFound();

            musician.FirstName = dto.FirstName;
            musician.LastName = dto.LastName;
            musician.UserName = dto.UserName;
            musician.Description = dto.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMusician(int id)
        {
            var musician = await _context.Musicians
                .Include(m => m.Performer)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (musician == null)
                return NotFound();

            if (musician.Performer != null)
                _context.Performers.Remove(musician.Performer);

            _context.Musicians.Remove(musician);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/performer")]
        public async Task<ActionResult<Musician>> CreatePerformerForMusician(int id)
        {
            var musician = await _context.Musicians.FindAsync(id);
            if (musician == null)
                return NotFound();

            if (musician.PerformerId.HasValue)
                return BadRequest("Musician already has a performer profile.");

            var performer = new Performer();
            _context.Performers.Add(performer);
            await _context.SaveChangesAsync();

            musician.PerformerId = performer.Id;
            await _context.SaveChangesAsync();

            return Ok(musician);
        }
    }
}

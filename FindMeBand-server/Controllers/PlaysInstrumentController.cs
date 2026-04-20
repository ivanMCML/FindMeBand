using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaysInstrumentController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PlaysInstrumentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("musician/{musicianId}")]
        public async Task<ActionResult<IEnumerable<PlaysInstrument>>> GetByMusician(int musicianId)
        {
            return await _context.PlaysInstrument
                .Where(pi => pi.MusicianId == musicianId)
                .Include(pi => pi.Instrument)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlaysInstrument>> GetPlaysInstrument(int id)
        {
            var playsInstrument = await _context.PlaysInstrument
                .Include(pi => pi.Instrument)
                .Include(pi => pi.Musician)
                .FirstOrDefaultAsync(pi => pi.Id == id);

            if (playsInstrument == null)
                return NotFound();

            return playsInstrument;
        }

        [HttpPost]
        public async Task<ActionResult<PlaysInstrument>> CreatePlaysInstrument(CreatePlaysInstrumentDTO dto)
        {
            if (dto.SkillLevel < 1 || dto.SkillLevel > 5)
                return BadRequest("Skill level must be between 1 and 5.");

            var musicianExists = await _context.Musicians.AnyAsync(m => m.Id == dto.MusicianId);
            if (!musicianExists)
                return BadRequest("Musician not found.");

            var instrumentExists = await _context.Instruments.AnyAsync(i => i.Id == dto.InstrumentId);
            if (!instrumentExists)
                return BadRequest("Instrument not found.");

            var duplicate = await _context.PlaysInstrument
                .AnyAsync(pi => pi.MusicianId == dto.MusicianId && pi.InstrumentId == dto.InstrumentId);
            if (duplicate)
                return Conflict("Musician already has this instrument assigned.");

            var playsInstrument = new PlaysInstrument
            {
                MusicianId = dto.MusicianId,
                InstrumentId = dto.InstrumentId,
                SkillLevel = dto.SkillLevel,
                YearsOfExperience = dto.YearsOfExperience,
                IsPrimary = dto.IsPrimary
            };

            _context.PlaysInstrument.Add(playsInstrument);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlaysInstrument), new { id = playsInstrument.Id }, playsInstrument);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlaysInstrument(int id, UpdatePlaysInstrumentDTO dto)
        {
            if (dto.SkillLevel < 1 || dto.SkillLevel > 5)
                return BadRequest("Skill level must be between 1 and 5.");

            var playsInstrument = await _context.PlaysInstrument.FindAsync(id);
            if (playsInstrument == null)
                return NotFound();

            playsInstrument.SkillLevel = dto.SkillLevel;
            playsInstrument.YearsOfExperience = dto.YearsOfExperience;
            playsInstrument.IsPrimary = dto.IsPrimary;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlaysInstrument(int id)
        {
            var playsInstrument = await _context.PlaysInstrument.FindAsync(id);
            if (playsInstrument == null)
                return NotFound();

            _context.PlaysInstrument.Remove(playsInstrument);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BandMemberController : ControllerBase
    {
        private readonly AppDbContext _context;
        public BandMemberController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("band/{bandId}")]
        public async Task<ActionResult<IEnumerable<BandMember>>> GetMembersByBand(int bandId)
        {
            return await _context.BandMember
                .Where(bm => bm.BandId == bandId)
                .Include(bm => bm.Musician)
                .Include(bm => bm.Instrument)
                .ToListAsync();
        }

        [HttpGet("musician/{musicianId}")]
        public async Task<ActionResult<IEnumerable<BandMember>>> GetBandsByMusician(int musicianId)
        {
            return await _context.BandMember
                .Where(bm => bm.MusicianId == musicianId)
                .Include(bm => bm.Band)
                .Include(bm => bm.Instrument)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BandMember>> GetBandMember(int id)
        {
            var member = await _context.BandMember
                .Include(bm => bm.Band)
                .Include(bm => bm.Musician)
                .Include(bm => bm.Instrument)
                .FirstOrDefaultAsync(bm => bm.Id == id);

            if (member == null)
                return NotFound();

            return member;
        }

        [HttpPost]
        public async Task<ActionResult<BandMember>> CreateBandMember(CreateBandMemberDTO dto)
        {
            var bandExists = await _context.Bands.AnyAsync(b => b.Id == dto.BandId);
            if (!bandExists)
                return BadRequest("Band not found.");

            var musicianExists = await _context.Musicians.AnyAsync(m => m.Id == dto.MusicianId);
            if (!musicianExists)
                return BadRequest("Musician not found.");

            var duplicate = await _context.BandMember
                .AnyAsync(bm => bm.BandId == dto.BandId && bm.MusicianId == dto.MusicianId && bm.LeftDate == null);
            if (duplicate)
                return Conflict("Musician is already an active member of this band.");

            var member = new BandMember
            {
                BandId = dto.BandId,
                MusicianId = dto.MusicianId,
                InstrumentId = dto.InstrumentId
            };

            _context.BandMember.Add(member);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBandMember), new { id = member.Id }, member);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBandMember(int id, UpdateBandMemberDTO dto)
        {
            var member = await _context.BandMember.FindAsync(id);
            if (member == null)
                return NotFound();

            member.InstrumentId = dto.InstrumentId;
            member.LeftDate = dto.LeftDate;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBandMember(int id)
        {
            var member = await _context.BandMember.FindAsync(id);
            if (member == null)
                return NotFound();

            _context.BandMember.Remove(member);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

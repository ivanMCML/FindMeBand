using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BandController : ControllerBase
    {
        private readonly AppDbContext _context;
        public BandController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Band>>> GetBands()
        {
            return await _context.Bands
                .Include(b => b.Performer)
                .Include(b => b.Members).ThenInclude(m => m.Musician)
                .Include(b => b.Members).ThenInclude(m => m.Instrument)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Band>> GetBand(int id)
        {
            var band = await _context.Bands
                .Include(b => b.Performer)
                    .ThenInclude(p => p!.PlaysGenres).ThenInclude(pg => pg.Genre)
                .Include(b => b.Performer)
                    .ThenInclude(p => p!.Locations)
                .Include(b => b.Members).ThenInclude(m => m.Musician)
                .Include(b => b.Members).ThenInclude(m => m.Instrument)
                .Include(b => b.Posts)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (band == null)
                return NotFound();

            return band;
        }

        [HttpPost]
        public async Task<ActionResult<Band>> CreateBand(CreateBandDTO dto)
        {
            var performer = new Performer();
            _context.Performers.Add(performer);
            await _context.SaveChangesAsync();

            var band = new Band
            {
                Name = dto.Name,
                Description = dto.Description,
                PerformerId = performer.Id
            };

            _context.Bands.Add(band);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBand), new { id = band.Id }, band);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBand(int id, UpdateBandDTO dto)
        {
            var band = await _context.Bands.FindAsync(id);
            if (band == null)
                return NotFound();

            band.Name = dto.Name;
            band.Description = dto.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBand(int id)
        {
            var band = await _context.Bands
                .Include(b => b.Performer)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (band == null)
                return NotFound();

            if (band.Performer != null)
                _context.Performers.Remove(band.Performer);

            _context.Bands.Remove(band);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

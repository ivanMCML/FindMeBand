using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstrumentController : ControllerBase
    {
        private readonly AppDbContext _context;
        public InstrumentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Instrument>>> GetInstruments()
        {
            return await _context.Instruments.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Instrument>> GetInstrument(int id)
        {
            var instrument = await _context.Instruments.FindAsync(id);
            if (instrument == null)
                return NotFound();
            return instrument;
        }

        [HttpPost]
        public async Task<ActionResult<Instrument>> CreateInstrument(InstrumentDTO instrumentDto)
        {
            var instrument = new Instrument
            {
                Name = instrumentDto.Name,
                Type = instrumentDto.Type
            };
            _context.Instruments.Add(instrument);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetInstrument), new { id = instrument.Id }, instrument);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInstrument(int id, InstrumentDTO instrumentDto)
        {
            var instrument = await _context.Instruments.FindAsync(id);
            if (instrument == null)
                return NotFound();

            instrument.Name = instrumentDto.Name;
            instrument.Type = instrumentDto.Type;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInstrument(int id)
        {
            var instrument = await _context.Instruments.FindAsync(id);
            if (instrument == null)
                return NotFound();

            var bandMembersUsingInstrument = await _context.BandMember
                .Where(bm => bm.InstrumentId == id)
                .ToListAsync();
            foreach (var bandMember in bandMembersUsingInstrument)
            {
                bandMember.InstrumentId = null;
            }

            var opportunityUsingInstrument = await _context.Opportunities
                .Where(o => o.InstrumentId == id)
                .ToListAsync();
            foreach (var opportunity in opportunityUsingInstrument)
            {
                opportunity.InstrumentId = null;
            }

            var playsInstrument = await _context.PlaysInstrument
                .Where(pi => pi.InstrumentId == id)
                .ToListAsync();
            foreach (var pi in playsInstrument)
            {
                _context.PlaysInstrument.Remove(pi);
            }

            _context.Instruments.Remove(instrument);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

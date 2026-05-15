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
    public class OpportunityController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OpportunityController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OpportunityResponseDTO>>> GetOpportunities()
        {
            var opportunities = await _context.Opportunities
                .Include(o => o.Instrument)
                .Include(o => o.Genre)
                .Include(o => o.Applications)
                .ToListAsync();

            return Ok(opportunities.Select(ToResponseDTO));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OpportunityResponseDTO>> GetOpportunity(int id)
        {
            var opportunity = await _context.Opportunities
                .Include(o => o.Instrument)
                .Include(o => o.Genre)
                .Include(o => o.Applications)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (opportunity == null)
                return NotFound();

            return Ok(ToResponseDTO(opportunity));
        }

        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<OpportunityResponseDTO>>> GetOpportunitiesByPerformer(int performerId)
        {
            var opportunities = await _context.Opportunities
                .Where(o => o.AuthorId == performerId)
                .Include(o => o.Instrument)
                .Include(o => o.Genre)
                .Include(o => o.Applications)
                .ToListAsync();

            return Ok(opportunities.Select(ToResponseDTO));
        }

        [Authorize(Roles = "Musician")]
        [HttpPost]
        public async Task<ActionResult<OpportunityResponseDTO>> CreateOpportunity(CreateOpportunityDTO dto)
        {
            var authorExists = await _context.Performers.AnyAsync(p => p.Id == dto.AuthorId);
            if (!authorExists)
                return BadRequest("Performer (author) not found.");

            var opportunity = new Opportunity
            {
                AuthorId = dto.AuthorId,
                InstrumentId = dto.InstrumentId,
                GenreId = dto.GenreId,
                Type = dto.Type,
                Description = dto.Description
            };

            _context.Opportunities.Add(opportunity);
            await _context.SaveChangesAsync();

            var created = await _context.Opportunities
                .Include(o => o.Instrument)
                .Include(o => o.Genre)
                .Include(o => o.Applications)
                .FirstAsync(o => o.Id == opportunity.Id);

            return CreatedAtAction(nameof(GetOpportunity), new { id = opportunity.Id }, ToResponseDTO(created));
        }

        [Authorize(Roles = "Musician")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOpportunity(int id, UpdateOpportunityDTO dto)
        {
            var opportunity = await _context.Opportunities.FindAsync(id);
            if (opportunity == null)
                return NotFound();

            opportunity.InstrumentId = dto.InstrumentId;
            opportunity.GenreId = dto.GenreId;
            opportunity.Type = dto.Type;
            opportunity.Description = dto.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Musician")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOpportunity(int id)
        {
            var opportunity = await _context.Opportunities.FindAsync(id);
            if (opportunity == null)
                return NotFound();

            _context.Opportunities.Remove(opportunity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static OpportunityResponseDTO ToResponseDTO(Opportunity o) => new()
        {
            Id = o.Id,
            AuthorId = o.AuthorId,
            Type = o.Type.ToString(),
            Description = o.Description,
            Genre = o.Genre == null ? null : new GenreSummaryDTO
            {
                Id = o.Genre.Id,
                Name = o.Genre.Name
            },
            Instrument = o.Instrument == null ? null : new InstrumentSummaryDTO
            {
                Id = o.Instrument.Id,
                Name = o.Instrument.Name,
                Type = o.Instrument.Type.ToString()
            },
            ApplicationCount = o.Applications.Count
        };
    }
}

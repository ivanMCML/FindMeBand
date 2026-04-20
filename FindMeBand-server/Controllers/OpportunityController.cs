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
        public async Task<ActionResult<IEnumerable<Opportunity>>> GetOpportunities()
        {
            return await _context.Opportunities
                .Include(o => o.Author)
                .Include(o => o.Instrument)
                .Include(o => o.Genre)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Opportunity>> GetOpportunity(int id)
        {
            var opportunity = await _context.Opportunities
                .Include(o => o.Author)
                .Include(o => o.Instrument)
                .Include(o => o.Genre)
                .Include(o => o.Applications).ThenInclude(a => a.Applicant)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (opportunity == null)
                return NotFound();

            return opportunity;
        }

        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<Opportunity>>> GetOpportunitiesByPerformer(int performerId)
        {
            return await _context.Opportunities
                .Where(o => o.AuthorId == performerId)
                .Include(o => o.Instrument)
                .Include(o => o.Genre)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Opportunity>> CreateOpportunity(CreateOpportunityDTO dto)
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

            return CreatedAtAction(nameof(GetOpportunity), new { id = opportunity.Id }, opportunity);
        }

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
    }
}

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
    public class OpportunityApplicationController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OpportunityApplicationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("opportunity/{opportunityId}")]
        public async Task<ActionResult<IEnumerable<OpportunityApplication>>> GetByOpportunity(int opportunityId)
        {
            return await _context.OpportunitiesApplications
                .Where(a => a.OpportunityId == opportunityId)
                .Include(a => a.Applicant)
                .ToListAsync();
        }

        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<OpportunityApplication>>> GetByPerformer(int performerId)
        {
            return await _context.OpportunitiesApplications
                .Where(a => a.ApplicantId == performerId)
                .Include(a => a.Opportunity)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OpportunityApplication>> GetApplication(int id)
        {
            var application = await _context.OpportunitiesApplications
                .Include(a => a.Opportunity)
                .Include(a => a.Applicant)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
                return NotFound();

            return application;
        }

        [Authorize(Roles = "Musician")]
        [HttpPost]
        public async Task<ActionResult<OpportunityApplication>> CreateApplication(CreateOpportunityApplicationDTO dto)
        {
            var opportunityExists = await _context.Opportunities.AnyAsync(o => o.Id == dto.OpportunityId);
            if (!opportunityExists)
                return BadRequest("Opportunity not found.");

            var applicantExists = await _context.Performers.AnyAsync(p => p.Id == dto.ApplicantId);
            if (!applicantExists)
                return BadRequest("Performer (applicant) not found.");

            var duplicate = await _context.OpportunitiesApplications
                .AnyAsync(a => a.OpportunityId == dto.OpportunityId && a.ApplicantId == dto.ApplicantId);
            if (duplicate)
                return Conflict("Application already exists.");

            var application = new OpportunityApplication
            {
                OpportunityId = dto.OpportunityId,
                ApplicantId = dto.ApplicantId,
                Message = dto.Message
            };

            _context.OpportunitiesApplications.Add(application);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, application);
        }

        [Authorize(Roles = "Musician")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApplication(int id)
        {
            var application = await _context.OpportunitiesApplications.FindAsync(id);
            if (application == null)
                return NotFound();

            _context.OpportunitiesApplications.Remove(application);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

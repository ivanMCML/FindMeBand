using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;
using FindMeBand_server.Enums;

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
        public async Task<ActionResult<IEnumerable<OppAppResponseDTO>>> GetByOpportunity(int opportunityId)
        {
            var apps = await _context.OpportunitiesApplications
                .Where(a => a.OpportunityId == opportunityId)
                .Include(a => a.Applicant).ThenInclude(p => p.Musician)
                .Include(a => a.Applicant).ThenInclude(p => p.Band)
                .ToListAsync();

            return Ok(apps.Select(a => new OppAppResponseDTO
            {
                Id = a.Id,
                OpportunityId = a.OpportunityId,
                ApplicantId = a.ApplicantId,
                Status = a.Status.ToString(),
                Message = a.Message,
                AppliedAt = a.AppliedAt,
                ApplicantName = a.Applicant.Musician != null
                    ? $"{a.Applicant.Musician.FirstName} {a.Applicant.Musician.LastName}"
                    : (a.Applicant.Band?.Name ?? "Nepoznat"),
                ApplicantType = a.Applicant.Musician != null ? "Musician" : "Band",
            }));
        }

        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetByPerformer(int performerId)
        {
            var apps = await _context.OpportunitiesApplications
                .Where(a => a.ApplicantId == performerId)
                .ToListAsync();

            return Ok(apps.Select(a => new
            {
                a.Id,
                a.OpportunityId,
                Status = a.Status.ToString(),
                a.AppliedAt,
            }));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OppAppResponseDTO>> GetApplication(int id)
        {
            var a = await _context.OpportunitiesApplications
                .Include(a => a.Applicant).ThenInclude(p => p.Musician)
                .Include(a => a.Applicant).ThenInclude(p => p.Band)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (a == null) return NotFound();

            return Ok(new OppAppResponseDTO
            {
                Id = a.Id,
                OpportunityId = a.OpportunityId,
                ApplicantId = a.ApplicantId,
                Status = a.Status.ToString(),
                Message = a.Message,
                AppliedAt = a.AppliedAt,
                ApplicantName = a.Applicant.Musician != null
                    ? $"{a.Applicant.Musician.FirstName} {a.Applicant.Musician.LastName}"
                    : (a.Applicant.Band?.Name ?? "Nepoznat"),
                ApplicantType = a.Applicant.Musician != null ? "Musician" : "Band",
            });
        }

        [Authorize(Roles = "Musician")]
        [HttpPost]
        public async Task<ActionResult<OppAppResponseDTO>> CreateApplication(CreateOpportunityApplicationDTO dto)
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

            var opportunity = await _context.Opportunities
                .Include(o => o.Author).ThenInclude(p => p.Musician)
                .Include(o => o.Author).ThenInclude(p => p.Band).ThenInclude(b => b.Members).ThenInclude(m => m.Musician)
                .FirstAsync(o => o.Id == dto.OpportunityId);

            var applicant = await _context.Performers
                .Include(p => p.Musician)
                .Include(p => p.Band)
                .FirstAsync(p => p.Id == dto.ApplicantId);

            var applicantName = applicant.Musician != null
                ? $"{applicant.Musician.FirstName} {applicant.Musician.LastName}"
                : applicant.Band?.Name ?? "Nepoznat";

            if (opportunity.Author.Musician != null)
            {
                _context.Notifications.Add(new Notification
                {
                    RecipientProfileId = opportunity.Author.Musician.Id,
                    ActorProfileId = applicant.Musician?.Id,
                    Type = NotificationType.NewApplication,
                    Message = $"{applicantName} se prijavio/la na vaš oglas.",
                });
            }
            else if (opportunity.Author.Band != null)
            {
                foreach (var admin in opportunity.Author.Band.Members.Where(m => m.Role == BandMemberRole.Admin))
                {
                    _context.Notifications.Add(new Notification
                    {
                        RecipientProfileId = admin.Musician.Id,
                        ActorProfileId = applicant.Musician?.Id,
                        Type = NotificationType.NewApplication,
                        Message = $"{applicantName} se prijavio/la na oglas benda \"{opportunity.Author.Band.Name}\".",
                    });
                }
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, new OppAppResponseDTO
            {
                Id = application.Id,
                OpportunityId = application.OpportunityId,
                ApplicantId = application.ApplicantId,
                Status = application.Status.ToString(),
                Message = application.Message,
                AppliedAt = application.AppliedAt,
                ApplicantName = applicantName,
                ApplicantType = applicant.Musician != null ? "Musician" : "Band",
            });
        }

        [Authorize(Roles = "Musician")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateOppAppStatusDTO dto)
        {
            var application = await _context.OpportunitiesApplications
                .Include(a => a.Applicant).ThenInclude(p => p.Musician)
                .Include(a => a.Applicant).ThenInclude(p => p.Band).ThenInclude(b => b.Members).ThenInclude(m => m.Musician)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null) return NotFound();

            application.Status = dto.Status;

            var accepted = dto.Status == ApplicationStatus.Accepted;
            var notifType = accepted ? NotificationType.ApplicationAccepted : NotificationType.ApplicationRejected;

            if (application.Applicant.Musician != null)
            {
                _context.Notifications.Add(new Notification
                {
                    RecipientProfileId = application.Applicant.Musician.Id,
                    Type = notifType,
                    Message = accepted
                        ? "Vaša prijava na oglas je prihvaćena!"
                        : "Vaša prijava na oglas je odbijena.",
                });
            }
            else if (application.Applicant.Band != null)
            {
                var msg = accepted
                    ? $"Prijava benda \"{application.Applicant.Band.Name}\" je prihvaćena!"
                    : $"Prijava benda \"{application.Applicant.Band.Name}\" je odbijena.";
                foreach (var admin in application.Applicant.Band.Members.Where(m => m.Role == BandMemberRole.Admin))
                {
                    _context.Notifications.Add(new Notification
                    {
                        RecipientProfileId = admin.Musician.Id,
                        Type = notifType,
                        Message = msg,
                    });
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
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

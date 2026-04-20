using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerformerController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PerformerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Performer>>> GetPerformers()
        {
            return await _context.Performers
                .Include(p => p.Musician)
                .Include(p => p.Band)
                .Include(p => p.PlaysGenres).ThenInclude(pg => pg.Genre)
                .Include(p => p.Locations)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Performer>> GetPerformer(int id)
        {
            var performer = await _context.Performers
                .Include(p => p.Musician)
                .Include(p => p.Band)
                .Include(p => p.PlaysGenres).ThenInclude(pg => pg.Genre)
                .Include(p => p.Locations)
                .Include(p => p.ReceivedReviews).ThenInclude(r => r.Reviewer)
                .Include(p => p.AuthoredOpportunities)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (performer == null)
                return NotFound();

            return performer;
        }
    }
}

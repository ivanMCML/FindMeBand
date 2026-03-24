using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProfileController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Profile>>> GetProfiles()
        {
            return await _context.Profiles.Include(p => p.User).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Profile>> GetProfile(int id)
        {
            var profile = await _context.Profiles.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
            if (profile == null)
                return NotFound();
            return profile;
        }

        [HttpPost]
        public async Task<ActionResult<Profile>> CreateProfile(CreateProfileDTO profileDto)
        {
            var profile = new Profile
            {
                UserId = profileDto.UserId,
                FirstName = profileDto.FirstName,
                LastName = profileDto.LastName,
                UserName = profileDto.UserName,
                Description = profileDto.Description
            };
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProfile), new { id = profile.Id }, profile);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, CreateProfileDTO profileDto)
        {
            var profile = await _context.Profiles.FindAsync(id);
            if (profile == null)
                return NotFound();

            profile.FirstName = profileDto.FirstName;
            profile.LastName = profileDto.LastName;
            profile.UserName = profileDto.UserName;
            profile.Description = profileDto.Description;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfile(int id)
        {
            var profile = await _context.Profiles.FindAsync(id);
            if (profile == null)
                return NotFound();

            var bandMembers = await _context.BandMember
                .Where(bm => (bm.MusicianId || bm.BandId) == profile.Id)
                .ToListAsync();
            foreach (var member in bandMembers)
            {
                _context.BandMember.Remove(member);
            }



            _context.Profiles.Remove(profile);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

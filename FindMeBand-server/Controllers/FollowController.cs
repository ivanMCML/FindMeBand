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
    public class FollowController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FollowController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("following/{profileId}")]
        public async Task<ActionResult<IEnumerable<FollowResponseDTO>>> GetFollowing(int profileId)
        {
            var follows = await _context.Follows
                .Where(f => f.FollowerId == profileId)
                .Include(f => f.FolloweeProfile)
                .Include(f => f.FolloweeBand)
                .ToListAsync();

            return Ok(follows.Select(ToResponseDTO));
        }

        [HttpGet("followers/profile/{profileId}")]
        public async Task<ActionResult<IEnumerable<FollowResponseDTO>>> GetProfileFollowers(int profileId)
        {
            var follows = await _context.Follows
                .Where(f => f.FolloweeProfileId == profileId)
                .Include(f => f.Follower)
                .ToListAsync();

            return Ok(follows.Select(ToResponseDTO));
        }

        [HttpGet("followers/band/{bandId}")]
        public async Task<ActionResult<IEnumerable<FollowResponseDTO>>> GetBandFollowers(int bandId)
        {
            var follows = await _context.Follows
                .Where(f => f.FolloweeBandId == bandId)
                .Include(f => f.Follower)
                .ToListAsync();

            return Ok(follows.Select(ToResponseDTO));
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<FollowResponseDTO>> Follow(CreateFollowDTO dto)
        {
            if (dto.FolloweeProfileId == null && dto.FolloweeBandId == null)
                return BadRequest("Mora biti postavljen FolloweeProfileId ili FolloweeBandId.");

            if (dto.FolloweeProfileId != null && dto.FolloweeBandId != null)
                return BadRequest("Može biti postavljen samo jedan od FolloweeProfileId ili FolloweeBandId.");

            var followerExists = await _context.Profiles.AnyAsync(p => p.Id == dto.FollowerId);
            if (!followerExists)
                return BadRequest("Follower profil nije pronađen.");

            if (dto.FolloweeProfileId != null)
            {
                if (dto.FolloweeProfileId == dto.FollowerId)
                    return BadRequest("Profil ne može pratiti samog sebe.");

                var followeeExists = await _context.Profiles.AnyAsync(p => p.Id == dto.FolloweeProfileId);
                if (!followeeExists)
                    return BadRequest("Followee profil nije pronađen.");

                var duplicate = await _context.Follows
                    .AnyAsync(f => f.FollowerId == dto.FollowerId && f.FolloweeProfileId == dto.FolloweeProfileId);
                if (duplicate)
                    return Conflict("Već prati ovaj profil.");
            }
            else
            {
                var bandExists = await _context.Bands.AnyAsync(b => b.Id == dto.FolloweeBandId);
                if (!bandExists)
                    return BadRequest("Bend nije pronađen.");

                var duplicate = await _context.Follows
                    .AnyAsync(f => f.FollowerId == dto.FollowerId && f.FolloweeBandId == dto.FolloweeBandId);
                if (duplicate)
                    return Conflict("Već prati ovaj bend.");
            }

            var follow = new Follow
            {
                FollowerId = dto.FollowerId,
                FolloweeProfileId = dto.FolloweeProfileId,
                FolloweeBandId = dto.FolloweeBandId
            };

            _context.Follows.Add(follow);
            await _context.SaveChangesAsync();

            var created = await _context.Follows
                .Include(f => f.Follower)
                .Include(f => f.FolloweeProfile)
                .Include(f => f.FolloweeBand)
                .FirstAsync(f => f.Id == follow.Id);

            return Ok(ToResponseDTO(created));
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Unfollow(int id)
        {
            var follow = await _context.Follows.FindAsync(id);
            if (follow == null)
                return NotFound();

            _context.Follows.Remove(follow);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static FollowResponseDTO ToResponseDTO(Follow f) => new()
        {
            Id = f.Id,
            FollowerId = f.FollowerId,
            FollowerFirstName = f.Follower?.FirstName,
            FollowerLastName = f.Follower?.LastName,
            FollowerUserName = f.Follower?.UserName,
            FolloweeProfileId = f.FolloweeProfileId,
            FolloweeProfileFirstName = f.FolloweeProfile?.FirstName,
            FolloweeProfileLastName = f.FolloweeProfile?.LastName,
            FolloweeProfileUserName = f.FolloweeProfile?.UserName,
            FolloweeProfileDescription = f.FolloweeProfile?.Description,
            FolloweeBandId = f.FolloweeBandId,
            FolloweeBandName = f.FolloweeBand?.Name,
            FollowedAt = f.FollowedAt
        };
    }
}

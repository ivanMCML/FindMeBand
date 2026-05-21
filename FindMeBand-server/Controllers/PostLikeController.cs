using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.DTOs;
using FindMeBand_server.Models;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PostLikeController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PostLikeController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Like(CreatePostLikeDTO dto)
        {
            var postExists = await _context.Posts.AnyAsync(p => p.Id == dto.PostId);
            if (!postExists)
                return NotFound("Post nije pronađen.");

            var profileExists = await _context.Profiles.AnyAsync(p => p.Id == dto.ProfileId);
            if (!profileExists)
                return NotFound("Profil nije pronađen.");

            var duplicate = await _context.PostLikes
                .AnyAsync(pl => pl.PostId == dto.PostId && pl.ProfileId == dto.ProfileId);
            if (duplicate)
                return Conflict("Već ste lajkali ovaj post.");

            _context.PostLikes.Add(new PostLike { PostId = dto.PostId, ProfileId = dto.ProfileId });
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> Unlike([FromQuery] int postId, [FromQuery] int profileId)
        {
            var like = await _context.PostLikes
                .FirstOrDefaultAsync(pl => pl.PostId == postId && pl.ProfileId == profileId);

            if (like == null)
                return NotFound();

            _context.PostLikes.Remove(like);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

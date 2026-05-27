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
        public async Task<IActionResult> ToggleLike(CreatePostLikeDTO dto)
        {
            var postExists = await _context.Posts.AnyAsync(p => p.Id == dto.PostId);
            if (!postExists)
                return NotFound("Post nije pronađen.");

            var profileExists = await _context.Profiles.AnyAsync(p => p.Id == dto.ProfileId);
            if (!profileExists)
                return NotFound("Profil nije pronađen.");

            var existing = await _context.PostLikes
                .FirstOrDefaultAsync(pl => pl.PostId == dto.PostId && pl.ProfileId == dto.ProfileId);

            if (existing != null)
            {
                _context.PostLikes.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new PostLikeResponseDTO { Liked = false });
            }

            _context.PostLikes.Add(new PostLike { PostId = dto.PostId, ProfileId = dto.ProfileId });
            await _context.SaveChangesAsync();
            return Ok(new PostLikeResponseDTO { Liked = true });
        }
    }
}

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
    public class PostController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PostController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile/{profileId}")]
        public async Task<ActionResult<IEnumerable<PostResponseDTO>>> GetPostsByProfile(int profileId)
        {
            var posts = await _context.Posts
                .Where(p => p.ProfileId == profileId && p.BandId == null)
                .Include(p => p.Profile)
                .Include(p => p.Media)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(posts.Select(ToResponseDTO));
        }

        [HttpGet("band/{bandId}")]
        public async Task<ActionResult<IEnumerable<PostResponseDTO>>> GetPostsByBand(int bandId)
        {
            var posts = await _context.Posts
                .Where(p => p.BandId == bandId)
                .Include(p => p.Profile)
                .Include(p => p.Band)
                .Include(p => p.Media)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(posts.Select(ToResponseDTO));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PostResponseDTO>> GetPost(int id)
        {
            var post = await _context.Posts
                .Include(p => p.Profile)
                .Include(p => p.Band)
                .Include(p => p.Media)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
                return NotFound();

            return Ok(ToResponseDTO(post));
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<PostResponseDTO>> CreatePost(CreatePostDTO dto)
        {
            var profileExists = await _context.Profiles.AnyAsync(p => p.Id == dto.ProfileId);
            if (!profileExists)
                return BadRequest("Profile not found.");

            if (dto.BandId != null)
            {
                var bandExists = await _context.Bands.AnyAsync(b => b.Id == dto.BandId);
                if (!bandExists)
                    return BadRequest("Band not found.");
            }

            var post = new Post
            {
                ProfileId = dto.ProfileId,
                BandId = dto.BandId,
                Content = dto.Content,
                Media = dto.Media.Select(m => new PostMedia
                {
                    Url = m.Url,
                    Type = m.Type
                }).ToList()
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            var created = await _context.Posts
                .Include(p => p.Profile)
                .Include(p => p.Band)
                .Include(p => p.Media)
                .FirstAsync(p => p.Id == post.Id);

            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, ToResponseDTO(created));
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, UpdatePostDTO dto)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
                return NotFound();

            post.Content = dto.Content;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
                return NotFound();

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static PostResponseDTO ToResponseDTO(Post p) => new()
        {
            Id = p.Id,
            ProfileId = p.ProfileId,
            AuthorFirstName = p.Profile.FirstName,
            AuthorLastName = p.Profile.LastName,
            AuthorUserName = p.Profile.UserName,
            BandId = p.BandId,
            BandName = p.Band?.Name,
            Content = p.Content,
            CreatedAt = p.CreatedAt,
            Media = p.Media.Select(m => new PostMediaResponseDTO
            {
                Id = m.Id,
                Url = m.Url,
                Type = m.Type.ToString()
            }).ToList()
        };
    }
}

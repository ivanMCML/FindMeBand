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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PostResponseDTO>>> GetAllPosts(
            [FromQuery] int? profileId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var posts = await _context.Posts
                .Include(p => p.Profile)
                .Include(p => p.Band)
                .Include(p => p.Media)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(posts.Select(p => ToResponseDTO(p, profileId)));
        }

        [HttpGet("feed/{profileId}")]
        public async Task<ActionResult<IEnumerable<PostResponseDTO>>> GetFeed(
            int profileId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var follows = await _context.Follows
                .Where(f => f.FollowerId == profileId)
                .ToListAsync();

            var followedProfileIds = follows
                .Where(f => f.FolloweeProfileId.HasValue)
                .Select(f => f.FolloweeProfileId!.Value)
                .ToList();

            var followedBandIds = follows
                .Where(f => f.FolloweeBandId.HasValue)
                .Select(f => f.FolloweeBandId!.Value)
                .ToList();

            var posts = await _context.Posts
                .Where(p =>
                    (p.BandId == null && followedProfileIds.Contains(p.ProfileId)) ||
                    (p.BandId != null && p.BandId.HasValue && followedBandIds.Contains(p.BandId.Value))
                )
                .Include(p => p.Profile)
                .Include(p => p.Band)
                .Include(p => p.Media)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(posts.Select(p => ToResponseDTO(p, profileId)));
        }

        [HttpGet("profile/{profileId}")]
        public async Task<ActionResult<IEnumerable<PostResponseDTO>>> GetPostsByProfile(int profileId, [FromQuery] int? viewerProfileId = null)
        {
            var posts = await _context.Posts
                .Where(p => p.ProfileId == profileId && p.BandId == null)
                .Include(p => p.Profile)
                .Include(p => p.Media)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(posts.Select(p => ToResponseDTO(p, viewerProfileId)));
        }

        [HttpGet("band/{bandId}")]
        public async Task<ActionResult<IEnumerable<PostResponseDTO>>> GetPostsByBand(int bandId, [FromQuery] int? profileId = null)
        {
            var posts = await _context.Posts
                .Where(p => p.BandId == bandId)
                .Include(p => p.Profile)
                .Include(p => p.Band)
                .Include(p => p.Media)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(posts.Select(p => ToResponseDTO(p, profileId)));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PostResponseDTO>> GetPost(int id, [FromQuery] int? profileId = null)
        {
            var post = await _context.Posts
                .Include(p => p.Profile)
                .Include(p => p.Band)
                .Include(p => p.Media)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
                return NotFound();

            return Ok(ToResponseDTO(post, profileId));
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

        private static PostResponseDTO ToResponseDTO(Post p, int? viewerProfileId = null) => new()
        {
            Id = p.Id,
            ProfileId = p.ProfileId,
            AuthorFirstName = p.Profile.FirstName,
            AuthorLastName = p.Profile.LastName,
            AuthorUserName = p.Profile.UserName,
            AuthorAvatarUrl = p.Profile.AvatarUrl,
            BandId = p.BandId,
            BandName = p.Band?.Name,
            BandAvatarUrl = p.Band?.AvatarUrl,
            Content = p.Content,
            CreatedAt = p.CreatedAt,
            Media = p.Media.Select(m => new PostMediaResponseDTO
            {
                Id = m.Id,
                Url = m.Url,
                Type = m.Type.ToString()
            }).ToList(),
            LikesCount = p.Likes.Count,
            IsLiked = viewerProfileId.HasValue && p.Likes.Any(l => l.ProfileId == viewerProfileId.Value),
            CommentsCount = p.Comments.Count
        };
    }
}

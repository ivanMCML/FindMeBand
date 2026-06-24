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
    public class PostCommentController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PostCommentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("post/{postId}")]
        public async Task<ActionResult<IEnumerable<PostCommentResponseDTO>>> GetComments(int postId)
        {
            var comments = await _context.PostComments
                .Where(c => c.PostId == postId)
                .Include(c => c.Profile)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return Ok(comments.Select(ToResponseDTO));
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<PostCommentResponseDTO>> CreateComment(CreatePostCommentDTO dto)
        {
            var postExists = await _context.Posts.AnyAsync(p => p.Id == dto.PostId);
            if (!postExists) return NotFound("Post not found.");

            var comment = new PostComment
            {
                PostId = dto.PostId,
                ProfileId = dto.ProfileId,
                Content = dto.Content.Trim()
            };

            _context.PostComments.Add(comment);
            await _context.SaveChangesAsync();

            var created = await _context.PostComments
                .Include(c => c.Profile)
                .FirstAsync(c => c.Id == comment.Id);

            return CreatedAtAction(nameof(GetComments), new { postId = comment.PostId }, ToResponseDTO(created));
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _context.PostComments.FindAsync(id);
            if (comment == null) return NotFound();

            _context.PostComments.Remove(comment);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static PostCommentResponseDTO ToResponseDTO(PostComment c) => new()
        {
            Id = c.Id,
            PostId = c.PostId,
            ProfileId = c.ProfileId,
            AuthorFirstName = c.Profile.FirstName,
            AuthorLastName = c.Profile.LastName,
            AuthorUserName = c.Profile.UserName,
            AuthorAvatarUrl = c.Profile.AvatarUrl,
            Content = c.Content,
            CreatedAt = c.CreatedAt,
        };
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReviewController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviewsByPerformer(int performerId)
        {
            return await _context.Reviews
                .Where(r => r.PerformerId == performerId)
                .Include(r => r.Reviewer)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.Performer)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
                return NotFound();

            return review;
        }

        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview(CreateReviewDTO dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            var performerExists = await _context.Performers.AnyAsync(p => p.Id == dto.PerformerId);
            if (!performerExists)
                return BadRequest("Performer not found.");

            var duplicate = await _context.Reviews
                .AnyAsync(r => r.ReviewerId == dto.ReviewerId && r.PerformerId == dto.PerformerId);
            if (duplicate)
                return Conflict("You have already reviewed this performer.");

            var review = new Review
            {
                ReviewerId = dto.ReviewerId,
                PerformerId = dto.PerformerId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };

            _context.Reviews.Add(review);

            var performer = await _context.Performers.FindAsync(dto.PerformerId);
            performer!.NumberOfReviews++;
            performer.AverageRating =
                (performer.AverageRating * (performer.NumberOfReviews - 1) + dto.Rating)
                / performer.NumberOfReviews;

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, UpdateReviewDTO dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
                return NotFound();

            var performer = await _context.Performers.FindAsync(review.PerformerId);
            if (performer != null && performer.NumberOfReviews > 0)
            {
                var totalRating = performer.AverageRating * performer.NumberOfReviews;
                totalRating = totalRating - review.Rating + dto.Rating;
                performer.AverageRating = totalRating / performer.NumberOfReviews;
            }

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
                return NotFound();

            var performer = await _context.Performers.FindAsync(review.PerformerId);
            if (performer != null && performer.NumberOfReviews > 1)
            {
                var totalRating = performer.AverageRating * performer.NumberOfReviews - review.Rating;
                performer.NumberOfReviews--;
                performer.AverageRating = totalRating / performer.NumberOfReviews;
            }
            else if (performer != null)
            {
                performer.NumberOfReviews = 0;
                performer.AverageRating = 0;
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

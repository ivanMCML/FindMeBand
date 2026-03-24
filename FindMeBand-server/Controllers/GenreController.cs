using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Data;
using FindMeBand_server.Models;
using FindMeBand_server.DTOs;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GenreController : ControllerBase
    {
        private readonly AppDbContext _context;
        public GenreController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Genre>>> GetGenres()
        {
            return await _context.Genres.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Genre>> GetGenre(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();
            return genre;
        }

        [HttpPost]
        public async Task<ActionResult<Genre>> CreateGenre(GenreDTO genreDto)
        {
            var genre = new Genre
            {
                Name = genreDto.Name
            };
            _context.Genres.Add(genre);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGenre), new { id = genre.Id }, genre);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGenre(int id, GenreDTO genreDto)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();

            genre.Name = genreDto.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGenre(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();

            var eventUsingGenre = await _context.Events
                .Where(e => e.GenreId == id)
                .ToListAsync();
            foreach (var ev in eventUsingGenre)
            {
                ev.GenreId = null;
            }

            var opportunityUsingGenre = await _context.Opportunities
                .Where(o => o.GenreId == id)
                .ToListAsync();
            foreach(var opportunity in opportunityUsingGenre)
            {
                opportunity.GenreId = null;
            }

            var playsGenre = await _context.PlaysGenre
                .Where(pg => pg.GenreId == id)
                .ToListAsync();
            foreach(var pg in playsGenre)
            {
                _context.PlaysGenre.Remove(pg);
            }

            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}

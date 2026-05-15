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
    public class BandController : ControllerBase
    {
        private readonly AppDbContext _context;
        public BandController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BandResponseDTO>>> GetBands()
        {
            var bands = await _context.Bands
                .Include(b => b.Performer)
                    .ThenInclude(p => p!.PlaysGenres).ThenInclude(pg => pg.Genre)
                .Include(b => b.Members).ThenInclude(m => m.Musician)
                .Include(b => b.Members).ThenInclude(m => m.Instrument)
                .ToListAsync();

            return Ok(bands.Select(ToResponseDTO));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BandResponseDTO>> GetBand(int id)
        {
            var band = await _context.Bands
                .Include(b => b.Performer)
                    .ThenInclude(p => p!.PlaysGenres).ThenInclude(pg => pg.Genre)
                .Include(b => b.Performer)
                    .ThenInclude(p => p!.Locations)
                .Include(b => b.Members).ThenInclude(m => m.Musician)
                .Include(b => b.Members).ThenInclude(m => m.Instrument)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (band == null)
                return NotFound();

            return Ok(ToResponseDTO(band));
        }

        private static BandResponseDTO ToResponseDTO(Band b) => new()
        {
            Id = b.Id,
            Name = b.Name,
            Description = b.Description,
            CreatedAt = b.CreatedAt,
            PerformerId = b.PerformerId,
            AverageRating = b.Performer?.AverageRating,
            NumberOfReviews = b.Performer?.NumberOfReviews,
            Genres = b.Performer?.PlaysGenres.Select(pg => new GenreSummaryDTO
            {
                Id = pg.Genre.Id,
                Name = pg.Genre.Name
            }).ToList() ?? new(),
            Locations = b.Performer?.Locations.Select(l => new LocationSummaryDTO
            {
                Id = l.Id,
                Name = l.Name,
                Address = l.Address,
                Latitude = l.Latitude,
                Longitude = l.Longitude
            }).ToList() ?? new(),
            Members = b.Members.Select(m => new BandMemberResponseDTO
            {
                Id = m.Id,
                BandId = m.BandId,
                BandName = b.Name,
                MusicianId = m.MusicianId,
                MusicianFirstName = m.Musician.FirstName,
                MusicianLastName = m.Musician.LastName,
                MusicianUserName = m.Musician.UserName,
                Role = m.Role.ToString(),
                JoinedDate = m.JoinedDate,
                LeftDate = m.LeftDate,
                Instrument = m.Instrument == null ? null : new InstrumentSummaryDTO
                {
                    Id = m.Instrument.Id,
                    Name = m.Instrument.Name,
                    Type = m.Instrument.Type.ToString()
                }
            }).ToList()
        };

        [Authorize(Roles = "Musician")]
        [HttpPost]
        public async Task<ActionResult<Band>> CreateBand(CreateBandDTO dto)
        {
            var performer = new Performer();
            _context.Performers.Add(performer);
            await _context.SaveChangesAsync();

            var band = new Band
            {
                Name = dto.Name,
                Description = dto.Description,
                PerformerId = performer.Id
            };

            _context.Bands.Add(band);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBand), new { id = band.Id }, band);
        }

        [Authorize(Roles = "Musician")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBand(int id, UpdateBandDTO dto)
        {
            var band = await _context.Bands.FindAsync(id);
            if (band == null)
                return NotFound();

            band.Name = dto.Name;
            band.Description = dto.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Musician")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBand(int id)
        {
            var band = await _context.Bands
                .Include(b => b.Performer)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (band == null)
                return NotFound();

            if (band.Performer != null)
                _context.Performers.Remove(band.Performer);

            _context.Bands.Remove(band);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FindMeBand_server.Data;
using FindMeBand_server.DTOs;
using FindMeBand_server.Enums;
using FindMeBand_server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FindMeBand_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(UserManager<User> userManager, AppDbContext context, IConfiguration config)
        {
            _userManager = userManager;
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDTO>> Register(RegisterDTO dto)
        {
            if (await _userManager.FindByEmailAsync(dto.Email) != null)
                return BadRequest("Korisnik s ovom email adresom već postoji.");

            if (await _context.Profiles.AnyAsync(p => p.UserName == dto.UserName))
                return BadRequest("Korisničko ime je već zauzeto.");

            var user = new User { UserName = dto.Email, Email = dto.Email };
            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description));

            Profile profile = dto.Role == UserRole.Organizer
                ? new Organizer
                {
                    UserId = user.Id,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    UserName = dto.UserName,
                    Description = dto.Description ?? string.Empty
                }
                : new Musician
                {
                    UserId = user.Id,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    UserName = dto.UserName,
                    Description = dto.Description ?? string.Empty
                };

            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            if (profile is Musician newMusician)
            {
                var performer = new Performer();
                _context.Performers.Add(performer);
                await _context.SaveChangesAsync();
                newMusician.PerformerId = performer.Id;
                await _context.SaveChangesAsync();
            }

            var role = profile is Organizer ? "Organizer" : "Musician";
            var token = GenerateToken(user, profile, role);

            return Ok(new AuthResponseDTO
            {
                Token = token,
                UserId = user.Id,
                ProfileId = profile.Id,
                FirstName = profile.FirstName,
                LastName = profile.LastName,
                UserName = profile.UserName,
                Email = user.Email!,
                Role = role
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDTO>> Login(LoginDTO dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized("Pogrešan email ili lozinka.");

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == user.Id);
            if (profile == null)
                return NotFound("Profil za ovog korisnika nije pronađen.");

            var role = profile is Organizer ? "Organizer" : "Musician";
            var token = GenerateToken(user, profile, role);

            return Ok(new AuthResponseDTO
            {
                Token = token,
                UserId = user.Id,
                ProfileId = profile.Id,
                FirstName = profile.FirstName,
                LastName = profile.LastName,
                UserName = profile.UserName,
                Email = user.Email!,
                Role = role
            });
        }

        private string GenerateToken(User user, Profile profile, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim("profileId", profile.Id.ToString()),
                new Claim("userName", profile.UserName),
                new Claim(ClaimTypes.Role, role),
            };

            var expires = DateTime.UtcNow.AddDays(int.Parse(_config["Jwt:ExpiresInDays"]!));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Text;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using FXJournal.Application.Abstractions.Authentication;
using FXJournal.Data;
using FXJournal.Domain.Entities;
using FXJournal.Application.Abstractions.JWT;

namespace FXJournal.Infrastructure.Repositories.JWT
{
    public class JWTRepository : IJWTRepository
    {
        private readonly ApplicationDbContext _context;

        public JWTRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public string GenerateToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSecretKey"));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Add user roles as claims
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            // Add roles to claims
            foreach (var role in user.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role.Name));
            }

            var token = new JwtSecurityToken(
                issuer: "YourIssuer",
                audience: "YourAudience",
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
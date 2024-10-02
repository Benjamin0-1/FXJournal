using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using BCrypt.Net;
using FXJournal.Application.Abstractions.Authentication;
using FXJournal.Data;
using FXJournal.Domain.Entities;

namespace FXJournal.Infrastructure.Repositories.Authentication
{
    public class AuthenticationRepository : IAuthenticationRepository
    {
        private readonly ApplicationDbContext _context;

        public AuthenticationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> LoginUserAsync(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return string.Empty; // or handle appropriately
            }

            if (BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                return "JWT token"; // implementation needed.
            }

            return string.Empty; // or handle appropriately
        }

        public async Task<bool> RegisterUserAsync(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user != null)
            {
                return false;
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            var newUser = new User
            {
                Email = email,
                Password = hashedPassword
            };

            _context.Users.Add(newUser);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> CheckPasswordAsync(User user, string password)
        {
            return await Task.Run(() => BCrypt.Net.BCrypt.Verify(password, user.Password));
        }
    }
}

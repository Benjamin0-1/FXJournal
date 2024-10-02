
using FXJournal.Domain.Dtos;
using FXJournal.Domain.Entities;

namespace FXJournal.Application.Abstractions.Authentication
{
    public interface IAuthenticationRepository
    {
        Task<string> LoginUserAsync(string email, string password); // returns a JWT token
        Task<bool> RegisterUserAsync(string email, string password); // returns true if successful
        Task<User> GetUserByEmailAsync(string email); 
        Task<bool> CheckPasswordAsync(User user, string password);
        //Task<UserDto> GetUserInfoAsync(int userId); // id from JWT token
    }
}
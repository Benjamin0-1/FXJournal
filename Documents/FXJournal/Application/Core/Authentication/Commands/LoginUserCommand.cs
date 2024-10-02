using MediatR;

namespace FXJournal.Application.Core.Authentication.Commands
{
    public class LoginUserCommand(string email, string password) : IRequest<string>
    {
        public string Email { get; set; } = email;
        public string Password { get; set; } = password;
    }
}
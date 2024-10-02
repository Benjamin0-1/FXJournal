using MediatR;
using System.Threading.Tasks;
using FXJournal.Application.Core.Authentication.Commands;
using FXJournal.Domain.Entities;
using Microsoft.AspNetCore.Authentication;
using FXJournal.Application.Abstractions.Authentication;
using FXJournal.Application.Abstractions.JWT;

namespace FXJournal.Application.Core.Authentication.CommandHandlers
{

public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, string>
{
    private readonly IAuthenticationRepository _authenicationRepository;
    private readonly IJWTRepository _jwtRepository;

    public LoginUserCommandHandler(IAuthenticationRepository authenicationRepository, IJWTRepository jwtRepository)
    {
        _authenicationRepository = authenicationRepository;
        _jwtRepository = jwtRepository;
    }

    public async Task<string> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _authenicationRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
        {
            return string.Empty; // or handle appropriately
        }

        if (await _authenicationRepository.CheckPasswordAsync(user, request.Password))
        {
            return _jwtRepository.GenerateToken(user); // generates token. this then gets back to the user on the controller.
        }

        return string.Empty; // or handle appropriately
    }
}

}
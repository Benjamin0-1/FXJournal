using FXJournal.Domain.Entities;

namespace FXJournal.Application.Abstractions.JWT
{
    public interface IJWTRepository
    {
        string GenerateToken(User user);
    }
}
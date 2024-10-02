using System;

namespace FXJournal.Domain.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }
        
        public required string JWT { get; set; }
    }
}
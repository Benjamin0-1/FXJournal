using System.ComponentModel.DataAnnotations;

namespace FXJournal.Domain.Entities
{
    public class User
    {
        public int Id { get; set ; }

        [Required]
        [MaxLength(50)]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Password { get; set; }

        // a user can have many journals
        public ICollection<Journal>? Journals { get; set; }

        // a user can have many roles
        public ICollection<Role>? Roles { get; set; }
    }
}
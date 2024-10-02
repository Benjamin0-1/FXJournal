using System.ComponentModel.DataAnnotations;

namespace FXJournal.Domain.Entities
{
    public class Role
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        // a role can have many users
        public ICollection<User>? Users { get; set; }
    }
}
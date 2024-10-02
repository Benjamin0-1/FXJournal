using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// a journal can have a name (the STRATEGY name)
// and then a description of the strategy
// and a user can have many journals

namespace FXJournal.Domain.Entities
{
    public class Journal
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public int UserId { get; set; }

        public required User User { get; set; }
    }
}
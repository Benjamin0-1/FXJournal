using System.ComponentModel.DataAnnotations;

namespace FXJournal.Domain.Entities
{
    public class Pair
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(50)]
        public required string BaseCurrency { get; set; }

        [Required]
        [MaxLength(50)]
        public required string QuoteCurrency { get; set; }

        // a pair can have many trades
        public ICollection<Trade>? Trades { get; set; }
    }
}
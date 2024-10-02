using System.ComponentModel.DataAnnotations;

namespace FXJournal.Domain.Entities
{
   public class Images
   {
        public int Id { get; set; }

        [Required]
        public required string ImageURL { get; set; }


        public int TradeId { get; set; }

        public required Trade Trade { get; set; }
   }
}

using System.ComponentModel.DataAnnotations;

namespace FXJournal.Domain.Entities
{
    public class Trade
    {
        public int Id { get; set; }

        public enum Result 
        {
            Win,
            Loss,
            Breakeven,
            BEWIN,
            BELOSS,
        }
        public string? BuySell { get; set; }
        public double? Amount { get; set; }
        public double? EntryPrice { get; set; }
        public double? ExitPrice { get; set; }
        public double? StopLoss { get; set; }
        public double? TakeProfit { get; set; }
        public string? EntryDate { get; set; }
        public string? ExitDate { get; set; }
        public string? Notes { get; set; }

        // a trade belongs to a pair
        public int PairId { get; set; } // in the route we can pass the pair name and then get the pair id
        public Pair? Pair { get; set; } // but in the front it will be a dropdown with the pair names

        // a trade can have many images
        public ICollection<Images>? Images { get; set; }

        // a trade belongs to a journal
        public int HistoryId { get; set; }
        public Journal? Journal { get; set; }
    }
}
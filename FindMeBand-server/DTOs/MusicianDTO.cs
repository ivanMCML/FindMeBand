namespace FindMeBand_server.DTOs
{
    public class CreateMusicianDTO
    {
        public string UserId { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Description { get; set; } = null!;
    }

    public class UpdateMusicianDTO
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Description { get; set; } = null!;
    }

    public class MusicianResponseDTO
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        // Performer podaci (null ako nije registriran kao performer)
        public int? PerformerId { get; set; }
        public double? AverageRating { get; set; }
        public int? NumberOfReviews { get; set; }

        public List<GenreSummaryDTO> Genres { get; set; } = new();
        public List<InstrumentSummaryDTO> Instruments { get; set; } = new();
        public List<BandMembershipDTO> Bands { get; set; } = new();
    }

    public class GenreSummaryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int? PlaysGenreId { get; set; }
    }

    public class InstrumentSummaryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
    }

    public class BandMembershipDTO
    {
        public int BandId { get; set; }
        public string BandName { get; set; } = null!;
        public string Role { get; set; } = null!;
        public DateTime JoinedDate { get; set; }
        public DateTime? LeftDate { get; set; }
    }
}

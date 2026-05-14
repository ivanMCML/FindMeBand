namespace FindMeBand_server.DTOs
{
    public class CreateBandDTO
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
    }

    public class UpdateBandDTO
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
    }

    public class BandResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        public int? PerformerId { get; set; }
        public double? AverageRating { get; set; }
        public int? NumberOfReviews { get; set; }

        public List<GenreSummaryDTO> Genres { get; set; } = new();
        public List<LocationSummaryDTO> Locations { get; set; } = new();
        public List<BandMemberResponseDTO> Members { get; set; } = new();
    }

    public class LocationSummaryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class BandMemberResponseDTO
    {
        public int Id { get; set; }
        public int BandId { get; set; }
        public string? BandName { get; set; }
        public int MusicianId { get; set; }
        public string MusicianFirstName { get; set; } = null!;
        public string MusicianLastName { get; set; } = null!;
        public string MusicianUserName { get; set; } = null!;
        public string Role { get; set; } = null!;
        public DateTime JoinedDate { get; set; }
        public DateTime? LeftDate { get; set; }
        public InstrumentSummaryDTO? Instrument { get; set; }
    }
}

using Microsoft.EntityFrameworkCore;
using FindMeBand_server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace FindMeBand_server.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Profile> Profiles { get; set; } = null!;
        public DbSet<Organizer> Organizers { get; set; } = null!;
        public DbSet<Performer> Performers { get; set; } = null!;
        public DbSet<Musician> Musicians { get; set; } = null!;
        public DbSet<Band> Bands { get; set; } = null!;

        public DbSet<Post> Posts { get; set; } = null!;
        public DbSet<PostMedia> PostsMedia { get; set; } = null!;

        public DbSet<BandMember> BandMember { get; set; } = null!;

        public DbSet<Genre> Genres { get; set; } = null!;
        public DbSet<PlaysGenre> PlaysGenre { get; set; } = null!;

        public DbSet<Instrument> Instruments { get; set; } = null!;
        public DbSet<PlaysInstrument> PlaysInstrument { get; set; } = null!;

        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<Location> Locations { get; set; } = null!;

        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<EventApplication> EventsApplications { get; set; } = null!;

        public DbSet<Opportunity> Opportunities { get; set; } = null!;
        public DbSet<OpportunityApplication> OpportunitiesApplications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- Profile -> User ---
            // NoAction: User (Identity) se briše zasebno, ne kaskadno
            modelBuilder.Entity<Profile>()
                .HasOne(p => p.User)
                .WithOne()
                .HasForeignKey<Profile>(p => p.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // --- Musician -> Performer (1-na-1) ---
            // NoAction: Performer se briše ručno prije Profile-a (zbog redosljeda)
            modelBuilder.Entity<Musician>()
                .HasOne(m => m.Performer)
                .WithOne(p => p.Musician)
                .HasForeignKey<Musician>(m => m.PerformerId)
                .OnDelete(DeleteBehavior.NoAction);

            // --- Band -> Performer (1-na-1) ---
            // NoAction: isto kao Musician, ručno upravljamo redosljedom brisanja
            modelBuilder.Entity<Band>()
                .HasOne(b => b.Performer)
                .WithOne(p => p.Band)
                .HasForeignKey<Band>(b => b.PerformerId)
                .OnDelete(DeleteBehavior.NoAction);

            // --- Post -> Profile ---
            // Cascade: postovi nemaju smisla bez profila
            modelBuilder.Entity<Post>()
                .HasOne(p => p.Profile)
                .WithMany(p => p.Posts)
                .HasForeignKey(p => p.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- PostMedia -> Post ---
            // Cascade: mediji nemaju smisla bez posta
            modelBuilder.Entity<PostMedia>()
                .HasOne(pm => pm.Post)
                .WithMany(p => p.Media)
                .HasForeignKey(pm => pm.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- BandMember -> Band ---
            // Cascade: članstvo nema smisla bez benda
            modelBuilder.Entity<BandMember>()
                .HasOne(bm => bm.Band)
                .WithMany(b => b.Members)
                .HasForeignKey(bm => bm.BandId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- BandMember -> Musician ---
            // Cascade: članstvo nema smisla bez glazbenika
            modelBuilder.Entity<BandMember>()
                .HasOne(bm => bm.Musician)
                .WithMany(m => m.BandMemberships)
                .HasForeignKey(bm => bm.MusicianId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- BandMember -> Instrument ---
            // SetNull: instrument se može obrisati, članstvo ostaje bez instrumenta
            modelBuilder.Entity<BandMember>()
                .HasOne(bm => bm.Instrument)
                .WithMany()
                .HasForeignKey(bm => bm.InstrumentId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<BandMember>()
                .HasIndex(bm => new { bm.BandId, bm.MusicianId })
                .IsUnique();

            // --- PlaysGenre -> Genre ---
            // Cascade: PlaysGenre bez žanra nema smisla
            modelBuilder.Entity<PlaysGenre>()
                .HasOne(pg => pg.Genre)
                .WithMany(g => g.Performers)
                .HasForeignKey(pg => pg.GenreId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- PlaysGenre -> Performer ---
            // Cascade: žanrovi performera nemaju smisla bez performera
            modelBuilder.Entity<PlaysGenre>()
                .HasOne(pg => pg.Performer)
                .WithMany(p => p.PlaysGenres)
                .HasForeignKey(pg => pg.PerformerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlaysGenre>()
                .HasIndex(pg => new { pg.GenreId, pg.PerformerId })
                .IsUnique();

            // --- PlaysInstrument -> Musician ---
            // Cascade: sviranje instrumenta nema smisla bez glazbenika
            modelBuilder.Entity<PlaysInstrument>()
                .HasOne(pi => pi.Musician)
                .WithMany(m => m.PlayedInstruments)
                .HasForeignKey(pi => pi.MusicianId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- PlaysInstrument -> Instrument ---
            // Cascade: zapis o sviranju nema smisla bez instrumenta
            modelBuilder.Entity<PlaysInstrument>()
                .HasOne(pi => pi.Instrument)
                .WithMany(i => i.PlayedBy)
                .HasForeignKey(pi => pi.InstrumentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlaysInstrument>()
                .HasIndex(pi => new { pi.MusicianId, pi.InstrumentId })
                .IsUnique();

            // --- Review -> Reviewer (Profile) ---
            // SetNull: recenzija ostaje anonimna ako se reviewer obriše
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany(p => p.GivenReviews)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.SetNull);

            // --- Review -> Performer ---
            // Cascade: recenzije performera brišu se s performerom
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Performer)
                .WithMany(p => p.ReceivedReviews)
                .HasForeignKey(r => r.PerformerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.ReviewerId, r.PerformerId })
                .IsUnique();

            // --- Location -> Performer ---
            // Cascade: lokacije performera brišu se s performerom
            modelBuilder.Entity<Location>()
                .HasOne(l => l.Performer)
                .WithMany(p => p.Locations)
                .HasForeignKey(l => l.PerformerId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- Opportunity -> Author (Performer) ---
            // Cascade: objave za traženje članova brišu se s performerom
            modelBuilder.Entity<Opportunity>()
                .HasOne(o => o.Author)
                .WithMany(p => p.AuthoredOpportunities)
                .HasForeignKey(o => o.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- Opportunity -> Instrument ---
            // SetNull: opportunity ostaje bez filtera ako se instrument obriše
            modelBuilder.Entity<Opportunity>()
                .HasOne(o => o.Instrument)
                .WithMany(i => i.Opportunities)
                .HasForeignKey(o => o.InstrumentId)
                .OnDelete(DeleteBehavior.SetNull);

            // --- Opportunity -> Genre ---
            // SetNull: opportunity ostaje bez filtera ako se žanr obriše
            modelBuilder.Entity<Opportunity>()
                .HasOne(o => o.Genre)
                .WithMany(g => g.Opportunities)
                .HasForeignKey(o => o.GenreId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Opportunity>()
                .HasIndex(o => new { o.AuthorId, o.InstrumentId, o.GenreId })
                .IsUnique();

            // --- OpportunityApplication -> Opportunity ---
            // Cascade: prijave se brišu s opportunityjem
            modelBuilder.Entity<OpportunityApplication>()
                .HasOne(oa => oa.Opportunity)
                .WithMany(o => o.Applications)
                .HasForeignKey(oa => oa.OpportunityId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- OpportunityApplication -> Applicant (Performer) ---
            // Cascade: prijave se brišu s performerom
            modelBuilder.Entity<OpportunityApplication>()
                .HasOne(oa => oa.Applicant)
                .WithMany(p => p.OpportunityApplications)
                .HasForeignKey(oa => oa.ApplicantId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OpportunityApplication>()
                .HasIndex(oa => new { oa.OpportunityId, oa.ApplicantId })
                .IsUnique();

            // --- Event -> Organizer ---
            // NoAction: eventi ostaju u bazi ako se organizer obriše (arhiva)
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Organizer)
                .WithMany(o => o.Events)
                .HasForeignKey(e => e.OrganizerId)
                .OnDelete(DeleteBehavior.NoAction);

            // --- Event -> Genre ---
            // SetNull: event ostaje bez žanra ako se žanr obriše
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Genre)
                .WithMany(g => g.Events)
                .HasForeignKey(e => e.GenreId)
                .OnDelete(DeleteBehavior.SetNull);

            // --- EventApplication -> Event ---
            // Cascade: prijave se brišu s eventom
            modelBuilder.Entity<EventApplication>()
                .HasOne(ea => ea.Event)
                .WithMany(e => e.Applications)
                .HasForeignKey(ea => ea.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- EventApplication -> Performer ---
            // Cascade: prijave se brišu s performerom
            modelBuilder.Entity<EventApplication>()
                .HasOne(ea => ea.Performer)
                .WithMany(p => p.EventApplications)
                .HasForeignKey(ea => ea.PerformerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EventApplication>()
                .HasIndex(ea => new { ea.EventId, ea.PerformerId })
                .IsUnique();
        }
    }
}
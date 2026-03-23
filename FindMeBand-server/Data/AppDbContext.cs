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
        public DbSet<Band> Bands { get; set; } = null!;
        public DbSet<Musician> Musicians { get; set;} = null!;

        public DbSet<Post> Posts { get; set; } = null!;
        public DbSet<PostMedia> PostsMedia { get; set; } = null!;

        public DbSet<BandMember> BandsMember { get; set; } = null!;

        public DbSet<Genre> Genres { get; set; } = null!;
        public DbSet<PlaysGenre> PlaysGenre { get; set;} = null!;

        public DbSet<Instrument> Instruments { get; set; } = null!;
        public DbSet<PlaysInstrument> PlaysInstrument { get; set; } = null!;

        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<Location> Locations { get; set; } = null!;

        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<EventApplication> EventsApplications { get; set; } = null!;

        public DbSet<Opportunity> Opportunities { get; set; } = null!;
        public DbSet<OpportunityApplication> OpportunitiesApplications { get; set; } = null!;

        // Tribat će dodat modele za dopisivanje i za one vježbe na gitari


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Profile>()
                .HasOne(p => p.User)
                .WithOne()
                .HasForeignKey<Profile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder .Entity<Post>()
                .HasOne(p =>p.Profile)
                .WithMany(p => p.Posts)
                .HasForeignKey(p => p.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostMedia>()
                .HasOne(pm => pm.Post)
                .WithMany(p => p.Media)
                .HasForeignKey(pm => pm.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BandMember>()
                .HasOne(bm => bm.Band)
                .WithMany(b => b.Members)
                .HasForeignKey(bm => bm.BandId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<BandMember>()
                .HasOne(bm => bm.Musician)
                .WithMany(m => m.BandMemberships)
                .HasForeignKey(bm => bm.MusicianId)
                .OnDelete(DeleteBehavior.NoAction);
             modelBuilder.Entity<BandMember>()
                .HasOne(bm => bm.Instrument)
                .WithMany()
                .HasForeignKey(bm => bm.InstrumentId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<BandMember>()
                .HasIndex(bm => new { bm.BandId, bm.MusicianId })
                .IsUnique();

            modelBuilder.Entity<PlaysGenre>()
                .HasOne(pg => pg.Genre)
                .WithMany(g => g.Performers)
                .HasForeignKey(pg => pg.GenreId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<PlaysGenre>()
                .HasOne(pg => pg.Performer)
                .WithMany(p => p.PlaysGenres)
                .HasForeignKey(pg => pg.PerformerId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<PlaysGenre>()
                .HasIndex(pg => new { pg.GenreId, pg.PerformerId })
                .IsUnique();
         
            modelBuilder.Entity<PlaysInstrument>()
                .HasOne(pi => pi.Musician)
                .WithMany(m=>m.PlayedInstruments)
                .HasForeignKey(pi => pi.MusicianId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<PlaysInstrument>()
                .HasOne(pi => pi.Instrument)
                .WithMany(i => i.PlayedBy)
                .HasForeignKey(pi => pi.InstrumentId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<PlaysInstrument>()
                .HasIndex(pi => new { pi.MusicianId, pi.InstrumentId })
                .IsUnique();

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany(p => p.GivenReviews)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Performer)
                .WithMany(p => p.ReceivedReviews)
                .HasForeignKey(r => r.PerformerId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.ReviewerId, r.PerformerId })
                .IsUnique();

            modelBuilder.Entity<Opportunity>()
                .HasOne(o => o.Author)
                .WithMany(p => p.AuthoredOpportunities)
                .HasForeignKey(o => o.AuthorId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Opportunity>()
                .HasOne(o => o.Instrument)
                .WithMany(i => i.Opportunities)
                .HasForeignKey(o => o.InstrumentId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Opportunity>()
                .HasOne(o => o.Genre)
                .WithMany(g => g.Opportunities)
                .HasForeignKey(o => o.GenreId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Opportunity>()
                .HasIndex(o => new { o.AuthorId, o.InstrumentId, o.GenreId })
                .IsUnique();

            modelBuilder.Entity<OpportunityApplication>()
                .HasOne(oa => oa.Opportunity)
                .WithMany(o => o.Applications)
                .HasForeignKey(oa => oa.OpportunityId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<OpportunityApplication>()
                .HasOne(oa => oa.Applicant)
                .WithMany(p => p.OpportunityApplications)
                .HasForeignKey(oa => oa.ApplicantId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<OpportunityApplication>()
                .HasIndex(oa => new { oa.OpportunityId, oa.ApplicantId })
                .IsUnique();

            modelBuilder.Entity<Event>()
                .HasOne(e => e.Organizer)
                .WithMany(o => o.Events)
                .HasForeignKey(e => e.OrganizerId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Genre)
                .WithMany(g => g.Events)
                .HasForeignKey(e => e.GenreId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<EventApplication>()
                .HasOne(ea => ea.Event)
                .WithMany(e => e.Applications)
                .HasForeignKey(ea => ea.EventId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<EventApplication>()
                .HasOne(ea => ea.Performer)
                .WithMany(p => p.EventApplications)
                .HasForeignKey(ea => ea.PerformerId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<EventApplication>()
                .HasIndex(ea => new { ea.EventId, ea.PerformerId })
                .IsUnique();
        }
    }
}

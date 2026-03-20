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

            // Model builder za BandMember

            // Model builder za PlaysGenre

            // Model builder za PlaysInstrument

            // Model builder za Review

            // Model builder za Opportunity

            // Model builder za OpportunityApplication

            // Model builder za Event

            // Model builder za EventApplication
        }
    }
}

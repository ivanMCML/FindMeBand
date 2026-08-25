using FindMeBand_server.Enums;
using FindMeBand_server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FindMeBand_server.Data
{
    /// <summary>
    /// Puni bazu demo podacima za prikaz aplikacije.
    /// Pokretanje:  dotnet run -- --seed          (dodaje podatke, preskače ako već postoje)
    ///              dotnet run -- --seed --reset  (prvo obriše demo podatke pa ih ponovno ubaci)
    /// Svi demo korisnici imaju lozinku Test123! i email na domeni @findmeband.hr.
    /// </summary>
    public static class DbSeeder
    {
        public const string SeedEmailDomain = "@findmeband.hr";
        public const string SeedPassword = "Test123!";

        private static readonly DateTime Now = DateTime.UtcNow;
        private static readonly Random Rnd = new Random(20260824);

        // ---------- pomoćni tipovi za definiciju podataka ----------
        private sealed record InstrumentSeed(string Name, InstrumentType Type);
        private sealed record Skill(string Name, int Level, int Years, bool Primary);
        private sealed record GenreSkill(string Name, int Level);
        private sealed record MusicianSeed(
            string UserName, string First, string Last, string City,
            string Description, Skill[] Instruments, GenreSkill[] Genres);
        private sealed record OrganizerSeed(string UserName, string First, string Last, string Description);
        private sealed record BandMemberSeed(string UserName, string Instrument, BandMemberRole Role);
        private sealed record BandSeed(
            string Name, string City, string Description,
            GenreSkill[] Genres, BandMemberSeed[] Members);
        private sealed record PostSeed(string Author, string? Band, int DaysAgo, string Content);

        // ---------- gradovi ----------
        private static readonly Dictionary<string, (string Address, double Lat, double Lng)> Cities = new()
        {
            ["Zagreb"] = ("Trg bana Josipa Jelačića 1, Zagreb", 45.8131, 15.9775),
            ["Split"] = ("Riva 12, Split", 43.5081, 16.4402),
            ["Rijeka"] = ("Korzo 20, Rijeka", 45.3271, 14.4422),
            ["Osijek"] = ("Trg Ante Starčevića 5, Osijek", 45.5550, 18.6955),
            ["Zadar"] = ("Široka ulica 3, Zadar", 44.1194, 15.2314),
            ["Varaždin"] = ("Trg kralja Tomislava 1, Varaždin", 46.3057, 16.3366),
            ["Pula"] = ("Forum 2, Pula", 44.8666, 13.8496),
            ["Dubrovnik"] = ("Stradun 8, Dubrovnik", 42.6407, 18.1077),
            ["Šibenik"] = ("Obala palih omladinaca 4, Šibenik", 43.7350, 15.8952),
            ["Karlovac"] = ("Trg bana Jelačića 2, Karlovac", 45.4870, 15.5478),
            ["Slavonski Brod"] = ("Trg Ivane Brlić-Mažuranić 1, Slavonski Brod", 45.1603, 18.0156),
            ["Vinkovci"] = ("Trg bana Šokčevića 6, Vinkovci", 45.2881, 18.8047),
            ["Čakovec"] = ("Trg Republike 3, Čakovec", 46.3844, 16.4339),
        };

        // ---------- žanrovi ----------
        private static readonly string[] GenreNames =
        {
            "Rock", "Pop", "Jazz", "Blues", "Metal", "Punk", "Funk", "Hip-hop",
            "Elektronika", "Klasična glazba", "Reggae", "Folk", "Soul", "Indie",
            "Zabavna glazba", "Tamburaška glazba"
        };

        // ---------- instrumenti ----------
        private static readonly InstrumentSeed[] InstrumentSeeds =
        {
            new("Klavir", InstrumentType.Keys),
            new("Klavijature", InstrumentType.Keys),
            new("Orgulje", InstrumentType.Keys),
            new("Harmonika", InstrumentType.Keys),
            new("Sintesajzer", InstrumentType.Keys),
            new("Akustična gitara", InstrumentType.Strings),
            new("Električna gitara", InstrumentType.Strings),
            new("Bas gitara", InstrumentType.Strings),
            new("Violina", InstrumentType.Strings),
            new("Violončelo", InstrumentType.Strings),
            new("Kontrabas", InstrumentType.Strings),
            new("Tambura", InstrumentType.Strings),
            new("Mandolina", InstrumentType.Strings),
            new("Bubnjevi", InstrumentType.Percussion),
            new("Udaraljke", InstrumentType.Percussion),
            new("Cajon", InstrumentType.Percussion),
            new("Saksofon", InstrumentType.Wind),
            new("Truba", InstrumentType.Wind),
            new("Trombon", InstrumentType.Wind),
            new("Flauta", InstrumentType.Wind),
            new("Klarinet", InstrumentType.Wind),
            new("Usna harmonika", InstrumentType.Wind),
            new("Vokal", InstrumentType.Other),
            new("DJ oprema", InstrumentType.Other),
        };

        // ---------- glazbenici ----------
        private static readonly MusicianSeed[] MusicianSeeds =
        {
            new("markoh", "Marko", "Horvat", "Zagreb",
                "Gitarist s 12 godina staža. Sviram rock i blues, najviše po zagrebačkim klubovima. Otvoren za studijski rad i gostovanja.",
                new[] { new Skill("Električna gitara", 5, 12, true), new Skill("Akustična gitara", 4, 10, false) },
                new[] { new GenreSkill("Rock", 5), new GenreSkill("Blues", 4) }),

            new("anakov", "Ana", "Kovačević", "Split",
                "Vokalistica. Pjevam od osnovne škole, najviše pop i soul. Imam vlastito ozvučenje za manje prostore.",
                new[] { new Skill("Vokal", 5, 9, true), new Skill("Klavir", 3, 5, false) },
                new[] { new GenreSkill("Pop", 5), new GenreSkill("Soul", 4) }),

            new("ivannovak", "Ivan", "Novak", "Rijeka",
                "Bubnjar. 14 godina iza kompleta, sviram sve od funka do hard rocka. Vlastiti kombi i oprema.",
                new[] { new Skill("Bubnjevi", 5, 14, true), new Skill("Udaraljke", 3, 6, false) },
                new[] { new GenreSkill("Rock", 5), new GenreSkill("Funk", 4) }),

            new("petraj", "Petra", "Jurić", "Zagreb",
                "Basistica. Volim groove i sve što se da odsvirati prstima. Redovito sviram na jam sessionima.",
                new[] { new Skill("Bas gitara", 4, 7, true), new Skill("Kontrabas", 3, 3, false) },
                new[] { new GenreSkill("Funk", 5), new GenreSkill("Jazz", 3) }),

            new("lukab", "Luka", "Babić", "Osijek",
                "Klavijaturist i producent. Radim aranžmane i snimam u vlastitom home studiju. Elektronika i moderni pop.",
                new[] { new Skill("Klavijature", 5, 11, true), new Skill("Sintesajzer", 4, 8, false) },
                new[] { new GenreSkill("Elektronika", 5), new GenreSkill("Pop", 4) }),

            new("majav", "Maja", "Vuković", "Zadar",
                "Violinistica, završila glazbenu akademiju. Sviram klasiku, ali me sve više vuku folk i crossover projekti.",
                new[] { new Skill("Violina", 5, 16, true) },
                new[] { new GenreSkill("Klasična glazba", 5), new GenreSkill("Folk", 3) }),

            new("tomom", "Tomislav", "Marić", "Zagreb",
                "Saksofonist. Jazz standardi, soul i sve što ima dobar bridge. Slobodan za nastupe vikendom.",
                new[] { new Skill("Saksofon", 5, 13, true), new Skill("Klarinet", 3, 6, false) },
                new[] { new GenreSkill("Jazz", 5), new GenreSkill("Soul", 4) }),

            new("sarap", "Sara", "Pavlović", "Split",
                "DJ i producentica. House i electro setovi, redovito sviram po splitskim klubovima i na ljetnim partyjima.",
                new[] { new Skill("DJ oprema", 5, 6, true), new Skill("Sintesajzer", 3, 4, false) },
                new[] { new GenreSkill("Elektronika", 5), new GenreSkill("Hip-hop", 4) }),

            new("filipk", "Filip", "Knežević", "Varaždin",
                "Metal gitarist. Sedmerožičana, drop tuning i puno riffova. Tražim ozbiljan bend za redovite probe.",
                new[] { new Skill("Električna gitara", 5, 9, true) },
                new[] { new GenreSkill("Metal", 5), new GenreSkill("Rock", 4) }),

            new("dorama", "Dora", "Matić", "Zagreb",
                "Violončelistica. Sviram u komornim sastavima, a povremeno i na indie snimanjima.",
                new[] { new Skill("Violončelo", 5, 15, true) },
                new[] { new GenreSkill("Klasična glazba", 5), new GenreSkill("Indie", 3) }),

            new("josipp", "Josip", "Perić", "Vinkovci",
                "Tamburaš od malih nogu. Svirke po Slavoniji, svadbe i folklorne večeri.",
                new[] { new Skill("Tambura", 5, 20, true), new Skill("Mandolina", 4, 12, false) },
                new[] { new GenreSkill("Tamburaška glazba", 5), new GenreSkill("Folk", 4) }),

            new("ninab", "Nina", "Brkić", "Rijeka",
                "Jazz vokalistica. Standardi, bossa nova i malo bluesa. Radim i kao prateći vokal na snimanjima.",
                new[] { new Skill("Vokal", 5, 8, true) },
                new[] { new GenreSkill("Jazz", 5), new GenreSkill("Blues", 4) }),

            new("matejk", "Matej", "Kovač", "Osijek",
                "Trubač. Sviram u puhačkoj sekciji, funk i jazz. Dostupan za snimanja i gostovanja.",
                new[] { new Skill("Truba", 4, 7, true), new Skill("Trombon", 3, 4, false) },
                new[] { new GenreSkill("Jazz", 4), new GenreSkill("Funk", 4) }),

            new("leag", "Lea", "Grgić", "Slavonski Brod",
                "Harmonikašica. Zabavna glazba, svadbe i proslave. Imam repertoar od 200+ pjesama.",
                new[] { new Skill("Harmonika", 5, 10, true) },
                new[] { new GenreSkill("Zabavna glazba", 5), new GenreSkill("Folk", 4) }),

            new("karlob", "Karlo", "Blažević", "Pula",
                "Bas i vokal u punk bendu. Brzo, glasno i kratko. Tražimo svirke po Istri.",
                new[] { new Skill("Bas gitara", 4, 6, true), new Skill("Vokal", 3, 6, false) },
                new[] { new GenreSkill("Punk", 5), new GenreSkill("Rock", 4) }),

            new("ivak", "Iva", "Klarić", "Dubrovnik",
                "Flautistica. Klasika i komorna glazba, sviram na koncertima u staroj gradskoj jezgri.",
                new[] { new Skill("Flauta", 5, 12, true) },
                new[] { new GenreSkill("Klasična glazba", 5), new GenreSkill("Folk", 3) }),

            new("davidr", "David", "Rukavina", "Zagreb",
                "Reper i tekstopisac. Radim vlastite bitove, tražim live bend za koncertnu postavu.",
                new[] { new Skill("Vokal", 4, 5, true), new Skill("DJ oprema", 3, 3, false) },
                new[] { new GenreSkill("Hip-hop", 5), new GenreSkill("Soul", 3) }),

            new("lucijas", "Lucija", "Sever", "Šibenik",
                "Pijanistica s 18 godina iskustva. Predajem klavir, sviram klasiku i jazz.",
                new[] { new Skill("Klavir", 5, 18, true), new Skill("Orgulje", 3, 7, false) },
                new[] { new GenreSkill("Klasična glazba", 5), new GenreSkill("Jazz", 4) }),

            new("brunok", "Bruno", "Katić", "Zagreb",
                "Bubnjar sklon jazzu i bluesu. Sviram i cajon za akustične postave.",
                new[] { new Skill("Bubnjevi", 4, 8, true), new Skill("Cajon", 3, 5, false) },
                new[] { new GenreSkill("Jazz", 4), new GenreSkill("Blues", 3) }),

            new("emal", "Ema", "Lovrić", "Karlovac",
                "Pišem i pjevam vlastite pjesme uz akustičnu gitaru. Indie i pop, tražim ekipu za bend.",
                new[] { new Skill("Akustična gitara", 4, 6, true), new Skill("Vokal", 4, 6, false) },
                new[] { new GenreSkill("Indie", 5), new GenreSkill("Pop", 4) }),

            new("robertv", "Robert", "Vidović", "Čakovec",
                "Gitarist i aranžer. Radim s coverbendovima, imam iskustva s velikim proslavama.",
                new[] { new Skill("Električna gitara", 4, 15, true), new Skill("Usna harmonika", 3, 9, false) },
                new[] { new GenreSkill("Zabavna glazba", 4), new GenreSkill("Blues", 4) }),

            new("tinam", "Tina", "Marković", "Zagreb",
                "Vokalistica i zborovođa. Vodim vokalnu radionicu, sviram i klavijature u pratećem sastavu.",
                new[] { new Skill("Vokal", 5, 11, true), new Skill("Klavijature", 3, 6, false) },
                new[] { new GenreSkill("Soul", 5), new GenreSkill("Pop", 4) }),
        };

        // ---------- organizatori ----------
        private static readonly OrganizerSeed[] OrganizerSeeds =
        {
            new("tvornicalive", "Damir", "Šimić",
                "Voditelj programa kluba Tvornica Live u Zagrebu. Bookiramo domaće bendove svaki tjedan."),
            new("kvarnerfest", "Ivana", "Barić",
                "Organizacija ljetnih festivala na Kvarneru. Tražimo izvođače za pozornice u Rijeci i Opatiji."),
            new("splitlive", "Ante", "Radić",
                "Live glazba petkom i subotom u caffe baru u centru Splita. Akustične postave i manji sastavi."),
            new("osijekevents", "Kristina", "Tot",
                "Event agencija iz Osijeka. Korporativni eventi, gradske manifestacije i klupski program."),
            new("zadarsummer", "Nikola", "Bilić",
                "Zadar Summer Nights - ljetna koncertna sezona na otvorenom."),
            new("proslaveplus", "Martina", "Krajačić",
                "Organiziramo vjenčanja i privatne proslave po cijeloj Hrvatskoj. Trebamo pouzdane sastave."),
        };

        // ---------- bendovi ----------
        private static readonly BandSeed[] BandSeeds =
        {
            new("Sjeverni Vjetar", "Zagreb",
                "Rock bend iz Zagreba, osnovan 2019. Dvije EP-ice i pedesetak odsviranih koncerata po Hrvatskoj.",
                new[] { new GenreSkill("Rock", 5), new GenreSkill("Blues", 4) },
                new[]
                {
                    new BandMemberSeed("markoh", "Električna gitara", BandMemberRole.Admin),
                    new BandMemberSeed("petraj", "Bas gitara", BandMemberRole.Member),
                    new BandMemberSeed("ivannovak", "Bubnjevi", BandMemberRole.Member),
                    new BandMemberSeed("anakov", "Vokal", BandMemberRole.Member),
                }),

            new("Modri Val", "Osijek",
                "Pop-elektro trio iz Osijeka. Vlastite pjesme, puno sintesajzera i live puhača.",
                new[] { new GenreSkill("Pop", 5), new GenreSkill("Elektronika", 4) },
                new[]
                {
                    new BandMemberSeed("lukab", "Klavijature", BandMemberRole.Admin),
                    new BandMemberSeed("emal", "Vokal", BandMemberRole.Member),
                    new BandMemberSeed("matejk", "Truba", BandMemberRole.Member),
                }),

            new("Kvintet Bez Imena", "Zagreb",
                "Jazz kvintet. Standardi, bossa nova i vlastiti aranžmani. Sviramo po klubovima i na privatnim eventima.",
                new[] { new GenreSkill("Jazz", 5), new GenreSkill("Soul", 3) },
                new[]
                {
                    new BandMemberSeed("tomom", "Saksofon", BandMemberRole.Admin),
                    new BandMemberSeed("brunok", "Bubnjevi", BandMemberRole.Member),
                    new BandMemberSeed("lucijas", "Klavir", BandMemberRole.Member),
                    new BandMemberSeed("ninab", "Vokal", BandMemberRole.Member),
                    new BandMemberSeed("petraj", "Kontrabas", BandMemberRole.Member),
                }),

            new("Čelični Kotač", "Varaždin",
                "Heavy metal iz Varaždina. Brzi riffovi, dupli bas bubanj i puno decibela.",
                new[] { new GenreSkill("Metal", 5), new GenreSkill("Rock", 4) },
                new[]
                {
                    new BandMemberSeed("filipk", "Električna gitara", BandMemberRole.Admin),
                    new BandMemberSeed("karlob", "Bas gitara", BandMemberRole.Member),
                    new BandMemberSeed("ivannovak", "Bubnjevi", BandMemberRole.Member),
                }),

            new("Tamburaški sastav Slavonija", "Vinkovci",
                "Tradicionalni tamburaški sastav. Svadbe, folklorne večeri i gradske manifestacije po Slavoniji.",
                new[] { new GenreSkill("Tamburaška glazba", 5), new GenreSkill("Folk", 4) },
                new[]
                {
                    new BandMemberSeed("josipp", "Tambura", BandMemberRole.Admin),
                    new BandMemberSeed("leag", "Harmonika", BandMemberRole.Member),
                    new BandMemberSeed("majav", "Violina", BandMemberRole.Member),
                }),

            new("Ansambl Adriatica", "Dubrovnik",
                "Komorni ansambl iz Dubrovnika. Klasični repertoar za koncerte, vjenčanja i protokolarne događaje.",
                new[] { new GenreSkill("Klasična glazba", 5) },
                new[]
                {
                    new BandMemberSeed("ivak", "Flauta", BandMemberRole.Admin),
                    new BandMemberSeed("dorama", "Violončelo", BandMemberRole.Member),
                    new BandMemberSeed("lucijas", "Klavir", BandMemberRole.Member),
                }),

            new("Beton Blok", "Zagreb",
                "Hip-hop projekt iz Novog Zagreba. Live nastupi s DJ-em i gostujućim vokalima.",
                new[] { new GenreSkill("Hip-hop", 5), new GenreSkill("Elektronika", 3) },
                new[]
                {
                    new BandMemberSeed("davidr", "Vokal", BandMemberRole.Admin),
                    new BandMemberSeed("sarap", "DJ oprema", BandMemberRole.Member),
                }),

            new("Kotlovina Band", "Čakovec",
                "Coverbend za proslave. Od Bijelog dugmeta do Bruna Marsa - sve što tjera ljude na ples.",
                new[] { new GenreSkill("Zabavna glazba", 5), new GenreSkill("Pop", 4) },
                new[]
                {
                    new BandMemberSeed("robertv", "Električna gitara", BandMemberRole.Admin),
                    new BandMemberSeed("tinam", "Vokal", BandMemberRole.Member),
                    new BandMemberSeed("brunok", "Bubnjevi", BandMemberRole.Member),
                }),
        };

        // ---------- objave ----------
        private static readonly PostSeed[] PostSeeds =
        {
            new("markoh", "Sjeverni Vjetar", 2, "Sinoć u Tvornici - rasprodano! Hvala svima koji ste došli, bilo je ludo. Fotke stižu uskoro."),
            new("markoh", null, 9, "Nabavio sam novo pojačalo i još uvijek se smiješim. Tko želi doći na jam u probni prostor na Trešnjevci?"),
            new("anakov", "Sjeverni Vjetar", 4, "Snimamo novi singl ovaj vikend u studiju u Splitu. Prvi put pjevam na hrvatskom, malo me strah."),
            new("anakov", null, 14, "Tražim pijanista za akustični duo za svirke po Dalmaciji tijekom ljeta. Javite se u poruke."),
            new("ivannovak", null, 1, "Tri svirke u tri dana, ruke otpale. Ali vrijedilo je - Rijeka, Pula, Zadar."),
            new("petraj", null, 6, "Jam session u Vintage Industrialu svaki utorak. Dođite, ima mjesta za sve instrumente."),
            new("lukab", "Modri Val", 3, "Novi demo je gotov. Sedam mjeseci rada, konačno zvuči kako sam zamislio."),
            new("lukab", null, 11, "Mali savjet: ako snimate vokale doma, ne štedite na akustičnoj obradi sobe. Mikrofon je zadnja stvar koja vam treba."),
            new("majav", null, 5, "Održali smo koncert u crkvi sv. Donata. Akustika je nevjerojatna, zvuk violine se vraća tri sekunde."),
            new("tomom", "Kvintet Bez Imena", 7, "Petak, 21h, jazz klub. Sviramo Coltranea i par vlastitih stvari. Ulaz slobodan."),
            new("tomom", null, 20, "Nakon 13 godina sviranja saksofona shvatio sam da još uvijek ne znam disati kako treba."),
            new("sarap", null, 2, "Set s prošlog vikenda je gore online. 90 minuta deep housea za one koji su propustili."),
            new("filipk", "Čelični Kotač", 8, "Snimili smo spot za novi singl u napuštenoj tvornici kod Varaždina. Izgleda brutalno."),
            new("filipk", null, 16, "Tražim bubnjara koji može odsvirati 180 bpm bez da mu ispadnu palice. Ozbiljno."),
            new("dorama", null, 10, "Komorni koncert u HNK sljedeći tjedan. Schubert, Brahms i jedan iznenađujući aranžman."),
            new("josipp", "Tamburaški sastav Slavonija", 12, "Vinkovačke jeseni su iza nas. Šest nastupa, tisuće ljudi i nijedna puknuta žica."),
            new("ninab", "Kvintet Bez Imena", 5, "Sinoć smo prvi put odsvirali Blue in Green s novim aranžmanom. Publika je bila tiha do zadnje note."),
            new("matejk", null, 18, "Puhačka sekcija traži trombonista za projekt u Osijeku. Probe subotom."),
            new("leag", null, 13, "Sezona svadbi je službeno počela. Vidimo se po Slavoniji!"),
            new("karlob", null, 4, "Punk večer u Rojcu u subotu. Tri benda, ulaz 5 eura, sav prihod ide za opremu."),
            new("ivak", "Ansambl Adriatica", 15, "Ljetni festival u Dubrovniku - sviramo na Lovrjencu 12. kolovoza. Karte su već u prodaji."),
            new("davidr", "Beton Blok", 3, "Novi track je vani. Snimljen u podrumu, miksan u dnevnom boravku, a zvuči bolje od pola stvari na radiju."),
            new("davidr", null, 21, "Tražim live bend za koncertnu postavu - bubnjevi, bas, klavijature. Materijal je gotov, treba nam samo zvuk."),
            new("lucijas", null, 6, "Održala sam prvi solo recital nakon pauze od dvije godine. Ruke su drhtale, ali prošlo je."),
            new("brunok", null, 9, "Kupio sam stari komplet bubnjeva iz 70-ih. Zvuči kao da je snimljen na ploču."),
            new("emal", "Modri Val", 7, "Napisala sam pjesmu u jednom danu, a onda je mijenjala mjesec dana. Klasika."),
            new("emal", null, 17, "Otvorene su prijave za natjecanje mladih kantautora. Prijavila sam se, vidjet ćemo."),
            new("robertv", "Kotlovina Band", 1, "Sinoć 250 ljudi na proslavi u Međimurju i bis u tri ujutro. Ovo je razlog zašto ovo radim."),
            new("tinam", null, 8, "Vokalna radionica u nedjelju - još ima tri slobodna mjesta. Za sve razine."),
            new("tvornicalive", null, 5, "Objavili smo jesenski program. Deset koncerata, osam domaćih bendova. Prijave za predgrupe su otvorene."),
            new("kvarnerfest", null, 4, "Tražimo izvođače za pozornicu na rivi u kolovozu. Rock, pop i jazz sastavi - javite se preko oglasa."),
            new("proslaveplus", null, 10, "Imamo pet vjenčanja u rujnu bez potvrđenog benda. Ako ste slobodni, pišite nam."),
        };

        private static readonly string[] CommentTexts =
        {
            "Svaka čast, zvuči odlično!",
            "Kad je sljedeći nastup?",
            "Bili ste sjajni zadnji put, dolazim opet.",
            "Ovo je vrhunski, bravo!",
            "Javi se u poruke, imam prijedlog za suradnju.",
            "Konačno netko tko zna što radi.",
            "Jedva čekam čuti cijeli materijal.",
            "Tko vam je snimao? Zvuk je odličan.",
            "Vidimo se na svirci!",
            "Ovo mora ići na radio.",
            "Prijavljujem se za probu, ako još treba.",
            "Odlična ekipa, samo tako nastavite.",
        };

        // =====================================================================
        public static async Task SeedAsync(IServiceProvider sp, bool reset)
        {
            var db = sp.GetRequiredService<AppDbContext>();
            var userManager = sp.GetRequiredService<UserManager<User>>();

            if (reset)
            {
                Console.WriteLine("Brišem postojeće demo podatke...");
                await ResetAsync(db, userManager);
            }

            if (await db.Users.AnyAsync(u => u.Email!.EndsWith(SeedEmailDomain)))
            {
                Console.WriteLine("Demo podaci već postoje. Pokreni s --seed --reset ako ih želiš ponovno generirati.");
                return;
            }

            Console.WriteLine("Punim bazu demo podacima...");

            var genres = await SeedGenresAsync(db);
            var instruments = await SeedInstrumentsAsync(db);
            var (musicians, organizers) = await SeedProfilesAsync(db, userManager);
            await SeedMusicianDetailsAsync(db, musicians, instruments, genres);
            var bands = await SeedBandsAsync(db, musicians, instruments, genres);
            var posts = await SeedPostsAsync(db, musicians, organizers, bands);
            await SeedEngagementAsync(db, musicians, organizers, posts);
            await SeedFollowsAsync(db, musicians, organizers, bands);
            var events = await SeedEventsAsync(db, organizers, genres);
            await SeedEventApplicationsAsync(db, events, musicians, bands);
            await SeedOpportunitiesAsync(db, musicians, bands, instruments, genres);
            await SeedReviewsAsync(db, musicians, organizers, bands);
            await SeedConversationsAsync(db, musicians, organizers);
            await SeedNotificationsAsync(db, musicians, organizers, bands, events);
            await IncludeExistingUsersAsync(db, musicians);

            await PrintSummaryAsync(db);
        }

        // ---------------------------------------------------------------------
        private static async Task<Dictionary<string, Genre>> SeedGenresAsync(AppDbContext db)
        {
            var existing = await db.Genres.ToDictionaryAsync(g => g.Name);
            foreach (var name in GenreNames)
            {
                if (existing.ContainsKey(name)) continue;
                var genre = new Genre { Name = name };
                db.Genres.Add(genre);
                existing[name] = genre;
            }
            await db.SaveChangesAsync();
            return existing;
        }

        private static async Task<Dictionary<string, Instrument>> SeedInstrumentsAsync(AppDbContext db)
        {
            var existing = await db.Instruments.ToDictionaryAsync(i => i.Name);
            foreach (var seed in InstrumentSeeds)
            {
                if (existing.ContainsKey(seed.Name)) continue;
                var instrument = new Instrument { Name = seed.Name, Type = seed.Type };
                db.Instruments.Add(instrument);
                existing[seed.Name] = instrument;
            }
            await db.SaveChangesAsync();
            return existing;
        }

        private static async Task<(Dictionary<string, Musician>, Dictionary<string, Organizer>)> SeedProfilesAsync(
            AppDbContext db, UserManager<User> userManager)
        {
            var musicians = new Dictionary<string, Musician>();
            var organizers = new Dictionary<string, Organizer>();
            var createdAt = Now.AddDays(-240);

            foreach (var seed in MusicianSeeds)
            {
                var user = await CreateUserAsync(userManager, seed.UserName);
                var performer = new Performer();
                db.Performers.Add(performer);
                await db.SaveChangesAsync();

                var musician = new Musician
                {
                    UserId = user.Id,
                    FirstName = seed.First,
                    LastName = seed.Last,
                    UserName = seed.UserName,
                    Description = seed.Description,
                    CreatedAt = createdAt,
                    PerformerId = performer.Id
                };
                db.Profiles.Add(musician);
                musicians[seed.UserName] = musician;
                createdAt = createdAt.AddDays(Rnd.Next(2, 8));
            }

            foreach (var seed in OrganizerSeeds)
            {
                var user = await CreateUserAsync(userManager, seed.UserName);
                var organizer = new Organizer
                {
                    UserId = user.Id,
                    FirstName = seed.First,
                    LastName = seed.Last,
                    UserName = seed.UserName,
                    Description = seed.Description,
                    CreatedAt = createdAt
                };
                db.Profiles.Add(organizer);
                organizers[seed.UserName] = organizer;
                createdAt = createdAt.AddDays(Rnd.Next(2, 8));
            }

            await db.SaveChangesAsync();
            return (musicians, organizers);
        }

        private static async Task<User> CreateUserAsync(UserManager<User> userManager, string userName)
        {
            var email = userName + SeedEmailDomain;
            var user = new User { UserName = email, Email = email, EmailConfirmed = true };
            var result = await userManager.CreateAsync(user, SeedPassword);
            if (!result.Succeeded)
                throw new Exception($"Neuspjelo kreiranje korisnika {email}: " +
                                    string.Join(", ", result.Errors.Select(e => e.Description)));
            return user;
        }

        private static async Task SeedMusicianDetailsAsync(
            AppDbContext db,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Instrument> instruments,
            Dictionary<string, Genre> genres)
        {
            foreach (var seed in MusicianSeeds)
            {
                var musician = musicians[seed.UserName];
                var performerId = musician.PerformerId!.Value;
                var city = Cities[seed.City];

                db.Locations.Add(new Location
                {
                    PerformerId = performerId,
                    Name = seed.City,
                    Address = city.Address,
                    Latitude = city.Lat,
                    Longitude = city.Lng
                });

                foreach (var skill in seed.Instruments)
                {
                    db.PlaysInstrument.Add(new PlaysInstrument
                    {
                        MusicianId = musician.Id,
                        InstrumentId = instruments[skill.Name].Id,
                        SkillLevel = skill.Level,
                        YearsOfExperience = skill.Years,
                        IsPrimary = skill.Primary
                    });
                }

                foreach (var genreSkill in seed.Genres)
                {
                    db.PlaysGenre.Add(new PlaysGenre
                    {
                        PerformerId = performerId,
                        GenreId = genres[genreSkill.Name].Id,
                        SkillLevel = genreSkill.Level
                    });
                }
            }
            await db.SaveChangesAsync();
        }

        private static async Task<Dictionary<string, Band>> SeedBandsAsync(
            AppDbContext db,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Instrument> instruments,
            Dictionary<string, Genre> genres)
        {
            var bands = new Dictionary<string, Band>();

            foreach (var seed in BandSeeds)
            {
                var performer = new Performer();
                db.Performers.Add(performer);
                await db.SaveChangesAsync();

                var band = new Band
                {
                    Name = seed.Name,
                    Description = seed.Description,
                    PerformerId = performer.Id,
                    CreatedAt = Now.AddDays(-Rnd.Next(200, 900))
                };
                db.Bands.Add(band);
                await db.SaveChangesAsync();

                var city = Cities[seed.City];
                db.Locations.Add(new Location
                {
                    PerformerId = performer.Id,
                    Name = seed.City,
                    Address = city.Address,
                    Latitude = city.Lat,
                    Longitude = city.Lng
                });

                foreach (var genreSkill in seed.Genres)
                {
                    db.PlaysGenre.Add(new PlaysGenre
                    {
                        PerformerId = performer.Id,
                        GenreId = genres[genreSkill.Name].Id,
                        SkillLevel = genreSkill.Level
                    });
                }

                foreach (var member in seed.Members)
                {
                    db.BandMember.Add(new BandMember
                    {
                        BandId = band.Id,
                        MusicianId = musicians[member.UserName].Id,
                        InstrumentId = instruments[member.Instrument].Id,
                        Role = member.Role,
                        JoinedDate = band.CreatedAt.AddDays(Rnd.Next(0, 60))
                    });
                }

                bands[seed.Name] = band;
                await db.SaveChangesAsync();
            }

            return bands;
        }

        private static async Task<List<Post>> SeedPostsAsync(
            AppDbContext db,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Organizer> organizers,
            Dictionary<string, Band> bands)
        {
            var posts = new List<Post>();
            foreach (var seed in PostSeeds)
            {
                var author = FindProfile(musicians, organizers, seed.Author);
                var post = new Post
                {
                    ProfileId = author.Id,
                    BandId = seed.Band is null ? null : bands[seed.Band].Id,
                    Content = seed.Content,
                    CreatedAt = Now.AddDays(-seed.DaysAgo).AddHours(-Rnd.Next(0, 20))
                };
                db.Posts.Add(post);
                posts.Add(post);
            }
            await db.SaveChangesAsync();
            return posts;
        }

        private static async Task SeedEngagementAsync(
            AppDbContext db,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Organizer> organizers,
            List<Post> posts)
        {
            var allProfiles = musicians.Values.Cast<Profile>().Concat(organizers.Values).ToList();

            foreach (var post in posts)
            {
                var likers = allProfiles
                    .Where(p => p.Id != post.ProfileId)
                    .OrderBy(_ => Rnd.Next())
                    .Take(Rnd.Next(2, 14));

                foreach (var liker in likers)
                {
                    db.PostLikes.Add(new PostLike
                    {
                        PostId = post.Id,
                        ProfileId = liker.Id,
                        LikedAt = post.CreatedAt.AddHours(Rnd.Next(1, 48))
                    });
                }

                var commenters = allProfiles
                    .Where(p => p.Id != post.ProfileId)
                    .OrderBy(_ => Rnd.Next())
                    .Take(Rnd.Next(0, 4));

                foreach (var commenter in commenters)
                {
                    db.PostComments.Add(new PostComment
                    {
                        PostId = post.Id,
                        ProfileId = commenter.Id,
                        Content = CommentTexts[Rnd.Next(CommentTexts.Length)],
                        CreatedAt = post.CreatedAt.AddHours(Rnd.Next(1, 60))
                    });
                }
            }
            await db.SaveChangesAsync();
        }

        private static async Task SeedFollowsAsync(
            AppDbContext db,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Organizer> organizers,
            Dictionary<string, Band> bands)
        {
            var allProfiles = musicians.Values.Cast<Profile>().Concat(organizers.Values).ToList();
            var bandList = bands.Values.ToList();
            var seen = new HashSet<(int, int, bool)>();

            foreach (var follower in allProfiles)
            {
                var followedProfiles = allProfiles
                    .Where(p => p.Id != follower.Id)
                    .OrderBy(_ => Rnd.Next())
                    .Take(Rnd.Next(4, 12));

                foreach (var followee in followedProfiles)
                {
                    if (!seen.Add((follower.Id, followee.Id, false))) continue;
                    db.Follows.Add(new Follow
                    {
                        FollowerId = follower.Id,
                        FolloweeProfileId = followee.Id,
                        FollowedAt = Now.AddDays(-Rnd.Next(1, 180))
                    });
                }

                var followedBands = bandList.OrderBy(_ => Rnd.Next()).Take(Rnd.Next(1, 5));
                foreach (var band in followedBands)
                {
                    if (!seen.Add((follower.Id, band.Id, true))) continue;
                    db.Follows.Add(new Follow
                    {
                        FollowerId = follower.Id,
                        FolloweeBandId = band.Id,
                        FollowedAt = Now.AddDays(-Rnd.Next(1, 180))
                    });
                }
            }
            await db.SaveChangesAsync();
        }

        private static async Task<List<Event>> SeedEventsAsync(
            AppDbContext db,
            Dictionary<string, Organizer> organizers,
            Dictionary<string, Genre> genres)
        {
            var seeds = new (string Organizer, string Title, string Description, string Genre, string City,
                int DaysFromNow, decimal Min, decimal Max, int Performers,
                PerformerType? Type, int? MinReviews, EventStatus Status)[]
            {
                ("tvornicalive", "Rock večer u Tvornici",
                    "Tražimo tri benda za jesensku rock večer. Backline i ozvučenje osigurani, honorar plus dio od ulaznica.",
                    "Rock", "Zagreb", 21, 400m, 900m, 3, PerformerType.Band, 3, EventStatus.Open),

                ("tvornicalive", "Predgrupa za veliki koncert",
                    "Tražimo predgrupu za koncert stranog izvođača u studenom. Set od 30 minuta.",
                    "Indie", "Zagreb", 68, 300m, 600m, 1, PerformerType.Band, 2, EventStatus.Open),

                ("kvarnerfest", "Ljeto na rivi - glavna pozornica",
                    "Festivalska pozornica na riječkoj rivi. Tražimo izvođače za tri večeri, svaka večer po dva sastava.",
                    "Pop", "Rijeka", 35, 800m, 1500m, 6, PerformerType.Band, 4, EventStatus.Open),

                ("kvarnerfest", "Jazz u parku",
                    "Nedjeljni popodnevni program u parku. Manji sastavi, akustična postava.",
                    "Jazz", "Rijeka", 14, 250m, 500m, 2, null, null, EventStatus.Open),

                ("splitlive", "Akustični petak",
                    "Akustični nastup u caffe baru na Rivi, dva seta po 45 minuta. Vlastito ozvučenje poželjno.",
                    "Blues", "Split", 9, 150m, 300m, 1, PerformerType.Musician, null, EventStatus.Open),

                ("splitlive", "DJ set - subotnja večer",
                    "Tražimo DJ-a za subotnje večeri kroz kolovoz i rujan. House i disco.",
                    "Elektronika", "Split", 5, 200m, 400m, 1, PerformerType.Musician, 2, EventStatus.Open),

                ("osijekevents", "Osječko ljeto na Tvrđi",
                    "Gradska manifestacija na Tvrđi. Tražimo tamburaške i folk sastave za tri dana programa.",
                    "Tamburaška glazba", "Osijek", 28, 500m, 1000m, 4, PerformerType.Band, null, EventStatus.Open),

                ("osijekevents", "Korporativni božićni domjenak",
                    "Coverbend za korporativni domjenak, 150 gostiju. Repertoar zabavne glazbe i evergreeni.",
                    "Zabavna glazba", "Osijek", 110, 900m, 1400m, 1, PerformerType.Band, 3, EventStatus.Open),

                ("zadarsummer", "Koncert na Forumu",
                    "Klasični i crossover program na otvorenom, uz zalazak sunca. Komorni sastavi i solisti.",
                    "Klasična glazba", "Zadar", 18, 600m, 1100m, 2, null, 3, EventStatus.Open),

                ("zadarsummer", "Zadar Summer Nights - finale",
                    "Završna večer ljetne sezone. Veliki sastavi, puna pozornica, produkcija osigurana.",
                    "Rock", "Zadar", 45, 1200m, 2000m, 2, PerformerType.Band, 4, EventStatus.Open),

                ("proslaveplus", "Vjenčanje - Vinkovci",
                    "Svadbena svirka za 120 uzvanika. Tamburaši prvi dio večeri, zabavni program kasnije.",
                    "Zabavna glazba", "Vinkovci", 24, 700m, 1200m, 1, PerformerType.Band, 3, EventStatus.Open),

                ("proslaveplus", "Vjenčanje - Dubrovnik, obred",
                    "Glazba za obred u crkvi i koktel nakon. Komorni sastav ili solist s pratnjom.",
                    "Klasična glazba", "Dubrovnik", 40, 400m, 800m, 1, null, null, EventStatus.Open),

                ("tvornicalive", "Metal noć",
                    "Održano u lipnju - tri benda, rasprodano.",
                    "Metal", "Zagreb", -55, 400m, 800m, 3, PerformerType.Band, null, EventStatus.Closed),

                ("splitlive", "Hip-hop večer",
                    "Odrađeno u srpnju, live bend uz repera.",
                    "Hip-hop", "Split", -30, 300m, 600m, 1, null, null, EventStatus.Closed),

                ("osijekevents", "Proljetni festival - otkazano",
                    "Manifestacija je otkazana zbog lošeg vremena.",
                    "Folk", "Osijek", -80, 300m, 700m, 2, null, null, EventStatus.Canceled),
            };

            var events = new List<Event>();
            foreach (var s in seeds)
            {
                var city = Cities[s.City];
                var evt = new Event
                {
                    OrganizerId = organizers[s.Organizer].Id,
                    Title = s.Title,
                    Description = s.Description,
                    GenreId = genres[s.Genre].Id,
                    Location = s.City,
                    Latitude = city.Lat,
                    Longitude = city.Lng,
                    BudgetMin = s.Min,
                    BudgetMax = s.Max,
                    RequiredPerformers = s.Performers,
                    PreferredPerformerType = s.Type,
                    MinReviewRequired = s.MinReviews,
                    Status = s.Status,
                    ScheduledAt = Now.AddDays(s.DaysFromNow),
                    CreatedAt = Now.AddDays(s.DaysFromNow - Rnd.Next(30, 70))
                };
                db.Events.Add(evt);
                events.Add(evt);
            }
            await db.SaveChangesAsync();
            return events;
        }

        private static async Task SeedEventApplicationsAsync(
            AppDbContext db,
            List<Event> events,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Band> bands)
        {
            var messages = new[]
            {
                "Pozdrav, zainteresirani smo za nastup. Imamo set od 60 minuta i vlastiti backline.",
                "Javljam se na oglas - slobodni smo na taj datum i rado bismo svirali.",
                "Sviramo u ovom žanru već godinama, možemo poslati snimke s prošlih nastupa.",
                "Zanima nas nastup. Recite nam više o tehničkim uvjetima na pozornici.",
                "Prijavljujemo se, honorar nam odgovara. Možemo doći i na tonsku probu ranije.",
                "Imamo iskustva s ovakvim događajima, javite se za detalje.",
            };

            var performerPool = new List<int>();
            foreach (var b in bands.Values) performerPool.Add(b.PerformerId!.Value);
            foreach (var m in musicians.Values) performerPool.Add(m.PerformerId!.Value);

            foreach (var evt in events)
            {
                var applicants = performerPool.OrderBy(_ => Rnd.Next()).Take(Rnd.Next(2, 7)).Distinct().ToList();
                var accepted = 0;

                foreach (var performerId in applicants)
                {
                    var status = ApplicationStatus.Pending;
                    if (evt.Status == EventStatus.Closed)
                        status = accepted < (evt.RequiredPerformers ?? 1)
                            ? ApplicationStatus.Accepted
                            : ApplicationStatus.Rejected;
                    else if (Rnd.Next(100) < 20)
                        status = ApplicationStatus.Accepted;
                    else if (Rnd.Next(100) < 15)
                        status = ApplicationStatus.Rejected;

                    if (status == ApplicationStatus.Accepted) accepted++;

                    db.EventsApplications.Add(new EventApplication
                    {
                        EventId = evt.Id,
                        PerformerId = performerId,
                        Message = messages[Rnd.Next(messages.Length)],
                        Status = status,
                        AppliedAt = evt.CreatedAt.AddDays(Rnd.Next(1, 14))
                    });
                }
            }
            await db.SaveChangesAsync();
        }

        private static async Task SeedOpportunitiesAsync(
            AppDbContext db,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Band> bands,
            Dictionary<string, Instrument> instruments,
            Dictionary<string, Genre> genres)
        {
            var seeds = new (string Author, bool IsBand, OpportunityType Type,
                string? Instrument, string? Genre, string Description, int DaysAgo)[]
            {
                ("Sjeverni Vjetar", true, OpportunityType.SeekingMusician, "Klavijature", "Rock",
                    "Tražimo klavijaturista za proširenje postave. Probe dva puta tjedno u Zagrebu, imamo dogovorene svirke do kraja godine.", 6),

                ("Čelični Kotač", true, OpportunityType.SeekingMusician, "Vokal", "Metal",
                    "Hitno tražimo vokal. Materijal je gotov, snimanje albuma kreće za dva mjeseca.", 12),

                ("Modri Val", true, OpportunityType.SeekingMusician, "Bas gitara", "Pop",
                    "Trebamo basista za live postavu. Osam svirki dogovoreno za jesen.", 3),

                ("Kvintet Bez Imena", true, OpportunityType.SeekingMusician, "Truba", "Jazz",
                    "Tražimo trubača za stalnu postavu. Standardi i vlastiti aranžmani, probe nedjeljom.", 20),

                ("Beton Blok", true, OpportunityType.SeekingMusician, "Bubnjevi", "Hip-hop",
                    "Tražimo bubnjara za live nastupe. Nije nužno iskustvo u hip-hopu, važan je osjećaj za groove.", 9),

                ("Tamburaški sastav Slavonija", true, OpportunityType.SeekingMusician, "Tambura", "Tamburaška glazba",
                    "Traži se bisernica. Sezona svadbi je pred nama, honorar po svirci.", 15),

                ("Kotlovina Band", true, OpportunityType.SeekingMusician, "Saksofon", "Zabavna glazba",
                    "Tražimo puhača za pojačanje postave na većim proslavama. Povremeni angažman.", 5),

                ("filipk", false, OpportunityType.SeekingBand, "Električna gitara", "Metal",
                    "Gitarist traži ozbiljan metal bend s ambicijama. Imam opremu, prijevoz i slobodne večeri.", 8),

                ("davidr", false, OpportunityType.SeekingBand, "Vokal", "Hip-hop",
                    "Tražim live bend za koncertnu postavu. Materijal je spreman, treba nam samo zvuk.", 21),

                ("emal", false, OpportunityType.SeekingBand, "Vokal", "Indie",
                    "Kantautorica traži bend za pratnju na nastupima. Vlastite pjesme, akustični i električni set.", 17),

                ("petraj", false, OpportunityType.SeekingCollaboration, "Bas gitara", "Funk",
                    "Tražim ekipu za funk projekt - bubnjevi, klavijature i puhači. Ideja je jam bend bez pritiska.", 4),

                ("lukab", false, OpportunityType.SeekingCollaboration, "Klavijature", "Elektronika",
                    "Producent traži vokale za suradnju na elektro projektu. Radim iz vlastitog studija u Osijeku.", 11),

                ("majav", false, OpportunityType.SeekingCollaboration, "Violina", "Folk",
                    "Violinistica traži glazbenike za crossover projekt - klasika i folk. Nastupi po Dalmaciji.", 14),

                ("tomom", false, OpportunityType.SeekingCollaboration, "Saksofon", "Soul",
                    "Tražim pijanista za duo. Soul i jazz standardi, nastupi u manjim prostorima.", 7),

                ("anakov", false, OpportunityType.SeekingCollaboration, "Vokal", "Pop",
                    "Vokalistica traži gitarista za akustični duo tijekom ljetne sezone u Dalmaciji.", 13),

                ("robertv", false, OpportunityType.SeekingCollaboration, "Električna gitara", "Blues",
                    "Tražim ekipu za blues jam nedjeljom. Bez obveza, samo sviranje.", 25),
            };

            var opportunities = new List<Opportunity>();
            foreach (var s in seeds)
            {
                var authorPerformerId = s.IsBand
                    ? bands[s.Author].PerformerId!.Value
                    : musicians[s.Author].PerformerId!.Value;

                var opp = new Opportunity
                {
                    AuthorId = authorPerformerId,
                    InstrumentId = s.Instrument is null ? null : instruments[s.Instrument].Id,
                    GenreId = s.Genre is null ? null : genres[s.Genre].Id,
                    Type = s.Type,
                    Description = s.Description,
                    CreatedAt = Now.AddDays(-s.DaysAgo)
                };
                db.Opportunities.Add(opp);
                opportunities.Add(opp);
            }
            await db.SaveChangesAsync();

            var appMessages = new[]
            {
                "Zainteresiran sam, sviram u tom žanru već godinama.",
                "Javljam se na oglas - slobodan sam za probe u tim terminima.",
                "Mogu poslati snimke, javite se ako vam odgovara.",
                "Zvuči kao projekt za mene. Imam vlastitu opremu i prijevoz.",
                "Prijavljujem se, jedva čekam čuti materijal.",
            };

            var musicianPerformerIds = musicians.Values.Select(m => m.PerformerId!.Value).ToList();

            foreach (var opp in opportunities)
            {
                var applicants = musicianPerformerIds
                    .Where(id => id != opp.AuthorId)
                    .OrderBy(_ => Rnd.Next())
                    .Take(Rnd.Next(1, 6));

                foreach (var applicantId in applicants)
                {
                    var roll = Rnd.Next(100);
                    var status = roll < 15 ? ApplicationStatus.Accepted
                        : roll < 30 ? ApplicationStatus.Rejected
                        : ApplicationStatus.Pending;

                    db.OpportunitiesApplications.Add(new OpportunityApplication
                    {
                        OpportunityId = opp.Id,
                        ApplicantId = applicantId,
                        Message = appMessages[Rnd.Next(appMessages.Length)],
                        Status = status,
                        AppliedAt = opp.CreatedAt.AddDays(Rnd.Next(0, 5)).AddHours(Rnd.Next(1, 20))
                    });
                }
            }
            await db.SaveChangesAsync();
        }

        private static async Task SeedReviewsAsync(
            AppDbContext db,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Organizer> organizers,
            Dictionary<string, Band> bands)
        {
            var comments = new[]
            {
                "Profesionalni od prve minute. Došli na vrijeme, odsvirali sjajno, publika oduševljena.",
                "Odlična suradnja, sve dogovoreno je i ispoštovano. Preporuka.",
                "Zvuk je bio vrhunski, a komunikacija prije nastupa besprijekorna.",
                "Sjajna energija na pozornici. Definitivno ih zovemo ponovno.",
                "Solidan nastup, jedino je tonska proba kasnila pola sata.",
                "Vrlo dobri glazbenici, repertoar je odgovarao publici.",
                "Sve pohvale, prilagodili su program našim željama bez problema.",
                "Ugodna suradnja i korektan odnos. Rado opet.",
                "Dobar nastup, iako bi malo više dogovora oko repertoara bilo korisno.",
                "Publika je plesala do kraja. Točno ono što smo tražili.",
                "Odlični profesionalci, ozvučenje su donijeli sami i sve je radilo savršeno.",
                "Nastup je bio dobar, iako su kasnili s dolaskom.",
            };

            var reviewers = musicians.Values.Cast<Profile>().Concat(organizers.Values).ToList();
            var targets = new List<(int PerformerId, int? OwnerProfileId)>();
            foreach (var b in bands.Values) targets.Add((b.PerformerId!.Value, null));
            foreach (var m in musicians.Values) targets.Add((m.PerformerId!.Value, m.Id));

            var used = new HashSet<(int, int)>();
            var ratingsByPerformer = new Dictionary<int, List<int>>();

            foreach (var target in targets)
            {
                var chosen = reviewers
                    .Where(r => target.OwnerProfileId is null || r.Id != target.OwnerProfileId)
                    .OrderBy(_ => Rnd.Next())
                    .Take(Rnd.Next(2, 9));

                foreach (var reviewer in chosen)
                {
                    if (!used.Add((reviewer.Id, target.PerformerId))) continue;

                    var rating = Rnd.Next(100) < 65 ? 5 : Rnd.Next(100) < 70 ? 4 : Rnd.Next(2, 4);
                    db.Reviews.Add(new Review
                    {
                        ReviewerId = reviewer.Id,
                        PerformerId = target.PerformerId,
                        Rating = rating,
                        Comment = comments[Rnd.Next(comments.Length)],
                        CreatedAt = Now.AddDays(-Rnd.Next(5, 300))
                    });

                    if (!ratingsByPerformer.TryGetValue(target.PerformerId, out var list))
                        ratingsByPerformer[target.PerformerId] = list = new List<int>();
                    list.Add(rating);
                }
            }
            await db.SaveChangesAsync();

            foreach (var (performerId, ratings) in ratingsByPerformer)
            {
                var performer = await db.Performers.FindAsync(performerId);
                if (performer is null) continue;
                performer.NumberOfReviews = ratings.Count;
                performer.AverageRating = Math.Round(ratings.Average(), 2);
            }
            await db.SaveChangesAsync();
        }

        private static async Task SeedConversationsAsync(
            AppDbContext db,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Organizer> organizers)
        {
            var threads = new (string A, string B, (bool FromA, string Text, int HoursAgo)[] Messages)[]
            {
                ("tvornicalive", "markoh", new[]
                {
                    (true, "Pozdrav Marko, gledao sam vaš nastup prošli mjesec. Zanima nas jeste li slobodni 15.10. za rock večer?", 72),
                    (false, "Bok Damire, hvala na pozivu! Provjerio sam s ekipom, taj datum nam odgovara.", 70),
                    (true, "Odlično. Set od 45 minuta, tonska proba u 17h. Honorar 600 eura plus dio od ulaznica.", 69),
                    (false, "Dogovoreno. Trebamo li donijeti backline ili je sve na pozornici?", 68),
                    (true, "Bubnjevi i pojačala su naši, samo donesite instrumente i pedale.", 66),
                    (false, "Super, vidimo se 15.10. Šaljem tehnički rider na mail danas.", 65),
                }),

                ("anakov", "lukab", new[]
                {
                    (true, "Bok Luka, čula sam demo koji si objavio. Zvuči odlično - radiš li snimanja za druge izvođače?", 200),
                    (false, "Bok Ana! Hvala. Da, radim, imam studio u Osijeku. Što bi točno trebala?", 198),
                    (true, "Imam tri pjesme koje bih htjela snimiti kako spada. Vokal, klavir i možda gudači.", 196),
                    (false, "To se da odraditi. Pošalji mi demo snimke pa da vidim u kojem smjeru ide.", 190),
                    (true, "Šaljem večeras. Koliko otprilike traje takav proces?", 188),
                }),

                ("filipk", "ivannovak", new[]
                {
                    (true, "Ivane, vidio sam da sviraš u par bendova. Tražimo bubnjara za metal projekt, jesi li zainteresiran?", 120),
                    (false, "Bok Filipe. Sviram već u dva benda, ali pošalji materijal pa ću poslušati.", 118),
                    (true, "Šaljem link na demo. Tempo ide do 180, ali ima i sporijih stvari.", 117),
                    (false, "Poslušao sam, dobro zvuči. Mogu doći na probu za dva tjedna, prije toga sam u gužvi.", 100),
                    (true, "Odlično, javljam ti termin.", 98),
                }),

                ("proslaveplus", "josipp", new[]
                {
                    (true, "Pozdrav, tražimo tamburaški sastav za vjenčanje u Vinkovcima 20.9. Jeste li slobodni?", 48),
                    (false, "Pozdrav Martina, jesmo. Koliko uzvanika i koliko sati sviranja?", 46),
                    (true, "Oko 120 uzvanika, sviranje od 18h do ponoći, pa dalje po dogovoru.", 45),
                    (false, "Može. Cijena za tu satnicu je 900 eura, ozvučenje je naše.", 44),
                    (true, "Odgovara nam. Šaljem ugovor na mail.", 40),
                }),

                ("emal", "brunok", new[]
                {
                    (true, "Bok Bruno, tražim bubnjara za akustični set. Vidjela sam da sviraš i cajon.", 300),
                    (false, "Bok Ema! Sviram, i baš mi je drago kad se ukaže prilika za nešto tiše.", 295),
                    (true, "Super. Imam osam pjesama, planiram nastupe po manjim klubovima.", 290),
                    (false, "Pošalji snimke i termine proba, pa da vidimo.", 288),
                }),

                ("kvarnerfest", "tomom", new[]
                {
                    (true, "Pozdrav Tomislave, organiziramo Jazz u parku. Zanima nas vaš kvintet za nedjeljni termin.", 30),
                    (false, "Pozdrav! Zainteresirani smo. Koji je datum i koliko traje nastup?", 28),
                    (true, "Dva termina po 40 minuta, popodne. Budžet je 400 eura.", 26),
                    (false, "Odgovara. Trebamo klavir na pozornici, ostalo donosimo sami.", 24),
                }),

                ("sarap", "davidr", new[]
                {
                    (true, "David, radim novi instrumental, mislim da bi tvoj vokal legao savršeno.", 500),
                    (false, "Šalji, uvijek sam za. Kad ti treba?", 495),
                    (true, "Nema žurbe, ali bilo bi lijepo objaviti do kraja mjeseca.", 490),
                    (false, "Napisat ću nešto ovaj vikend pa ti javim.", 480),
                    (true, "Savršeno. Poslala sam ti stem fajlove na mail.", 478),
                }),

                ("majav", "lucijas", new[]
                {
                    (true, "Lucija, imamo koncert na Forumu u Zadru. Trebamo pijanisticu za dva komada.", 150),
                    (false, "Zvuči odlično. Koji repertoar?", 148),
                    (true, "Brahms i jedan suvremeni aranžman. Note ti šaljem odmah.", 146),
                    (false, "Može, računaj na mene.", 140),
                }),
            };

            foreach (var thread in threads)
            {
                var a = FindProfile(musicians, organizers, thread.A);
                var b = FindProfile(musicians, organizers, thread.B);

                var conversation = new Conversation
                {
                    Profile1Id = Math.Min(a.Id, b.Id),
                    Profile2Id = Math.Max(a.Id, b.Id),
                    CreatedAt = Now.AddHours(-thread.Messages.Max(m => m.HoursAgo) - 1)
                };
                db.Conversations.Add(conversation);
                await db.SaveChangesAsync();

                for (var i = 0; i < thread.Messages.Length; i++)
                {
                    var msg = thread.Messages[i];
                    db.DirectMessages.Add(new DirectMessage
                    {
                        ConversationId = conversation.Id,
                        SenderId = msg.FromA ? a.Id : b.Id,
                        Content = msg.Text,
                        SentAt = Now.AddHours(-msg.HoursAgo),
                        IsRead = i < thread.Messages.Length - 1
                    });
                }
            }
            await db.SaveChangesAsync();
        }

        private static Profile FindProfile(
            Dictionary<string, Musician> musicians,
            Dictionary<string, Organizer> organizers,
            string userName)
            => musicians.TryGetValue(userName, out var m) ? m : organizers[userName];

        private static async Task SeedNotificationsAsync(
            AppDbContext db,
            Dictionary<string, Musician> musicians,
            Dictionary<string, Organizer> organizers,
            Dictionary<string, Band> bands,
            List<Event> events)
        {
            var allProfiles = musicians.Values.Cast<Profile>().Concat(organizers.Values).ToList();
            var names = allProfiles.ToDictionary(p => p.Id, p => $"{p.FirstName} {p.LastName}");

            // --- novi pratitelji ---
            var recentFollows = await db.Follows
                .Where(f => f.FolloweeProfileId != null)
                .OrderByDescending(f => f.FollowedAt)
                .Take(60)
                .ToListAsync();

            foreach (var follow in recentFollows)
            {
                if (!names.TryGetValue(follow.FollowerId, out var actorName)) continue;
                db.Notifications.Add(new Notification
                {
                    RecipientProfileId = follow.FolloweeProfileId!.Value,
                    ActorProfileId = follow.FollowerId,
                    Type = NotificationType.NewFollower,
                    Message = $"{actorName} te počeo/la pratiti.",
                    IsRead = Rnd.Next(100) < 55,
                    CreatedAt = follow.FollowedAt
                });
            }

            // --- nove recenzije ---
            var performerOwner = musicians.Values.ToDictionary(m => m.PerformerId!.Value, m => m.Id);

            var recentReviews = await db.Reviews
                .OrderByDescending(r => r.CreatedAt)
                .Take(40)
                .ToListAsync();

            foreach (var review in recentReviews)
            {
                if (review.ReviewerId is null) continue;
                if (!performerOwner.TryGetValue(review.PerformerId, out var recipientId)) continue;
                if (recipientId == review.ReviewerId.Value) continue;
                if (!names.TryGetValue(review.ReviewerId.Value, out var actorName)) continue;

                db.Notifications.Add(new Notification
                {
                    RecipientProfileId = recipientId,
                    ActorProfileId = review.ReviewerId,
                    Type = NotificationType.NewReview,
                    Message = $"{actorName} ti je ostavio/la recenziju ({review.Rating}/5).",
                    IsRead = Rnd.Next(100) < 40,
                    CreatedAt = review.CreatedAt
                });
            }

            // --- prijave na događaje ---
            var bandOwner = new Dictionary<int, int>();
            foreach (var band in bands.Values)
            {
                var admin = BandSeeds.First(b => b.Name == band.Name).Members
                    .First(m => m.Role == BandMemberRole.Admin);
                bandOwner[band.PerformerId!.Value] = musicians[admin.UserName].Id;
            }

            var eventById = events.ToDictionary(e => e.Id);
            var applications = await db.EventsApplications
                .OrderByDescending(a => a.AppliedAt)
                .Take(50)
                .ToListAsync();

            foreach (var app in applications)
            {
                if (!eventById.TryGetValue(app.EventId, out var evt)) continue;

                int? applicantProfileId = performerOwner.TryGetValue(app.PerformerId, out var pid)
                    ? pid
                    : bandOwner.TryGetValue(app.PerformerId, out var bid) ? bid : null;
                if (applicantProfileId is null) continue;

                if (app.Status == ApplicationStatus.Pending)
                {
                    if (!names.TryGetValue(applicantProfileId.Value, out var actorName)) continue;
                    db.Notifications.Add(new Notification
                    {
                        RecipientProfileId = evt.OrganizerId,
                        ActorProfileId = applicantProfileId,
                        Type = NotificationType.NewApplication,
                        Message = $"{actorName} se prijavio/la na događaj \"{evt.Title}\".",
                        IsRead = Rnd.Next(100) < 30,
                        CreatedAt = app.AppliedAt,
                        EventId = evt.Id
                    });
                }
                else
                {
                    var accepted = app.Status == ApplicationStatus.Accepted;
                    db.Notifications.Add(new Notification
                    {
                        RecipientProfileId = applicantProfileId.Value,
                        ActorProfileId = evt.OrganizerId,
                        Type = accepted ? NotificationType.ApplicationAccepted : NotificationType.ApplicationRejected,
                        Message = accepted
                            ? $"Tvoja prijava na \"{evt.Title}\" je prihvaćena!"
                            : $"Tvoja prijava na \"{evt.Title}\" je odbijena.",
                        IsRead = Rnd.Next(100) < 45,
                        CreatedAt = app.AppliedAt.AddDays(Rnd.Next(1, 6)),
                        EventId = evt.Id
                    });
                }
            }

            await db.SaveChangesAsync();
        }

        /// <summary>
        /// Postojeći (ne-demo) korisnici dobivaju pratitelje, poruke i obavijesti
        /// kako feed i inbox ne bi bili prazni kad se prijaviš svojim računom.
        /// </summary>
        private static async Task IncludeExistingUsersAsync(AppDbContext db, Dictionary<string, Musician> musicians)
        {
            var seedUserIds = await db.Users
                .Where(u => u.Email!.EndsWith(SeedEmailDomain))
                .Select(u => u.Id)
                .ToListAsync();

            var realProfiles = await db.Profiles
                .Where(p => !seedUserIds.Contains(p.UserId))
                .ToListAsync();

            if (realProfiles.Count == 0) return;

            var musicianList = musicians.Values.ToList();
            var openers = new[]
            {
                new[]
                {
                    "Bok! Vidio sam tvoj profil, tražimo nekoga za suradnju na projektu. Jesi li zainteresiran/a?",
                    "Javi se kad stigneš, imamo probu u srijedu u 19h.",
                },
                new[]
                {
                    "Pozdrav! Sviđa mi se što radiš. Imaš li vremena za jednu svirku sljedeći mjesec?",
                    "Detalje ti mogu poslati na mail ako ti je lakše.",
                }
            };

            foreach (var profile in realProfiles)
            {
                foreach (var follower in musicianList.OrderBy(_ => Rnd.Next()).Take(9))
                {
                    var followedAt = Now.AddDays(-Rnd.Next(1, 40));
                    db.Follows.Add(new Follow
                    {
                        FollowerId = follower.Id,
                        FolloweeProfileId = profile.Id,
                        FollowedAt = followedAt
                    });
                    db.Notifications.Add(new Notification
                    {
                        RecipientProfileId = profile.Id,
                        ActorProfileId = follower.Id,
                        Type = NotificationType.NewFollower,
                        Message = $"{follower.FirstName} {follower.LastName} te počeo/la pratiti.",
                        IsRead = false,
                        CreatedAt = followedAt
                    });
                }

                // profil prati nekoliko demo glazbenika da feed ne bude prazan
                foreach (var followee in musicianList.OrderBy(_ => Rnd.Next()).Take(10))
                {
                    db.Follows.Add(new Follow
                    {
                        FollowerId = profile.Id,
                        FolloweeProfileId = followee.Id,
                        FollowedAt = Now.AddDays(-Rnd.Next(1, 40))
                    });
                }

                await db.SaveChangesAsync();

                var partners = musicianList.OrderBy(_ => Rnd.Next()).Take(2).ToList();
                for (var i = 0; i < partners.Count; i++)
                {
                    var partner = partners[i];
                    var conversation = new Conversation
                    {
                        Profile1Id = Math.Min(profile.Id, partner.Id),
                        Profile2Id = Math.Max(profile.Id, partner.Id),
                        CreatedAt = Now.AddDays(-3)
                    };
                    db.Conversations.Add(conversation);
                    await db.SaveChangesAsync();

                    var texts = openers[i % openers.Length];
                    for (var j = 0; j < texts.Length; j++)
                    {
                        db.DirectMessages.Add(new DirectMessage
                        {
                            ConversationId = conversation.Id,
                            SenderId = partner.Id,
                            Content = texts[j],
                            SentAt = Now.AddDays(-3).AddHours(j * 2),
                            IsRead = false
                        });
                    }
                }

                await db.SaveChangesAsync();
            }
        }

        // ---------------------------------------------------------------------
        private static async Task ResetAsync(AppDbContext db, UserManager<User> userManager)
        {
            db.Notifications.RemoveRange(db.Notifications);
            db.DirectMessages.RemoveRange(db.DirectMessages);
            await db.SaveChangesAsync();

            db.Conversations.RemoveRange(db.Conversations);
            db.PostComments.RemoveRange(db.PostComments);
            db.PostLikes.RemoveRange(db.PostLikes);
            db.PostsMedia.RemoveRange(db.PostsMedia);
            await db.SaveChangesAsync();

            db.Posts.RemoveRange(db.Posts);
            db.Follows.RemoveRange(db.Follows);
            db.Reviews.RemoveRange(db.Reviews);
            db.EventsApplications.RemoveRange(db.EventsApplications);
            db.OpportunitiesApplications.RemoveRange(db.OpportunitiesApplications);
            await db.SaveChangesAsync();

            db.Events.RemoveRange(db.Events);
            db.Opportunities.RemoveRange(db.Opportunities);
            db.BandMember.RemoveRange(db.BandMember);
            db.PlaysInstrument.RemoveRange(db.PlaysInstrument);
            db.PlaysGenre.RemoveRange(db.PlaysGenre);
            db.Locations.RemoveRange(db.Locations);
            await db.SaveChangesAsync();

            var bands = await db.Bands.ToListAsync();
            var bandPerformerIds = bands.Where(b => b.PerformerId != null)
                .Select(b => b.PerformerId!.Value)
                .ToList();
            db.Bands.RemoveRange(bands);
            await db.SaveChangesAsync();

            db.Instruments.RemoveRange(db.Instruments);
            db.Genres.RemoveRange(db.Genres);
            await db.SaveChangesAsync();

            var seedUsers = await db.Users.Where(u => u.Email!.EndsWith(SeedEmailDomain)).ToListAsync();
            var seedUserIds = seedUsers.Select(u => u.Id).ToList();
            var seedProfiles = await db.Profiles.Where(p => seedUserIds.Contains(p.UserId)).ToListAsync();
            var musicianPerformerIds = seedProfiles.OfType<Musician>()
                .Where(m => m.PerformerId != null)
                .Select(m => m.PerformerId!.Value)
                .ToList();

            db.Profiles.RemoveRange(seedProfiles);
            await db.SaveChangesAsync();

            var performerIds = bandPerformerIds.Concat(musicianPerformerIds).ToList();
            var performers = await db.Performers.Where(p => performerIds.Contains(p.Id)).ToListAsync();
            db.Performers.RemoveRange(performers);
            await db.SaveChangesAsync();

            foreach (var user in seedUsers)
                await userManager.DeleteAsync(user);
        }

        private static async Task PrintSummaryAsync(AppDbContext db)
        {
            Console.WriteLine();
            Console.WriteLine("Baza je napunjena:");
            Console.WriteLine($"  Korisnici .................. {await db.Users.CountAsync()}");
            Console.WriteLine($"  Profili .................... {await db.Profiles.CountAsync()}");
            Console.WriteLine($"  Izvodaci (Performers) ...... {await db.Performers.CountAsync()}");
            Console.WriteLine($"  Bendovi .................... {await db.Bands.CountAsync()}");
            Console.WriteLine($"  Clanovi bendova ............ {await db.BandMember.CountAsync()}");
            Console.WriteLine($"  Zanrovi .................... {await db.Genres.CountAsync()}");
            Console.WriteLine($"  Instrumenti ................ {await db.Instruments.CountAsync()}");
            Console.WriteLine($"  Objave ..................... {await db.Posts.CountAsync()}");
            Console.WriteLine($"  Lajkovi .................... {await db.PostLikes.CountAsync()}");
            Console.WriteLine($"  Komentari .................. {await db.PostComments.CountAsync()}");
            Console.WriteLine($"  Pracenja ................... {await db.Follows.CountAsync()}");
            Console.WriteLine($"  Dogadaji ................... {await db.Events.CountAsync()}");
            Console.WriteLine($"  Prijave na dogadaje ........ {await db.EventsApplications.CountAsync()}");
            Console.WriteLine($"  Oglasi (Opportunities) ..... {await db.Opportunities.CountAsync()}");
            Console.WriteLine($"  Prijave na oglase .......... {await db.OpportunitiesApplications.CountAsync()}");
            Console.WriteLine($"  Recenzije .................. {await db.Reviews.CountAsync()}");
            Console.WriteLine($"  Razgovori .................. {await db.Conversations.CountAsync()}");
            Console.WriteLine($"  Poruke ..................... {await db.DirectMessages.CountAsync()}");
            Console.WriteLine($"  Obavijesti ................. {await db.Notifications.CountAsync()}");
            Console.WriteLine();
            Console.WriteLine($"Prijava: <korisnicko_ime>{SeedEmailDomain} / {SeedPassword}");
            Console.WriteLine("Npr. markoh@findmeband.hr, anakov@findmeband.hr, tvornicalive@findmeband.hr");
        }
    }
}

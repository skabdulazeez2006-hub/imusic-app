import { Router } from "express";
import {
  SearchSongsQueryParams,
  GetTrendingSongsQueryParams,
  GetSongParams,
} from "@workspace/api-zod";

const router = Router();

const SAAVN_API = "https://saavn.sumit.co/api";

// ── JioSaavn response types ──────────────────────────────────────────

type SaavnImage = { quality: string; url: string };
type SaavnDownloadUrl = { quality: string; url: string };
type SaavnArtist = { id: string; name: string; role: string; image: SaavnImage[]; type: string; url: string };

type SaavnSong = {
  id: string;
  name: string;
  type: string;
  year: string;
  releaseDate: string | null;
  duration: number;
  label: string;
  explicitContent: boolean;
  playCount: number;
  language: string;
  hasLyrics: boolean;
  url: string;
  album: { id: string; name: string; url: string };
  artists: {
    primary: SaavnArtist[];
    featured: SaavnArtist[];
    all: SaavnArtist[];
  };
  image: SaavnImage[];
  downloadUrl: SaavnDownloadUrl[];
};

// ── Mapper ───────────────────────────────────────────────────────────

function mapSaavnSong(song: SaavnSong): Record<string, unknown> {
  // Pick the highest quality image (500x500)
  const image =
    song.image?.find((i) => i.quality === "500x500")?.url ||
    song.image?.[song.image.length - 1]?.url ||
    "";

  // Pick the highest quality download URL (prefer 320kbps)
  const streamUrl = getBestStreamUrl(song.downloadUrl);

  // Extract primary artist names
  const artists = song.artists?.primary?.map((a) => a.name) || [];

  return {
    id: song.id,
    name: song.name,
    artists: artists.length > 0 ? artists : ["Unknown Artist"],
    albumName: song.album?.name || "",
    image,
    language: normalizeLanguage(song.language),
    duration: song.duration || 0,
    year: song.year || null,
    streamUrl,
    lyrics: null,
  };
}

function getBestStreamUrl(downloadUrls: SaavnDownloadUrl[] | undefined): string {
  if (!downloadUrls || downloadUrls.length === 0) return "";

  // Prefer 320kbps > 160kbps > 96kbps > whatever is available
  const preferredQualities = ["320kbps", "160kbps", "96kbps", "48kbps", "12kbps"];
  for (const quality of preferredQualities) {
    const match = downloadUrls.find((d) => d.quality === quality);
    if (match?.url) return match.url;
  }

  // Fallback to last entry (usually highest quality)
  return downloadUrls[downloadUrls.length - 1]?.url || "";
}

function normalizeLanguage(lang: string): string {
  const l = (lang || "").toLowerCase().trim();
  if (l === "hindi" || l === "bollywood") return "hindi";
  if (l === "tamil") return "tamil";
  if (l === "telugu") return "telugu";
  if (l === "kannada") return "kannada";
  if (l === "malayalam") return "malayalam";
  if (l === "punjabi") return "punjabi";
  if (l === "bengali" || l === "bangla") return "bengali";
  if (l === "marathi") return "marathi";
  if (l === "gujarati") return "gujarati";
  if (l === "bhojpuri") return "bhojpuri";
  if (l === "english") return "english";
  return l || "hindi";
}

// ── Trending queries — comprehensive Indian cinema ───────────────────

const TRENDING_QUERIES: Record<string, string[]> = {
  hindi: [
    "kesariya brahmastra",
    "tum hi ho aashiqui",
    "chaiyya chaiyya dil se",
    "jai ho slumdog",
    "arijit singh hits",
    "kabhi khushi kabhie gham",
    "tere bina jawan",
    "chaleya jawan",
    "besharam rang pathaan",
    "apna bana le bhediya",
    "maan meri jaan king",
    "tera ban jaunga kabir singh",
    "raataan lambiyan shershaah",
    "deva deva brahmastra",
    "phir aur kya chahiye zara hatke",
    "heeriye jasleen royal",
    "o bedardeya tu jhoothi main makkaar",
    "ae dil hai mushkil",
    "tum se hi jab we met",
    "agar tum saath ho tamasha",
  ],
  tamil: [
    "kannaana kanney viswasam",
    "vaathi coming master",
    "arabic kuthu beast",
    "rowdy baby maari 2",
    "anirudh ravichander hits",
    "why this kolaveri di",
    "aalaporan thamizhan mersal",
    "master the blaster",
    "vikram kamal haasan",
    "kutti story master",
    "enjoy enjaami dhee",
    "naa ready jailer",
    "hukum jailer",
    "chinna chinna aasai roja",
    "kaadhale kaadhale 96",
    "en iniya pon nilave",
    "thalli pogathey achcham yenbathu madamaiyada",
    "ilamai thirumbi petta",
    "kaavaalaa jailer",
    "annaatthe annaatthe",
  ],
  telugu: [
    "oo antava pushpa",
    "naatu naatu rrr",
    "srivalli pushpa",
    "saami saami pushpa",
    "buttabomma ala vaikunthapurramuloo",
    "butta bomma allu arjun",
    "ramuloo ramulaa",
    "samajavaragamana ala vaikunthapurramuloo",
    "komuram bheemudo rrr",
    "dosti rrr",
    "pushpa pushpa pushpa 2",
    "angaaron ka rakshas pushpa 2",
    "sooseki pushpa 2",
    "eyy bidda idhi naa adda pushpa 2",
    "jaragandi game changer",
    "arjun reddy breakup song",
    "inkem inkem kaavaale geetha govindam",
    "yenti yenti geetha govindam",
    "kalaavathi sarkaru vaari paata",
    "penny akhanda",
  ],
  kannada: [
    "tagaru tagaru",
    "kotigobba anthem",
    "bombe helutaite raajakumara",
    "belageddu kirik party",
    "joe joe charlie 777",
    "rangitaranga theme",
    "there summane heege kantara",
    "varaha roopam kantara",
    "toofan kgf chapter 2",
    "sultan kgf chapter 2",
    "salaam rocky bhai kgf",
    "garbadhi kgf",
    "pogaru pogaru",
    "bairavaa bairavaa roberrt",
  ],
  malayalam: [
    "jeevamshamayi theevandi",
    "jimikki kammal velipadinte pusthakam",
    "entammede jimikki kammal",
    "premam malare",
    "kaathirunnu kaathirunnu",
    "nee himamazhayayi edakkad battalion",
    "poomaram poomaram",
    "illuminati aavesham",
    "pachakkuthira pachakkuthira",
    "aaradhike ambili",
    "appangal embadum chethikulangara",
    "kondoram kondoram minnal murali",
    "karimizhi kuruvikku",
    "thallumala thallumala",
  ],
  punjabi: [
    "brown munde ap dhillon",
    "excuses ap dhillon",
    "jatt da muqabla sidhu moosewala",
    "levels sidhu moosewala",
    "lover diljit dosanjh",
    "naina lagiya diljit dosanjh",
    "born to shine diljit dosanjh",
    "goat diljit dosanjh",
    "we rollin shubh",
    "elevated shubh",
    "no love shubh",
    "softly karan aujla",
    "tauba tauba karan aujla",
    "52 bars karan aujla",
  ],
  bengali: [
    "ami je tomar rabindra sangeet",
    "tomake chai rabindra sangeet",
    "mon majhi re arijit singh",
    "bolna mahi arijit singh",
    "preme pora baron",
    "oporadhi arman alif",
    "tor kotha ami",
    "ei raat tomar amar",
  ],
  marathi: [
    "zingaat sairat",
    "yad lagla sairat",
    "apsara aali natarang",
    "mala jau de natrang",
    "wajle ki bara natsamrat",
    "kombdi palali jatra",
    "morya morya ganpati",
    "devak kalji re",
  ],
  english: [
    "shape of you ed sheeran",
    "blinding lights weeknd",
    "dance monkey tones and i",
    "stay kid laroi",
    "heat waves glass animals",
    "as it was harry styles",
    "flowers miley cyrus",
    "anti hero taylor swift",
  ],
  all: [
    "kesariya brahmastra",
    "naatu naatu rrr",
    "arabic kuthu beast",
    "brown munde ap dhillon",
    "oo antava pushpa",
    "arijit singh hits",
    "jimikki kammal",
    "vaathi coming master",
    "srivalli pushpa",
    "belageddu kirik party",
    "tum hi ho aashiqui 2",
    "maan meri jaan king",
    "raataan lambiyan shershaah",
    "rowdy baby maari 2",
    "buttabomma allu arjun",
    "chaleya jawan",
  ],
};

// ── Fetch helpers ────────────────────────────────────────────────────

async function fetchSaavnSongs(
  query: string,
  limit: number
): Promise<SaavnSong[]> {
  try {
    const params = new URLSearchParams({
      query,
      limit: String(Math.min(limit, 40)),
    });
    const res = await fetch(`${SAAVN_API}/search/songs?${params}`);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      success: boolean;
      data?: { results?: SaavnSong[] };
    };
    return data?.data?.results || [];
  } catch {
    return [];
  }
}

async function fetchSaavnSongById(id: string): Promise<SaavnSong | null> {
  try {
    const res = await fetch(`${SAAVN_API}/songs/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success: boolean;
      data?: SaavnSong[];
    };
    return data?.data?.[0] || null;
  } catch {
    return null;
  }
}

// ── Routes ───────────────────────────────────────────────────────────

router.get("/songs/search", async (req, res) => {
  const parse = SearchSongsQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { q, language, limit = 20 } = parse.data;

  try {
    const query = language && language !== "all" ? `${q} ${language}` : q;
    const tracks = await fetchSaavnSongs(query, limit);
    const songs = tracks.map(mapSaavnSong);
    res.json({ songs, total: songs.length });
  } catch {
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

router.get("/songs/trending", async (req, res) => {
  const parse = GetTrendingSongsQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { language = "all", limit = 20 } = parse.data;

  try {
    const lang = (language || "all").toLowerCase();
    const queries = TRENDING_QUERIES[lang] || TRENDING_QUERIES.all;

    // Pick 2-3 random queries and merge results for variety
    const selectedQueries = pickRandom(queries, Math.min(3, queries.length));
    const perQueryLimit = Math.ceil(limit / selectedQueries.length);

    const allTracks: SaavnSong[] = [];
    for (const query of selectedQueries) {
      const tracks = await fetchSaavnSongs(query, perQueryLimit);
      allTracks.push(...tracks);
    }

    // De-duplicate by song id
    const seen = new Set<string>();
    const unique = allTracks.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    const songs = unique.slice(0, limit).map(mapSaavnSong);
    res.json({ songs, total: songs.length });
  } catch {
    res.status(500).json({ error: "Failed to fetch trending songs" });
  }
});

router.get("/songs/:id", async (req, res) => {
  const parse = GetSongParams.safeParse(req.params);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid song ID" });
    return;
  }

  const { id } = parse.data;

  try {
    const song = await fetchSaavnSongById(id);

    if (!song) {
      res.status(404).json({ error: "Song not found" });
      return;
    }

    const mapped = mapSaavnSong(song);
    res.json(mapped);
  } catch {
    res.status(500).json({ error: "Failed to fetch song" });
  }
});

// ── Utilities ────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Exports ──────────────────────────────────────────────────────────

export { mapSaavnSong, fetchSaavnSongs, type SaavnSong };
export default router;

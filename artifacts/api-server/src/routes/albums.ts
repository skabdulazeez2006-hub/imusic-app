import { Router } from "express";
import { GetTrendingAlbumsQueryParams, GetAlbumParams } from "@workspace/api-zod";
import { mapSaavnSong, type SaavnSong } from "./songs";

const router = Router();

const SAAVN_API = "https://saavn.sumit.co/api";

// ── JioSaavn album types ─────────────────────────────────────────────

type SaavnImage = { quality: string; url: string };

type SaavnAlbum = {
  id: string;
  name: string;
  type: string;
  year: string;
  releaseDate: string | null;
  language: string;
  playCount: number;
  songCount: number;
  url: string;
  artists?: {
    primary?: Array<{ id: string; name: string }>;
    all?: Array<{ id: string; name: string }>;
  };
  image: SaavnImage[];
  songs?: SaavnSong[];
};

type SaavnAlbumSearchResult = {
  id: string;
  name: string;
  type: string;
  year: string;
  language: string;
  songCount: number;
  url: string;
  artists?: {
    primary?: Array<{ id: string; name: string }>;
    all?: Array<{ id: string; name: string }>;
  };
  image: SaavnImage[];
};

// ── Mapper ───────────────────────────────────────────────────────────

function mapSaavnAlbum(
  album: SaavnAlbum | SaavnAlbumSearchResult,
  songs?: ReturnType<typeof mapSaavnSong>[]
): Record<string, unknown> {
  const image =
    album.image?.find((i) => i.quality === "500x500")?.url ||
    album.image?.[album.image.length - 1]?.url ||
    "";

  const artists =
    album.artists?.primary?.map((a) => a.name) ||
    album.artists?.all?.map((a) => a.name) ||
    [];

  return {
    id: album.id,
    name: album.name,
    artists: artists.length > 0 ? artists : ["Various Artists"],
    image,
    language: (album.language || "hindi").toLowerCase(),
    year: album.year || "",
    songCount: album.songCount || (songs?.length ?? 0),
    songs: songs ?? [],
    description: null,
  };
}

// ── Album queries — Indian cinema ────────────────────────────────────

const ALBUM_QUERIES: Record<string, string[]> = {
  hindi: [
    "brahmastra soundtrack",
    "jawan film soundtrack",
    "pathaan hindi film",
    "animal film soundtrack",
    "kabir singh",
    "aashiqui 2",
    "shershaah",
    "rockstar ranbir kapoor",
    "pk aamir khan",
    "dilwale dulhania",
  ],
  tamil: [
    "vikram kamal haasan",
    "beast tamil soundtrack",
    "master vijay",
    "jailer rajinikanth",
    "leo vijay",
    "ponniyin selvan",
    "roja ar rahman",
    "96 tamil film",
    "soorarai pottru",
    "kaithi karthi",
  ],
  telugu: [
    "pushpa allu arjun",
    "rrr telugu soundtrack",
    "baahubali 2 telugu",
    "ala vaikunthapurramuloo",
    "geetha govindam",
    "arjun reddy",
    "pushpa 2 the rule",
    "sarkaru vaari paata",
    "jersey nani",
    "kgf telugu",
  ],
  kannada: [
    "kgf chapter 2 kannada",
    "kantara kannada film",
    "vikrant rona",
    "salaga kannada",
    "kirik party",
    "charlie 777",
    "raajakumara puneeth",
    "tagaru shivaraj",
  ],
  malayalam: [
    "premam malayalam",
    "aavesham fahadh",
    "minnal murali",
    "theevandi malayalam",
    "drishyam mohanlal",
    "charlie dulquer",
    "bangalore days",
    "kumbalangi nights",
  ],
  punjabi: [
    "diljit dosanjh album",
    "ap dhillon brown munde",
    "sidhu moosewala album",
    "karan aujla album",
    "shubh album",
    "b praak album",
  ],
  bengali: [
    "arijit singh bengali",
    "rabindra sangeet collection",
    "bengali modern songs",
    "bengali film songs",
  ],
  marathi: [
    "sairat marathi",
    "natarang marathi",
    "marathi film songs",
    "natsamrat marathi",
  ],
  english: [
    "taylor swift eras",
    "adele 30 album",
    "weeknd dawn fm",
    "ed sheeran equals",
  ],
  all: [
    "bollywood 2024 soundtrack",
    "tamil 2024 film songs",
    "telugu 2024 film songs",
    "pushpa 2",
    "jawan soundtrack",
    "jailer rajinikanth",
    "kantara",
    "rrr telugu",
  ],
};

// ── Routes ───────────────────────────────────────────────────────────

router.get("/albums/trending", async (req, res) => {
  const parse = GetTrendingAlbumsQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { language = "all", limit = 12 } = parse.data;

  try {
    const lang = (language || "all").toLowerCase();
    const queries = ALBUM_QUERIES[lang] || ALBUM_QUERIES.all;
    const query = queries[Math.floor(Math.random() * queries.length)];

    const params = new URLSearchParams({
      query,
      limit: String(Math.min(limit, 20)),
    });

    const albumRes = await fetch(`${SAAVN_API}/search/albums?${params}`);
    if (!albumRes.ok) {
      res.status(500).json({ error: "Failed to fetch albums" });
      return;
    }

    const data = (await albumRes.json()) as {
      success: boolean;
      data?: { results?: SaavnAlbumSearchResult[] };
    };

    const albums = (data?.data?.results || []).map((a) => mapSaavnAlbum(a));
    res.json({ albums });
  } catch {
    res.status(500).json({ error: "Failed to fetch albums" });
  }
});

router.get("/albums/:id", async (req, res) => {
  const parse = GetAlbumParams.safeParse(req.params);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid album ID" });
    return;
  }

  const { id } = parse.data;

  try {
    const albumRes = await fetch(
      `${SAAVN_API}/albums?id=${encodeURIComponent(id)}`
    );

    if (!albumRes.ok) {
      res.status(404).json({ error: "Album not found" });
      return;
    }

    const data = (await albumRes.json()) as {
      success: boolean;
      data?: SaavnAlbum;
    };

    if (!data?.data) {
      res.status(404).json({ error: "Album not found" });
      return;
    }

    const albumData = data.data;
    const songs = (albumData.songs || []).map(mapSaavnSong);
    const album = mapSaavnAlbum(albumData, songs);

    res.json(album);
  } catch {
    res.status(500).json({ error: "Failed to fetch album" });
  }
});

export default router;

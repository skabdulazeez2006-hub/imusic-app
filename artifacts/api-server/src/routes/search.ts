import { Router } from "express";
import { GlobalSearchQueryParams } from "@workspace/api-zod";
import { mapSaavnSong, type SaavnSong } from "./songs";

const router = Router();
const SAAVN_API = "https://saavn.sumit.co/api";

// ── JioSaavn search result types ─────────────────────────────────────

type SaavnImage = { quality: string; url: string };

type SaavnAlbumSearchResult = {
  id: string;
  name: string;
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

type SaavnArtistSearchResult = {
  id: string;
  name: string;
  role: string;
  type: string;
  url: string;
  image: SaavnImage[];
};

// ── Route ────────────────────────────────────────────────────────────

router.get("/search", async (req, res) => {
  const parse = GlobalSearchQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { q } = parse.data;

  try {
    const [songsRes, albumsRes, artistsRes] = await Promise.all([
      fetch(`${SAAVN_API}/search/songs?query=${encodeURIComponent(q)}&limit=10`),
      fetch(`${SAAVN_API}/search/albums?query=${encodeURIComponent(q)}&limit=6`),
      fetch(`${SAAVN_API}/search/artists?query=${encodeURIComponent(q)}&limit=6`),
    ]);

    // Parse songs
    let songs: Record<string, unknown>[] = [];
    if (songsRes.ok) {
      const songsData = (await songsRes.json()) as {
        success: boolean;
        data?: { results?: SaavnSong[] };
      };
      songs = (songsData?.data?.results || []).map(mapSaavnSong);
    }

    // Parse albums
    let albums: Record<string, unknown>[] = [];
    if (albumsRes.ok) {
      const albumsData = (await albumsRes.json()) as {
        success: boolean;
        data?: { results?: SaavnAlbumSearchResult[] };
      };
      albums = (albumsData?.data?.results || []).map((album) => {
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
          songCount: album.songCount || 0,
        };
      });
    }

    // Parse artists
    let artists: Record<string, unknown>[] = [];
    if (artistsRes.ok) {
      const artistsData = (await artistsRes.json()) as {
        success: boolean;
        data?: { results?: SaavnArtistSearchResult[] };
      };
      artists = (artistsData?.data?.results || []).map((artist) => {
        const image =
          artist.image?.find((i) => i.quality === "500x500")?.url ||
          artist.image?.[artist.image.length - 1]?.url ||
          "";

        return {
          id: artist.id,
          name: artist.name,
          image,
          role: artist.role || null,
        };
      });
    }

    res.json({ songs, albums, artists });
  } catch {
    res.status(500).json({ error: "Failed to search" });
  }
});

export default router;

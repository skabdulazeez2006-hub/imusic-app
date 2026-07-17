import { Router } from "express";
import { GetArtistParams } from "@workspace/api-zod";
import { mapSaavnSong, fetchSaavnSongs, type SaavnSong } from "./songs";

const router = Router();
const SAAVN_API = "https://saavn.sumit.co/api";

type SaavnImage = { quality: string; url: string };

type SaavnArtistDetail = {
  id: string;
  name: string;
  url: string;
  type: string;
  followerCount: number;
  fanCount: string;
  isVerified: boolean;
  dominantLanguage: string;
  dominantType: string;
  bio: Array<{ text: string; title: string; sequence: number }>;
  image: SaavnImage[];
  topSongs?: SaavnSong[];
  topAlbums?: Array<{
    id: string;
    name: string;
    year: string;
    language: string;
    image: SaavnImage[];
  }>;
};

router.get("/artists/:id", async (req, res) => {
  const parse = GetArtistParams.safeParse(req.params);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid artist ID" });
    return;
  }

  const { id } = parse.data;

  try {
    // Try to fetch artist details from JioSaavn
    const artistRes = await fetch(
      `${SAAVN_API}/artists/${encodeURIComponent(id)}?songCount=20&albumCount=10`
    );

    if (artistRes.ok) {
      const data = (await artistRes.json()) as {
        success: boolean;
        data?: SaavnArtistDetail;
      };

      if (data?.data) {
        const artist = data.data;
        const image =
          artist.image?.find((i) => i.quality === "500x500")?.url ||
          artist.image?.[artist.image.length - 1]?.url ||
          "";

        const songs = (artist.topSongs || []).map(mapSaavnSong);

        const albums = (artist.topAlbums || []).map((album) => {
          const albumImage =
            album.image?.find((i) => i.quality === "500x500")?.url ||
            album.image?.[album.image.length - 1]?.url ||
            "";

          return {
            id: album.id,
            name: album.name,
            image: albumImage,
            year: album.year || "",
            language: (album.language || "").toLowerCase(),
          };
        });

        const bio = artist.bio?.map((b) => b.text).join(" ") || null;

        res.json({
          id: artist.id,
          name: artist.name,
          image,
          bio,
          songs,
          albums,
        });
        return;
      }
    }

    // Fallback: search for the artist's songs by name
    const songs = await fetchSaavnSongs(id, 20);
    const mappedSongs = songs.map(mapSaavnSong);

    res.json({
      id,
      name: id,
      image: "",
      bio: null,
      songs: mappedSongs,
      albums: [],
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch artist" });
  }
});

export default router;

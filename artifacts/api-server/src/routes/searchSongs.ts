import { Router } from "express";
import path from "path";
import { readFileSync } from "fs";

const router = Router();

// GET /api/songs/search?q=...&language=...
router.get("/songs/search", (req, res) => {
  const query = (req.query.q || "").toString().toLowerCase();
  const lang = (req.query.language || "").toString().toLowerCase();
  const filePath = path.resolve(process.cwd(), "artifacts", "api-server", "data", "songs.json");
  try {
    const raw = readFileSync(filePath, { encoding: "utf-8" });
    const songs = JSON.parse(raw);
    const filtered = songs.filter((song: any) => {
      const matchesTitle = song.title?.toLowerCase().includes(query);
      const matchesArtist = song.artist?.toLowerCase().includes(query);
      const matchesLang = lang ? song.language?.toLowerCase() === lang : true;
      return (matchesTitle || matchesArtist) && matchesLang;
    });
    res.json({ songs: filtered });
  } catch (error) {
    console.error("Failed to read songs.json", error);
    res.status(500).json({ error: "Failed to load songs data" });
  }
});

export default router;

import { Router } from "express";
import path from "path";
import { readFileSync } from "fs";

const router = Router();

// GET /api/static-songs (or /songs) returns the list of songs from the JSON data file
router.get("/songs", (req, res) => {
  const filePath = path.resolve(process.cwd(), "artifacts", "api-server", "data", "songs.json");
  try {
    const raw = readFileSync(filePath, { encoding: "utf-8" });
    const songs = JSON.parse(raw);
    res.json({ songs });
  } catch (error) {
    console.error("Failed to read songs.json", error);
    res.status(500).json({ error: "Failed to load songs data" });
  }
});

export default router;

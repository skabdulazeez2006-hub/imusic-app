// generate-songs.ts – script to create a large placeholder songs.json
import { writeFileSync } from "fs";
import { resolve } from "path";

const languages = ["Hindi", "Tamil", "Telugu", "Malayalam", "Kannada", "Punjabi", "Bengali", "Marathi", "English"]; 
const artists = [
  "Arijit Singh",
  "A. R. Rahman",
  "Shreya Ghoshal",
  "Sonu Nigam",
  "Sid Sriram",
  "Jubin Nautiyal",
  "Neha Kakkar",
  "S. P. Balasubrahmanyam",
  "Lata Mangeshkar",
  "Mohit Chauhan",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSong(id: number) {
  const language = randomItem(languages);
  const artist = randomItem(artists);
  const title = `${language} Song ${id}`;
  // Use royalty‑free sample audio URLs (SoundHelix provides 5 samples)
  const audioSamples = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  ];
  const cover = `https://picsum.photos/seed/${id}/400/400`;
  return {
    id: id.toString(),
    title,
    artist,
    cover,
    audio: randomItem(audioSamples),
    language,
    duration: Math.floor(Math.random() * 240) + 60, // 1‑4 min
  };
}

const total = 200; // number of placeholder songs
const songs = Array.from({ length: total }, (_, i) => generateSong(i + 1));

const outPath = resolve(process.cwd(), "artifacts", "api-server", "data", "songs.json");
writeFileSync(outPath, JSON.stringify(songs, null, 2), "utf-8");
console.log(`Generated ${total} songs to ${outPath}`);

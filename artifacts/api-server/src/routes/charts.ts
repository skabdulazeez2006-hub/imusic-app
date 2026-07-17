import { Router } from "express";
import { GetChartsQueryParams } from "@workspace/api-zod";

const router = Router();
const SAAVN_API = "https://saavn.sumit.co/api";

type SaavnImage = { quality: string; url: string };

type SaavnAlbumSearchResult = {
  id: string;
  name: string;
  year: string;
  language: string;
  songCount: number;
  url: string;
  image: SaavnImage[];
};

const CHART_QUERIES: Record<
  string,
  Array<{ name: string; query: string; language: string }>
> = {
  all: [
    { name: "Bollywood Top 50", query: "bollywood hits 2024", language: "hindi" },
    { name: "Tamil Cinema Hits", query: "kollywood tamil 2024", language: "tamil" },
    { name: "Telugu Blockbusters", query: "tollywood telugu 2024", language: "telugu" },
    { name: "Punjabi Bangers", query: "punjabi hits 2024", language: "punjabi" },
    { name: "Malayalam Melodies", query: "malayalam hits 2024", language: "malayalam" },
    { name: "Retro Classics", query: "classic bollywood 90s", language: "hindi" },
    { name: "Romantic Hits", query: "romantic hindi love songs", language: "hindi" },
    { name: "Dance Anthems", query: "dance bollywood party", language: "hindi" },
    { name: "Kannada Chart", query: "kannada hits 2024", language: "kannada" },
    { name: "Bengali Hits", query: "bengali hits 2024", language: "bengali" },
  ],
  hindi: [
    { name: "Bollywood Top 50", query: "bollywood hits 2024", language: "hindi" },
    { name: "Retro Classics", query: "classic bollywood 90s", language: "hindi" },
    { name: "Romantic Hits", query: "romantic hindi songs arijit", language: "hindi" },
    { name: "Dance Anthems", query: "dance bollywood party", language: "hindi" },
    { name: "Sad Songs", query: "sad hindi songs heartbreak", language: "hindi" },
    { name: "90s & 2000s", query: "90s bollywood kumar sanu", language: "hindi" },
  ],
  tamil: [
    { name: "Tamil Top 50", query: "kollywood tamil hits 2024", language: "tamil" },
    { name: "Vijay Hits", query: "thalapathy vijay tamil songs", language: "tamil" },
    { name: "ARR Classics", query: "ar rahman tamil songs", language: "tamil" },
    { name: "Anirudh Hits", query: "anirudh ravichander tamil", language: "tamil" },
    { name: "Rajini Songs", query: "rajinikanth tamil songs", language: "tamil" },
  ],
  telugu: [
    { name: "Telugu Top 50", query: "tollywood telugu hits 2024", language: "telugu" },
    { name: "Pushpa Hits", query: "pushpa telugu songs", language: "telugu" },
    { name: "RRR Hits", query: "rrr telugu songs", language: "telugu" },
    { name: "Allu Arjun Hits", query: "allu arjun telugu songs", language: "telugu" },
    { name: "DSP Hits", query: "devi sri prasad telugu songs", language: "telugu" },
  ],
  kannada: [
    { name: "Kannada Top 50", query: "kannada hits 2024", language: "kannada" },
    { name: "KGF Hits", query: "kgf kannada songs", language: "kannada" },
    { name: "Kantara Hits", query: "kantara kannada songs", language: "kannada" },
  ],
  malayalam: [
    { name: "Malayalam Top 50", query: "malayalam hits 2024", language: "malayalam" },
    { name: "Romantic Malayalam", query: "romantic malayalam songs", language: "malayalam" },
    { name: "Classic Malayalam", query: "classic malayalam songs", language: "malayalam" },
  ],
  punjabi: [
    { name: "Punjabi Top 50", query: "punjabi hits 2024", language: "punjabi" },
    { name: "AP Dhillon", query: "ap dhillon songs", language: "punjabi" },
    { name: "Diljit Dosanjh", query: "diljit dosanjh hits", language: "punjabi" },
  ],
  bengali: [
    { name: "Bengali Top Hits", query: "bengali hits 2024", language: "bengali" },
    { name: "Rabindra Sangeet", query: "rabindra sangeet", language: "bengali" },
  ],
  marathi: [
    { name: "Marathi Top Hits", query: "marathi hits 2024", language: "marathi" },
    { name: "Marathi Film Songs", query: "marathi film songs hits", language: "marathi" },
  ],
  english: [
    { name: "English Top 50", query: "pop hits 2024", language: "english" },
    { name: "R&B Hits", query: "rnb hits 2024", language: "english" },
  ],
};

router.get("/charts", async (req, res) => {
  const parse = GetChartsQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { language = "all" } = parse.data;
  const lang = (language || "all").toLowerCase();
  const chartDefs = CHART_QUERIES[lang] || CHART_QUERIES.all;

  try {
    const chartDef = chartDefs[0];
    const params = new URLSearchParams({
      query: chartDef.query,
      limit: "15",
    });

    const albumRes = await fetch(`${SAAVN_API}/search/albums?${params}`);

    let dynamicCharts: Record<string, unknown>[] = [];

    if (albumRes.ok) {
      const albumData = (await albumRes.json()) as {
        success: boolean;
        data?: { results?: SaavnAlbumSearchResult[] };
      };

      dynamicCharts = (albumData?.data?.results || []).slice(0, 8).map((album) => {
        const image =
          album.image?.find((i) => i.quality === "500x500")?.url ||
          album.image?.[album.image.length - 1]?.url ||
          "";

        return {
          id: album.id,
          name: album.name,
          image,
          language: (album.language || chartDef.language).toLowerCase(),
          songCount: album.songCount || 10,
        };
      });
    }

    const staticCharts = chartDefs.map((c) => ({
      id: `static-${c.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: c.name,
      image: "",
      language: c.language,
      songCount: 50,
    }));

    const charts = [...dynamicCharts, ...staticCharts].slice(0, 12);
    res.json({ charts });
  } catch {
    res.status(500).json({ error: "Failed to fetch charts" });
  }
});

export default router;

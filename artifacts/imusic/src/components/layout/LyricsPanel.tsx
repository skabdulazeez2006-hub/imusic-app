import { useEffect, useRef, useMemo } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { X, Music } from "lucide-react";
import { cn } from "@/lib/utils";

// Synced lyrics data for well-known Indian cinematic tracks
const LYRICS_DB: Record<string, { time: number; text: string }[]> = {
  kesariya: [
    { time: 0, text: "🎵 (Acoustic Guitar Intro) 🎵" },
    { time: 7, text: "Mujhpe jo tera rang lagaa..." },
    { time: 11, text: "Toh mai saara rang gayaa..." },
    { time: 15, text: "Sajda kiya hai maine tera..." },
    { time: 19, text: "Toh mai ibaadat ban gayaa..." },
    { time: 23, text: "Kesariya tera ishq hai piya..." },
    { time: 29, text: "Rang jaaun jo mai haath lagaaun..." },
    { time: 35, text: "Din beete saara teri fikr mein..." },
    { time: 41, text: "Rain saari teri khair manaaun..." },
    { time: 47, text: "Kesariya tera ishq hai piya..." },
    { time: 53, text: "Rang jaaun jo mai haath lagaaun..." },
    { time: 59, text: "🎵 (Melody Flute Interlude) 🎵" },
    { time: 67, text: "Ganga ke jaise paak hai tera man..." },
    { time: 71, text: "Kashi ke jaise sheetal hai ye badan..." },
    { time: 75, text: "Tu hai banaras ki meethi si subah..." },
    { time: 79, text: "Jis mein kho ke mai sab kuch bhulaa..." },
    { time: 83, text: "Kesariya tera ishq hai piya..." },
    { time: 89, text: "Rang jaaun jo mai haath lagaaun..." }
  ],
  naatu: [
    { time: 0, text: "🎵 (High Energy Cinematic Beats) 🎵" },
    { time: 6, text: "Poleroko nattu..." },
    { time: 9, text: "Vairapu nattu..." },
    { time: 12, text: "Kari kotte nattu..." },
    { time: 15, text: "Naatu naatu naatu nattu..." },
    { time: 18, text: "Veera naatu naatu..." },
    { time: 21, text: "Oora naatu naatu..." },
    { time: 24, text: "Dhummu lepe naatu..." },
    { time: 27, text: "Kaaraladige naatu naatu..." },
    { time: 30, text: "Kirru cheppu nattu..." },
    { time: 33, text: "Pachhi mirapa nattu..." },
    { time: 36, text: "Naatu naatu naatu naatu..." }
  ],
  tumhiho: [
    { time: 0, text: "🎵 (Piano Instrumental Intro) 🎵" },
    { time: 5, text: "Hum tere bin ab reh nahi sakte..." },
    { time: 11, text: "Tere bina kya wajood mera..." },
    { time: 17, text: "Tujhse juda agar ho jaayenge..." },
    { time: 23, text: "Toh khud se hi ho jaayenge judaa..." },
    { time: 29, text: "Kyunki tum hi ho..." },
    { time: 34, text: "Ab tum hi ho..." },
    { time: 37, text: "Zindagi ab tum hi ho..." },
    { time: 42, text: "Chain bhi, mera dard bhi..." },
    { time: 48, text: "Meri aashiqui ab tum hi ho..." }
  ],
  chaiyya: [
    { time: 0, text: "🎵 (Dholak Beats on Train Roof) 🎵" },
    { time: 6, text: "Jinke sar ho ishq ki chhaaon..." },
    { time: 10, text: "Paaon ke neeche jannat hogi..." },
    { time: 15, text: "Shaam raat meri mehboob ki..." },
    { time: 19, text: "Khushboo jaise narm hawaa..." },
    { time: 23, text: "Chal chaiyya chaiyya chaiyya chaiyya..." },
    { time: 29, text: "Chal chaiyya chaiyya chaiyya chaiyya..." },
    { time: 35, text: "Saare ishq ki chhaaon chal chaiyya..." }
  ],
  arabic: [
    { time: 0, text: "🎵 (Arabic Kuthu Club Beat) 🎵" },
    { time: 8, text: "Halamaithi habibo..." },
    { time: 11, text: "Halamaithi habibo..." },
    { time: 15, text: "Dilamenu dilamenu arabic kuthu..." },
    { time: 19, text: "Halamithi habibo halamithi..." },
    { time: 23, text: "Oru ponnu paatha pothum..." },
    { time: 26, text: "En nenju kulira koodum..." },
    { time: 29, text: "Arabic kuthu beats on fire..." }
  ]
};

export function LyricsPanel() {
  const { currentSong, progress, showLyrics, setShowLyrics } = usePlayer();
  const listRef = useRef<HTMLDivElement>(null);

  const lyrics = useMemo(() => {
    if (!currentSong) return [];
    const title = currentSong.name.toLowerCase();

    if (title.includes("kesariya")) return LYRICS_DB.kesariya;
    if (title.includes("naatu")) return LYRICS_DB.naatu;
    if (title.includes("tum hi ho")) return LYRICS_DB.tumhiho;
    if (title.includes("chaiyya")) return LYRICS_DB.chaiyya;
    if (title.includes("arabic") || title.includes("kuthu") || title.includes("beast")) return LYRICS_DB.arabic;

    // Fallback scrolling guidelines based on language
    const lang = currentSong.language || "hindi";
    return [
      { time: 0, text: `🎵 Listening to "${currentSong.name}" 🎵` },
      { time: 4, text: `Vocals by ${currentSong.artists.join(", ")}` },
      { time: 10, text: "Let the sound wash over you..." },
      { time: 16, text: "This cinema score brings stories to life..." },
      { time: 24, text: "🎵 (Beautiful Orchestral Solo) 🎵" },
      { time: 34, text: "Enjoy the rhythm and the base..." },
      { time: 42, text: "Singing in the melodies of life..." },
      { time: 50, text: "🎵 (Music Interlude) 🎵" },
      { time: 62, text: "Persisting in your favorite lists..." },
      { time: 74, text: "Curated with love by iMusic Hub." }
    ];
  }, [currentSong]);

  // Find active line index
  const activeIndex = useMemo(() => {
    let index = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (progress >= lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [lyrics, progress]);

  // Scroll active line to center
  useEffect(() => {
    if (listRef.current) {
      const container = listRef.current;
      const activeElement = container.children[activeIndex] as HTMLElement;
      if (activeElement) {
        container.scrollTo({
          top: activeElement.offsetTop - container.clientHeight / 2 + activeElement.clientHeight / 2,
          behavior: "smooth"
        });
      }
    }
  }, [activeIndex]);

  if (!showLyrics) return null;

  return (
    <div className="w-80 md:w-96 bg-card border-l border-border/40 flex flex-col h-full shrink-0 relative z-30 transition-all duration-300 animate-in slide-in-from-right">
      {/* Background Cover Blur */}
      {currentSong?.image && (
        <div 
          className="absolute inset-0 bg-cover bg-center blur-[120px] opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${currentSong.image})` }}
        />
      )}

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/30 backdrop-blur bg-background/40">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-foreground">Synced Lyrics</span>
        </div>
        <button 
          onClick={() => setShowLyrics(false)}
          className="text-muted-foreground hover:text-foreground transition p-1 hover:bg-secondary/40 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Lyrics Box */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto px-6 py-32 space-y-6 scrollbar-thin select-none"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div 
              key={idx}
              className={cn(
                "transition-all duration-300 origin-left py-1 text-base md:text-lg font-bold leading-relaxed cursor-pointer",
                isActive 
                  ? "text-primary scale-105 filter drop-shadow-[0_0_8px_rgba(124,58,237,0.5)] opacity-100" 
                  : "text-muted-foreground/60 hover:text-muted-foreground opacity-60"
              )}
              style={{ scrollSnapAlign: "center" }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetTrendingSongs, useGetTrendingAlbums, useGetCharts } from "@workspace/api-client-react";
import { SongCard } from "@/components/shared/SongCard";
import { AlbumCard } from "@/components/shared/AlbumCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { Heart, Zap, Clock, Flame, Star, Droplets, Music2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { id: "all", label: "All" },
  { id: "hindi", label: "Hindi" },
  { id: "tamil", label: "Tamil" },
  { id: "telugu", label: "Telugu" },
  { id: "malayalam", label: "Malayalam" },
  { id: "kannada", label: "Kannada" },
  { id: "punjabi", label: "Punjabi" },
  { id: "bengali", label: "Bengali" },
  { id: "marathi", label: "Marathi" },
  { id: "english", label: "English" },
];

const MOODS = [
  { name: "Romantic", icon: Heart, q: "romantic love", bg: "from-rose-900/80 to-rose-600/20" },
  { name: "Party", icon: Zap, q: "party dance", bg: "from-yellow-900/80 to-yellow-600/20" },
  { name: "Retro", icon: Clock, q: "retro classic", bg: "from-indigo-900/80 to-indigo-600/20" },
  { name: "Workout", icon: Flame, q: "workout energy", bg: "from-green-900/80 to-green-600/20" },
  { name: "Devotional", icon: Star, q: "devotional spiritual", bg: "from-orange-900/80 to-orange-600/20" },
  { name: "Sad", icon: Droplets, q: "sad heartbreak", bg: "from-blue-900/80 to-blue-600/20" },
  { name: "Dance", icon: Music2, q: "dance beats", bg: "from-purple-900/80 to-purple-600/20" },
  { name: "Study", icon: BookOpen, q: "calm study", bg: "from-slate-900/80 to-slate-600/20" },
];

export default function Home() {
  const [selectedLang, setSelectedLang] = useState("all");
  const [, setLocation] = useLocation();

  const { data: trendingSongsData, isLoading: isLoadingSongs } = useGetTrendingSongs({ language: selectedLang === "all" ? undefined : selectedLang, limit: 12 });
  const { data: newReleasesData, isLoading: isLoadingNew } = useGetTrendingSongs({ language: selectedLang === "all" ? "tamil" : selectedLang, limit: 10 });
  const { data: trendingAlbumsData, isLoading: isLoadingAlbums } = useGetTrendingAlbums({ language: selectedLang === "all" ? undefined : selectedLang, limit: 8 });
  const { data: chartsData } = useGetCharts({ language: selectedLang === "all" ? undefined : selectedLang });

  return (
    <AppLayout>
      <div className="px-6 py-6 md:px-8 space-y-10">
        
        {/* SECTION 1 — HERO */}
        <section className="relative w-full h-[42vh] min-h-[280px] rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=2000&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover"
            alt="Hero Cinematic"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10" />
          
          <div className="absolute bottom-8 left-8 z-20 max-w-xl">
            <span className="inline-block px-3 py-1 border border-violet-500 text-violet-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Featured
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-3">
              Sounds of Cinema
            </h1>
            <p className="text-muted-foreground text-lg mb-6 max-w-md">
              The biggest hits from Indian cinema, curated for you. Deep dive into the melodies of blockbuster movies.
            </p>
            <div className="flex gap-3">
              <button className="bg-gradient-to-r from-violet-600 to-violet-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:scale-105 transition-all">
                Play Now
              </button>
              <button className="border border-white/30 text-white px-6 py-3 rounded-full hover:bg-white/10 transition">
                Explore
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2 — LANGUAGE PILLS */}
        <section className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => {
            const isActive = selectedLang === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm transition-all",
                  isActive 
                    ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] scale-105 font-semibold" 
                    : "border border-violet-900/40 text-muted-foreground hover:text-foreground hover:border-violet-600/50"
                )}
              >
                {lang.label}
              </button>
            );
          })}
        </section>

        {/* SECTION 3 — TRENDING SONGS */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
            <Link href="/search" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">See all</Link>
          </div>
          {isLoadingSongs ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {trendingSongsData?.songs?.slice(0, 5).map((song) => (
                <SongCard key={song.id} song={song} queue={trendingSongsData?.songs ?? []} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 4 — NEW RELEASES */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">New Releases</h2>
          {isLoadingNew ? (
            <div className="flex overflow-x-auto gap-4 pb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3 min-w-[160px] flex-shrink-0">
                  <Skeleton className="w-full aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4">
              { (newReleasesData?.songs?.slice(0, 8) ?? []).map((song) => (
                <div key={song.id} className="min-w-[160px] flex-shrink-0">
                  <SongCard song={song} queue={newReleasesData?.songs ?? []} />
                </div>
              )) }
            </div>
          )}
        </section>

        {/* SECTION 5 — FEATURED ALBUMS */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Featured Albums</h2>
          {isLoadingAlbums ? (
            <div className="flex overflow-x-auto gap-4 pb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3 min-w-[160px] flex-shrink-0">
                  <Skeleton className="w-full aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4">
              { (trendingAlbumsData?.albums?.slice(0, 8) ?? []).map((album) => (
                <div key={album.id} className="min-w-[160px] flex-shrink-0">
                  <AlbumCard album={album} />
                </div>
              )) }
            </div>
          )}
        </section>

        {/* SECTION 6 — MOODS & VIBES */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Moods & Vibes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOODS.map((mood, idx) => (
              <div 
                key={idx}
                onClick={() => setLocation(`/search?q=${encodeURIComponent(mood.q)}`)}
                className={cn("relative h-24 rounded-xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform bg-gradient-to-br", mood.bg)}
              >
                <mood.icon className="absolute top-3 right-3 w-5 h-5 text-white/60" />
                <span className="absolute bottom-3 left-3 font-bold text-sm text-white">{mood.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7 — CHARTS STRIP */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Charts by Language</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(chartsData?.charts ?? []).slice(0, 4).map((chart) => (
              <Link href="/charts" key={chart.id}>
                <div className="relative group overflow-hidden rounded-xl h-32 cursor-pointer border border-border hover:border-violet-500/50 transition-colors">
                  <img src={chart.image} alt={chart.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{chart.language}</span>
                    <h3 className="text-lg font-bold text-white">{chart.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
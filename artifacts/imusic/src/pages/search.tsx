import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGlobalSearch, useGetTrendingSongs, getGlobalSearchQueryKey } from "@workspace/api-client-react";
import { AlbumCard } from "@/components/shared/AlbumCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useDebounce } from "@/hooks/use-debounce";
import { usePlayer } from "@/context/PlayerContext";
import { formatDuration, cn } from "@/lib/utils";

const LANGUAGES = ["All","Hindi","Tamil","Telugu","Malayalam","Kannada","Punjabi","Bengali","Marathi","English"];

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLang, setActiveLang] = useState("All");

  const { playSong, currentSong, isPlaying } = usePlayer();

  // Listen to popstate or initialize from URL query param
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || "";
      setQuery(q);
      setSearchQuery(q);
    };

    // Initial check
    handleUrlChange();

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  // Debounce the input query
  const debouncedQuery = useDebounce(query, 500);

  // Sync debounced query to searchQuery
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery]);

  // Sync searchQuery back to URL search params (using replaceState to not pollute history)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentQ = params.get("q") || "";
    if (searchQuery !== currentQ) {
      const newPath = searchQuery 
        ? `/search?q=${encodeURIComponent(searchQuery)}` 
        : `/search`;
      window.history.replaceState(null, "", newPath);
    }
  }, [searchQuery]);

  // Immediate triggers
  const triggerSearch = () => {
    setSearchQuery(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      triggerSearch();
    }
  };

  // Build API query string by appending language if active
  const queryToSend = useMemo(() => {
    if (!searchQuery.trim()) return "";
    return activeLang === "All" 
      ? searchQuery 
      : `${searchQuery} ${activeLang.toLowerCase()}`;
  }, [searchQuery, activeLang]);

  // Query JioSaavn global search API
  const { data: searchResult, isLoading: isLoadingSearch } = useGlobalSearch(
    { q: queryToSend },
    {
      query: {
        enabled: searchQuery.trim().length > 0,
        queryKey: getGlobalSearchQueryKey({ q: queryToSend }),
      }
    }
  );

  // Fallback trending recommendation query when search is empty
  const { data: trendingSongsData, isLoading: isLoadingTrending } = useGetTrendingSongs({ 
    language: activeLang === "All" ? undefined : activeLang.toLowerCase(),
    limit: 20 
  });

  const filteredSongs = searchQuery.trim().length > 0 
    ? (searchResult?.songs || []) 
    : (trendingSongsData?.songs || []);

  const filteredAlbums = searchQuery.trim().length > 0 
    ? (searchResult?.albums || []) 
    : [];

  const filteredArtists = searchQuery.trim().length > 0 
    ? (searchResult?.artists || []) 
    : [];

  const isLoading = searchQuery.trim().length > 0 ? isLoadingSearch : isLoadingTrending;

  return (
    <AppLayout>
      <div className="px-6 py-8 md:px-8 space-y-8">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur py-4 -mx-6 px-6 md:-mx-8 md:px-8 border-b border-border/50">
          <div className="relative max-w-2xl">
            <button 
              onClick={triggerSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for songs, artists, or albums..."
              className="pl-12 py-6 bg-secondary/50 border-transparent focus-visible:ring-violet-500 focus-visible:border-transparent text-lg rounded-full glow-primary"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const isActive = activeLang === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm transition-all",
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] scale-105 font-semibold"
                      : "border border-violet-900/40 text-muted-foreground hover:text-foreground hover:border-violet-600/50"
                  )}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-12 animate-pulse">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 bg-violet-900/10" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg bg-violet-900/10" />
                ))}
              </div>
            </div>
            {searchQuery.trim().length > 0 && (
              <>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48 bg-violet-900/10" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square w-full rounded-xl bg-violet-900/10" />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48 bg-violet-900/10" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-44 w-full rounded-full bg-violet-900/10" />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Artists Section */}
            {filteredArtists.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold tracking-tight mb-6">Artists</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {filteredArtists.slice(0, 6).map((artist) => (
                    <Link key={artist.id} href={`/artist/${artist.id}`}>
                      <div className="bg-card/45 hover:bg-card/90 border border-border/40 hover:border-violet-500/30 p-4 rounded-2xl cursor-pointer group transition-all duration-300 hover:scale-[1.03] text-center shadow-lg">
                        <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden shadow-md border-2 border-border/40 group-hover:border-violet-500/50 transition-colors">
                          <img 
                            src={artist.image || "https://placehold.co/150?text=Artist"} 
                            alt={artist.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                        <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {artist.name}
                        </h3>
                        <span className="text-xs text-muted-foreground mt-1.5 inline-block capitalize bg-secondary/60 px-2.5 py-0.5 rounded-full border border-border/30">
                          {artist.role || "Artist"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Songs Section */}
            {filteredSongs.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold tracking-tight mb-6">
                  {searchQuery.trim().length > 0 ? "Songs" : "Trending Today"}
                </h2>
                <div className="space-y-1">
                  {filteredSongs.map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, filteredSongs)}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer group transition-colors",
                          isCurrent ? "bg-secondary/40" : "hover:bg-card"
                        )}
                      >
                        <div className="w-6 text-xs text-muted-foreground text-center">
                          {isCurrent && isPlaying ? (
                            <div className="flex gap-[2px] items-end justify-center h-4 w-4 mx-auto">
                              <div className="w-1 bg-primary animate-[bounce_1s_infinite] h-2" />
                              <div className="w-1 bg-primary animate-[bounce_1.2s_infinite] h-4" />
                              <div className="w-1 bg-primary animate-[bounce_0.8s_infinite] h-3" />
                            </div>
                          ) : (
                            <span className="group-hover:hidden">{index + 1}</span>
                          )}
                          <Play
                            className={cn(
                              "w-4 h-4 fill-current mx-auto",
                              isCurrent && isPlaying ? "hidden" : "hidden group-hover:block text-foreground"
                            )}
                          />
                        </div>
                        <img src={song.image} alt={song.name} className="w-10 h-10 rounded-md object-cover" />
                        <div className="w-1/3 truncate">
                          <div className={cn("text-sm font-medium truncate", isCurrent ? "text-primary" : "text-foreground")}>
                            {song.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {song.artists.join(", ")}
                          </div>
                        </div>
                        <div className="hidden md:block flex-1 text-xs text-muted-foreground truncate">
                          {song.albumName || "Single"}
                        </div>
                        <div className="text-xs text-muted-foreground w-12 text-right">
                          {formatDuration(song.duration)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Albums Section */}
            {filteredAlbums.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold tracking-tight mb-6">Albums & Movies</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {filteredAlbums.slice(0, 6).map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
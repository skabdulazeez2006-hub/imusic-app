import { Link, useLocation } from "wouter";
import { Home, Search, BarChart2, Heart, ListMusic, Plus, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePlaylists } from "@/context/PlaylistContext";
import { usePlayer } from "@/context/PlayerContext";

export function Sidebar() {
  const [location] = useLocation();
  const { playlists, createPlaylist } = usePlaylists();
  const { currentSong, isPlaying, showQueue, setShowQueue, setShowLyrics } = usePlayer();

  return (
    <div className="flex h-full w-60 flex-col bg-sidebar border-r border-sidebar-border relative">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <Music2 className="w-8 h-8 text-primary" />
          <span className="bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent font-bold text-xl tracking-tight">
            iMusic
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4 mb-20">
        <div className="space-y-1 py-2">
          <h2 className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Discover
          </h2>
          <Link href="/">
            <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer", location === "/" ? "bg-sidebar-accent text-primary border-l-2 border-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
              <Home className="h-4 w-4" /> Home
            </div>
          </Link>
          <Link href="/search">
            <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer", location === "/search" ? "bg-sidebar-accent text-primary border-l-2 border-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
              <Search className="h-4 w-4" /> Search
            </div>
          </Link>
          <Link href="/charts">
            <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer", location === "/charts" ? "bg-sidebar-accent text-primary border-l-2 border-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
              <BarChart2 className="h-4 w-4" /> Charts
            </div>
          </Link>
        </div>

        <div className="space-y-1 py-4">
          <h2 className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Your Library
          </h2>
          <Link href="/playlist/liked">
            <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer", location === "/playlist/liked" ? "bg-sidebar-accent text-primary border-l-2 border-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
              <Heart className="h-4 w-4" /> Liked Songs
            </div>
          </Link>
          <div 
            onClick={() => {
              setShowQueue(!showQueue);
              setShowLyrics(false);
            }}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer", showQueue ? "bg-sidebar-accent text-primary border-l-2 border-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}
          >
            <ListMusic className="h-4 w-4" /> Queue
          </div>
        </div>

        <Separator className="my-4 border-sidebar-border/50" />
        
        <div className="space-y-1 py-2">
          <div className="flex items-center justify-between px-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Playlists
            </h2>
            <button onClick={() => createPlaylist("My Playlist " + (playlists.length + 1))} className="text-muted-foreground hover:text-foreground">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {playlists.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">No playlists yet</div>
          ) : (
            playlists.map((pl) => (
              <Link key={pl.id} href={`/playlist/${pl.id}`}>
                <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer", location === `/playlist/${pl.id}` ? "bg-sidebar-accent text-primary border-l-2 border-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
                  <ListMusic className="h-4 w-4 shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Mini Now Playing Strip */}
      {currentSong && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <img src={currentSong.image || "https://placehold.co/400"} alt={currentSong.name} className="w-8 h-8 rounded shrink-0 object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{currentSong.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{currentSong.artists.join(", ")}</div>
            </div>
            {isPlaying && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
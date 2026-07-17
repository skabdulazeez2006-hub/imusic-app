import { usePlayer } from "@/context/PlayerContext";
import { X, Play, Trash2, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";

export function QueuePanel() {
  const { 
    currentSong, 
    queue, 
    currentIndex, 
    isPlaying, 
    playSong, 
    setQueue, 
    setCurrentIndex, 
    showQueue, 
    setShowQueue 
  } = usePlayer();

  const handlePlaySong = (song: any, idx: number) => {
    setCurrentIndex(idx);
    playSong(song);
  };

  const handleClearQueue = () => {
    if (currentSong) {
      // Keep only current song in queue
      setQueue([currentSong]);
      setCurrentIndex(0);
    } else {
      setQueue([]);
      setCurrentIndex(-1);
    }
  };

  if (!showQueue) return null;

  // Filter next songs
  const nextUp = queue.slice(currentIndex + 1);

  return (
    <div className="w-80 md:w-96 bg-card border-l border-border/40 flex flex-col h-full shrink-0 relative z-30 transition-all duration-300 animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/30 backdrop-blur bg-background/40">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-foreground">Play Queue</span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <button 
              onClick={handleClearQueue}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 px-2 py-1 hover:bg-secondary/40 rounded-md"
              title="Clear Queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button 
            onClick={() => setShowQueue(false)}
            className="text-muted-foreground hover:text-foreground transition p-1 hover:bg-secondary/40 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
        {/* NOW PLAYING */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">Now Playing</h3>
          {currentSong ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/40 border border-violet-500/10">
              <img 
                src={currentSong.image || "https://placehold.co/400?text=No+Cover"} 
                alt={currentSong.name} 
                className="w-12 h-12 rounded object-cover shadow"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-primary truncate">{currentSong.name}</div>
                <div className="text-xs text-muted-foreground truncate">{currentSong.artists.join(", ")}</div>
              </div>
              {isPlaying && (
                <div className="flex gap-[2px] items-end h-4 w-4 shrink-0 mr-2">
                  <div className="w-[3px] bg-primary animate-[bounce_1s_infinite] h-2"></div>
                  <div className="w-[3px] bg-primary animate-[bounce_1.2s_infinite] h-4"></div>
                  <div className="w-[3px] bg-primary animate-[bounce_0.8s_infinite] h-3"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground px-2 italic">Nothing playing</div>
          )}
        </div>

        {/* NEXT UP */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">Next Up</h3>
          {nextUp.length === 0 ? (
            <div className="text-xs text-muted-foreground px-2 py-4 italic border border-dashed border-border/30 rounded-lg text-center">
              Queue is empty. Add songs from cards!
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((song, idx) => {
                // Only show songs after current index
                if (idx <= currentIndex) return null;

                return (
                  <div 
                    key={song.id + idx}
                    onClick={() => handlePlaySong(song, idx)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-card border border-transparent hover:border-border/30 transition cursor-pointer group"
                  >
                    <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden shadow">
                      <img 
                        src={song.image || "https://placehold.co/400?text=No+Cover"} 
                        alt={song.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{song.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{song.artists.join(", ")}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground px-2 shrink-0">
                      #{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

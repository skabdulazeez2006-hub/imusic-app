import { usePlayer } from "@/context/PlayerContext";
import { usePlaylists } from "@/context/PlaylistContext";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Heart, ListMusic, Maximize2 } from "lucide-react";
import { formatDuration, cn } from "@/lib/utils";

export function PlayerBar() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause, 
    playNext, 
    playPrev, 
    progress, 
    duration, 
    seekTo,
    volume,
    setVolume,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    showQueue,
    setShowQueue,
    showLyrics,
    setShowLyrics
  } = usePlayer();

  const { toggleLikeSong, isSongLiked } = usePlaylists();
  const isLiked = currentSong ? isSongLiked(currentSong.id) : false;

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[90px] z-50 glass border-t border-violet-900/30">
      <div 
        className="absolute top-0 left-0 h-[2px] bg-violet-600 transition-all duration-100 ease-linear"
        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
      />
      
      <div className="flex items-center px-4 md:px-6 justify-between h-full">
        {/* LEFT */}
        <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
          <div className="w-14 h-14 rounded-lg overflow-hidden relative shadow-[0_0_15px_rgba(124,58,237,0.4)] shrink-0">
            <img 
              src={currentSong.image || "https://placehold.co/400"} 
              alt={currentSong.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col truncate pr-2">
            <span className="font-semibold text-sm text-white truncate">
              {currentSong.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {currentSong.artists.join(", ")}
            </span>
          </div>
          <button 
            onClick={() => toggleLikeSong(currentSong)}
            className={cn("text-muted-foreground hover:text-white transition ml-2", isLiked && "text-primary")}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-primary")} />
          </button>
        </div>

        {/* CENTER */}
        <div className="flex-1 max-w-[480px] mx-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-5">
            <button onClick={toggleShuffle} className={cn("text-muted-foreground hover:text-white transition", isShuffle && "text-primary")}>
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={playPrev} className="text-muted-foreground hover:text-white transition">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={togglePlayPause}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <button onClick={() => playNext(false)} className="text-muted-foreground hover:text-white transition">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={cycleRepeatMode} 
              className={cn("text-muted-foreground hover:text-white transition relative", repeatMode !== "off" && "text-primary")}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === "one" && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary text-primary-foreground w-2.5 h-2.5 rounded-full flex items-center justify-center">1</span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 w-full text-xs text-muted-foreground">
            <span className="w-10 text-right">{formatDuration(progress)}</span>
            <Slider 
              value={[progress]} 
              max={duration || 100} 
              step={1}
              onValueChange={(val) => seekTo(val[0])}
              className="flex-1"
            />
            <span className="w-10">{formatDuration(duration || currentSong.duration)}</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-5 w-1/4 min-w-[150px]">
          <button 
            onClick={() => {
              setShowQueue(!showQueue);
              setShowLyrics(false);
            }}
            className={cn("text-muted-foreground hover:text-white transition", showQueue && "text-primary")}
            title="Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 w-28">
            <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-muted-foreground hover:text-white transition">
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <Slider 
              value={[volume]} 
              max={1} 
              step={0.01}
              onValueChange={(val) => setVolume(val[0])}
              className="w-20"
            />
          </div>
          <button 
            onClick={() => {
              setShowLyrics(!showLyrics);
              setShowQueue(false);
            }}
            className={cn("text-muted-foreground hover:text-white transition", showLyrics && "text-primary")}
            title="Lyrics"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
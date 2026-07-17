import { useState, useEffect } from "react";
import { Song } from "@workspace/api-client-react";
import { Play, MoreVertical, Heart } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylists } from "@/context/PlaylistContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SongCardProps {
  song: Song;
  queue?: Song[];
}

export function SongCard({ song, queue }: SongCardProps) {
  const { playSong, currentSong, isPlaying, addToQueue } = usePlayer();
  const { playlists, addSongToPlaylist, toggleLikeSong, isSongLiked } = usePlaylists();
  const [showMenu, setShowMenu] = useState(false);
  const isCurrentSong = currentSong?.id === song.id;
  const isLiked = isSongLiked(song.id);

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group relative rounded-xl p-3 cursor-pointer transition-all hover:bg-card"
      onClick={() => playSong(song, queue)}
    >
      <div className="relative aspect-square w-full mb-3 rounded-lg overflow-hidden shadow-md">
        <img 
          src={song.image || "https://placehold.co/400?text=No+Cover"} 
          alt={song.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {song.language && (
          <div className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded-full z-10">
            {song.language}
          </div>
        )}

        <div className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center ${isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg transition-transform ${isCurrentSong ? 'translate-y-0' : 'translate-y-2 group-hover:translate-y-0'}`}>
            {isCurrentSong && isPlaying ? (
              <div className="flex gap-[2px] items-end h-4 w-4">
                <div className="w-1 bg-white animate-[bounce_1s_infinite] h-2"></div>
                <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-4"></div>
                <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-3"></div>
              </div>
            ) : (
              <Play className="w-5 h-5 fill-current text-white ml-0.5" />
            )}
          </div>
        </div>

        <div 
          className={cn("absolute top-2 right-2 transition-opacity z-20 flex gap-1.5", isLiked ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <button 
            className="w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 hover:scale-105 transition-all"
            onClick={() => toggleLikeSong(song)}
          >
            <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-primary text-primary" : "")} />
          </button>
          <button 
            className="w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 hover:scale-105 transition-all"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {showMenu && (
          <div 
            className="absolute top-8 right-2 z-50 bg-popover border border-border rounded-lg shadow-xl py-1 min-w-[160px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
              onClick={() => {
                addToQueue(song);
                setShowMenu(false);
              }}
            >
              Add to Queue
            </button>
            <button 
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-center justify-between"
              onClick={() => {
                toggleLikeSong(song);
                setShowMenu(false);
              }}
            >
              <span>{isLiked ? "Unlike" : "Like Song"}</span>
              <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-primary text-primary" : "")} />
            </button>
            <div className="h-px bg-border my-1" />
            <div className="px-3 py-1 text-xs text-muted-foreground">Add to Playlist:</div>
            {playlists.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">No playlists</div>
            ) : (
              playlists.map(pl => (
                <button
                  key={pl.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors truncate"
                  onClick={() => {
                    addSongToPlaylist(pl.id, song);
                    setShowMenu(false);
                  }}
                >
                  {pl.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className={`font-semibold text-sm leading-snug line-clamp-2 ${isCurrentSong ? 'text-primary' : 'text-foreground'}`}>
          {song.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {song.artists.join(", ")}
        </p>
      </div>
    </motion.div>
  );
}
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePlaylists } from "@/context/PlaylistContext";
import { usePlayer } from "@/context/PlayerContext";
import { useRoute, useLocation } from "wouter";
import { Play, Clock, X, Edit2, Heart } from "lucide-react";
import { formatDuration, cn } from "@/lib/utils";

export default function Playlist() {
  const [match, params] = useRoute("/playlist/:id");
  const [, setLocation] = useLocation();
  const { playlists, likedSongs, deletePlaylist, removeSongFromPlaylist, toggleLikeSong } = usePlaylists();
  const { playSong, currentSong, isPlaying } = usePlayer();
  
  const isLikedPage = params?.id === "liked";
  const playlist = isLikedPage 
    ? {
        id: "liked",
        name: "Liked Songs",
        songs: likedSongs,
        createdAt: Date.now()
      }
    : playlists.find(p => p.id === params?.id);
    
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(playlist?.name || "");

  useEffect(() => {
    if (playlist) {
      setName(playlist.name);
    }
  }, [playlist?.id]);

  if (!playlist) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-muted-foreground">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Playlist not found</h2>
          <button onClick={() => setLocation("/")} className="text-primary hover:underline">Go back home</button>
        </div>
      </AppLayout>
    );
  }

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleDelete = () => {
    if (isLikedPage) return;
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist(playlist.id);
      setLocation("/");
    }
  };

  const totalDuration = playlist.songs.reduce((acc, song) => acc + (song.duration || 0), 0);

  return (
    <AppLayout>
      <div className="relative">
        <div className={cn(
          "h-56 px-6 py-8 md:px-8 flex flex-col justify-end bg-gradient-to-br transition-all duration-500",
          isLikedPage ? "from-violet-950 via-rose-950 to-card" : "from-violet-900 to-violet-600"
        )}>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-200 mb-2">
            {isLikedPage ? "Your Library" : "Playlist"}
          </span>
          
          <div className="flex items-center gap-3">
            {isEditing && !isLikedPage ? (
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  playlist.name = name; // In real app, we'd update context
                  setIsEditing(false);
                }}
                autoFocus
                className="bg-black/20 text-white text-4xl md:text-6xl font-black rounded-lg px-2 outline-none focus:ring-2 focus:ring-violet-400 max-w-2xl"
              />
            ) : (
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight flex items-center gap-3">
                {isLikedPage && <Heart className="w-10 h-10 md:w-14 md:h-14 fill-primary text-primary shrink-0" />}
                {playlist.name}
              </h1>
            )}
            {!isLikedPage && (
              <button onClick={() => setIsEditing(!isEditing)} className="text-white/60 hover:text-white mt-4">
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mt-4 text-violet-200 text-sm font-semibold">
            {playlist.songs.length} songs • {Math.floor(totalDuration / 60)} min
          </div>
        </div>

        <div className="px-6 py-8 md:px-8 max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={handlePlayAll}
              disabled={playlist.songs.length === 0}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:hover:scale-100"
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </button>
            {!isLikedPage && (
              <button 
                onClick={handleDelete}
                className="text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
              >
                Delete Playlist
              </button>
            )}
          </div>

          {playlist.songs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border/30 rounded-xl max-w-lg mx-auto">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm font-medium">This list is empty.</p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                {isLikedPage ? "Heart songs from search or trending lists to save them here." : "Add songs to this playlist from any song card menu."}
              </p>
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-[auto_1fr_80px] md:grid-cols-[auto_1fr_1fr_80px_40px] gap-4 text-muted-foreground text-sm border-b border-border/50 pb-2 mb-4 px-4">
                <div className="w-6 text-center">#</div>
                <div>Title</div>
                <div className="hidden md:block">Artist</div>
                <div className="text-right"><Clock className="w-4 h-4 ml-auto" /></div>
                <div></div>
              </div>
              
              <div className="space-y-1">
                {playlist.songs.map((song, index) => {
                  const isCurrent = currentSong?.id === song.id;
                  
                  return (
                    <div 
                      key={song.id + index}
                      className={cn("grid grid-cols-[auto_1fr_80px] md:grid-cols-[auto_1fr_1fr_80px_40px] gap-4 items-center px-4 py-3 rounded-lg hover:bg-card transition-colors group", isCurrent ? "bg-secondary/40" : "")}
                    >
                      <div className="w-6 text-xs text-muted-foreground text-center" onClick={() => playSong(song, playlist.songs)}>
                        {isCurrent && isPlaying ? (
                          <div className="flex gap-[2px] items-end justify-center h-4 w-4 mx-auto cursor-pointer">
                            <div className="w-1 bg-primary animate-[bounce_1s_infinite] h-2"></div>
                            <div className="w-1 bg-primary animate-[bounce_1.2s_infinite] h-4"></div>
                            <div className="w-1 bg-primary animate-[bounce_0.8s_infinite] h-3"></div>
                          </div>
                        ) : (
                          <span className="group-hover:hidden cursor-pointer">{index + 1}</span>
                        )}
                        <Play className={cn("w-4 h-4 fill-current mx-auto cursor-pointer", isCurrent && isPlaying ? "hidden" : "hidden group-hover:block text-foreground")} />
                      </div>
                      
                      <div className="flex items-center gap-3 truncate cursor-pointer" onClick={() => playSong(song, playlist.songs)}>
                        <img src={song.image} alt={song.name} className="w-10 h-10 rounded-md object-cover" />
                        <div className="truncate">
                          <div className={cn("font-medium text-sm truncate", isCurrent ? "text-primary" : "text-foreground")}>{song.name}</div>
                          <div className="md:hidden text-xs text-muted-foreground truncate">{song.artists.join(", ")}</div>
                        </div>
                      </div>
                      
                      <div className="hidden md:block text-xs text-muted-foreground truncate cursor-pointer" onClick={() => playSong(song, playlist.songs)}>
                        {song.artists.join(", ")}
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        {formatDuration(song.duration)}
                      </div>
 
                      <div className="text-right">
                        <button 
                          onClick={() => {
                            if (isLikedPage) {
                              toggleLikeSong(song);
                            } else {
                              removeSongFromPlaylist(playlist.id, song.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          title={isLikedPage ? "Unlike" : "Remove"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
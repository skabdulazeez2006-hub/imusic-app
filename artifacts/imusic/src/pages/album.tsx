import { AppLayout } from "@/components/layout/AppLayout";
import { useGetAlbum, getGetAlbumQueryKey } from "@workspace/api-client-react";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Clock, Heart } from "lucide-react";
import { formatDuration, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Album({ params }: { params: { id: string } }) {
  const id = params.id;
  
  const { data: album, isLoading, error } = useGetAlbum(id, {
    query: { enabled: !!id, queryKey: getGetAlbumQueryKey(id) }
  });

  const { playSong, currentSong, isPlaying } = usePlayer();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="px-6 py-8 md:px-8 max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <Skeleton className="w-64 h-64 rounded-xl shadow-2xl shrink-0" />
            <div className="space-y-4 w-full">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !album) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-destructive">Failed to load album.</div>
      </AppLayout>
    );
  }

  const handlePlayAll = () => {
    if (album.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  const totalDuration = album.songs?.reduce((acc, song) => acc + song.duration, 0) || 0;

  return (
    <AppLayout>
      <div className="relative">
        <div 
          className="absolute inset-0 h-[400px] w-full overflow-hidden opacity-30 blur-3xl saturate-[2] pointer-events-none"
          style={{ 
            backgroundImage: `url(${album.image})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
          }} 
        />
        
        <div className="px-6 py-12 md:px-8 max-w-6xl mx-auto relative z-10 space-y-8">
          
          <div className="flex flex-col md:flex-row gap-8 items-end mb-8">
            <div className="w-64 h-64 max-w-[240px] shrink-0 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
              <img src={album.image} alt={album.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3">
              <span className="uppercase tracking-widest text-xs font-bold text-violet-400">Album</span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">{album.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {album.artists?.map((artist, idx) => (
                  <span key={artist} className="font-bold text-foreground">{artist}{idx < album.artists.length - 1 ? ',' : ''}</span>
                ))}
                <span>•</span>
                <span>{album.year}</span>
                <span>•</span>
                <span className="uppercase">{album.language}</span>
                <span>•</span>
                <span>{album.songs?.length || 0} songs, {Math.floor(totalDuration / 60)} min</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <button 
              onClick={handlePlayAll}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-[auto_1fr_80px] md:grid-cols-[auto_1fr_1fr_80px] gap-4 text-muted-foreground text-sm border-b border-border/50 pb-2 mb-4 px-4">
              <div className="w-6 text-center">#</div>
              <div>Title</div>
              <div className="hidden md:block">Artist</div>
              <div className="text-right"><Clock className="w-4 h-4 ml-auto" /></div>
            </div>
            
            <div className="space-y-1">
              {album.songs?.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                
                return (
                  <div 
                    key={song.id} 
                    onClick={() => playSong(song, album.songs)}
                    className={cn("grid grid-cols-[auto_1fr_80px] md:grid-cols-[auto_1fr_1fr_80px] gap-4 items-center px-4 py-3 rounded-lg hover:bg-card cursor-pointer transition-colors group", isCurrent ? "bg-secondary/40" : "")}
                  >
                    <div className="w-6 text-xs text-muted-foreground text-center">
                      {isCurrent && isPlaying ? (
                        <div className="flex gap-[2px] items-end justify-center h-4 w-4 mx-auto">
                          <div className="w-1 bg-primary animate-[bounce_1s_infinite] h-2"></div>
                          <div className="w-1 bg-primary animate-[bounce_1.2s_infinite] h-4"></div>
                          <div className="w-1 bg-primary animate-[bounce_0.8s_infinite] h-3"></div>
                        </div>
                      ) : (
                        <span className="group-hover:hidden">{index + 1}</span>
                      )}
                      <Play className={cn("w-4 h-4 fill-current mx-auto", isCurrent && isPlaying ? "hidden" : "hidden group-hover:block text-foreground")} />
                    </div>
                    
                    <div className="flex items-center gap-3 truncate">
                      <img src={song.image || album.image} alt={song.name} className="w-10 h-10 rounded-md object-cover" />
                      <div className="truncate">
                        <div className={cn("font-medium text-sm truncate", isCurrent ? "text-primary" : "text-foreground")}>{song.name}</div>
                        <div className="md:hidden text-xs text-muted-foreground truncate">{song.artists.join(", ")}</div>
                      </div>
                    </div>
                    
                    <div className="hidden md:block text-xs text-muted-foreground truncate">
                      {song.artists.join(", ")}
                    </div>
                    
                    <div className="text-right text-xs text-muted-foreground flex items-center justify-end gap-2">
                      <Heart className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary" />
                      <span className="w-10">{formatDuration(song.duration)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetArtist, getGetArtistQueryKey } from "@workspace/api-client-react";
import { SongCard } from "@/components/shared/SongCard";
import { AlbumCard } from "@/components/shared/AlbumCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Artist({ params }: { params: { id: string } }) {
  const id = params.id;
  
  const { data: artist, isLoading, error } = useGetArtist(id, {
    query: { enabled: !!id, queryKey: getGetArtistQueryKey(id) }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="px-6 py-8 md:px-8 space-y-8 max-w-7xl mx-auto">
          <Skeleton className="w-full h-64 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (error || !artist) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-destructive">Failed to load artist.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative">
        <div 
          className="absolute inset-0 h-[400px] w-full overflow-hidden opacity-30 blur-3xl saturate-[2] pointer-events-none"
          style={{ 
            backgroundImage: `url(${artist.image})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
          }} 
        />
        
        <div className="px-6 py-12 md:px-8 max-w-7xl mx-auto relative z-10 space-y-12">
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end text-center md:text-left mb-12">
            <div className="w-64 h-64 shrink-0 rounded-full shadow-2xl overflow-hidden border-4 border-background">
              <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4">
              <span className="uppercase tracking-widest text-xs font-bold text-primary flex items-center justify-center md:justify-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" /> Verified Artist
              </span>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white">{artist.name}</h1>
              {artist.bio && <p className="text-muted-foreground max-w-2xl text-lg">{artist.bio}</p>}
            </div>
          </div>

          {artist.songs && artist.songs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Popular Songs</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {artist.songs.slice(0, 12).map((song) => (
                  <SongCard key={song.id} song={song} queue={artist.songs} />
                ))}
              </div>
            </section>
          )}

          {artist.albums && artist.albums.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {artist.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </AppLayout>
  );
}

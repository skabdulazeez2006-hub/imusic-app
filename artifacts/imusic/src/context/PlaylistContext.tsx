import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Song } from '@workspace/api-client-react';
import { toast } from 'sonner';

export type Playlist = {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
};

interface PlaylistContextType {
  playlists: Playlist[];
  likedSongs: Song[];
  toggleLikeSong: (song: Song) => void;
  isSongLiked: (songId: string) => boolean;
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem("imusic_playlists");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem("imusic_liked_songs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("imusic_playlists", JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem("imusic_liked_songs", JSON.stringify(likedSongs));
  }, [likedSongs]);

  const toggleLikeSong = useCallback((song: Song) => {
    setLikedSongs(prev => {
      const exists = prev.some(s => s.id === song.id);
      if (exists) {
        toast.success("Removed from Liked Songs");
        return prev.filter(s => s.id !== song.id);
      } else {
        toast.success("Added to Liked Songs");
        return [...prev, song];
      }
    });
  }, []);

  const isSongLiked = useCallback((songId: string) => {
    return likedSongs.some(s => s.id === songId);
  }, [likedSongs]);

  const createPlaylist = useCallback((name: string) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      songs: [],
      createdAt: Date.now()
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    toast.success(`Created playlist "${name}"`);
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    toast.success("Playlist deleted");
  }, []);

  const addSongToPlaylist = useCallback((playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        // Prevent duplicates
        if (p.songs.some(s => s.id === song.id)) {
          toast.info("Song already in this playlist");
          return p;
        }
        toast.success(`Added "${song.name}" to "${p.name}"`);
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    }));
  }, []);

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        toast.success("Removed song from playlist");
        return { ...p, songs: p.songs.filter(s => s.id !== songId) };
      }
      return p;
    }));
  }, []);

  return (
    <PlaylistContext.Provider value={{ playlists, likedSongs, toggleLikeSong, isSongLiked, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylists must be used within a PlaylistProvider");
  }
  return context;
}
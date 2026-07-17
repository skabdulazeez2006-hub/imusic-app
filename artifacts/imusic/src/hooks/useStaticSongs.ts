import { useQuery } from '@tanstack/react-query';

// Define the shape of a song based on the static JSON structure
export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  language: string;
  duration: number;
  album?: string;
  audio?: string;
}

/**
 * Hook to fetch the list of static songs from the backend API.
 * The backend endpoint is `/api/songs` as defined in `artifacts/api-server/src/routes/staticSongs.ts`.
 */
export const useStaticSongs = () => {
  return useQuery<Song[]>({
    queryKey: ['staticSongs'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/songs`);
      if (!response.ok) {
        throw new Error('Failed to fetch static songs');
      }
      const json = await response.json();
      // The backend returns `{ songs: [...] }`
      return json.songs as Song[];
    },
    // Stale-while-revalidate strategy – keep data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Refetch on window focus to keep UI up‑to‑date
    refetchOnWindowFocus: true,
  });
};

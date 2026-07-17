import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Song, SongDetail, getSong, getGetSongQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PlayerContextType {
  currentSong: SongDetail | null;
  queue: Song[];
  isPlaying: boolean;
  currentIndex: number;
  volume: number;
  progress: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  showQueue: boolean;
  setShowQueue: (show: boolean) => void;
  showLyrics: boolean;
  setShowLyrics: (show: boolean) => void;
  playSong: (song: Song, newQueue?: Song[]) => Promise<void>;
  togglePlayPause: () => void;
  playNext: (isAutoEnd?: boolean | React.MouseEvent) => void;
  playPrev: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (song: Song) => void;
  setQueue: React.Dispatch<React.SetStateAction<Song[]>>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<SongDetail | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, []);

  // Use a ref for playNext to avoid stale closures in event listeners
  const playNextRef = useRef<(isAutoEnd?: boolean | React.MouseEvent) => void>(() => {});

  useEffect(() => {
    playNextRef.current = playNext;
  }, [queue, currentIndex, isShuffle, repeatMode, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNextRef.current(true);
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const playSong = async (song: Song, newQueue?: Song[]) => {
    try {
      if (newQueue) {
        setQueue(newQueue);
        const index = newQueue.findIndex(s => s.id === song.id);
        setCurrentIndex(index !== -1 ? index : 0);
      } else if (queue.length === 0) {
        setQueue([song]);
        setCurrentIndex(0);
      }

      // Optimistically set some song details while loading
      setCurrentSong(song as SongDetail);
      
      const songDetail = await queryClient.fetchQuery({
        queryKey: getGetSongQueryKey(song.id),
        queryFn: () => getSong(song.id)
      });

      setCurrentSong(songDetail);

      if (audioRef.current) {
        audioRef.current.src = songDetail.streamUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Failed to play song", error);
      toast.error("Failed to load song");
      setIsPlaying(false);
    }
  };

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
         console.error("Playback failed", e);
         setIsPlaying(false);
      });
    }
  }, [isPlaying, currentSong]);

  const playNext = useCallback((isAutoEnd: any = false) => {
    if (queue.length === 0) return;
    
    const auto = isAutoEnd === true;
    if (auto && repeatMode === 'one' && currentSong) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
        setProgress(0);
      }
      return;
    }

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // Stop playback at end of list
          setIsPlaying(false);
          setProgress(0);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.pause();
          }
          return;
        }
      }
    }
    
    setCurrentIndex(nextIndex);
    playSong(queue[nextIndex]);
  }, [queue, currentIndex, isShuffle, repeatMode, currentSong]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = queue.length - 1;
      } else {
        prevIndex = 0;
      }
    }
    
    setCurrentIndex(prevIndex);
    playSong(queue[prevIndex]);
  }, [queue, currentIndex, progress, repeatMode]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolumeState(vol);
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => {
      // Avoid duplicates
      if (prev.some(s => s.id === song.id)) {
        toast.info("Song already in queue");
        return prev;
      }
      toast.success("Added to queue");
      return [...prev, song];
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        currentIndex,
        volume,
        progress,
        duration,
        isShuffle,
        repeatMode,
        showQueue,
        setShowQueue,
        showLyrics,
        setShowLyrics,
        playSong,
        togglePlayPause,
        playNext,
        playPrev,
        seekTo,
        setVolume,
        toggleShuffle,
        cycleRepeatMode,
        addToQueue,
        setQueue,
        setCurrentIndex
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

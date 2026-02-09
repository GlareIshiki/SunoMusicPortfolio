/* Design Philosophy: Aurora Dreamscape - smooth, flowing state management */

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { Song, RepeatMode } from '@/../../shared/types';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        handleSongEnd();
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  const handleSongEnd = useCallback(() => {
    if (repeatMode === 'one') {
      audioRef.current?.play();
    } else if (repeatMode === 'all' || currentIndex < queue.length - 1) {
      playNext();
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, currentIndex, queue.length]);
  
  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    if (newQueue) {
      setQueue(newQueue);
      const index = newQueue.findIndex(s => s.id === song.id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
    
    setCurrentSong(song);
    if (audioRef.current) {
      audioRef.current.src = song.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);
  
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentSong]);
  
  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }
    
    setCurrentIndex(nextIndex);
    playSong(queue[nextIndex]);
  }, [queue, currentIndex, isShuffle, playSong]);
  
  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    
    if (currentTime > 3) {
      seek(0);
    } else {
      const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      playSong(queue[prevIndex]);
    }
  }, [queue, currentIndex, currentTime, playSong]);
  
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);
  
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);
  
  const toggleRepeat = useCallback(() => {
    setRepeatMode(current => {
      if (current === 'off') return 'all';
      if (current === 'all') return 'one';
      return 'off';
    });
  }, []);
  
  const toggleShuffle = useCallback(() => {
    setIsShuffle(current => !current);
  }, []);
  
  const addToQueue = useCallback((song: Song) => {
    setQueue(current => [...current, song]);
  }, []);
  
  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        volume,
        currentTime,
        duration,
        queue,
        currentIndex,
        repeatMode,
        isShuffle,
        playSong,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleRepeat,
        toggleShuffle,
        addToQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}

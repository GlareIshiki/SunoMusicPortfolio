/* Design Philosophy: Grand Harmonic Archive - luxurious ornate player */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatDuration } from '@/lib/utils';

export function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    volume,
    repeatMode,
    isShuffle,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    toggleRepeat,
    toggleShuffle,
  } = usePlayer();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    
    audio.src = currentSong.audioUrl;
    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentSong]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
    }
  };
  
  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  const handleEnded = () => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
    } else {
      playNext();
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  if (!currentSong) return null;
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-md border-t border-primary/30 elegant-shadow mystical-particles"
        >
          {/* Decorative top border */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          {/* Progress bar */}
          <div className="relative h-1 bg-secondary">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-accent to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          <div className="container py-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
              {/* Song Info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden ornate-border">
                    <img
                      src={currentSong.coverUrl}
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm truncate text-foreground">
                    {currentSong.title}
                  </p>
                  <p className="font-elegant text-xs text-muted-foreground truncate">
                    {currentSong.artist}
                  </p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleShuffle}
                    className={isShuffle ? 'text-primary' : 'text-muted-foreground'}
                  >
                    <Shuffle className="w-4 h-4" strokeWidth={2} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPrevious}
                    className="text-foreground hover:text-primary"
                  >
                    <SkipBack className="w-5 h-5" strokeWidth={2} />
                  </Button>
                  
                  <Button
                    size="icon"
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-accent to-primary hover:from-primary hover:via-accent hover:to-primary gold-glow"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-background" strokeWidth={2.5} />
                    ) : (
                      <Play className="w-6 h-6 text-background ml-0.5" strokeWidth={2.5} />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playNext}
                    className="text-foreground hover:text-primary"
                  >
                    <SkipForward className="w-5 h-5" strokeWidth={2} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRepeat}
                    className={repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground'}
                  >
                    {repeatMode === 'one' ? (
                      <Repeat1 className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Repeat className="w-4 h-4" strokeWidth={2} />
                    )}
                  </Button>
                </div>
                
                {/* Time and Progress */}
                <div className="hidden md:flex items-center gap-3 w-full max-w-md">
                  <span className="font-mono text-xs text-muted-foreground w-12 text-right">
                    {formatDuration(currentTime)}
                  </span>
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="flex-1"
                  />
                  <span className="font-mono text-xs text-muted-foreground w-12">
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>
              
              {/* Volume Control */}
              <div className="hidden lg:flex items-center gap-3 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Volume2 className="w-5 h-5" strokeWidth={2} />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => {
                    setVolume(value[0]);
                    if (value[0] > 0) setIsMuted(false);
                  }}
                  className="w-24"
                />
                <span className="font-mono text-xs text-muted-foreground w-10 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

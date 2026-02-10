import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Play, Pause, Clock, Calendar, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAdmin } from '@/contexts/AdminContext';
import { updateSong } from '@/lib/api';
import { formatDuration, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Song } from '@/../../shared/types';

const SONGS_PER_PAGE = 40;

interface SongCardProps {
  song: Song;
  index: number;
  onVisibilityChange?: () => void;
}

export function SongCard({ song, index, onVisibilityChange }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isAdmin } = useAdmin();
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateSong(song.id, { visible: !song.visible });
      toast.success(song.visible ? 'Song hidden' : 'Song visible');
      onVisibilityChange?.();
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: Math.min((index % SONGS_PER_PAGE) * 0.05, 0.5),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Link href={`/song/${song.id}`}>
        <div className={`ornate-card elegant-shadow transition-all duration-500 hover:gold-glow group cursor-pointer ${isAdmin && !song.visible ? 'opacity-50 grayscale-[50%]' : ''}`}>
          <div className="ornate-card-inner p-0">
            {/* Cover Image */}
            <div className="relative aspect-square overflow-hidden rounded-t-lg">
              <img
                src={song.coverUrl}
                alt={`${song.title} のカバーアート`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Mystical particles */}
              <div className="absolute inset-0 mystical-particles opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Play button - visible on hover (desktop) and always on touch devices */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-70 transition-opacity duration-300">
                <Button
                  size="icon"
                  onClick={handlePlayClick}
                  aria-label={isCurrentSong && isPlaying ? '一時停止' : '再生'}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary hover:from-primary hover:via-accent hover:to-primary gold-glow"
                >
                  {isCurrentSong && isPlaying ? (
                    <Pause className="w-8 h-8 text-background" strokeWidth={2.5} />
                  ) : (
                    <Play className="w-8 h-8 text-background ml-1" strokeWidth={2.5} />
                  )}
                </Button>
              </div>

              {/* Status indicator */}
              {isCurrentSong && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-sm animate-glow-pulse">
                  <span className="font-elegant text-xs text-background font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Playing
                  </span>
                </div>
              )}

              {/* Admin visibility toggle */}
              {isAdmin && (
                <button
                  onClick={handleToggleVisibility}
                  className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center border border-primary/30 hover:gold-glow transition-all"
                >
                  {song.visible ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              )}

              {/* Cover badge */}
              {!isAdmin && song.isCover && (
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="rounded-full font-elegant text-xs backdrop-blur-sm">
                    Cover
                  </Badge>
                </div>
              )}

              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />
            </div>

            {/* Info */}
            <div className="p-5">
              {/* Title */}
              <h3 className="font-display text-base mb-1 text-foreground truncate">
                {song.title}
              </h3>

              {/* Artist */}
              <p className="font-elegant text-sm text-muted-foreground mb-3 truncate">
                {song.artist}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{formatDuration(song.duration)}</span>
                </div>

                <Badge
                  variant="outline"
                  className="font-elegant text-xs border-primary/30 text-primary rounded-full"
                >
                  {song.genre}
                </Badge>
              </div>

              {/* Date */}
              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 text-accent" />
                  <span className="font-mono">
                    {formatDate(song.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

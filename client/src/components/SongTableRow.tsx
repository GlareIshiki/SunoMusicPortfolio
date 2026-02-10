import { Link } from 'wouter';
import { Play, Pause, Eye, EyeOff, Pin, PinOff } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAdmin } from '@/contexts/AdminContext';
import { updateSong } from '@/lib/api';
import { formatDuration, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Song } from '@/../../shared/types';

interface SongTableRowProps {
  song: Song;
  index: number;
  queue: Song[];
  onVisibilityChange?: () => void;
}

export function SongTableRow({ song, index, queue, onVisibilityChange }: SongTableRowProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isAdmin } = useAdmin();
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue);
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

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateSong(song.id, { pinned: !song.pinned });
      toast.success(song.pinned ? 'Unpinned' : 'Pinned');
      onVisibilityChange?.();
    } catch {
      toast.error('Failed to update pin');
    }
  };

  const handleRowClick = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={cn(
        'group grid gap-3 items-center px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer',
        isAdmin
          ? 'grid-cols-[2rem_2rem_2.5rem_1fr_3rem] md:grid-cols-[2rem_2rem_2.5rem_2fr_1fr_1fr_3.5rem]'
          : 'grid-cols-[2.5rem_1fr_3rem] md:grid-cols-[2.5rem_2fr_1fr_1fr_3.5rem]',
        isCurrentSong
          ? 'bg-primary/10'
          : 'hover:bg-muted/50',
        isAdmin && !song.visible && 'opacity-50'
      )}
    >
      {/* Admin visibility toggle */}
      {isAdmin && (
        <button
          onClick={handleToggleVisibility}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted transition-colors"
        >
          {song.visible ? (
            <Eye className="w-3.5 h-3.5 text-primary" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      )}
      {/* Admin pin toggle */}
      {isAdmin && (
        <button
          onClick={handleTogglePin}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted transition-colors"
        >
          {song.pinned ? (
            <Pin className="w-3.5 h-3.5 text-primary" />
          ) : (
            <PinOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      )}
      {/* # / Play button */}
      <div className="flex items-center justify-center w-8">
        <span
          className={cn(
            'font-mono text-sm tabular-nums group-hover:hidden [@media(hover:none)]:hidden',
            isCurrentSong ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {index + 1}
        </span>
        <button
          onClick={handlePlayClick}
          aria-label={isCurrentSong && isPlaying ? '一時停止' : '再生'}
          className="hidden group-hover:flex [@media(hover:none)]:flex items-center justify-center text-foreground"
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <Play className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Cover + Title + Artist */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={song.coverUrl}
          alt={`${song.title} のカバーアート`}
          loading="lazy"
          className="w-10 h-10 rounded object-cover shrink-0"
        />
        <div className="min-w-0">
          <Link href={`/song/${song.id}`}>
            <p
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'font-display text-sm truncate hover:underline',
                isCurrentSong ? 'text-primary' : 'text-foreground hover:text-primary'
              )}
            >
              {song.title}
            </p>
          </Link>
          <p className="font-elegant text-sm text-muted-foreground truncate">
            {song.artist}
          </p>
        </div>
      </div>

      {/* Genre */}
      <span className="font-elegant text-sm text-muted-foreground truncate hidden md:block">
        {song.genre}
      </span>

      {/* Date */}
      <span className="font-mono text-sm text-muted-foreground truncate hidden md:block">
        {formatDate(song.createdAt)}
      </span>

      {/* Duration */}
      <span className="font-mono text-sm text-muted-foreground text-right">
        {formatDuration(song.duration)}
      </span>
    </div>
  );
}

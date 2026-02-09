import { Link } from 'wouter';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatDuration, formatDate, cn } from '@/lib/utils';
import type { Song } from '@/../../shared/types';

interface SongTableRowProps {
  song: Song;
  index: number;
  queue: Song[];
}

export function SongTableRow({ song, index, queue }: SongTableRowProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
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

  return (
    <Link href={`/song/${song.id}`}>
      <div
        className={cn(
          'group grid grid-cols-[2.5rem_1fr_minmax(0,1fr)_minmax(0,1fr)_3rem] md:grid-cols-[2.5rem_2fr_1fr_1fr_3.5rem] gap-3 items-center px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer',
          isCurrentSong
            ? 'bg-primary/10'
            : 'hover:bg-muted/50'
        )}
      >
        {/* # / Play button */}
        <div className="flex items-center justify-center w-8">
          <span
            className={cn(
              'font-mono text-sm tabular-nums group-hover:hidden',
              isCurrentSong ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {index + 1}
          </span>
          <button
            onClick={handlePlayClick}
            className="hidden group-hover:flex items-center justify-center text-foreground"
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
            alt={song.title}
            className="w-10 h-10 rounded object-cover shrink-0"
          />
          <div className="min-w-0">
            <p
              className={cn(
                'font-display text-sm truncate',
                isCurrentSong ? 'text-primary' : 'text-foreground'
              )}
            >
              {song.title}
            </p>
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
    </Link>
  );
}

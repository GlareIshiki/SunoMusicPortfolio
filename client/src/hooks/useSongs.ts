import { useState, useEffect, useCallback } from 'react';
import type { Song } from '@/../../shared/types';
import { fetchSongs, fetchSongById } from '@/lib/api';

interface UseSongsResult {
  songs: Song[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSongs(): UseSongsResult {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchSongs()
      .then(setSongs)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { songs, isLoading, error, refetch };
}

interface UseSongResult {
  song: Song | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSong(id: string | undefined): UseSongResult {
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!id) {
      setSong(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    fetchSongById(id)
      .then(setSong)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { song, isLoading, error, refetch };
}

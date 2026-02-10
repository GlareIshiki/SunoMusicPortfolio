import { useState, useEffect, useCallback } from 'react';
import type { Song } from '@/../../shared/types';
import { fetchSongs, fetchSongById } from '@/lib/api';
import type { FetchSongsParams, PaginatedSongs } from '@/lib/api';

interface UseSongsResult {
  songs: Song[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSongs(params: FetchSongsParams = {}): UseSongsResult {
  const [data, setData] = useState<PaginatedSongs>({
    songs: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page, limit, search, genre, sort } = params;

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchSongs({ page, limit, search, genre, sort })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [page, limit, search, genre, sort]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...data, isLoading, error, refetch };
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

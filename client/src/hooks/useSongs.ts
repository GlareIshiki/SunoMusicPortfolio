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
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!id) {
      setSong(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function load() {
      const MAX_RETRIES = 2;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (cancelled) return;
        try {
          const data = await fetchSongById(id!, controller.signal);
          if (cancelled) return;
          // If null (404) on first attempts, retry after short delay
          // (transient Vercel cold-start errors can masquerade as 404)
          if (!data && attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 500));
            continue;
          }
          setSong(data);
          setIsLoading(false);
          return;
        } catch (e: unknown) {
          if (cancelled) return;
          if (e instanceof Error && e.name === 'AbortError') return;
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 500));
            continue;
          }
          setError(e instanceof Error ? e.message : 'Unknown error');
          setIsLoading(false);
          return;
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, fetchKey]);

  const refetch = useCallback(() => {
    setFetchKey(k => k + 1);
  }, []);

  return { song, isLoading, error, refetch };
}

import { useState, useEffect, useCallback } from 'react';
import type { Character } from '@/../../shared/types';
import { fetchCharacters, fetchCharacterById } from '@/lib/api';

interface UseCharactersResult {
  characters: Character[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCharacters(): UseCharactersResult {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchCharacters()
      .then(setCharacters)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { characters, isLoading, error, refetch };
}

interface UseCharacterResult {
  character: Character | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCharacter(id: string | undefined): UseCharacterResult {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!id) {
      setCharacter(null);
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
          const data = await fetchCharacterById(id!, controller.signal);
          if (cancelled) return;
          if (!data && attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 500));
            continue;
          }
          setCharacter(data);
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

  return { character, isLoading, error, refetch };
}

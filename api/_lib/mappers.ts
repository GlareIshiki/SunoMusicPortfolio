import type { Song, Playlist, Character, CharacterSection } from '../../shared/types';

interface SongRow {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tags: string[];
  audio_url: string;
  cover_url: string;
  prompt: string;
  is_cover: boolean;
  original_url: string | null;
  created_at: string;
  duration: number;
  visible: boolean;
  pinned: boolean;
  original_cover_url: string | null;
}

interface PlaylistRow {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  song_ids: string[];
  created_at: string;
  updated_at: string;
}

export function songRowToSong(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    genre: row.genre,
    tags: row.tags,
    audioUrl: row.audio_url,
    coverUrl: row.cover_url,
    prompt: row.prompt,
    isCover: row.is_cover,
    originalUrl: row.original_url ?? undefined,
    createdAt: row.created_at,
    duration: row.duration,
    visible: row.visible,
    pinned: row.pinned,
    originalCoverUrl: row.original_cover_url ?? undefined,
  };
}

export function songToRow(song: Partial<Song>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (song.title !== undefined) row.title = song.title;
  if (song.artist !== undefined) row.artist = song.artist;
  if (song.genre !== undefined) row.genre = song.genre;
  if (song.tags !== undefined) row.tags = song.tags;
  if (song.audioUrl !== undefined) row.audio_url = song.audioUrl;
  if (song.coverUrl !== undefined) row.cover_url = song.coverUrl;
  if (song.prompt !== undefined) row.prompt = song.prompt;
  if (song.isCover !== undefined) row.is_cover = song.isCover;
  if (song.originalUrl !== undefined) row.original_url = song.originalUrl;
  if (song.visible !== undefined) row.visible = song.visible;
  if (song.pinned !== undefined) row.pinned = song.pinned;
  if (song.originalCoverUrl !== undefined) row.original_cover_url = song.originalCoverUrl;
  return row;
}

export function playlistRowToPlaylist(row: PlaylistRow): Playlist {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    coverUrl: row.cover_url,
    songIds: row.song_ids,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --- Character mappers ---

interface CharacterRow {
  id: string;
  name: string;
  subtitle: string;
  cover_url: string;
  sections: CharacterSection[];
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export function characterRowToCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    coverUrl: row.cover_url,
    sections: row.sections ?? [],
    sortOrder: row.sort_order,
    visible: row.visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function characterToRow(char: Partial<Character>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (char.name !== undefined) row.name = char.name;
  if (char.subtitle !== undefined) row.subtitle = char.subtitle;
  if (char.coverUrl !== undefined) row.cover_url = char.coverUrl;
  if (char.sections !== undefined) row.sections = char.sections;
  if (char.sortOrder !== undefined) row.sort_order = char.sortOrder;
  if (char.visible !== undefined) row.visible = char.visible;
  return row;
}

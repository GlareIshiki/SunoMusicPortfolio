import type { Song, Playlist } from '../../shared/types';

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

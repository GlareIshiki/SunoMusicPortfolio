import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Song, Playlist } from '../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.env.NODE_ENV === 'production'
  ? path.resolve(__dirname, '..', 'data')
  : path.resolve(__dirname, '..', 'data');

const songsPath = path.join(dataDir, 'songs.json');
const playlistsPath = path.join(dataDir, 'playlists.json');

export async function loadSongs(): Promise<Song[]> {
  const raw = await fs.readFile(songsPath, 'utf-8');
  return JSON.parse(raw) as Song[];
}

export async function saveSongs(songs: Song[]): Promise<void> {
  await fs.writeFile(songsPath, JSON.stringify(songs, null, 2));
}

export async function getSongById(id: string): Promise<Song | undefined> {
  const songs = await loadSongs();
  return songs.find(s => s.id === id);
}

export async function updateSong(id: string, updates: Partial<Song>): Promise<Song | null> {
  const songs = await loadSongs();
  const index = songs.findIndex(s => s.id === id);
  if (index === -1) return null;

  // Don't allow changing id
  const { id: _id, ...safeUpdates } = updates;
  songs[index] = { ...songs[index], ...safeUpdates };
  await saveSongs(songs);
  return songs[index];
}

export async function loadPlaylists(): Promise<Playlist[]> {
  const raw = await fs.readFile(playlistsPath, 'utf-8');
  return JSON.parse(raw) as Playlist[];
}

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Set them in .env or as environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface SongJson {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tags: string[];
  audioUrl: string;
  coverUrl: string;
  prompt: string;
  isCover: boolean;
  originalUrl?: string;
  createdAt: string;
  duration: number;
  visible: boolean;
}

interface PlaylistJson {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
}

function songToRow(song: SongJson) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    genre: song.genre,
    tags: song.tags,
    audio_url: song.audioUrl,
    cover_url: song.coverUrl,
    prompt: song.prompt,
    is_cover: song.isCover,
    original_url: song.originalUrl || null,
    created_at: song.createdAt,
    duration: song.duration,
    visible: song.visible,
  };
}

function playlistToRow(playlist: PlaylistJson) {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    cover_url: playlist.coverUrl,
    song_ids: playlist.songIds,
    created_at: playlist.createdAt,
    updated_at: playlist.updatedAt,
  };
}

async function seed() {
  const songsPath = path.resolve(__dirname, '..', 'data', 'songs.json');
  const playlistsPath = path.resolve(__dirname, '..', 'data', 'playlists.json');

  if (!fs.existsSync(songsPath)) {
    console.error(`songs.json not found at ${songsPath}`);
    console.error('Run "npm run seed" first to generate the JSON data');
    process.exit(1);
  }

  const songs: SongJson[] = JSON.parse(fs.readFileSync(songsPath, 'utf-8'));
  const playlists: PlaylistJson[] = JSON.parse(fs.readFileSync(playlistsPath, 'utf-8'));

  console.log(`Seeding ${songs.length} songs...`);

  const CHUNK_SIZE = 100;
  for (let i = 0; i < songs.length; i += CHUNK_SIZE) {
    const chunk = songs.slice(i, i + CHUNK_SIZE).map(songToRow);
    const { error } = await supabase.from('songs').upsert(chunk);
    if (error) {
      console.error(`Error seeding songs batch ${i}:`, error);
      process.exit(1);
    }
    console.log(`  Songs ${i + 1}-${Math.min(i + CHUNK_SIZE, songs.length)} inserted`);
  }

  console.log(`Seeding ${playlists.length} playlists...`);
  const playlistRows = playlists.map(playlistToRow);
  const { error } = await supabase.from('playlists').upsert(playlistRows);
  if (error) {
    console.error('Error seeding playlists:', error);
    process.exit(1);
  }

  console.log('Seed complete!');
}

seed().catch(console.error);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Song, Playlist } from '../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genres = ['Electronic', 'Ambient', 'Synthwave', 'Lo-fi', 'Orchestral', 'Rock', 'Jazz', 'Classical', 'Pop', 'Experimental'];
const tagPool = ['chill', 'energetic', 'atmospheric', 'dreamy', 'epic', 'melancholic', 'uplifting', 'dark', 'cinematic', 'nostalgic'];

const coverImages = [
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
  'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=800&q=80',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80',
  'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&q=80',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
];

const sampleAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const titles = [
  'Cosmic Dreams', 'Neon Nights', 'Aurora Waves', 'Stellar Journey', 'Digital Horizons',
  'Midnight Echo', 'Crystal Rain', 'Ethereal Flow', 'Quantum Pulse', 'Celestial Dance',
  'Nebula Drift', 'Lunar Serenade', 'Starlight Symphony', 'Void Walker', 'Prismatic Skies',
  'Infinite Loop', 'Time Cascade', 'Electric Soul', 'Gravity Well', 'Photon Stream',
];

const artists = [
  'Synthwave Dreamer', 'Aurora Collective', 'Cosmic Voyager', 'Digital Phantom', 'Neon Oracle',
  'Stellar Architect', 'Quantum Echo', 'Celestial Harmonics', 'Void Composer', 'Prismatic Sound',
];

// Use seeded random for reproducible data
let seed = 42;
function seededRandom(): number {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function generateSong(id: number): Song {
  const genre = genres[Math.floor(seededRandom() * genres.length)];
  const songTags = Array.from(
    { length: Math.floor(seededRandom() * 3) + 2 },
    () => tagPool[Math.floor(seededRandom() * tagPool.length)]
  ).filter((tag, index, self) => self.indexOf(tag) === index);

  const isCover = seededRandom() > 0.8;
  const duration = Math.floor(seededRandom() * 240) + 120;

  const title = titles[id % titles.length] + (id > titles.length ? ` ${Math.floor(id / titles.length)}` : '');
  const artist = artists[id % artists.length];

  const date = new Date('2025-06-01');
  date.setDate(date.getDate() - Math.floor(seededRandom() * 365));

  return {
    id: `song-${String(id).padStart(3, '0')}`,
    title,
    artist,
    genre,
    tags: songTags,
    audioUrl: sampleAudioUrl,
    coverUrl: coverImages[id % coverImages.length],
    prompt: `Create a ${genre.toLowerCase()} track with ${songTags.join(', ')} vibes. Inspired by ${artist}'s signature sound.`,
    isCover,
    originalUrl: isCover ? 'https://example.com/original-song' : undefined,
    createdAt: date.toISOString().split('T')[0],
    duration,
    visible: true,
  };
}

const songs: Song[] = Array.from({ length: 720 }, (_, i) => generateSong(i + 1));

const playlists: Playlist[] = [
  {
    id: 'playlist-001',
    name: 'Aurora Favorites',
    description: 'The best tracks from my cosmic journey',
    coverUrl: coverImages[0],
    songIds: songs.slice(0, 25).map(s => s.id),
    createdAt: '2024-01-15',
    updatedAt: '2024-02-08',
  },
  {
    id: 'playlist-002',
    name: 'Chill Vibes',
    description: 'Relaxing ambient tracks for focus and meditation',
    coverUrl: coverImages[1],
    songIds: songs.filter(s => s.tags.includes('chill')).slice(0, 30).map(s => s.id),
    createdAt: '2024-02-01',
    updatedAt: '2024-02-09',
  },
  {
    id: 'playlist-003',
    name: 'Epic Orchestral',
    description: 'Cinematic and powerful orchestral compositions',
    coverUrl: coverImages[7],
    songIds: songs.filter(s => s.genre === 'Orchestral').slice(0, 20).map(s => s.id),
    createdAt: '2024-01-20',
    updatedAt: '2024-02-05',
  },
];

const dataDir = path.resolve(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

fs.writeFileSync(path.join(dataDir, 'songs.json'), JSON.stringify(songs, null, 2));
fs.writeFileSync(path.join(dataDir, 'playlists.json'), JSON.stringify(playlists, null, 2));

console.log(`Generated ${songs.length} songs -> data/songs.json`);
console.log(`Generated ${playlists.length} playlists -> data/playlists.json`);

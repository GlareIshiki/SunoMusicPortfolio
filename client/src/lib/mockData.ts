/* Design Philosophy: Aurora Dreamscape - diverse, immersive music collection */

import type { Song, Playlist } from '@/../../shared/types';

const genres = ['Electronic', 'Ambient', 'Synthwave', 'Lo-fi', 'Orchestral', 'Rock', 'Jazz', 'Classical', 'Pop', 'Experimental'];
const tags = ['chill', 'energetic', 'atmospheric', 'dreamy', 'epic', 'melancholic', 'uplifting', 'dark', 'cinematic', 'nostalgic'];

// Using Unsplash for album covers with music/abstract themes
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

// Sample audio URL (using a public domain sample)
const sampleAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

function generateSong(id: number): Song {
  const genre = genres[Math.floor(Math.random() * genres.length)];
  const songTags = Array.from(
    { length: Math.floor(Math.random() * 3) + 2 },
    () => tags[Math.floor(Math.random() * tags.length)]
  ).filter((tag, index, self) => self.indexOf(tag) === index);
  
  const isCover = Math.random() > 0.8;
  const duration = Math.floor(Math.random() * 240) + 120; // 2-6 minutes
  
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
  
  const title = titles[id % titles.length] + (id > titles.length ? ` ${Math.floor(id / titles.length)}` : '');
  const artist = artists[id % artists.length];
  
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 365));
  
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
    pinned: false,
  };
}

// Generate 720 songs
export const mockSongs: Song[] = Array.from({ length: 720 }, (_, i) => generateSong(i + 1));

export const mockPlaylists: Playlist[] = [
  {
    id: 'playlist-001',
    name: 'Aurora Favorites',
    description: 'The best tracks from my cosmic journey',
    coverUrl: 'https://private-us-east-1.manuscdn.com/sessionFile/s1rF6OwbRH7CMoYsrPbBKV/sandbox/VQfDSlWgbU8ZgJuEEtHDUE-img-5_1770653011000_na1fn_cGxheWxpc3QtY292ZXItZGVmYXVsdA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvczFyRjZPd2JSSDdDTW9Zc3JQYkJLVi9zYW5kYm94L1ZRZkRTbFdnYlU4WmdKdUVFdEhEVUUtaW1nLTVfMTc3MDY1MzAxMTAwMF9uYTFmbl9jR3hoZVd4cGMzUXRZMjkyWlhJdFpHVm1ZWFZzZEEucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Gwd4I~lSsfwWWKb4vff1Hp0NILJxPfpD6229tgkzLByo6hFFoSKUiec~tZ19G3qnhECmbiU6Z9P02l50ibk471FsEEtPomQjtLVo9h7XFQq~VuWnun1fbn5ELhgT4n0SQ-cMNkMTWc4UOYMt0wlVr76Ihx9Ef6o1dzYWDEtGS6YECFO8BGjn1vhPqt0dS6zt2XNGtmOyexLDHzDiNHjP8-ayqvvjURS1u1QEnj30wnxBG0Whw655N9HZTdigQz16VF79YGnNHAxZwSiSDp5RvSUSmuPSkA9n-b2mAL02qr7cxCVbXDrckMPAfw2UmzRzND-HoNHi-wmYcqk3gfka7A__',
    songIds: mockSongs.slice(0, 25).map(s => s.id),
    createdAt: '2024-01-15',
    updatedAt: '2024-02-08',
  },
  {
    id: 'playlist-002',
    name: 'Chill Vibes',
    description: 'Relaxing ambient tracks for focus and meditation',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
    songIds: mockSongs.filter(s => s.tags.includes('chill')).slice(0, 30).map(s => s.id),
    createdAt: '2024-02-01',
    updatedAt: '2024-02-09',
  },
  {
    id: 'playlist-003',
    name: 'Epic Orchestral',
    description: 'Cinematic and powerful orchestral compositions',
    coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80',
    songIds: mockSongs.filter(s => s.genre === 'Orchestral').slice(0, 20).map(s => s.id),
    createdAt: '2024-01-20',
    updatedAt: '2024-02-05',
  },
];

export function getSongById(id: string): Song | undefined {
  return mockSongs.find(song => song.id === id);
}

export function getPlaylistById(id: string): Playlist | undefined {
  return mockPlaylists.find(playlist => playlist.id === id);
}

export function getSongsByPlaylistId(playlistId: string): Song[] {
  const playlist = getPlaylistById(playlistId);
  if (!playlist) return [];
  return playlist.songIds.map(id => getSongById(id)).filter(Boolean) as Song[];
}

// Design Philosophy: Aurora Dreamscape - flowing, organic data structures

export interface Song {
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
  duration: number; // in seconds
  visible: boolean;
  pinned: boolean;
}

export type TextAlign = 'left' | 'right' | 'center' | 'full';

export type CharacterSection =
  | { type: 'text'; content: string; align?: TextAlign; frame?: boolean }
  | { type: 'songs'; songIds: string[] }
  | { type: 'image'; url: string; alt?: string; align?: TextAlign };

export interface Character {
  id: string;
  name: string;
  subtitle: string;
  coverUrl: string;
  sections: CharacterSection[];
  sortOrder: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'newest' | 'oldest' | 'title' | 'artist' | 'duration';
export type RepeatMode = 'off' | 'all' | 'one';

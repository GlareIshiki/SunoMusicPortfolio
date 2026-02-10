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

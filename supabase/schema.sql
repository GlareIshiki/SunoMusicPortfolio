-- SunoMusicPortfolio Supabase Schema

CREATE TABLE songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  audio_url TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  original_url TEXT,
  created_at TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_songs_visible ON songs (visible);
CREATE INDEX idx_songs_genre ON songs (genre);

CREATE TABLE playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL,
  song_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Storage: Create a public bucket named 'covers' via Supabase dashboard

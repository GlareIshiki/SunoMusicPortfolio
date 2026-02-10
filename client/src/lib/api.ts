import type { Song, Playlist } from '@/../../shared/types';

const API_BASE = '';

// JWT token management
let adminToken: string | null = null;

export function setAdminToken(token: string | null) {
  adminToken = token;
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
}

export function getAdminToken(): string | null {
  if (!adminToken) {
    adminToken = localStorage.getItem('admin_token');
  }
  return adminToken;
}

function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PaginatedSongs {
  songs: Song[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FetchSongsParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  sort?: string;
}

export async function fetchSongs(params: FetchSongsParams = {}): Promise<PaginatedSongs> {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page.toString());
  if (params.limit) sp.set('limit', params.limit.toString());
  if (params.search) sp.set('search', params.search);
  if (params.genre && params.genre !== 'all') sp.set('genre', params.genre);
  if (params.sort) sp.set('sort', params.sort);

  const qs = sp.toString();
  const url = `${API_BASE}/api/songs${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch songs');
  return res.json();
}

export async function fetchGenres(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/songs/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  const data = await res.json();
  return data.genres;
}

export async function fetchSongById(id: string): Promise<Song | null> {
  const res = await fetch(`${API_BASE}/api/songs/${id}`, { headers: authHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch song');
  return res.json();
}

export async function updateSong(id: string, updates: Partial<Song>): Promise<Song> {
  const res = await fetch(`${API_BASE}/api/songs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update song');
  return res.json();
}

export async function uploadCover(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('cover', file);
  const res = await fetch(`${API_BASE}/api/upload/cover`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload cover');
  const data = await res.json();
  return data.url;
}

export async function adminLogin(password: string): Promise<{ ok: boolean; token?: string }> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return { ok: false };
  const data = await res.json();
  if (data.token) {
    setAdminToken(data.token);
  }
  return { ok: true, token: data.token };
}

export async function adminLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/admin/logout`, {
    method: 'POST',
    headers: authHeaders(),
  });
  setAdminToken(null);
}

export async function verifyAdmin(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/verify`, { headers: authHeaders() });
    if (!res.ok) return false;
    const data = await res.json();
    return data.authenticated === true;
  } catch {
    return false;
  }
}

export async function fetchPlaylists(): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE}/api/playlists`);
  if (!res.ok) throw new Error('Failed to fetch playlists');
  return res.json();
}

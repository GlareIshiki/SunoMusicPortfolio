import type { Song } from '@/../../shared/types';

const API_BASE = '';

export async function fetchSongs(): Promise<Song[]> {
  const res = await fetch(`${API_BASE}/api/songs`);
  if (!res.ok) throw new Error('Failed to fetch songs');
  return res.json();
}

export async function fetchSongById(id: string): Promise<Song | null> {
  const res = await fetch(`${API_BASE}/api/songs/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch song');
  return res.json();
}

export async function updateSong(id: string, updates: Partial<Song>): Promise<Song> {
  const res = await fetch(`${API_BASE}/api/songs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
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
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload cover');
  const data = await res.json();
  return data.url;
}

export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

export async function adminLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/admin/logout`, { method: 'POST' });
}

export async function verifyAdmin(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/verify`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.authenticated === true;
  } catch {
    return false;
  }
}

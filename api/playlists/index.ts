import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';
import { playlistRowToPlaylist } from '../_lib/mappers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase.from('playlists').select('*');
    if (error) throw error;
    return res.json((data ?? []).map(playlistRowToPlaylist));
  } catch {
    return res.status(500).json({ error: 'Failed to load playlists' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('songs')
      .select('genre');

    if (error) throw error;

    const genres = Array.from(new Set((data ?? []).map(r => r.genre)))
      .filter(Boolean)
      .sort();

    return res.json({ genres });
  } catch {
    return res.status(500).json({ error: 'Failed to load genres' });
  }
}

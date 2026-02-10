import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';
import { isAdmin } from '../_lib/auth.js';
import { songRowToSong } from '../_lib/mappers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const idsParam = (req.query.ids as string) || '';
    const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);

    if (ids.length === 0) {
      return res.json([]);
    }

    if (ids.length > 100) {
      return res.status(400).json({ error: 'Too many IDs (max 100)' });
    }

    const admin = await isAdmin(req);

    let query = supabase.from('songs').select('*').in('id', ids);
    if (!admin) {
      query = query.eq('visible', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Preserve requested order
    const songMap = new Map((data ?? []).map(row => [row.id, songRowToSong(row)]));
    const ordered = ids.map(id => songMap.get(id)).filter(Boolean);

    return res.json(ordered);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch songs batch' });
  }
}

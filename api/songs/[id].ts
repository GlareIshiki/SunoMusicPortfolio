import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';
import { isAdmin } from '../_lib/auth.js';
import { songRowToSong, songToRow } from '../_lib/mappers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('songs').select('*').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Song not found' });

    const admin = await isAdmin(req);
    if (!data.visible && !admin) {
      return res.status(404).json({ error: 'Song not found' });
    }

    return res.json(songRowToSong(data));
  }

  if (req.method === 'PATCH') {
    const admin = await isAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });

    const updates = songToRow(req.body);
    delete updates.id;

    const { data, error } = await supabase
      .from('songs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Song not found' });
    return res.json(songRowToSong(data));
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

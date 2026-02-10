import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';
import { isAdmin } from '../_lib/auth.js';
import { characterRowToCharacter, characterToRow } from '../_lib/mappers.js';
import { nanoid } from 'nanoid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const admin = await isAdmin(req);
      let query = supabase.from('characters').select('*').order('sort_order', { ascending: true });
      if (!admin) {
        query = query.eq('visible', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.json((data ?? []).map(characterRowToCharacter));
    } catch {
      return res.status(500).json({ error: 'Failed to fetch characters' });
    }
  }

  if (req.method === 'POST') {
    try {
      const admin = await isAdmin(req);
      if (!admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const body = req.body || {};
      const now = new Date().toISOString();
      const id = nanoid(12);

      const row = {
        id,
        name: body.name || 'Untitled',
        subtitle: body.subtitle || '',
        cover_url: body.coverUrl || '',
        sections: body.sections || [],
        sort_order: body.sortOrder ?? 0,
        visible: body.visible ?? true,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase.from('characters').insert(row).select().single();
      if (error) throw error;

      return res.status(201).json(characterRowToCharacter(data));
    } catch {
      return res.status(500).json({ error: 'Failed to create character' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

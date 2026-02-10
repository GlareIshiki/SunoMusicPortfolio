import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';
import { isAdmin } from '../_lib/auth.js';
import { characterRowToCharacter, characterToRow } from '../_lib/mappers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Character not found' });
        }
        throw error;
      }
      if (!data) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const admin = await isAdmin(req);
      if (!data.visible && !admin) {
        return res.status(404).json({ error: 'Character not found' });
      }

      return res.json(characterRowToCharacter(data));
    } catch {
      return res.status(500).json({ error: 'Failed to fetch character' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const admin = await isAdmin(req);
      if (!admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updates = characterToRow(req.body || {});
      updates.updated_at = new Date().toISOString();

      // Also handle sections directly if provided
      if (req.body?.sections !== undefined) {
        updates.sections = req.body.sections;
      }

      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Character not found' });
        }
        throw error;
      }
      if (!data) {
        return res.status(404).json({ error: 'Character not found' });
      }

      return res.json(characterRowToCharacter(data));
    } catch {
      return res.status(500).json({ error: 'Failed to update character' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const admin = await isAdmin(req);
      if (!admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error } = await supabase.from('characters').delete().eq('id', id);
      if (error) throw error;

      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Failed to delete character' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

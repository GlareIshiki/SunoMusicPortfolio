import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';
import { isAdmin } from '../_lib/auth.js';
import { songRowToSong } from '../_lib/mappers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await isAdmin(req);

    // Parse query params
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const maxLimit = admin ? 500 : 100;
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string) || 40));
    const search = ((req.query.search as string) || '').trim();
    const genre = ((req.query.genre as string) || '').trim();
    const sort = (req.query.sort as string) || 'newest';

    let query = supabase.from('songs').select('*', { count: 'exact' });

    // Visibility
    if (!admin) {
      query = query.eq('visible', true);
    }

    // Pinned filter
    const pinnedFilter = (req.query as Record<string, string>).pinned;
    if (pinnedFilter === 'true') {
      query = query.eq('pinned', true);
    }

    // Search: title or artist
    if (search) {
      query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%`);
    }

    // Genre filter
    if (genre && genre !== 'all') {
      query = query.eq('genre', genre);
    }

    // Sort
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'title':
        query = query.order('title', { ascending: true });
        break;
      case 'artist':
        query = query.order('artist', { ascending: true });
        break;
      case 'duration':
        query = query.order('duration', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;

    return res.json({
      songs: (data ?? []).map(songRowToSong),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return res.status(500).json({ error: 'Failed to load songs' });
  }
}

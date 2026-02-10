import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdmin } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authenticated = await isAdmin(req);
  return res.json({ authenticated });
}

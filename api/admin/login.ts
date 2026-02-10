import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPassword, signToken } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = await signToken();

  res.setHeader('Set-Cookie', [
    `admin_token=${token}; HttpOnly; SameSite=Strict; Max-Age=${24 * 60 * 60}; Path=/`,
  ]);

  return res.json({ ok: true, token });
}

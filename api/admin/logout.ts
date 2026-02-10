import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', [
    `admin_token=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/`,
  ]);

  return res.json({ ok: true });
}

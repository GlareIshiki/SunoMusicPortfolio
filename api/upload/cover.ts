import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdmin } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';
import formidable from 'formidable';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await isAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [, files] = await form.parse(req);
    const file = files.cover?.[0];

    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!file.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    const ext = path.extname(file.originalFilename || '.jpg');
    const filename = `${crypto.randomUUID()}${ext}`;
    const fileBuffer = fs.readFileSync(file.filepath);

    const { error } = await supabase.storage
      .from('covers')
      .upload(filename, fileBuffer, { contentType: file.mimetype });

    if (error) return res.status(500).json({ error: 'Upload failed' });

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(filename);

    return res.json({ url: publicUrl });
  } catch {
    return res.status(500).json({ error: 'Upload failed' });
  }
}

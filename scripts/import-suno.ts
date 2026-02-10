import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// --- Configuration ---

const SUNO_DIR = String.raw`C:\Users\syudo\Downloads\Suno Downloads`;
const BATCH_SIZE = 100;

// --- Environment ---

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2PublicUrl = process.env.R2_PUBLIC_URL;

function checkEnv() {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!r2AccountId) missing.push('R2_ACCOUNT_ID');
  if (!r2AccessKeyId) missing.push('R2_ACCESS_KEY_ID');
  if (!r2SecretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
  if (!r2BucketName) missing.push('R2_BUCKET_NAME');
  if (!r2PublicUrl) missing.push('R2_PUBLIC_URL');
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    console.error('Set them in .env or as environment variables');
    process.exit(1);
  }
}

// --- Clients ---

function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId!,
      secretAccessKey: r2SecretAccessKey!,
    },
  });
}

function createSupabaseClient() {
  return createClient(supabaseUrl!, supabaseKey!);
}

// --- Suno JSON type ---

interface SunoMetadata {
  id: string;
  title: string;
  isLiked?: boolean;
  audio_url: string;
  image_url: string;
  isCover: boolean;
  isRemaster?: boolean;
  isStem?: boolean;
  isUpload?: boolean;
  isPublic?: boolean;
  display_name: string;
  handle: string;
  metadata: {
    tags?: string;
    prompt?: string;
    duration?: number;
    type?: string;
    [key: string]: unknown;
  };
}

// --- Genre detection ---

const GENRE_MAP: [string, RegExp][] = [
  ['Rock', /\b(rock|metal|grunge|punk|hard rock|alt rock|alternative rock|post-punk|garage)\b/],
  ['Electronic', /\b(electronic|techno|house|dubstep|synthwave|edm|synth|trance|drum and bass|dnb|breakbeat)\b/],
  ['Pop', /\b(pop|idol|catchy|dance pop|synth pop|bubblegum|k-pop|kpop)\b/],
  ['Hip Hop', /\b(hip.hop|rap|trap|boom bap|drill|grime)\b/],
  ['Jazz', /\b(jazz|blues|soul|swing|bossa nova|bebop|smooth jazz)\b/],
  ['R&B', /\b(r&b|rnb|neo soul|motown)\b/],
  ['Folk', /\b(folk|acoustic|country|bluegrass|singer.songwriter)\b/],
  ['Classical', /\b(classical|orchestra|symphon|piano solo|violin solo|chamber|baroque|opera)\b/],
  ['Ambient', /\b(ambient|chill|lofi|lo-fi|chillout|downtempo|meditation)\b/],
  ['Latin', /\b(latin|salsa|reggaeton|bossa|cumbia|merengue|bachata)\b/],
  ['Anime', /\b(anime|jpop|j-pop|vocaloid|j-rock|jrock|visual kei)\b/],
  ['World', /\b(world|ethnic|traditional|celtic|african|middle eastern|indian)\b/],
  ['Reggae', /\b(reggae|ska|dub|dancehall)\b/],
  ['Metal', /\b(metal|death metal|black metal|thrash|doom|progressive metal|djent)\b/],
];

function deriveGenre(tags: string): string {
  const t = tags.toLowerCase();
  for (const [genre, pattern] of GENRE_MAP) {
    if (pattern.test(t)) return genre;
  }
  return 'Uncategorized';
}

function parseTags(tagsStr: string): string[] {
  return tagsStr
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0 && t.length < 50);
}

// --- R2 upload helpers ---

async function r2Exists(r2: S3Client, key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: r2BucketName!, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadToR2(r2: S3Client, key: string, body: Buffer, contentType: string) {
  await r2.send(new PutObjectCommand({
    Bucket: r2BucketName!,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
}

// --- Collect all song entries (JSON files) across all folders ---

interface SongEntry {
  jsonPath: string;       // full path to .json
  oggPath: string | null; // full path to matching .ogg
  jpgPath: string | null; // full path to matching .jpg/.jpeg/.png
  folder: string;         // folder name
  baseName: string;       // file base name (without extension)
}

function collectSongEntries(): SongEntry[] {
  const entries: SongEntry[] = [];
  const folders = fs.readdirSync(SUNO_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(SUNO_DIR, folder.name);
    const files = fs.readdirSync(folderPath);

    // Find all JSON files in this folder
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    for (const jsonFile of jsonFiles) {
      const baseName = jsonFile.slice(0, -'.json'.length);

      // Find matching OGG: exact base name match
      const oggFile = files.find(f =>
        f === `${baseName}.ogg`
      ) ?? null;

      // Find matching image: exact base name match (.jpg, .jpeg, .png)
      const imgFile = files.find(f =>
        f === `${baseName}.jpg` ||
        f === `${baseName}.jpeg` ||
        f === `${baseName}.png`
      ) ?? null;

      entries.push({
        jsonPath: path.join(folderPath, jsonFile),
        oggPath: oggFile ? path.join(folderPath, oggFile) : null,
        jpgPath: imgFile ? path.join(folderPath, imgFile) : null,
        folder: folder.name,
        baseName,
      });
    }
  }

  return entries;
}

// --- Main ---

async function main() {
  checkEnv();

  const r2 = createR2Client();
  const supabase = createSupabaseClient();

  // Read all folders
  if (!fs.existsSync(SUNO_DIR)) {
    console.error(`Suno Downloads directory not found: ${SUNO_DIR}`);
    process.exit(1);
  }

  // Collect all song entries (JSON-based)
  console.log('Scanning folders...');
  const entries = collectSongEntries();
  console.log(`Found ${entries.length} songs across folders`);

  const withOgg = entries.filter(e => e.oggPath).length;
  const withImg = entries.filter(e => e.jpgPath).length;
  console.log(`  With OGG: ${withOgg}, With image: ${withImg}`);

  // Get existing IDs for resume capability
  console.log('Checking existing songs in Supabase...');
  const { data: existingRows } = await supabase.from('songs').select('id');
  const existingIds = new Set((existingRows ?? []).map((r: { id: string }) => r.id));
  console.log(`Already imported: ${existingIds.size} songs`);

  // Delete demo data on first run
  if (existingIds.size > 0) {
    const demoIds = Array.from(existingIds).filter(id => id.startsWith('song-'));
    if (demoIds.length > 0) {
      console.log(`Deleting ${demoIds.length} demo songs...`);
      for (let i = 0; i < demoIds.length; i += 100) {
        const batch = demoIds.slice(i, i + 100);
        await supabase.from('songs').delete().in('id', batch);
      }
      for (const id of demoIds) existingIds.delete(id);
      console.log('Demo data deleted');
    }
  }

  // Process songs
  const pendingRows: Record<string, unknown>[] = [];
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  let uploadedAudio = 0;
  let uploadedCovers = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    try {
      // Parse metadata
      const raw = fs.readFileSync(entry.jsonPath, 'utf-8');
      const meta: SunoMetadata = JSON.parse(raw);

      // Skip if already imported
      if (existingIds.has(meta.id)) {
        skipped++;
        continue;
      }

      const audioKey = `audio/${meta.id}.ogg`;
      const coverKey = `covers/${meta.id}.jpg`;

      // Upload OGG audio (already converted)
      if (entry.oggPath) {
        const audioExists = await r2Exists(r2, audioKey);
        if (!audioExists) {
          const oggBuffer = fs.readFileSync(entry.oggPath);
          await uploadToR2(r2, audioKey, oggBuffer, 'audio/ogg');
          uploadedAudio++;
        }
      }

      // Upload cover image
      if (entry.jpgPath) {
        const coverExists = await r2Exists(r2, coverKey);
        if (!coverExists) {
          const imgBuffer = fs.readFileSync(entry.jpgPath);
          const ext = path.extname(entry.jpgPath).toLowerCase();
          const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
          await uploadToR2(r2, coverKey, imgBuffer, contentType);
          uploadedCovers++;
        }
      }

      // Get file creation date
      const fileStat = fs.statSync(entry.jsonPath);
      const createdAt = fileStat.mtime.toISOString();

      // Map to DB row
      const tagsStr = meta.metadata?.tags || '';
      const row = {
        id: meta.id,
        title: meta.title,
        artist: meta.display_name || meta.handle || 'Unknown',
        genre: deriveGenre(tagsStr),
        tags: parseTags(tagsStr),
        audio_url: entry.oggPath
          ? `${r2PublicUrl}/${audioKey}`
          : meta.audio_url, // fallback to Suno CDN
        cover_url: entry.jpgPath
          ? `${r2PublicUrl}/${coverKey}`
          : meta.image_url, // fallback to Suno CDN
        prompt: meta.metadata?.prompt || '',
        is_cover: meta.isCover ?? false,
        original_url: null,
        created_at: createdAt,
        duration: Math.round(meta.metadata?.duration || 0),
        visible: true,
      };

      pendingRows.push(row);
      processed++;

      // Batch upsert
      if (pendingRows.length >= BATCH_SIZE) {
        await upsertBatch(supabase, pendingRows);
        pendingRows.length = 0;
      }

      // Progress log every 50 songs
      if (processed % 50 === 0) {
        console.log(`  [${i + 1}/${entries.length}] Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}, Uploaded: ${uploadedAudio} audio / ${uploadedCovers} covers`);
      }
    } catch (err) {
      console.error(`  [ERROR] ${entry.baseName}:`, err instanceof Error ? err.message : err);
      errors++;
    }
  }

  // Final batch
  if (pendingRows.length > 0) {
    await upsertBatch(supabase, pendingRows);
  }

  console.log(`
===== Import Complete =====
  Total songs found: ${entries.length}
  Imported:          ${processed}
  Skipped (exists):  ${skipped}
  Errors:            ${errors}
  Uploaded audio:    ${uploadedAudio}
  Uploaded covers:   ${uploadedCovers}
===========================
`);
}

async function upsertBatch(supabase: ReturnType<typeof createClient>, rows: Record<string, unknown>[]) {
  const { error } = await supabase.from('songs').upsert(rows);
  if (error) {
    console.error('Batch upsert error:', error);
    throw error;
  }
  console.log(`  -> Upserted ${rows.length} songs to Supabase`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

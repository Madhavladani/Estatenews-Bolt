import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const accountId = import.meta.env.R2_ACCOUNT_ID;
const accessKeyId = import.meta.env.R2_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.R2_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.R2_BUCKET_NAME;
const publicBaseUrl = import.meta.env.R2_PUBLIC_URL;

const endpoint = import.meta.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');

const s3Client = accountId && accessKeyId && secretAccessKey
  ? new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  })
  : null;

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

function mimeToExt(mimeType: string): string {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/avif') return 'avif';
  return 'jpg';
}


export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.supabase) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!s3Client || !bucketName || !publicBaseUrl) {
    return new Response(JSON.stringify({ error: 'R2 is not configured. Missing env values.' }), { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = String(formData.get('folder') || 'uploads').replace(/[^a-z0-9/_-]/gi, '');

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'No file uploaded.' }), { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return new Response(JSON.stringify({ error: 'Only JPG, PNG, WEBP, and AVIF are allowed.' }), { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let outputBuffer: Buffer;
  const outputType = file.type; // preserve original format
  const outputExt = mimeToExt(file.type);
  try {
    const pipeline = sharp(inputBuffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true, fit: 'inside' });

    if (outputExt === 'webp') outputBuffer = await pipeline.webp({ quality: 80 }).toBuffer();
    else if (outputExt === 'avif') outputBuffer = await pipeline.avif({ quality: 80 }).toBuffer();
    else if (outputExt === 'png') outputBuffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    else outputBuffer = await pipeline.jpeg({ quality: 80 }).toBuffer();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid image data.' }), { status: 400 });
  }

  const baseName = (file.name || 'image').toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'image';
  const timestamp = Date.now();
  const randomPart = crypto.randomUUID().slice(0, 8);
  const key = `${folder}/${baseName}-${timestamp}-${randomPart}.${outputExt}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: outputBuffer,
    ContentType: outputType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  const publicUrl = `${String(publicBaseUrl).replace(/\/$/, '')}/${key}`;

  return new Response(JSON.stringify({ url: publicUrl, key }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

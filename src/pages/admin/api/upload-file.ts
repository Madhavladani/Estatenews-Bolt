import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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

const allowedTypes = new Set(['application/pdf']);

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
    return new Response(JSON.stringify({ error: 'Only PDF files are allowed.' }), { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  const baseName = (file.name || 'document').toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'document';
  const originalExt = 'pdf';
  const timestamp = Date.now();
  const randomPart = crypto.randomUUID().slice(0, 8);
  const key = `${folder}/${baseName}-${timestamp}-${randomPart}.${originalExt}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: inputBuffer,
    ContentType: 'application/pdf',
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  const publicUrl = `${String(publicBaseUrl).replace(/\/$/, '')}/${key}`;

  return new Response(JSON.stringify({ url: publicUrl, key }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

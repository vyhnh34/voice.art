const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ext  = String(req.query.ext || 'png').replace(/[^a-z0-9]/gi, '') || 'png';
  const kind = req.query.kind === 'clip' ? 'clip' : 'photo';

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  if (!buffer.length) {
    res.status(400).json({ error: 'Empty upload' });
    return;
  }

  const contentType = req.headers['content-type'] || 'application/octet-stream';
  const name = `captures/${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const blob = await put(name, buffer, { access: 'public', contentType });
    res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', detail: err && err.message, hasToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
  }
};

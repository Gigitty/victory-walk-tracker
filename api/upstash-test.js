// Debug endpoint to check Upstash REST connectivity and show raw response
// GET /api/upstash-test

const UPSTASH_REST_URL = process.env.UPSTASH_REST_URL;
const UPSTASH_REST_TOKEN = process.env.UPSTASH_REST_TOKEN;
const STORAGE_KEY = 'victory-walk:leader:current';

async function upstashGet(key) {
  if (!UPSTASH_REST_URL || !UPSTASH_REST_TOKEN) throw new Error('Upstash credentials missing');
  const url = `${UPSTASH_REST_URL.replace(/\/$/, '')}/get/${encodeURIComponent(key)}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${UPSTASH_REST_TOKEN}`
    }
  });
  const text = await resp.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { /* not JSON */ }
  return { status: resp.status, ok: resp.ok, bodyText: text, body: json };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const result = await upstashGet(STORAGE_KEY);
    return res.status(200).json({ success: true, upstash: result });
  } catch (err) {
    console.error('Upstash test failed:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
}

// Vercel Serverless Function for Leader Position Updates
// Stores leader state in Upstash Redis via the REST API. Falls back to
// in-process global memory when Upstash credentials are not present or calls fail.

// Upstash REST credentials are read from environment variables:
// - UPSTASH_REST_URL
// - UPSTASH_REST_TOKEN

const UPSTASH_REST_URL = process.env.UPSTASH_REST_URL;
const UPSTASH_REST_TOKEN = process.env.UPSTASH_REST_TOKEN;
const STORAGE_KEY = 'victory-walk:leader:current';

// Ensure a minimal global fallback
if (!global.leaderData) {
  global.leaderData = {
    hasLeader: false,
    leaders: {},
    leaderPosition: null,
    currentStopIndex: 0,
    leaderStopIndex: 0,
    lastUpdate: Date.now(),
    timestamp: Date.now(),
    serverTime: new Date().toISOString()
  };
}

async function upstashSet(key, value) {
  if (!UPSTASH_REST_URL || !UPSTASH_REST_TOKEN) throw new Error('Upstash credentials missing');
  const url = `${UPSTASH_REST_URL.replace(/\/$/, '')}/set/${encodeURIComponent(key)}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${UPSTASH_REST_TOKEN}`
    },
    body: JSON.stringify({ value })
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Upstash set failed: ${resp.status} ${resp.statusText} ${text}`);
  }
  return resp.json();
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const receivedData = req.body;

      console.log('📡 Leader position update received:', {
        lat: receivedData.leaderPosition?.lat,
        lng: receivedData.leaderPosition?.lng,
        leaderType: receivedData.leaderPosition?.leaderType,
        hasMultipleLeaders: !!receivedData.leaders
      });

      const dataToStore = {
        ...receivedData,
        lastServerUpdate: Date.now(),
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };
      // Try Upstash first, fall back to global memory
      let storedInUpstash = false;
      try {
        await upstashSet(STORAGE_KEY, dataToStore);
        storedInUpstash = true;
        console.log('✅ Leader data saved to Upstash REST');
      } catch (upError) {
        console.warn('⚠️ Upstash unavailable, falling back to global memory:', upError?.message || upError);
      }

      if (!storedInUpstash) {
        global.leaderData = dataToStore;
        console.log('✅ Leader data stored in global memory fallback');
      }

      return res.status(200).json({
        success: true,
        message: 'Leader position updated',
        activeLeaders: dataToStore.leaders ? Object.keys(dataToStore.leaders).length : 0,
        storedInUpstash
      });
    } catch (error) {
      console.error('❌ Error handling leader update:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
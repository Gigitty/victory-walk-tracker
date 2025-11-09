// Vercel Serverless Function for Leader Data Retrieval
// Reads leader state from Upstash Redis via the REST API. Falls back to
// in-process global memory when Upstash credentials are not present or calls fail.

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
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Upstash get failed: ${resp.status} ${resp.statusText} ${text}`);
  }
  return resp.json();
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Aggressive cache control for real-time data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '-1');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      // Try to read from Upstash first
      let leaderData = null;
      try {
        const body = await upstashGet(STORAGE_KEY);
        // Upstash GET typically returns { result: <value> }
        if (body && typeof body === 'object' && 'result' in body) {
          leaderData = body.result;
          console.log('📡 Leader data loaded from Upstash REST');
        }
      } catch (upError) {
        console.warn('⚠️ Upstash read failed, falling back to global memory:', upError?.message || upError);
      }

      // Fallback to global memory if Upstash is unavailable or empty
      if (!leaderData && global.leaderData) {
        leaderData = global.leaderData;
        console.log('📡 Leader data loaded from global memory fallback');
      }

      if (!leaderData) {
        leaderData = {
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

      console.log('📡 Serving leader data:', {
        hasLeader: leaderData.hasLeader,
        leadersCount: Object.keys(leaderData.leaders || {}).length,
        lastUpdate: leaderData.lastUpdate
      });

      return res.status(200).json({
        ...leaderData,
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in leader-data handler:', error);
      const fallbackData = {
        hasLeader: false,
        leaders: {},
        leaderPosition: null,
        currentStopIndex: 0,
        leaderStopIndex: 0,
        lastUpdate: Date.now(),
        timestamp: Date.now(),
        serverTime: new Date().toISOString(),
        error: error.message
      };
      return res.status(200).json(fallbackData);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
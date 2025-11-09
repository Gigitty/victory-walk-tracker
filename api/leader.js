// Vercel Serverless Function for Leader Position Updates
// Simple global memory storage that works across requests
import { kv } from '@vercel/kv';

// Key used in KV for the current leader state
const KV_KEY = 'victory-walk:leader:current';

// Ensure a minimal global fallback if KV is not available
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

      // Try KV first, fall back to global memory
      let savedToKV = false;
      try {
        await kv.set(KV_KEY, dataToStore);
        savedToKV = true;
        console.log('✅ Leader data saved to Vercel KV');
      } catch (kvError) {
        console.warn('⚠️ Vercel KV unavailable, falling back to global memory:', kvError?.message || kvError);
      }

      if (!savedToKV) {
        global.leaderData = dataToStore;
        console.log('✅ Leader data stored in global memory fallback');
      }

      return res.status(200).json({
        success: true,
        message: 'Leader position updated',
        activeLeaders: dataToStore.leaders ? Object.keys(dataToStore.leaders).length : 0,
        storedInKV: savedToKV
      });
    } catch (error) {
      console.error('❌ Error handling leader update:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
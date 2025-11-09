// Vercel Serverless Function for Leader Data Retrieval
// Simple in-memory storage with timestamp validation

// Global in-memory storage that persists for the function lifetime
if (!global.leaderDataCache) {
  global.leaderDataCache = {
    data: {
      hasLeader: false,
      leaders: {},
      leaderPosition: null,
      currentStopIndex: 0,
      leaderStopIndex: 0,
      lastUpdate: 0
    },
    timestamp: 0
  };
}

export default async function handler(req, res) {
  console.log('📡 leader-data API called');
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Aggressive cache control for real-time data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '-1');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Get current data from global cache
      const currentData = global.leaderDataCache.data;
      const cacheAge = Date.now() - global.leaderDataCache.timestamp;

      console.log('🔍 DEBUG - Global cache state:', {
        cacheExists: !!global.leaderDataCache,
        cacheData: global.leaderDataCache,
        hasLeader: currentData?.hasLeader,
        leadersCount: Object.keys(currentData?.leaders || {}).length
      });

      // Add cache busting timestamp
      const responseData = {
        ...currentData,
        timestamp: Date.now(),
        serverTime: new Date().toISOString(),
        cacheAge: cacheAge,
        debug: {
          globalCacheExists: !!global.leaderDataCache,
          cacheTimestamp: global.leaderDataCache.timestamp,
          functionId: process.env.VERCEL_REGION || 'unknown'
        }
      };

      console.log('📡 Serving leader data from cache:', {
        hasLeader: responseData.hasLeader,
        leadersCount: Object.keys(responseData.leaders || {}).length,
        lastUpdate: responseData.lastUpdate,
        cacheAge: cacheAge,
        functionId: responseData.debug.functionId
      });

      return res.status(200).json(responseData);

    } catch (error) {
      console.error('❌ Error in leader-data handler:', error);
      
      // Return safe fallback
      const fallbackData = {
        hasLeader: false,
        leaders: {},
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
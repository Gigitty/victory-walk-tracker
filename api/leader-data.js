// Vercel Serverless Function for Leader Data Retrieval
// Replaces the leader-data.json file access

// Use the same global Map as leader.js for consistency
global.leaderDataStore = global.leaderDataStore || new Map();

function getLeaderData() {
  const stored = global.leaderDataStore.get('leaderData');
  if (stored && Date.now() - stored.timestamp < 300000) { // 5 minute cache
    console.log('📦 Using cached leader data from global store');
    return stored.data;
  }
  
  console.log('🔄 No cached data found, creating default');
  const defaultData = {
    hasLeader: false,
    leaders: {},
    leaderPosition: null,
    currentStopIndex: 0,
    leaderStopIndex: 0,
    lastUpdate: Date.now()
  };
  
  return defaultData;
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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Read current leader data from global storage
      const currentData = getLeaderData();

      // Add cache busting timestamp
      const responseData = {
        ...currentData,
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };

      console.log('📡 Serving leader data:', {
        hasLeader: responseData.hasLeader,
        leadersCount: Object.keys(responseData.leaders || {}).length,
        lastUpdate: responseData.lastUpdate,
        cacheSource: 'global'
      });

      return res.status(200).json(responseData);

    } catch (error) {
      console.error('❌ Error retrieving leader data:', error);
      
      // Return a safe fallback response
      const fallbackData = {
        error: 'Internal server error', 
        message: error.message,
        hasLeader: false,
        leaders: {},
        lastUpdate: Date.now(),
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };
      
      return res.status(200).json(fallbackData); // Return 200 instead of 500 to avoid client errors
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
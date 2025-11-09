// Vercel Serverless Function for Leader Data Retrieval
// Shared Map using global object (same approach as test-storage.js)
if (!global.leaderStore) {
  global.leaderStore = new Map();
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
      // Get data from the same Map the leader uses
      const currentData = global.leaderStore.get('currentLeaderData');
      
      console.log('🔍 DEBUG - Map state:', {
        mapSize: global.leaderStore.size,
        hasCurrentData: global.leaderStore.has('currentLeaderData'),
        rawData: currentData
      });

      // Prepare response
      const responseData = currentData ? {
        ...currentData,
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      } : {
        hasLeader: false,
        leaders: {},
        leaderPosition: null,
        currentStopIndex: 0,
        leaderStopIndex: 0,
        lastUpdate: Date.now(),
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };

      console.log('📡 Serving leader data:', {
        hasLeader: responseData.hasLeader,
        leadersCount: Object.keys(responseData.leaders || {}).length,
        lastUpdate: responseData.lastUpdate,
        mapSize: global.leaderStore.size
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
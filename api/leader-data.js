// Vercel Serverless Function for Leader Data Retrieval
// Simple global memory storage that works across requests
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
      // Access the same global data that POST stores
      const leaderData = global.leaderData || {
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
        hasLeader: leaderData.hasLeader,
        leadersCount: Object.keys(leaderData.leaders || {}).length,
        lastUpdate: leaderData.lastUpdate
      });

      // Return current data with fresh timestamp
      return res.status(200).json({
        ...leaderData,
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error in leader-data handler:', error);
      
      // Return safe fallback
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
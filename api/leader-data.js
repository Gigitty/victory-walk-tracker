// Vercel Serverless Function for Leader Data Retrieval
// Replaces the leader-data.json file access

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
      // Return current leader data (same as what was in leader-data.json)
      const currentData = global.leaderData || {
        hasLeader: false,
        leaders: {},
        leaderPosition: null,
        currentStopIndex: 0,
        leaderStopIndex: 0,
        lastUpdate: Date.now()
      };

      // Add cache busting timestamp
      const responseData = {
        ...currentData,
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };

      return res.status(200).json(responseData);

    } catch (error) {
      console.error('❌ Error retrieving leader data:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        hasLeader: false,
        leaders: {},
        lastUpdate: Date.now()
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
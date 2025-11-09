// Vercel Serverless Function for Leader Position Updates
// Replaces the /api/leader endpoint from secure_server.py

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const leaderData = req.body;
      
      // For now, we'll use a simple in-memory storage simulation
      // In production, this would use Vercel KV or a database
      console.log('📡 Leader position update received:', {
        lat: leaderData.leaderPosition?.lat,
        lng: leaderData.leaderPosition?.lng,
        leaderType: leaderData.leaderPosition?.leaderType,
        hasMultipleLeaders: !!leaderData.leaders
      });

      // Simulate saving to storage
      // TODO: Replace with Vercel KV when we set it up
      global.leaderData = {
        ...global.leaderData,
        ...leaderData,
        lastServerUpdate: Date.now()
      };

      // Merge multiple leaders if present
      if (leaderData.leaders) {
        if (!global.leaderData.leaders) {
          global.leaderData.leaders = {};
        }
        
        // Merge the new leader data
        for (const [leaderType, leaderInfo] of Object.entries(leaderData.leaders)) {
          global.leaderData.leaders[leaderType] = leaderInfo;
        }
        
        global.leaderData.hasLeader = true;
        global.leaderData.lastUpdate = leaderData.lastUpdate || Date.now();
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Leader position updated',
        activeLeaders: global.leaderData?.leaders ? Object.keys(global.leaderData.leaders).length : 1
      });

    } catch (error) {
      console.error('❌ Error handling leader update:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }

  if (req.method === 'GET') {
    try {
      // Return current leader data (for follower polling)
      const currentData = global.leaderData || {
        hasLeader: false,
        leaders: {},
        lastUpdate: Date.now()
      };

      return res.status(200).json(currentData);

    } catch (error) {
      console.error('❌ Error retrieving leader data:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Initialize global storage (temporary until we add Vercel KV)
if (typeof global.leaderData === 'undefined') {
  global.leaderData = {
    hasLeader: false,
    leaders: {},
    lastUpdate: Date.now()
  };
}
// Vercel Serverless Function for Leader Removal
// Replaces the /api/leader/remove endpoint from secure_server.py

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
      const { leaderType, action } = req.body;

      if (!leaderType) {
        return res.status(400).json({ error: 'leaderType is required' });
      }

      if (action !== 'remove') {
        return res.status(400).json({ error: 'action must be "remove"' });
      }

      // Initialize global data if not exists
      if (!global.leaderData) {
        global.leaderData = { hasLeader: false, leaders: {}, lastUpdate: Date.now() };
      }

      // Remove the specific leader
      if (global.leaderData.leaders && global.leaderData.leaders[leaderType]) {
        delete global.leaderData.leaders[leaderType];
        console.log(`🗑️ Removed ${leaderType} from server data`);
        
        // If no leaders left, update hasLeader flag
        if (Object.keys(global.leaderData.leaders).length === 0) {
          global.leaderData.hasLeader = false;
          console.log('📴 No leaders remaining - set hasLeader to False');
        }
        
        global.leaderData.lastUpdate = Date.now();
      } else {
        console.log(`⚠️ Leader ${leaderType} not found in data`);
      }

      return res.status(200).json({ 
        success: true, 
        message: `Leader ${leaderType} removed`,
        remainingLeaders: Object.keys(global.leaderData.leaders || {}).length
      });

    } catch (error) {
      console.error('❌ Error removing leader:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
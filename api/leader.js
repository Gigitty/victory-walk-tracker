// Vercel Serverless Function for Leader Position Updates
// Simple global memory storage that works across requests
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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const receivedData = req.body;
      
      console.log('📡 Leader position update received:', {
        lat: receivedData.leaderPosition?.lat,
        lng: receivedData.leaderPosition?.lng,
        leaderType: receivedData.leaderPosition?.leaderType,
        hasMultipleLeaders: !!receivedData.leaders
      });

      // Store directly in global memory
      global.leaderData = {
        ...receivedData,
        lastServerUpdate: Date.now(),
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };
      
      console.log('✅ Leader data stored globally:', {
        hasLeader: global.leaderData.hasLeader,
        leadersCount: Object.keys(global.leaderData.leaders || {}).length
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Leader position updated successfully',
        activeLeaders: global.leaderData.leaders ? Object.keys(global.leaderData.leaders).length : 0,
        stored: {
          hasLeader: global.leaderData.hasLeader,
          leadersCount: Object.keys(global.leaderData.leaders || {}).length
        }
      });

    } catch (error) {
      console.error('❌ Error handling leader update:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
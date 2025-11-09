// Vercel Serverless Function for Leader Position Updates
// Simple in-memory storage using Map (proven to work)
const leaderStore = new Map();

export default async function handler(req, res) {
  console.log('📡 leader API called');
  
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
      
      console.log('📡 Leader position update received:', {
        lat: leaderData.leaderPosition?.lat,
        lng: leaderData.leaderPosition?.lng,
        leaderType: leaderData.leaderPosition?.leaderType,
        hasMultipleLeaders: !!leaderData.leaders
      });

      // Store the entire leader data object
      leaderStore.set('currentLeaderData', {
        ...leaderData,
        lastServerUpdate: Date.now(),
        storeTimestamp: Date.now()
      });
      
      const stored = leaderStore.get('currentLeaderData');
      
      console.log('✅ Stored leader data:', {
        hasLeader: stored.hasLeader,
        leadersCount: Object.keys(stored.leaders || {}).length,
        lastUpdate: stored.lastUpdate,
        mapSize: leaderStore.size
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Leader position updated',
        activeLeaders: stored.leaders ? Object.keys(stored.leaders).length : 0,
        mapSize: leaderStore.size,
        stored: {
          hasLeader: stored.hasLeader,
          leadersCount: Object.keys(stored.leaders || {}).length
        }
      });

    } catch (error) {
      console.error('❌ Error handling leader update:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
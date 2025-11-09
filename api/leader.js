// Vercel Serverless Function for Leader Position Updates
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

      // Get existing data from global cache
      const existingData = global.leaderDataCache.data;
      
      console.log('📦 Existing data before merge:', {
        hasLeader: existingData.hasLeader,
        leadersCount: Object.keys(existingData.leaders || {}).length,
        lastUpdate: existingData.lastUpdate
      });
      
      // Merge with existing data
      const updatedData = {
        ...existingData,
        ...leaderData,
        lastServerUpdate: Date.now()
      };

      // Merge multiple leaders if present
      if (leaderData.leaders) {
        if (!updatedData.leaders) {
          updatedData.leaders = {};
        }
        
        // Merge the new leader data
        for (const [leaderType, leaderInfo] of Object.entries(leaderData.leaders)) {
          updatedData.leaders[leaderType] = leaderInfo;
          console.log(`💾 Storing leader ${leaderType}:`, leaderInfo);
        }
        
        updatedData.hasLeader = true;
        updatedData.lastUpdate = leaderData.lastUpdate || Date.now();
      }

      // Update global cache
      global.leaderDataCache = {
        data: updatedData,
        timestamp: Date.now()
      };
      
      console.log('✅ Updated global cache:', {
        hasLeader: updatedData.hasLeader,
        leadersCount: Object.keys(updatedData.leaders || {}).length,
        lastUpdate: updatedData.lastUpdate,
        cacheTimestamp: global.leaderDataCache.timestamp,
        functionId: process.env.VERCEL_REGION || 'unknown'
      });

      // Test: Try to read back immediately to verify storage
      const testRead = global.leaderDataCache.data;
      console.log('🧪 Immediate read test:', {
        hasLeader: testRead.hasLeader,
        leadersCount: Object.keys(testRead.leaders || {}).length
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Leader position updated',
        activeLeaders: updatedData.leaders ? Object.keys(updatedData.leaders).length : 0,
        cacheUpdated: true,
        debug: {
          functionId: process.env.VERCEL_REGION || 'unknown',
          immediateReadTest: {
            hasLeader: testRead.hasLeader,
            leadersCount: Object.keys(testRead.leaders || {}).length
          }
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
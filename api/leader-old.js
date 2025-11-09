// Vercel Serverless Function for Leader Position Updates
// Replaces the /api/leader endpoint from secure_server.py

// Use a simple global Map for cross-function persistence
// This works better than file system in Vercel
global.leaderDataStore = global.leaderDataStore || new Map();

function getLeaderData() {
  const stored = global.leaderDataStore.get('leaderData');
  if (stored && Date.now() - stored.timestamp < 300000) { // 5 minute cache
    console.log('📦 Using cached leader data');
    return stored.data;
  }
  
  console.log('� Creating new default leader data');
  const defaultData = {
    hasLeader: false,
    leaders: {},
    leaderPosition: null,
    currentStopIndex: 0,
    leaderStopIndex: 0,
    lastUpdate: Date.now()
  };
  
  // Cache it
  global.leaderDataStore.set('leaderData', {
    data: defaultData,
    timestamp: Date.now()
  });
  
  return defaultData;
}

function setLeaderData(data) {
  console.log('💾 Storing leader data in global cache');
  global.leaderDataStore.set('leaderData', {
    data: data,
    timestamp: Date.now()
  });
  return true;
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
      const leaderData = req.body;
      
      console.log('📡 Leader position update received:', {
        lat: leaderData.leaderPosition?.lat,
        lng: leaderData.leaderPosition?.lng,
        leaderType: leaderData.leaderPosition?.leaderType,
        hasMultipleLeaders: !!leaderData.leaders,
        fullLeaderData: leaderData
      });

      // Read existing data and merge
      const existingData = await getLeaderData();
      
      console.log('📦 Existing data before merge:', {
        hasLeader: existingData.hasLeader,
        leadersCount: Object.keys(existingData.leaders || {}).length,
        lastUpdate: existingData.lastUpdate
      });
      
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

      // Save the updated data
      await setLeaderData(updatedData);
      
      console.log('✅ Final stored data:', {
        hasLeader: updatedData.hasLeader,
        leadersCount: Object.keys(updatedData.leaders || {}).length,
        lastUpdate: updatedData.lastUpdate,
        leaders: updatedData.leaders
      });

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
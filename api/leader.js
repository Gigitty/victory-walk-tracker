// Vercel Serverless Function for Leader Position Updates
// Multi-approach storage: Global + File backup + Response data
import fs from 'fs';

// Global storage (works within same instance)
if (!global.leaderStore) {
  global.leaderStore = new Map();
}

// File backup (attempt persistence)
const DATA_FILE = '/tmp/leader-data.json';

// Helper functions
function saveToMultipleStorage(data) {
  try {
    // Store in global memory
    global.leaderStore.set('currentLeaderData', data);
    
    // Attempt file backup
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (fileError) {
      console.log('📝 File storage failed (expected in Vercel):', fileError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error in multi-storage save:', error);
    return false;
  }
}

function loadFromMultipleStorage() {
  try {
    // Try global memory first
    let data = global.leaderStore.get('currentLeaderData');
    if (data) return data;
    
    // Try file backup
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileData);
      // Restore to global memory
      global.leaderStore.set('currentLeaderData', data);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error in multi-storage load:', error);
    return null;
  }
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

      // Prepare data to store
      const dataToStore = {
        ...leaderData,
        lastServerUpdate: Date.now(),
        storeTimestamp: Date.now()
      };

      // Save using multi-storage approach
      const saved = saveToMultipleStorage(dataToStore);
      
      if (!saved) {
        return res.status(500).json({ error: 'Failed to save leader data' });
      }

      // Verify the save
      const verification = loadFromMultipleStorage();
      
      console.log('✅ Multi-storage save completed:', {
        hasLeader: verification?.hasLeader,
        leadersCount: Object.keys(verification?.leaders || {}).length,
        lastUpdate: verification?.lastUpdate,
        globalMapSize: global.leaderStore.size,
        fileExists: fs.existsSync(DATA_FILE)
      });

      // Return data in response for client fallback
      return res.status(200).json({ 
        success: true, 
        message: 'Leader position updated',
        activeLeaders: verification?.leaders ? Object.keys(verification.leaders).length : 0,
        stored: {
          hasLeader: verification?.hasLeader,
          leadersCount: Object.keys(verification?.leaders || {}).length
        },
        // Include the actual data for client-side caching
        leaderData: verification
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
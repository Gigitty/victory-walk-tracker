// Vercel Serverless Function for Leader Data Retrieval
// Multi-approach storage: Global + File backup
import fs from 'fs';

// Global storage (works within same instance)
if (!global.leaderStore) {
  global.leaderStore = new Map();
}

// File backup
const DATA_FILE = '/tmp/leader-data.json';

// Helper function
function loadFromMultipleStorage() {
  try {
    // Try global memory first
    let data = global.leaderStore.get('currentLeaderData');
    if (data) {
      console.log('📚 Data found in global memory');
      return data;
    }
    
    // Try file backup
    if (fs.existsSync(DATA_FILE)) {
      console.log('📁 Data found in file, restoring to memory');
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileData);
      // Restore to global memory
      global.leaderStore.set('currentLeaderData', data);
      return data;
    }
    
    console.log('❌ No data found in any storage');
    return null;
  } catch (error) {
    console.error('❌ Error in multi-storage load:', error);
    return null;
  }
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
      // Load data using multi-storage approach
      const currentData = loadFromMultipleStorage();
      
      console.log('🔍 DEBUG - Multi-storage state:', {
        hasGlobalData: global.leaderStore.has('currentLeaderData'),
        globalMapSize: global.leaderStore.size,
        fileExists: fs.existsSync(DATA_FILE),
        hasData: !!currentData,
        dataTimestamp: currentData?.storeTimestamp
      });
      
      // Log all global Map contents for debugging
      console.log('🗂️ Global Map contents:', Array.from(global.leaderStore.entries()));
      
      // If no data, add a test entry to verify the GET endpoint works
      if (!currentData) {
        console.log('💡 No data found - creating test data for debugging');
        const testData = {
          hasLeader: true,
          leaders: { TEST: { position: { lat: 1, lng: 1, leaderType: 'TEST' }, lastUpdate: Date.now() } },
          leaderPosition: { lat: 1, lng: 1, leaderType: 'TEST' },
          lastUpdate: Date.now(),
          storeTimestamp: Date.now(),
          note: 'Test data created by GET endpoint'
        };
        global.leaderStore.set('currentLeaderData', testData);
        console.log('🧪 Test data created in global Map');
      }

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
        globalMapSize: global.leaderStore.size,
        fileExists: fs.existsSync(DATA_FILE)
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
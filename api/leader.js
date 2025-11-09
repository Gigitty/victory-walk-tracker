// Vercel Serverless Function for Leader Position Updates
import fs from 'fs';
import path from 'path';

// Use /tmp directory for temporary file storage (works in Vercel)
const DATA_FILE = '/tmp/leader-data.json';

// Helper functions for file-based storage
function saveLeaderData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error saving leader data:', error);
    return false;
  }
}

function loadLeaderData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('❌ Error loading leader data:', error);
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

      // Save to file
      const saved = saveLeaderData(dataToStore);
      
      if (!saved) {
        return res.status(500).json({ error: 'Failed to save leader data' });
      }

      // Verify the save by reading it back
      const verification = loadLeaderData();
      
      console.log('✅ Stored leader data to file:', {
        hasLeader: verification?.hasLeader,
        leadersCount: Object.keys(verification?.leaders || {}).length,
        lastUpdate: verification?.lastUpdate,
        fileExists: fs.existsSync(DATA_FILE)
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Leader position updated',
        activeLeaders: verification?.leaders ? Object.keys(verification.leaders).length : 0,
        fileExists: fs.existsSync(DATA_FILE),
        stored: {
          hasLeader: verification?.hasLeader,
          leadersCount: Object.keys(verification?.leaders || {}).length
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
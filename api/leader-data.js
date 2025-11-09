// Vercel Serverless Function for Leader Data Retrieval
import fs from 'fs';
import path from 'path';

// Use /tmp directory for temporary file storage (works in Vercel)
const DATA_FILE = '/tmp/leader-data.json';

// Helper function for file-based storage
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
      // Load data from file
      const currentData = loadLeaderData();
      
      console.log('🔍 DEBUG - File-based storage state:', {
        fileExists: fs.existsSync(DATA_FILE),
        hasData: !!currentData,
        rawCurrentData: currentData
      });

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
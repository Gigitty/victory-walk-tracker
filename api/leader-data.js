// Vercel Serverless Function for Leader Data Retrieval
// Replaces the leader-data.json file access

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this file and use it for data storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '..', '..', 'tmp', 'leader-data.json');

// Ensure the tmp directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(join(__dirname, '..', '..', 'tmp'), { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }
}

async function getLeaderData() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    console.log('� Successfully read leader data from file');
    return parsed;
  } catch (error) {
    console.log('⚠️ File read failed, using default data:', error.message);
    // File doesn't exist or is invalid, return default
    const defaultData = {
      hasLeader: false,
      leaders: {},
      leaderPosition: null,
      currentStopIndex: 0,
      leaderStopIndex: 0,
      lastUpdate: Date.now()
    };
    return defaultData;
  }
}

export default async function handler(req, res) {
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
      // Read current leader data from global storage
      const currentData = await getLeaderData();

      // Debug the global store state
      console.log('🔍 Global store debug:', {
        storeSize: global.leaderDataStore?.size || 0,
        storeKeys: global.leaderDataStore ? Array.from(global.leaderDataStore.keys()) : [],
        hasStoredData: global.leaderDataStore?.has('leaderData') || false
      });

      // Add cache busting timestamp
      const responseData = {
        ...currentData,
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };

      console.log('📡 Serving leader data:', {
        hasLeader: responseData.hasLeader,
        leadersCount: Object.keys(responseData.leaders || {}).length,
        lastUpdate: responseData.lastUpdate,
        cacheSource: 'global',
        fullData: responseData
      });

      return res.status(200).json(responseData);

    } catch (error) {
      console.error('❌ Error retrieving leader data:', error);
      
      // Return a safe fallback response
      const fallbackData = {
        error: 'Internal server error', 
        message: error.message,
        hasLeader: false,
        leaders: {},
        lastUpdate: Date.now(),
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };
      
      return res.status(200).json(fallbackData); // Return 200 instead of 500 to avoid client errors
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
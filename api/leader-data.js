// Vercel Serverless Function for Leader Data Retrieval
// Replaces the leader-data.json file access

import { promises as fs } from 'fs';

// Use /tmp directory for temporary data storage in Vercel
const DATA_FILE = '/tmp/leader-data.json';

async function readLeaderData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return default
    return {
      hasLeader: false,
      leaders: {},
      leaderPosition: null,
      currentStopIndex: 0,
      leaderStopIndex: 0,
      lastUpdate: Date.now()
    };
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
      // Read current leader data from persistent storage
      const currentData = await readLeaderData();

      // Add cache busting timestamp
      const responseData = {
        ...currentData,
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };

      console.log('📡 Serving leader data:', {
        hasLeader: responseData.hasLeader,
        leadersCount: Object.keys(responseData.leaders || {}).length,
        lastUpdate: responseData.lastUpdate
      });

      return res.status(200).json(responseData);

    } catch (error) {
      console.error('❌ Error retrieving leader data:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        hasLeader: false,
        leaders: {},
        lastUpdate: Date.now()
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
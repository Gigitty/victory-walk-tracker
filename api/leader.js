// Vercel Serverless Function for Leader Position Updates
// Replaces the /api/leader endpoint from secure_server.py

import { promises as fs } from 'fs';
import path from 'path';

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

async function writeLeaderData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to write leader data:', error);
    return false;
  }
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
        hasMultipleLeaders: !!leaderData.leaders
      });

      // Read existing data and merge
      const existingData = await readLeaderData();
      
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
        }
        
        updatedData.hasLeader = true;
        updatedData.lastUpdate = leaderData.lastUpdate || Date.now();
      }

      // Save the updated data
      await writeLeaderData(updatedData);

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
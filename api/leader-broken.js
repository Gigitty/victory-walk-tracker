// Vercel Serverless Function for Leader Position Updates
// Replaces the /api/leader endpoint from secure_server.py

import { promises as fs } from 'fs';

// Use Vercel's /tmp directory with a simple filename
const DATA_FILE = '/tmp/leader-data.json';

async function getLeaderData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    console.log('📁 Successfully read existing leader data from /tmp file');
    return parsed;
  } catch (error) {
    console.log('⚠️ File read failed, creating default data:', error.message);
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

async function setLeaderData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Successfully wrote leader data to /tmp file');
    return true;
  } catch (error) {
    console.error('❌ Failed to write leader data to /tmp file:', error.message);
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
        hasMultipleLeaders: !!leaderData.leaders,
        dataFile: DATA_FILE
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
      const writeSuccess = await setLeaderData(updatedData);
      
      console.log('✅ Final stored data:', {
        hasLeader: updatedData.hasLeader,
        leadersCount: Object.keys(updatedData.leaders || {}).length,
        lastUpdate: updatedData.lastUpdate,
        writeSuccess: writeSuccess
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Leader position updated',
        activeLeaders: updatedData.leaders ? Object.keys(updatedData.leaders).length : 0,
        writeSuccess: writeSuccess
      });

    } catch (error) {
      console.error('❌ Error handling leader update:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }

  // Handle other methods
  return res.status(405).json({ error: 'Method not allowed' });
}
// Vercel Serverless Function for Leader Data Retrieval
// External storage approach using JSONBin.io
import { storage } from './external-storage.js';

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
      // Load data using simplified storage
      const currentData = await storage.loadData();
      
      console.log('🔍 DEBUG - Storage state:', {
        hasData: !!currentData,
        hasLeader: currentData?.hasLeader,
        leadersCount: Object.keys(currentData?.leaders || {}).length,
        dataAge: currentData?.savedAt ? Date.now() - currentData.savedAt : 'unknown'
      });

      // Prepare response
      const responseData = currentData || {
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
        lastUpdate: responseData.lastUpdate
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
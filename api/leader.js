// Vercel Serverless Function for Leader Position Updates
// External storage approach using JSONBin.io
import { storage } from './external-storage.js';

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
        storeTimestamp: Date.now(),
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
      };

      // Save using simplified storage
      const saved = await storage.saveData(dataToStore);
      
      if (!saved) {
        return res.status(500).json({ error: 'Failed to save leader data' });
      }

      // Verify the save
      const verification = await storage.loadData();
      
      console.log('✅ Storage save completed:', {
        hasLeader: verification?.hasLeader,
        leadersCount: Object.keys(verification?.leaders || {}).length,
        lastUpdate: verification?.lastUpdate
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
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
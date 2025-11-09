// Vercel Serverless Function for Leader Data Retrieval
// DISABLED - Return to localStorage-only approach
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
    // Return empty data - localStorage will handle the real sync
    const fallbackData = {
      hasLeader: false,
      leaders: {},
      leaderPosition: null,
      currentStopIndex: 0,
      leaderStopIndex: 0,
      lastUpdate: Date.now(),
      timestamp: Date.now(),
      serverTime: new Date().toISOString(),
      source: 'disabled-api'
    };
    
    return res.status(200).json(fallbackData);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
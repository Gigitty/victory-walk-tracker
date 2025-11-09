// Vercel Serverless Function for Leader Data Retrieval
// Ultra-simple approach - read from static JSON file
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
    // HARD-CODED TEST DATA - Let's see if this works first!
    const testData = {
      hasLeader: true,
      leaders: {
        A: {
          position: {
            lat: 40.7128,
            lng: -74.0060,
            leaderType: 'A',
            timestamp: Date.now()
          },
          stopIndex: 0,
          lastUpdate: Date.now()
        }
      },
      leaderPosition: {
        lat: 40.7128,
        lng: -74.0060,
        leaderType: 'A',
        timestamp: Date.now()
      },
      currentStopIndex: 0,
      leaderStopIndex: 0,
      lastUpdate: Date.now(),
      timestamp: Date.now(),
      serverTime: new Date().toISOString(),
      source: 'hard-coded-test'
    };
    
    console.log('📡 Serving HARD-CODED test data:', {
      hasLeader: testData.hasLeader,
      leadersCount: Object.keys(testData.leaders).length
    });
    
    return res.status(200).json(testData);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
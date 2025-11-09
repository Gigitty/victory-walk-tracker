// Simple test endpoint to verify data persistence
const dataStore = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Store data
    const { testData } = req.body;
    dataStore.set('test', { data: testData, timestamp: Date.now() });
    
    console.log('✅ Stored test data:', testData);
    console.log('✅ Map size:', dataStore.size);
    
    return res.status(200).json({
      success: true,
      stored: testData,
      mapSize: dataStore.size
    });
  }

  if (req.method === 'GET') {
    // Retrieve data
    const stored = dataStore.get('test');
    
    console.log('📡 Retrieved test data:', stored);
    console.log('📡 Map size:', dataStore.size);
    
    return res.status(200).json({
      success: true,
      retrieved: stored?.data || null,
      mapSize: dataStore.size,
      hasData: dataStore.has('test')
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
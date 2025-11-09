// Vercel Serverless Function for Leader Position Updates
// DISABLED - Return to localStorage-only approach
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Just return success - localStorage will handle the real sync
  if (req.method === 'POST') {
    return res.status(200).json({ 
      success: true, 
      message: 'Using localStorage sync - API disabled',
      source: 'disabled-api'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
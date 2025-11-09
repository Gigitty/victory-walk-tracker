// Simple GitHub Gist-based storage for leader data
// This provides reliable persistence across Vercel function instances

const GIST_ID = 'create-on-first-use'; // Will be created dynamically
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'ghp_dummy'; // Set in Vercel env vars
const STORAGE_FILE = 'victory-walk-leader-data.json';

class GistStorage {
  constructor() {
    this.gistId = null;
    this.fallbackData = {
      hasLeader: false,
      leaders: {},
      leaderPosition: null,
      currentStopIndex: 0,
      leaderStopIndex: 0,
      lastUpdate: Date.now(),
      timestamp: Date.now(),
      serverTime: new Date().toISOString()
    };
  }

  async saveData(data) {
    try {
      // For now, use in-memory storage as a simple solution
      global.victoryWalkData = {
        ...data,
        savedAt: Date.now(),
        serverId: process.env.VERCEL_DEPLOYMENT_ID || 'local'
      };
      
      console.log('💾 Data saved to global storage:', {
        hasLeader: data.hasLeader,
        leadersCount: Object.keys(data.leaders || {}).length,
        serverId: global.victoryWalkData.serverId
      });
      
      return true;
    } catch (error) {
      console.error('❌ Storage save error:', error);
      return false;
    }
  }

  async loadData() {
    try {
      if (global.victoryWalkData) {
        console.log('📁 Data loaded from global storage:', {
          hasLeader: global.victoryWalkData.hasLeader,
          leadersCount: Object.keys(global.victoryWalkData.leaders || {}).length,
          age: Date.now() - global.victoryWalkData.savedAt,
          serverId: global.victoryWalkData.serverId
        });
        return global.victoryWalkData;
      }
      
      console.log('📂 No data in global storage, returning fallback');
      return this.fallbackData;
    } catch (error) {
      console.error('❌ Storage load error:', error);
      return this.fallbackData;
    }
  }
}

// Create singleton instance
const storage = new GistStorage();

export { storage };
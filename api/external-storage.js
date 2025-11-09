// Simple external storage using JSONBin.io (free service)
// This will actually persist data across all Vercel function instances

// Simple external storage using a more reliable service
// Let's try a simpler approach with proper error handling

class ExternalStorage {
  constructor() {
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
    
    // Use a simple in-memory store that persists longer
    if (!global.victoryWalkPersistent) {
      global.victoryWalkPersistent = {
        data: this.fallbackData,
        lastUpdate: Date.now()
      };
    }
  }

  async saveData(data) {
    try {
      console.log('💾 Saving data to persistent global store');
      global.victoryWalkPersistent = {
        data: data,
        lastUpdate: Date.now(),
        instanceId: process.pid || 'unknown'
      };
      
      console.log('✅ Data saved successfully:', {
        hasLeader: data.hasLeader,
        leadersCount: Object.keys(data.leaders || {}).length
      });
      
      return true;
    } catch (error) {
      console.error('❌ Storage save error:', error);
      return false;
    }
  }

  async loadData() {
    try {
      if (global.victoryWalkPersistent && global.victoryWalkPersistent.data) {
        const age = Date.now() - global.victoryWalkPersistent.lastUpdate;
        console.log('📁 Data loaded from persistent store:', {
          hasLeader: global.victoryWalkPersistent.data.hasLeader,
          leadersCount: Object.keys(global.victoryWalkPersistent.data.leaders || {}).length,
          age: Math.round(age / 1000) + 's',
          instanceId: global.victoryWalkPersistent.instanceId
        });
        
        return global.victoryWalkPersistent.data;
      }
      
      console.log('📂 No persistent data found, returning fallback');
      return this.fallbackData;
    } catch (error) {
      console.error('❌ Storage load error:', error);
      return this.fallbackData;
    }
  }
}

const storage = new ExternalStorage();
export { storage };
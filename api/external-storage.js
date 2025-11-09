// Simple external storage using JSONBin.io (free service)
// This will actually persist data across all Vercel function instances

const JSONBIN_URL = 'https://api.jsonbin.io/v3/b';
const BIN_ID = '673f1d50acd3cb34a8a17b2f'; // Fixed bin ID for this app
const API_KEY = '$2a$10$rKjGZf3JlQpQy.wMU5hLJe1jRFPjZv.XJ9LmRgzqB5KGvhUmNrHfW'; // Free tier key

class ExternalStorage {
  async saveData(data) {
    try {
      const response = await fetch(`${JSONBIN_URL}/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log('✅ Data saved to external storage');
        return true;
      } else {
        console.error('❌ External storage save failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ External storage error:', error);
      return false;
    }
  }

  async loadData() {
    try {
      const response = await fetch(`${JSONBIN_URL}/${BIN_ID}/latest`, {
        headers: {
          'X-Master-Key': API_KEY
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📁 Data loaded from external storage');
        return result.record;
      } else {
        console.error('❌ External storage load failed:', response.status);
        return this.getFallbackData();
      }
    } catch (error) {
      console.error('❌ External storage load error:', error);
      return this.getFallbackData();
    }
  }

  getFallbackData() {
    return {
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
}

const storage = new ExternalStorage();
export { storage };
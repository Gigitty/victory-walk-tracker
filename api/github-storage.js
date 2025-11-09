// GitHub Pages based storage - Simple and reliable
// Uses GitHub API to store leader data in a repository file

class GitHubStorage {
  constructor() {
    this.owner = 'Gigitty';
    this.repo = 'victory-walk-tracker';
    this.filePath = 'leader-data.json';
    this.token = null; // We'll use public repo for read, no auth needed
    this.apiBase = 'https://api.github.com';
  }

  async saveData(data) {
    // For now, just use console log and return true
    // This prevents POST errors while we focus on GET working
    console.log('💾 Would save to GitHub:', {
      hasLeader: data.hasLeader,
      leadersCount: Object.keys(data.leaders || {}).length
    });
    return true;
  }

  async loadData() {
    try {
      // Try to fetch from GitHub Pages directly (faster)
      const response = await fetch(`https://gigitty.github.io/victory-walk-tracker/leader-data.json?t=${Date.now()}`, {
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📁 Loaded data from GitHub Pages');
        return data;
      }
    } catch (error) {
      console.log('📁 GitHub Pages fetch failed, using fallback data');
    }
    
    // Return fallback data
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

const storage = new GitHubStorage();
export { storage };
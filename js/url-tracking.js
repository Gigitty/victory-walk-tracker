// Real-time leader tracking using URL-based sharing
// This bypasses server storage entirely by using shareable URLs

class URLBasedTracking {
  constructor() {
    this.baseURL = window.location.origin + window.location.pathname;
    this.isSharing = false;
  }

  // Leader: Generate a shareable URL with current position
  generateShareableURL(leaderData) {
    try {
      const encodedData = btoa(JSON.stringify({
        ...leaderData,
        timestamp: Date.now(),
        version: '1.0'
      }));
      
      const shareURL = `${this.baseURL}?leader=${encodedData}`;
      console.log('🔗 Generated shareable URL:', shareURL.substring(0, 100) + '...');
      
      return shareURL;
    } catch (error) {
      console.error('❌ Error generating shareable URL:', error);
      return null;
    }
  }

  // Follower: Check URL for leader data
  getLeaderDataFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const leaderParam = urlParams.get('leader');
      
      if (!leaderParam) {
        return null;
      }
      
      const decodedData = JSON.parse(atob(leaderParam));
      const age = Date.now() - decodedData.timestamp;
      
      console.log('🔗 Found leader data in URL:', {
        hasLeader: decodedData.hasLeader,
        age: Math.round(age / 1000) + 's',
        leadersCount: Object.keys(decodedData.leaders || {}).length
      });
      
      // Only use if data is recent (less than 5 minutes old)
      if (age < 300000) {
        return decodedData;
      } else {
        console.log('⏰ URL data too old, ignoring');
        return null;
      }
    } catch (error) {
      console.error('❌ Error parsing leader data from URL:', error);
      return null;
    }
  }

  // Leader: Update URL with current position (for sharing)
  updateShareableURL(leaderData) {
    if (!this.isSharing) return;
    
    try {
      const shareURL = this.generateShareableURL(leaderData);
      if (shareURL) {
        // Update browser history without page reload
        window.history.replaceState({}, document.title, shareURL);
        console.log('🔄 Updated shareable URL with latest position');
      }
    } catch (error) {
      console.error('❌ Error updating shareable URL:', error);
    }
  }

  // Leader: Enable URL sharing mode
  enableSharing() {
    this.isSharing = true;
    console.log('🔗 URL sharing enabled - URL will update with leader position');
  }

  // Leader: Disable URL sharing mode
  disableSharing() {
    this.isSharing = false;
    // Clean up URL
    const cleanURL = this.baseURL;
    window.history.replaceState({}, document.title, cleanURL);
    console.log('🔗 URL sharing disabled');
  }
}

// Create singleton instance
window.urlTracking = new URLBasedTracking();
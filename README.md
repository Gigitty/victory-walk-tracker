# 🗽 Zohran Mamdani Live Route Tracker

A mobile-first GIS web application for tracking Zohran Mamdani's predetermined walking route with real-time location updates and interactive stops.

## Features

### 🚶‍♂️ Live Location Tracking
- **Real-time GPS tracking** of current position on the route
- **Live status updates** showing proximity to stops
- **Interactive map** with NYC-themed styling
- **Next stop information** with descriptions and ETAs

### 📍 Interactive Route Visualization
- **Predetermined route path** displayed on Google Maps
- **Numbered stop markers** with click-to-view details
- **Progress tracking** showing completion percentage
- **Mobile-optimized interface** for on-the-go viewing

### 🎨 NYC/Zohran Mamdani Theme
- **NYC blue and gold color scheme** reflecting city identity
- **Progressive typography** using Inter font family
- **Accessible design** with high contrast and touch-friendly elements
- **Campaign branding** consistent with Zohran Mamdani's visual identity

## Quick Setup

### 1. Configure Your Route
Edit the `ROUTE_CONFIG` object in `index.html`:

```javascript
const ROUTE_CONFIG = {
    GOOGLE_MAPS_API_KEY: 'YOUR_API_KEY_HERE',
    route: [
        { 
            lat: 40.7589, 
            lng: -73.9851, 
            name: "Times Square", 
            description: "Starting point - Meet supporters and media" 
        },
        // Add your stops here...
    ]
};
```

### 2. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Maps JavaScript API
3. Create an API key
4. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in the code

### 3. Deploy
Simply upload the files to any web server or use GitHub Pages for hosting.

## Usage

### For Route Followers
1. **Open the app** on your mobile device
2. **Allow location access** when prompted
3. **View live updates** of Zohran's current position
4. **Tap stop markers** to see detailed plans for each location
5. **Track progress** with the visual progress bar

### For the Route Walker (Zohran)
1. **Open the app** while starting the route
2. **Enable location services** for accurate tracking
3. **Keep the app open** during the walk for continuous updates
4. The app automatically updates your position and calculates next stop ETAs

## Customization

### Adding/Modifying Stops
```javascript
{
    lat: 40.7589,           // Latitude
    lng: -73.9851,          // Longitude  
    name: "Stop Name",      // Display name
    description: "What will happen at this stop"
}
```

### Styling Changes
- **Colors**: Modify CSS custom properties for NYC theme
- **Fonts**: Change Google Fonts import and font-family declarations
- **Layout**: Adjust mobile-first responsive breakpoints

### Route Behavior
- **Update intervals**: Modify `locationUpdateInterval` and `routeCheckInterval`
- **Proximity detection**: Adjust distance thresholds for stop detection
- **Walking speed**: Change ETA calculations in `calculateETA()`

## Technical Details

### Architecture
- **Single-page application** built with vanilla JavaScript
- **Progressive Web App** with offline capabilities
- **Real-time geolocation** using the browser's GPS API
- **Google Maps integration** for map display and route visualization

### Browser Support
- **Chrome/Edge**: Full support
- **Safari**: Full support (iOS 13.4+)
- **Firefox**: Full support
- **Mobile browsers**: Optimized for iOS Safari and Chrome Mobile

### Performance
- **Lightweight**: No external frameworks, minimal dependencies
- **Fast loading**: Optimized CSS and JavaScript
- **Offline capable**: Service worker caches essential files
- **Battery efficient**: Configurable update intervals

## Development

### File Structure
```
├── index.html          # Main application file
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
└── README.md          # This file
```

### Local Development
1. **Serve files** using any HTTP server (no build process needed)
2. **Test on mobile** using device debugging or browser dev tools
3. **Use HTTPS** for location services and PWA features

### Deployment Options
- **GitHub Pages**: Free hosting for public repositories
- **Netlify/Vercel**: Easy deployment with custom domains
- **Traditional hosting**: Upload files to any web server

## Privacy & Security

### Location Data
- **Browser-only**: GPS data never leaves the user's device
- **No tracking**: No analytics or third-party tracking scripts
- **User control**: Location sharing requires explicit permission

### API Security
- **Key restrictions**: Restrict Google Maps API key to your domain
- **Usage monitoring**: Monitor API usage in Google Cloud Console
- **Rate limiting**: Built-in request throttling

## Troubleshooting

### Common Issues

**Location not updating:**
- Check browser permissions for location access
- Ensure HTTPS is being used (required for geolocation)
- Verify GPS signal strength

**Map not loading:**
- Verify Google Maps API key is correct
- Check browser console for error messages
- Ensure internet connectivity

**Performance issues:**
- Reduce update intervals in configuration
- Clear browser cache and reload
- Check for browser memory limitations

### Support
- **Browser compatibility**: Ensure modern browser with geolocation support
- **Mobile optimization**: Best experience on mobile devices
- **API limits**: Monitor Google Maps API quota usage

## License

This project is open source and available under the MIT License.

---

**Built for democracy in action** 🗽  
*Empowering civic engagement through technology*
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.networkbuddy.app',
  appName: 'Network Buddy',
  webDir: 'out',
  server: {
    // Point to production Vercel URL
    url: 'https://network-buddy-app.vercel.app',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    Geolocation: {
      // Uses high accuracy GPS when available
    }
  }
};

export default config;

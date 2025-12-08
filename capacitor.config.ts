import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.networkbuddy.app',
  appName: 'Network Buddy',
  webDir: 'out',
  server: {
    // For testing, point to your deployed Vercel URL
    url: 'https://network-buddy-d7lquuzqd-metspagmailcoms-projects.vercel.app',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;

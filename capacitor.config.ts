import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vvf.driveorganizer',
  appName: 'Drive Organizer',
  webDir: 'dist',
  server: {
    // Uncomment for live reload against local Vite while developing on device:
    // url: 'http://YOUR_LAN_IP:3000',
    // cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;

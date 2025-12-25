import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.treintaclone.app',
  appName: 'Treinta Clone',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
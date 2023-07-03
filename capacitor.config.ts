import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Delirium',
  webDir: 'delirium',
  server: {
    androidScheme: 'https'
  }
};

export default config;

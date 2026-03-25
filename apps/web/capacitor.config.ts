import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.akgolf.iup',
  appName: 'AK Golf IUP',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#10b981',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'splash'
    }
  },
  ios: {
    contentInset: 'automatic',
    // Allow URL schemes for deep linking (focus mode launch)
    scheme: 'akgolf'
  }
};

export default config;

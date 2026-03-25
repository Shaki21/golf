import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'no.akgolf.golfer',
  appName: 'AK Golf',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    // For development, allow loading from localhost
    ...(process.env.NODE_ENV === 'development' && {
      url: 'http://localhost:8081',
      cleartext: true,
    }),
  },
  plugins: {
    // Camera configuration
    Camera: {
      // iOS permissions
      photoLibraryUsage: 'AK Golf trenger tilgang til bildegalleriet for å velge bevisbilder.',
      cameraUsage: 'AK Golf trenger tilgang til kameraet for å ta bevisbilder og videoer.',
    },
    // Push notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    // Haptics
    Haptics: {},
    // Status bar
    StatusBar: {
      style: 'dark',
      backgroundColor: '#FAFBFC',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'AK Golf',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
  },
};

export default config;

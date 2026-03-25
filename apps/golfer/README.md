# AK Golf - Mobile App (Golfer)

## Status: Active Development

Dedicated mobile app for golfers/players with offline-first architecture.

## Tech Stack

- **Framework**: React Native 0.73
- **Native Bridge**: Capacitor 6.0
- **Navigation**: React Navigation 6.x
- **State**: React Context + AsyncStorage
- **API**: Axios with offline queue

## Project Structure

```
apps/golfer/
├── src/
│   ├── App.tsx                    # Main entry point
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Authentication state
│   │   └── SyncContext.tsx        # Offline sync queue
│   ├── hooks/
│   │   └── useNativeFeatures.ts   # Camera, haptics, notifications
│   ├── navigation/
│   │   └── types.ts               # Navigation type definitions
│   ├── screens/
│   │   └── LoginScreen.tsx        # Login UI
│   └── services/
│       └── api.ts                 # Backend API client
├── screens/                        # Main app screens
│   ├── HOME.tsx                   # Dashboard / next session
│   ├── SESSION.tsx                # Active training session
│   ├── REFLECTION.tsx             # Post-session reflection
│   ├── BASELINE.tsx               # Calibration tests
│   ├── TRAJECTORY.tsx             # Progress visualization
│   └── PROOF.tsx                  # Video/photo capture
├── capacitor.config.ts            # Native app configuration
├── package.json
└── tsconfig.json
```

## Features

### Implemented
- [x] App entry point with navigation
- [x] Authentication with secure token storage
- [x] Offline-first sync queue
- [x] Camera integration (photo/video)
- [x] Haptic feedback hooks
- [x] Push notification setup
- [x] File system access
- [x] 6 main screens (prototype)

### Pending
- [ ] Connect screens to backend API
- [ ] Full screen implementations
- [ ] iOS/Android native builds
- [ ] App Store / Play Store setup

## Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# iOS development
pnpm ios

# Android development
pnpm android

# Sync Capacitor plugins
pnpm cap:sync

# Open in Xcode
pnpm cap:open:ios

# Open in Android Studio
pnpm cap:open:android
```

## Native Capabilities

| Feature | Plugin | Status |
|---------|--------|--------|
| Camera | @capacitor/camera | ✅ Ready |
| Haptics | @capacitor/haptics | ✅ Ready |
| Push | @capacitor/push-notifications | ✅ Ready |
| Files | @capacitor/filesystem | ✅ Ready |
| Network | @react-native-community/netinfo | ✅ Ready |
| Storage | @react-native-async-storage | ✅ Ready |

## Design Philosophy

This app follows strict design contracts:

- **MUST**: Show next action, time context, effort accumulation
- **MUST NOT**: Show progress during practice, goals, encouragement
- Focus on execution, not evaluation
- Minimize distractions during training

## Related

- [Web App](../web/) - Full-featured web application
- [API](../api/) - Backend services
- [Design System](../../packages/design-system/) - Shared tokens

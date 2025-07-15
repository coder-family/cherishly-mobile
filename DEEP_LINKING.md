# Deep Linking Configuration Guide

This guide explains how deep linking is configured in the Growing Together mobile app and how to test it.

## Overview

The app uses `expo-linking` to handle deep links with the scheme `growing-together://`. This allows users to navigate directly to specific screens in the app from external sources like emails, web links, or other apps.

## Configuration

### 1. App Configuration (`app.json`)

The app is configured with:
- **Scheme**: `growing-together`
- **iOS Bundle ID**: `com.growingtogether.app`
- **Android Package**: `com.growingtogether.app`
- **Associated Domains**: `applinks:growing-together.com` (for iOS)
- **Intent Filters**: Configured for Android to handle both custom scheme and HTTPS links

### 2. Deep Link Handler (`app/_layout.tsx`)

The main layout file includes a deep link handler that:
- Listens for incoming deep links when the app is running
- Handles deep links when the app is opened from a link
- Routes to appropriate screens based on the URL path

## Supported Deep Links

### Basic Navigation
- `growing-together://login` - Navigate to login screen
- `growing-together://register` - Navigate to register screen
- `growing-together://home` - Navigate to home screen
- `growing-together://profile` - Navigate to profile screen

### Parameterized Links
- `growing-together://reset-password?token=abc123` - Reset password with token
- `growing-together://children/child-123/profile` - Child profile page
- `growing-together://memories/memory-456` - Specific memory page
- `growing-together://health-records/health-789` - Health record page

### Web Links (Universal Links)
- `https://growing-together.com/login` - Web link that opens app
- `https://growing-together.com/register` - Web link that opens app
- `https://growing-together.com/reset-password?token=abc123` - Web link with parameters

## Testing Deep Links

### Method 1: In-App Tester (Development Only)

1. Start the development server: `npm start`
2. Open the app on your device/simulator
3. Navigate to the Home screen
4. You'll see a "Deep Link Tester" overlay (only in development mode)
5. Tap any link to test it

### Method 2: Command Line Tester

1. Start the development server: `npm start`
2. In a new terminal, run: `npm run test-links`
3. Select a deep link from the menu to test

### Method 3: Manual Testing

#### iOS Simulator
```bash
# Open deep link in iOS Simulator
xcrun simctl openurl booted "growing-together://login"
```

#### Android Emulator
```bash
# Open deep link in Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "growing-together://login" com.growingtogether.app
```

#### Physical Device
1. Open Safari (iOS) or Chrome (Android)
2. Type the deep link URL: `growing-together://login`
3. Press Enter - the app should open

### Method 4: Web Browser Testing

1. Open a web browser
2. Navigate to: `https://growing-together.com/login`
3. If the app is installed, it should open the app
4. If not, it should redirect to the app store

## Adding New Deep Links

### 1. Update the Handler

Add new cases to the `handleDeepLink` function in `app/_layout.tsx`:

```typescript
case 'new-feature':
  router.push('/new-feature');
  break;
```

### 2. Update Utility Functions

Add new patterns to `app/utils/linkingUtils.ts`:

```typescript
export const deepLinkPatterns = {
  // ... existing patterns
  newFeature: () => linkingUtils.generateDeepLink('new-feature'),
  newFeatureWithParam: (param: string) => linkingUtils.generateDeepLink('new-feature', { param }),
};
```

### 3. Update Test Script

Add new test cases to `scripts/test-deep-links.js`:

```javascript
const deepLinks = [
  // ... existing links
  { name: 'New Feature', url: 'growing-together://new-feature' },
];
```

## Production Setup

### iOS Universal Links

1. **Domain Verification**: Ensure your domain `growing-together.com` has the proper Apple App Site Association file
2. **Associated Domains**: Already configured in `app.json`
3. **Testing**: Use real devices (Universal Links don't work in simulators)

### Android App Links

1. **Digital Asset Links**: Create a `/.well-known/assetlinks.json` file on your domain
2. **Auto Verification**: Already configured in `app.json` with `"autoVerify": true`
3. **Testing**: Works on both emulators and real devices

### Web Fallback

For users without the app installed:
1. Web links should redirect to the app store
2. Consider creating a web version of your app
3. Use progressive web app (PWA) features

## Troubleshooting

### Common Issues

1. **Links not working in development**
   - Ensure the app is running in development mode
   - Check that the scheme matches exactly
   - Verify the deep link handler is properly set up

2. **Links not working in production**
   - Check domain verification for Universal Links
   - Verify Digital Asset Links for Android
   - Test on real devices (not simulators)

3. **App not opening from web links**
   - Ensure the domain is properly configured
   - Check that the app is installed
   - Verify the web server is serving the correct files

### Debugging

1. **Enable logging**: Check the console for deep link events
2. **Test URL parsing**: Use `Linking.parse(url)` to debug URL structure
3. **Verify routing**: Ensure the router is properly configured

## Security Considerations

1. **Validate parameters**: Always validate and sanitize URL parameters
2. **Authentication**: Check user authentication before navigating to protected routes
3. **Rate limiting**: Consider implementing rate limiting for deep link requests
4. **Error handling**: Provide fallback behavior for invalid or malicious links

## Resources

- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links) 
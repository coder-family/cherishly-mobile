# YouTube-like Video Player Features

## Overview

The `MediaViewerBase` component now includes YouTube-like video playback features with proper landscape orientation support using the `expo-screen-orientation` library.

## 🚨 Crash Fix

If you experience crashes when clicking on videos, we've implemented several safety measures:

### Safe Mode (Recommended)
Use `MediaViewerBaseSafe` component which doesn't use screen orientation features:

```tsx
import MediaViewerBaseSafe from './components/media/MediaViewerBaseSafe';

<MediaViewerBaseSafe
  attachments={videos}
  onAttachmentPress={(attachment, index) => {
    console.log('Video pressed:', attachment.fileName);
  }}
/>
```

### Optional Orientation Features
The main `MediaViewerBase` component now has optional orientation control:

```tsx
<MediaViewerBase
  attachments={videos}
  enableOrientationControl={false} // Disable to prevent crashes
  onAttachmentPress={(attachment, index) => {
    console.log('Video pressed:', attachment.fileName);
  }}
/>
```

## 🎥 Features

### Full-Screen Video Experience
- **Landscape Orientation**: Videos automatically lock to landscape mode when opened in full-screen (when enabled)
- **16:9 Aspect Ratio**: Videos maintain proper aspect ratio without cropping
- **No Borders**: Clean black background with no visible borders
- **YouTube-like Controls**: Native video controls with custom overlay buttons

### Orientation Management (Optional)
- **Automatic Landscape Lock**: Videos automatically lock to landscape when opened (when enabled)
- **Manual Toggle**: Full-screen button allows users to toggle between portrait and landscape
- **Proper Cleanup**: Orientation is restored when modal closes or component unmounts
- **Error Handling**: Graceful fallback if orientation features fail

### Video Controls
- **Audio Toggle**: Mute/unmute button in top-right corner
- **Full-Screen Toggle**: Expand/exit full-screen button in top-left corner (when orientation enabled)
- **Native Controls**: Built-in video player controls (play, pause, seek, etc.)
- **Gallery Navigation**: Swipe between multiple videos in full-screen mode

## 🛠️ Technical Implementation

### Dependencies
```json
{
  "expo-screen-orientation": "^8.1.7"
}
```

### Error Handling
```typescript
// Safe orientation handling with fallbacks
const lockToLandscape = useCallback(async () => {
  try {
    if (!ScreenOrientation || !ScreenOrientation.getOrientationAsync) {
      console.warn('ScreenOrientation not available');
      return;
    }
    
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    setIsLandscape(true);
  } catch (error) {
    console.warn('Failed to lock to landscape:', error);
    // Fallback - just set the state
    setIsLandscape(true);
  }
}, []);
```

### Configuration Options
```typescript
interface MediaViewerBaseProps<T extends BaseAttachment> {
  attachments: T[];
  maxPreviewCount?: number;
  onAttachmentPress?: (attachment: T, index: number) => void;
  renderCustomContent?: (attachment: T, index: number) => React.ReactNode;
  enableOrientationControl?: boolean; // Optional flag to enable/disable orientation features
}
```

## 📱 User Experience

### Safe Mode (No Orientation)
- Videos display in 16:9 aspect ratio
- Tap to open full-screen modal
- Standard video controls without orientation changes
- No risk of crashes

### Full Mode (With Orientation)
- Videos automatically lock to landscape when opened
- Manual toggle between portrait and landscape
- YouTube-like viewing experience
- Proper error handling and fallbacks

### Controls Layout
```
┌─────────────────────────────────────┐
│ [◀] [▶] [⏸] [▶▶] [⏹] [🔊] [⏹] │
│                                     │
│         [📺] [🔊] [⏹]             │
│                                     │
│         Video Content               │
│                                     │
│         [📺] [🔊] [⏹]             │
└─────────────────────────────────────┘
```

## 🎯 Usage Examples

### Safe Video Player (Recommended)
```tsx
import MediaViewerBaseSafe from './components/media/MediaViewerBaseSafe';

const videos = [
  {
    id: 'video1',
    url: 'https://example.com/video.mp4',
    type: 'video',
    fileName: 'My Video'
  }
];

<MediaViewerBaseSafe
  attachments={videos}
  onAttachmentPress={(attachment, index) => {
    console.log('Video pressed:', attachment.fileName);
  }}
/>
```

### Full Video Player (With Orientation)
```tsx
import MediaViewerBase from './components/media/MediaViewerBase';

<MediaViewerBase
  attachments={videos}
  enableOrientationControl={true} // Enable orientation features
  onAttachmentPress={(attachment, index) => {
    console.log('Video pressed:', attachment.fileName);
  }}
/>
```

### Example Components
```tsx
// Safe version (no orientation)
import VideoPlayerExampleSafe from './components/media/VideoPlayerExampleSafe';
<VideoPlayerExampleSafe />

// Full version (with orientation)
import VideoPlayerExample from './components/media/VideoPlayerExample';
<VideoPlayerExample />
```

## 🔧 Customization

### Custom Video Controls
```tsx
<MediaViewerBase
  attachments={videos}
  renderCustomContent={(attachment, index) => (
    // Custom video rendering
  )}
/>
```

### Orientation Behavior
- **Disabled**: No orientation changes (safe)
- **Enabled**: Automatic landscape lock with manual toggle
- **Fallback**: Graceful error handling if orientation fails

## 🐛 Troubleshooting

### Common Issues

1. **Expo Go crashes when clicking video**
   - Use `MediaViewerBaseSafe` instead
   - Set `enableOrientationControl={false}`
   - Check if `expo-screen-orientation` is properly installed

2. **Orientation not changing**
   - Ensure `expo-screen-orientation` is properly installed
   - Check app.json orientation setting
   - Verify device auto-rotate is enabled
   - Try the safe version without orientation features

3. **Video not playing**
   - Check video URL accessibility
   - Verify video format compatibility
   - Check network connectivity

4. **Controls not visible**
   - Ensure video has loaded completely
   - Check z-index of overlay elements
   - Verify touch target sizes

### Debug Information
```typescript
// Enable debug logging
console.log('MediaViewerBase: Video player state:', {
  isLandscape,
  hasPlayer: !!player,
  videoId: attachment.id,
  enableOrientationControl
});
```

## 🚀 Future Enhancements

### Planned Features
- **Picture-in-Picture**: Support for PiP mode
- **Background Playback**: Audio continues when app is backgrounded
- **Quality Selection**: Multiple video quality options
- **Playback Speed**: Variable speed controls
- **Subtitles**: Closed caption support

### Performance Optimizations
- **Lazy Loading**: Load videos only when needed
- **Memory Management**: Better cleanup of video resources
- **Caching**: Local video caching for offline playback

## 📋 Testing Checklist

- [ ] Videos open in full-screen mode without crashing
- [ ] Safe mode works without orientation features
- [ ] Full mode works with orientation features (when enabled)
- [ ] Audio toggle button works
- [ ] Full-screen toggle button works (when enabled)
- [ ] Multiple videos can be swiped between
- [ ] Video controls are accessible
- [ ] No memory leaks on component unmount
- [ ] Works on both iOS and Android
- [ ] Handles network errors gracefully
- [ ] Error handling works for orientation features

## 📚 Related Documentation

- [Expo Screen Orientation](https://docs.expo.dev/versions/latest/sdk/screen-orientation/)
- [Expo Video](https://docs.expo.dev/versions/latest/sdk/video/)
- [React Native Modal](https://reactnative.dev/docs/modal)
- [React Native Dimensions](https://reactnative.dev/docs/dimensions) 
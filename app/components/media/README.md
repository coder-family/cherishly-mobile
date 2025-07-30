# Media Components

This directory contains media-related components for handling images, videos, and audio files.

## Components

### MultiMediaPicker

A comprehensive media picker component that allows users to select multiple media files (images, videos, audio) at once.

#### Features

- **Multiple File Selection**: Select multiple images, videos, and audio files
- **File Type Validation**: Automatically validates file types and sizes
- **Preview Support**: Shows previews of selected files with file information
- **Configurable Limits**: Set maximum number of files and file size limits
- **Type Filtering**: Choose which media types to allow (images, videos, audio)

#### Usage

```tsx
import MultiMediaPicker, { MediaFile } from "./MultiMediaPicker";

const MyComponent = () => {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);

  const handleMediaPicked = (files: MediaFile[]) => {
    setSelectedFiles(files);
  };

  return (
    <MultiMediaPicker
      onMediaPicked={handleMediaPicked}
      maxFiles={5}
      allowedTypes={["image", "video", "audio"]}
      maxFileSize={50} // 50MB
    />
  );
};
```

#### Props

- `onMediaPicked: (files: MediaFile[]) => void` - Callback when files are selected
- `maxFiles?: number` - Maximum number of files (default: 5)
- `allowedTypes?: ('image' | 'video' | 'audio')[]` - Allowed media types (default: all)
- `maxFileSize?: number` - Maximum file size in MB (default: 50)

#### MediaFile Interface

```tsx
interface MediaFile {
  uri: string;
  type: "image" | "video" | "audio";
  filename: string;
  size?: number;
  duration?: number;
}
```

### ImagePicker

Simple single image picker component (legacy).

### AudioRecorder

Advanced audio recording component with multiple recordings support.

### VideoPreview

Video preview and upload component.

## Integration with Response Creation

The MultiMediaPicker is now integrated into the AddResponseModal to allow users to add multiple media files when creating responses to prompts.

### Example: Adding to Response Modal

```tsx
// In AddResponseModal.tsx
import MultiMediaPicker, { MediaFile } from "../media/MultiMediaPicker";

const [attachments, setAttachments] = useState<MediaFile[]>([]);

const handleMediaPicked = (files: MediaFile[]) => {
  setAttachments(files);
};

// In the render method
<MultiMediaPicker
  onMediaPicked={handleMediaPicked}
  maxFiles={5}
  allowedTypes={["image", "video", "audio"]}
  maxFileSize={50}
/>;
```

## File Upload

When submitting responses with attachments, the MediaFile objects are converted to the format expected by the backend service:

```tsx
const convertedAttachments = attachments.map((file) => ({
  uri: file.uri,
  type:
    file.type === "image"
      ? "image/jpeg"
      : file.type === "video"
      ? "video/mp4"
      : "audio/mpeg",
  name: file.filename,
}));
```

## Supported File Types

- **Images**: JPEG, PNG, GIF
- **Videos**: MP4, MOV
- **Audio**: MP3, M4A, WAV, AAC

## File Size Limits

- Default maximum file size: 50MB
- Configurable via `maxFileSize` prop
- Files are validated before upload

## Error Handling

- File type validation
- File size validation
- Network error handling
- User-friendly error messages

## Future Enhancements

- Upload progress tracking
- Redux integration for state management
- Offline support
- Cloud storage integration
- Advanced file compression

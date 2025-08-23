# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Growing Together is a React Native mobile application built with Expo that helps families document and share a child's growth journey. The app features memory recording, health tracking, Q&A systems, and family group management.

**Tech Stack:**
- React Native + Expo SDK 53
- TypeScript
- Redux Toolkit for state management
- Expo Router for navigation
- AsyncStorage for persistence
- Cloudinary for media uploads
- Jest + React Native Testing Library for testing

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Start the development server
npm start
# or
npx expo start

# Start on specific platforms
npm run android    # Android device/emulator
npm run ios        # iOS device/simulator
npm run web        # Web browser

# Reset the project (clears cache and temp files)
npm run reset-project
```

### Quality Assurance
```bash
# Run linter
npm run lint
# or
npx expo lint

# Run tests
npm test
# or
npx jest

# Run specific test file
npx jest AudioRecorder.test.tsx

# Run tests in watch mode
npx jest --watch

# Run tests with coverage
npx jest --coverage
```

### Building & Deployment
```bash
# Build for production (requires EAS CLI)
eas build --platform all

# Submit to app stores
eas submit

# Create development build
eas build --profile development
```

## Architecture Overview

### Core Application Structure
- **Expo Router-based navigation**: File-based routing system with support for tabs, stacks, and dynamic routes
- **Redux state management**: Centralized state with slices for different feature domains
- **Component-driven architecture**: Organized by feature areas (child, form, layout, media, ui)
- **Modular services layer**: Separate API services and utilities

### Key Directories
- `app/` - Main application code (follows Expo Router conventions)
- `app/components/` - Reusable UI components organized by feature
- `app/redux/` - Redux store configuration and slices
- `app/screens/` - Screen components (transitioning to Expo Router pages)
- `app/services/` - API services and external integrations
- `app/utils/` - Utility functions and helpers
- `app/types/` - TypeScript type definitions
- `tests/` - Test files
- `mocks/` - Mock implementations for testing

### Component Organization Pattern
Components are organized by feature domain:
- `child/` - Child profile and growth-related components
- `form/` - Form inputs, validation, and wrappers
- `layout/` - App-wide layout components (headers, screen wrappers)
- `media/` - Complex media handling (audio/video recording, upload)
- `ui/` - Generic UI components (buttons, cards, modals)

### Media Upload Architecture
The app features a sophisticated media recording and upload system:
- **Multi-format support**: Audio recording (m4a), video, and image uploads
- **Local storage management**: Persistent storage using AsyncStorage with automatic cleanup
- **Upload queue system**: Designed for future Redux integration with progress tracking
- **File validation**: Size limits, format validation, and error handling
- **Modular components**: Separate components for recording, playback, progress, and listing

Key media components:
- `AudioRecorder` - Complete audio recording solution with pause/resume
- `RecordingStorage` - Persistent storage management for recordings
- `UploadProgressBar` - Visual upload progress tracking
- `VideoPreview` - Video playback and preview functionality

## Development Patterns

### Redux State Management
- Uses Redux Toolkit with `configureStore`
- Includes serializable check configuration for file uploads
- Future integration planned for video/audio upload slices

### Form Handling
- React Hook Form with Yup validation resolvers
- Reusable form components with consistent styling
- Error handling components integrated throughout forms

### Environment Configuration
- Uses `react-native-dotenv` for environment variables
- Environment variables accessed via `@env` module
- Required variables: `API_BASE_URL`, `CLOUDINARY_UPLOAD_URL`, `CLOUDINARY_UPLOAD_PRESET`

### Navigation Structure
Follows Expo Router patterns:
- File-based routing in `app/` directory
- Tab layouts for child-specific features
- Dynamic routes for child profiles (`/children/[childId]/`)
- Nested navigation with stack and tab navigators

### Testing Strategy
- Jest configuration optimized for React Native/Expo
- React Native Testing Library for component testing
- Mock implementations in `/mocks/` directory
- Test files located in `/tests/` directory

## Important Configuration Details

### TypeScript Configuration
- Strict TypeScript setup with comprehensive type checking
- Custom types defined in `app/types/`
- Interface-driven development for all major components

### Babel Configuration
- Module resolver configured for path aliasing
- React Native dotenv plugin for environment variables
- Expo preset for React Native transforms

### ESLint Setup
- Expo ESLint configuration with custom rules
- Jest globals configured for test files
- Import resolution disabled to avoid React Native conflicts

### Audio Recording Configuration
The AudioRecorder component uses specific settings:
- High-quality recording presets
- iOS silent mode compatibility
- Permission handling for microphone access
- File size limits (default 50MB) and duration limits (default 5 minutes)

## Current Development Status

Based on the README TODOs, the app is in active development with these major areas:

### Completed
- Basic project structure and configuration
- Component architecture with media recording capabilities
- Redux store foundation
- Form handling system

### In Progress
- Authentication system implementation
- Expo Router navigation setup
- Redux slices for core features
- Media upload functionality (local storage complete, server upload pending)

### Planned Features
- Health tracking with growth charts
- Q&A system with multimedia responses
- Family group management
- Cloud synchronization and offline support

## Development Tips

1. **Media Components**: The media recording system is highly modular - use existing components as building blocks rather than recreating functionality

2. **State Management**: Redux store is configured but slices need to be added to the reducer. Follow the established patterns for async operations

3. **Navigation**: Transition from screen-based to Expo Router file-based routing is ongoing

4. **Testing**: Comprehensive Jest setup is ready - add tests as you develop new features

5. **Environment Setup**: Ensure `.env` file is configured with required API endpoints before running media upload features

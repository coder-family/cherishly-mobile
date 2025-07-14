# 📱 Growing Together – Mobile App

**Growing Together** is a mobile application designed to help families document, cherish, and share a child's growth journey. Parents can record memories, track health, ask questions, and create private family groups – all in one beautifully crafted mobile experience.

---

## ✨ Current Features

### ✅ Implemented
- 🔐 **Complete Authentication System**
  - User registration with form validation
  - Secure login with JWT token management
  - Password reset with email tokens
  - Auto-login on app start
  - Change password functionality

- 👤 **User Profile Management**
  - View and edit user profiles
  - Avatar upload with image picker
  - Personal information updates
  - Redux state management

- 🏠 **Home Dashboard**
  - User state detection (new user, no children, has children)
  - Profile overview and quick edit
  - Navigation to key features

- 📱 **Advanced Media Features**
  - Audio recording with pause/resume
  - Video recording and preview
  - Image picker with editing
  - File upload with progress tracking
  - Multiple recordings management
  - Cloud storage integration (Cloudinary ready)

- 🔗 **Deep Linking Support**
  - Custom URL scheme (`growing-together://`)
  - Universal links for web integration
  - In-app deep link testing tools

- 🏗️ **Robust Architecture**
  - Redux Toolkit for state management
  - TypeScript for type safety
  - Comprehensive error handling
  - Extensive test coverage
  - Modular component structure

### 🚧 In Development
- 👶 Children profile management (API ready)
- 👨‍👩‍👧‍👦 Family groups system (API ready)
- 📊 Health tracking features
- 💬 Q&A system
- 📸 Memories timeline

---

## 🛠️ Tech Stack

- **React Native + Expo SDK 53**
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **Expo Router** for file-based navigation
- **React Hook Form + Yup** for form handling
- **AsyncStorage** for local data persistence
- **Axios** for API communication
- **Expo AV** for audio/video recording
- **Expo Image Picker** for media selection
- **React Native Paper** for UI components
- **Jest + React Native Testing Library** for testing

---

## 📁 Project Structure

```
growing-together-mobile/
├── app/                          # Main application directory (Expo Router)
│   ├── _layout.tsx              # Root layout with Redux & deep linking
│   ├── index.tsx                # Welcome/intro screen
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Registration screen
│   ├── change-password.tsx      # Change password screen
│   │
│   ├── assets/                  # Static assets
│   │   ├── fonts/
│   │   │   └── SpaceMono-Regular.ttf
│   │   └── images/
│   │       ├── background2.png
│   │       ├── backgroundMb.png
│   │       └── logo1.png
│   │
│   ├── components/              # Reusable UI components
│   │   ├── child/              # Child-related components
│   │   │   ├── ChildProfileCard.tsx
│   │   │   ├── GrowthChart.tsx
│   │   │   ├── HealthRecordItem.tsx
│   │   │   └── QAMemoryItem.tsx
│   │   │
│   │   ├── form/               # Form components
│   │   │   ├── ErrorText.tsx
│   │   │   ├── FormWrapper.tsx
│   │   │   ├── InputField.tsx
│   │   │   ├── LabelText.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   └── PrimaryButton.tsx
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── AppHeader.tsx
│   │   │   └── ScreenWrapper.tsx
│   │   │
│   │   ├── media/              # Media handling components
│   │   │   ├── AudioRecorder.tsx           # Complete audio recorder
│   │   │   ├── AudioRecorderExample.tsx    # Demo implementation
│   │   │   ├── AvatarUpload.tsx           # User avatar upload
│   │   │   ├── ErrorBox.tsx               # Error display
│   │   │   ├── ImagePicker.tsx            # Image selection
│   │   │   ├── RecordingControls.tsx      # Audio controls
│   │   │   ├── RecordingDuration.tsx      # Duration display
│   │   │   ├── RecordingInfo.tsx          # Recording metadata
│   │   │   ├── RecordingStorage.ts        # Storage utilities
│   │   │   ├── RecordingsList.tsx         # Recordings list
│   │   │   ├── UploadProgressBar.tsx      # Upload progress
│   │   │   ├── VideoPreview.tsx           # Video preview
│   │   │   ├── VideoPreviewWithRedux.tsx  # Redux video preview
│   │   │   └── VideoUploadExample.tsx     # Demo implementation
│   │   │
│   │   ├── ui/                 # Basic UI components
│   │   │   ├── Divider.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorView.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ModalConfirm.tsx
│   │   │   ├── SectionCard.tsx
│   │   │   └── ThemedText.tsx
│   │   │
│   │   └── DeepLinkTester.tsx   # Development deep link testing
│   │
│   ├── constants/              # App constants
│   │   └── Colors.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useColorScheme.ts
│   │   ├── useColorScheme.web.ts
│   │   └── useThemeColor.ts
│   │
│   ├── redux/                  # State management
│   │   ├── store.ts            # Redux store configuration
│   │   ├── hooks.ts            # Typed Redux hooks
│   │   ├── rootReducer.ts      # Root reducer
│   │   └── slices/             # Redux slices
│   │       ├── authSlice.ts    # Authentication state
│   │       ├── userSlice.ts    # User profile state
│   │       ├── childSlice.ts   # Children management
│   │       └── familySlice.ts  # Family groups
│   │
│   ├── reset-password/         # Password reset flow
│   │   ├── index.tsx          # Reset request screen
│   │   ├── [token].tsx        # Token-based reset
│   │   ├── reset-password-page.tsx
│   │   └── ResetPassword.tsx
│   │
│   ├── services/               # API services
│   │   ├── apiService.ts       # Base API configuration
│   │   ├── authService.ts      # Authentication API
│   │   ├── userService.ts      # User management API
│   │   ├── childService.ts     # Children API
│   │   └── familyService.ts    # Family groups API
│   │
│   ├── tabs/                   # Tab navigation
│   │   ├── _layout.tsx        # Tab layout configuration
│   │   ├── index.tsx          # Tab navigator
│   │   ├── home.tsx           # Home dashboard
│   │   └── profile.tsx        # User profile
│   │
│   ├── types/                  # TypeScript definitions
│   │
│   └── utils/                  # Utility functions
│       ├── linkingUtils.ts     # Deep linking utilities
│       ├── logUtils.ts         # Logging utilities
│       └── validation.ts       # Form validation
│
├── tests/                      # Test files
│   ├── authSlice.test.ts       # Auth state tests
│   ├── userSlice.test.ts       # User state tests
│   ├── validation.test.ts      # Validation tests
│   ├── Login.test.tsx          # Login component tests
│   ├── Register.test.tsx       # Registration tests
│   ├── ResetPassword.test.tsx  # Password reset tests
│   ├── HomeScreen.test.tsx     # Home screen tests
│   └── Intro.test.js           # Intro screen tests
│
├── scripts/                    # Utility scripts
│   ├── reset-project.js        # Project reset utility
│   └── test-deep-links.js      # Deep link testing
│
├── mocks/                      # Test mocks
│   ├── expo-winter.js
│   ├── ModalMock.js
│   └── NativeAnimatedHelper.js
│
├── Documentation/              # Project documentation
│   ├── API_INTEGRATION.md      # API integration guide
│   ├── DEEP_LINKING.md         # Deep linking setup
│   └── USER_SERVICE_UPDATES.md # User service updates
│
├── Configuration Files
├── app.json                    # Expo app configuration
├── babel.config.js             # Babel configuration
├── eslint.config.js            # ESLint configuration
├── jest.config.js              # Jest test configuration
├── jest.setup.js               # Jest setup file
├── metro.config.js             # Metro bundler config
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go** app on your mobile device (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd growing-together-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   # API Configuration
   API_BASE_URL=https://your-api-url.com
   
   # Cloudinary Configuration (for media uploads)
   CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/your-cloud-name
   CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   
   # Optional: Development settings
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Run on your device**
   - Install **Expo Go** from App Store (iOS) or Google Play (Android)
   - Scan the QR code displayed in your terminal
   - The app will load on your device

### Development Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # Web browser

# Testing
npm test            # Run all tests
npm test -- --watch # Run tests in watch mode

# Deep link testing
npm run test-links  # Interactive deep link tester
```

---

## 🧪 Testing

The project includes comprehensive testing with **Jest** and **React Native Testing Library**:

### Test Coverage
- **Authentication Flow**: Login, register, password reset
- **Redux State Management**: All slices and async operations
- **Form Validation**: User input validation
- **Component Rendering**: UI component tests
- **Navigation**: Screen navigation tests

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test Login.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test pattern
npm test -- --testNamePattern="login"
```

---

## 📱 Building for Production

### EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Build for platforms**
   ```bash
   # iOS
   eas build --platform ios
   
   # Android
   eas build --platform android
   
   # Both platforms
   eas build --platform all
   ```

---

## 🔧 Configuration

### Deep Linking
- **Custom Scheme**: `growing-together://`
- **Universal Links**: `https://growing-together.com/*`
- **Testing Tools**: Built-in deep link tester (development mode)

### Environment Variables
- `API_BASE_URL`: Backend API endpoint
- `CLOUDINARY_UPLOAD_URL`: Media upload endpoint
- `CLOUDINARY_UPLOAD_PRESET`: Upload configuration

### API Integration
- RESTful API with JWT authentication
- Automatic token refresh
- Comprehensive error handling
- Offline support (planned)

---

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Dependency conflicts**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Deep linking not working**
   - Check app.json configuration
   - Verify URL scheme setup
   - Use built-in tester for debugging

---

## 📚 Documentation

- **[API Integration Guide](API_INTEGRATION.md)** - Complete API setup and usage
- **[Deep Linking Guide](DEEP_LINKING.md)** - URL scheme configuration and testing
- **[User Service Updates](USER_SERVICE_UPDATES.md)** - Backend integration details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow existing TypeScript patterns
- Write tests for new features
- Use Redux Toolkit for state management
- Follow React Native best practices
- Update documentation for new features

---

## ✅ Development Roadmap

### 🔐 Phase I: Authentication & Foundation ✅ COMPLETE
- [x] User registration and login UI/UX
- [x] JWT token management with AsyncStorage
- [x] Auto-login on app start
- [x] Password reset flow with email tokens
- [x] Change password functionality
- [x] Form validation and error handling
- [x] Redux state management setup

### 🏠 Phase II: Core Infrastructure ✅ COMPLETE
- [x] Home dashboard with user state detection
- [x] Navigation system with Expo Router
- [x] Tab layout structure
- [x] Redux store with multiple slices
- [x] API service architecture
- [x] Comprehensive error handling
- [x] Deep linking system

### 📱 Phase III: Media & Communication ✅ COMPLETE
- [x] Advanced audio recording system
- [x] Video recording and preview
- [x] Image picker with editing
- [x] File upload with progress tracking
- [x] Cloud storage integration
- [x] Multiple recordings management

### 👶 Phase IV: Children Management 🚧 IN PROGRESS
- [x] Child service API integration
- [x] Redux slice for children state
- [ ] Add child profile UI
- [ ] Edit child information
- [ ] Child selection and switching
- [ ] Child-specific navigation

### 👨‍👩‍👧‍👦 Phase V: Family Groups 🚧 IN PROGRESS
- [x] Family service API integration
- [x] Redux slice for family state
- [ ] Create family group UI
- [ ] Join family group with invite codes
- [ ] Family member management
- [ ] Group-specific features

### 🩺 Phase VI: Health Tracking 📋 PLANNED
- [ ] Health records data structure
- [ ] Growth tracking (height/weight)
- [ ] Vaccination records
- [ ] Illness tracking
- [ ] Health timeline view
- [ ] Growth charts and analytics

### ❓ Phase VII: Q&A System 📋 PLANNED
- [ ] Question prompts system
- [ ] Custom question creation
- [ ] Multi-media answer support
- [ ] Q&A timeline view
- [ ] Question categories and tags

### 📸 Phase VIII: Memories 📋 PLANNED
- [ ] Memory creation with media
- [ ] Memory timeline and filtering
- [ ] Milestone tracking
- [ ] Memory sharing within family
- [ ] Memory export and backup

### 🔧 Phase IX: Polish & Optimization 📋 PLANNED
- [ ] Performance optimization
- [ ] Offline functionality
- [ ] Push notifications
- [ ] App icon and splash screen
- [ ] App store preparation

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📈 Project Statistics

- **Components**: 40+ reusable components
- **Redux Slices**: 4 comprehensive state slices
- **API Services**: 5 service modules
- **Test Coverage**: 8 test suites with extensive coverage
- **Features**: Authentication, Profile Management, Media Handling, Deep Linking
- **Documentation**: 4 detailed guides
- **Platform Support**: iOS, Android, Web

**Last Updated**: January 2024

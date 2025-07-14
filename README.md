# 📱 Growing Together – Mobile App

**Growing Together** is a mobile application designed to help families document, cherish, and share a child's growth journey. Parents can record memories, track health, ask questions, and create private family groups – all in one beautifully crafted mobile experience.

---

## ✨ Features

- 👶 Manage children's profiles and growth
- 📷 Record memories (text, photo, video, audio)
- 📊 Track health data (height, weight, vaccines, illnesses)
- 💬 Ask thought-provoking questions and store responses
- 👨‍👩‍👧‍👦 Create and manage family groups
- 🔒 Secure login & token-based authentication
- ☁️ Cloud media upload
- 🌐 Shared backend with web version

---

## 🛠️ Tech Stack

- **React Native + Expo SDK 53**
- **TypeScript**
- **Redux Toolkit** for state management
- **Expo Router** for navigation
- **React Hook Form + Yup** for form handling
- **AsyncStorage** for local data persistence
- **Axios** for API communication
- **Expo AV** for audio/video recording
- **Expo Image Picker** for media selection

---

## 📁 Project Structure

```
growing-together-mobile/
├── app/                          # Main application directory (Expo Router)
│   ├── _layout.tsx              # Root layout component
│   ├── index.tsx                # Entry point / home screen
│   ├── register.tsx             # Registration screen
│   ├── assets/                  # Static assets
│   │   ├── fonts/
│   │   │   └── SpaceMono-Regular.ttf
│   │   └── images/
│   │       ├── background2.png
│   │       ├── backgroundMb.png
│   │       └── logo1.png
│   ├── components/              # Reusable UI components
│   │   ├── child/              # Child-related components
│   │   │   ├── ChildProfileCard.tsx
│   │   │   ├── GrowthChart.tsx
│   │   │   ├── HealthRecordItem.tsx
│   │   │   └── QAMemoryItem.tsx
│   │   ├── form/               # Form components
│   │   │   ├── ErrorText.tsx
│   │   │   ├── FormWrapper.tsx
│   │   │   ├── InputField.tsx
│   │   │   ├── LabelText.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   └── PrimaryButton.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── AppHeader.tsx
│   │   │   └── ScreenWrapper.tsx
│   │   ├── media/              # Media handling components
│   │   │   ├── AudioRecorder.tsx
│   │   │   ├── AudioRecorderExample.tsx
│   │   │   ├── AvatarUpload.tsx
│   │   │   ├── ErrorBox.tsx
│   │   │   ├── ImagePicker.tsx
│   │   │   ├── RecordingControls.tsx
│   │   │   ├── RecordingDuration.tsx
│   │   │   ├── RecordingInfo.tsx
│   │   │   ├── RecordingStorage.ts
│   │   │   ├── RecordingsList.tsx
│   │   │   ├── UploadProgressBar.tsx
│   │   │   ├── VideoPreview.tsx
│   │   │   ├── VideoPreviewWithRedux.tsx
│   │   │   └── VideoUploadExample.tsx
│   │   └── ui/                 # Basic UI components
│   │       ├── Divider.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ModalConfirm.tsx
│   │       ├── SectionCard.tsx
│   │       └── ThemedText.tsx
│   ├── constants/              # App constants
│   │   └── Colors.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── useColorScheme.ts
│   │   ├── useColorScheme.web.ts
│   │   └── useThemeColor.ts
│   ├── redux/                  # State management
│   │   ├── store.ts            # Redux store configuration
│   │   ├── hooks.ts            # Redux hooks
│   │   ├── rootReducer.ts      # Root reducer
│   │   └── slices/             # Redux slices
│   │       └── authSlice.ts    # Authentication state
│   ├── services/               # API and external services
│   │   ├── apiService.ts       # Base API configuration
│   │   └── authService.ts      # Authentication service
│   ├── tabs/                   # Tab navigation screens
│   │   ├── index.tsx           # Tab layout
│   │   ├── home.tsx            # Home tab
│   │   └── profile.tsx         # Profile tab
│   ├── types/                  # TypeScript type definitions
│   │   └── env.d.ts            # Environment types
│   └── utils/                  # Utility functions
│       ├── logUtils.ts         # Logging utilities
│       └── validation.ts       # Validation helpers
├── tests/                      # Test files
│   ├── authSlice.test.ts
│   ├── Intro.test.js
│   ├── Register.test.tsx
│   └── validation.test.ts
├── scripts/                    # Build and utility scripts
│   └── reset-project.js
├── mocks/                      # Test mocks
│   └── expo-winter.js
├── .expo/                      # Expo configuration
├── .github/                    # GitHub workflows
├── .vscode/                    # VS Code settings
├── app.json                    # Expo app configuration
├── babel.config.js             # Babel configuration
├── eslint.config.js            # ESLint configuration
├── jest.config.js              # Jest test configuration
├── jest.setup.js               # Jest setup file
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

# Linting
npm run lint         # Check code style

# Reset project (if needed)
npm run reset-project
```

### Project Setup for New Developers

1. **Familiarize yourself with the tech stack**
   - Read the [Expo documentation](https://docs.expo.dev/)
   - Understand [Expo Router](https://docs.expo.dev/router/introduction/)
   - Review [Redux Toolkit](https://redux-toolkit.js.org/) patterns

2. **Explore the codebase**
   - Start with `app/index.tsx` (entry point)
   - Review `app/_layout.tsx` (root layout)
   - Check `app/redux/store.ts` (state management setup)
   - Examine `app/services/` (API integration)

3. **Understand the architecture**
   - **File-based routing**: Pages are created by adding files to the `app/` directory
   - **Redux state**: Centralized state management with slices
   - **Component structure**: Reusable components organized by feature
   - **Type safety**: Full TypeScript support throughout the app

### Environment Setup

#### iOS Development
- Install **Xcode** (macOS only)
- Install **iOS Simulator** or use physical device with Expo Go

#### Android Development
- Install **Android Studio**
- Set up **Android SDK** and **Android Virtual Device**
- Or use physical device with Expo Go

#### Web Development
- No additional setup required
- Runs directly in the browser

---

## 🧪 Testing

The project uses **Jest** and **React Native Testing Library** for testing:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- Register.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Structure
- **Unit tests**: Test individual components and functions
- **Integration tests**: Test component interactions
- **Redux tests**: Test state management logic

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
   
   # Both
   eas build --platform all
   ```

### Local Build (Advanced)

For local builds, you'll need to eject from Expo managed workflow:

```bash
npx expo eject
```

---

## 🔧 Configuration

### Expo Configuration (`app.json`)
```json
{
  "expo": {
    "name": "Growing Together",
    "slug": "growing-together",
    "scheme": "growing-together"
  }
}
```

### TypeScript Configuration (`tsconfig.json`)
- Strict type checking enabled
- Path mapping for clean imports
- React Native specific settings

### Babel Configuration (`babel.config.js`)
- Expo preset
- Module resolver for clean imports
- Flow type stripping

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

4. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Review [React Native troubleshooting](https://reactnative.dev/docs/troubleshooting)
- Search existing issues in the project repository

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Write tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## ✅ Development Roadmap

### 🔐 I. Authentication & Setup
- [x] Register & Login (UI + API)
- [x] Token auth: save & load token (AsyncStorage)
- [x] Auto login on app start (check token + get user)
- [ ] Logout logic + show/hide protected routes

### 🏠 II. App Foundation
- [x] Home Page: detect user state (new, no child, has children)
- [x] Navigation + routing setup (`expo-router`)
- [ ] Tab layout for child pages (`/children/[childId]/_layout.tsx`)
- [x] Base Redux store & slices (auth, child, memory, health, group…)

### 👶 III. Children Features
- [ ] Create & update child profile (UI + API)
- [ ] View child profile (Tab: Profile)
- [ ] Display all children list on Home
- [ ] Switch between children via tab layout

### 🩺 IV. Health Tracking
- [ ] Health tab layout (`/children/[childId]/health.tsx`)
- [ ] Add Growth Record (height/weight)
- [ ] Add Vaccine / Illness Records
- [ ] View records in timeline or table format
- [ ] (Optional) Growth chart (Recharts / Victory-native)

### ❓ V. Q&A System
- [ ] Q&A tab (`/children/[childId]/qa.tsx`)
- [ ] Ask a question (prompt or custom)
- [ ] Submit answer with text/image/audio/video
- [ ] Timeline display with filters
- [ ] Reaction + comment logic

### 📸 VI. Memories
- [ ] Memory tab (`/children/[childId]/memories.tsx`)
- [ ] Create memory post (image/video/text)
- [ ] Tag support (milestone, family, feeling, etc.)
- [ ] Timeline list with filters

### 👨‍👩‍👧 VII. Family Groups
- [ ] Group list page (`/family/index.tsx`)
- [ ] Create new group
- [ ] View group detail page (`/family/[groupId].tsx`)
- [ ] Share children into groups
- [ ] Show posts shared with group (timeline view)
- [ ] Member roles (admin/member), invite/remove
- [ ] (Optional) Chat feature (basic text)

### 🧩 VIII. UI & Utility
- [x] Shared components: InputField, Avatar, Tabs, Card...
- [x] Media upload (image, video, audio) + preview
- [ ] Responsive styling & keyboard handling
- [ ] Error handling & loading indicators
- [ ] Fonts, splash screen, app icon, theme

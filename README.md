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

- **React Native + Expo**
- **TypeScript**
- **Redux** for state management
- **React Navigation / Expo Router**
- **AsyncStorage / SecureStore** for auth
- **REST API** (Node.js backend)
- **Cloudinary** (for media uploads)

---

## 📁 Project Structure

growing-together-mobile/
├── app/
│   ├── assets/
│   │   ├── fonts/
│   │   │   └── SpaceMono-Regular.ttf
│   │   └── images/
│   │       ├── background2.png
│   │       ├── backgroundMb.png
│   │       └── logo1.png
│   ├── components/
│   │   ├── child/
│   │   │   ├── ChildProfileCard.tsx
│   │   │   ├── GrowthChart.tsx
│   │   │   ├── HealthRecordItem.tsx
│   │   │   └── QAMemoryItem.tsx
│   │   ├── form/
│   │   │   ├── ErrorText.tsx
│   │   │   ├── FormWrapper.tsx
│   │   │   ├── InputField.tsx
│   │   │   ├── LabelText.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   └── PrimaryButton.tsx
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx
│   │   │   └── ScreenWrapper.tsx
│   │   ├── media/
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
│   │   └── ui/
│   │       ├── Divider.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ModalConfirm.tsx
│   │       ├── SectionCard.tsx
│   │       └── ThemedText.tsx
│   ├── constants/
│   │   └── Colors.ts
│   ├── hooks/
│   │   ├── useColorScheme.ts
│   │   ├── useColorScheme.web.ts
│   │   └── useThemeColor.ts
│   ├── redux/
│   │   ├── store.ts
│   │   ├── hooks.ts
│   │   ├── rootReducer.ts
│   │   └── slices/
│   ├── screens/
│   │   ├── Auth/
│   │   │   └── register.tsx
│   │   ├── Intro/
│   │   │   └── intro.tsx
│   │   ├── Login/
│   │   └── index.js
│   ├── services/
│   ├── tabs/
│   ├── types/
│   └── utils/
│       ├── logUtils.ts
│       └── validation.ts
├── app.json
├── babel.config.js
├── eslint.config.js
├── jest.config.js
├── jest.setup.js
├── mocks/
├── package-lock.json
├── package.json
├── README.md
├── scripts/
├── tests/
└── tsconfig.json


## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```
Then scan the QR code using Expo Go on your device.


🔐 Environment Variables
Create a .env file:

API_BASE_URL=https://your-api-url.com
CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/...
CLOUDINARY_UPLOAD_PRESET=...
Use with expo-constants or react-native-dotenv.

### ✅ TODOs for Growing Together Mobile App

#### 🔐 I. Authentication & Setup
- [ ] Register & Login (UI + API)
- [ ] Token auth: save & load token (AsyncStorage or SecureStore)
- [ ] Auto login on app start (check token + get user)
- [ ] Logout logic + show/hide protected routes

#### 🏠 II. App Foundation
- [ ] Home Page: detect user state (new, no child, has children)
- [ ] Navigation + routing setup (`expo-router`)
- [ ] Tab layout for child pages (`/children/[childId]/_layout.tsx`)
- [ ] Base Redux store & slices (auth, child, memory, health, group…)

#### 👶 III. Children Features
- [ ] Create & update child profile (UI + API)
- [ ] View child profile (Tab: Profile)
- [ ] Display all children list on Home
- [ ] Switch between children via tab layout

#### 🩺 IV. Health Tracking
- [ ] Health tab layout (`/children/[childId]/health.tsx`)
- [ ] Add Growth Record (height/weight)
- [ ] Add Vaccine / Illness Records
- [ ] View records in timeline or table format
- [ ] (Optional) Growth chart (Recharts / Victory-native)

#### ❓ V. Q&A System
- [ ] Q&A tab (`/children/[childId]/qa.tsx`)
- [ ] Ask a question (prompt or custom)
- [ ] Submit answer with text/image/audio/video
- [ ] Timeline display with filters
- [ ] Reaction + comment logic

#### 📸 VI. Memories
- [ ] Memory tab (`/children/[childId]/memories.tsx`)
- [ ] Create memory post (image/video/text)
- [ ] Tag support (milestone, family, feeling, etc.)
- [ ] Timeline list with filters

#### 👨‍👩‍👧 VII. Family Groups
- [ ] Group list page (`/family/index.tsx`)
- [ ] Create new group
- [ ] View group detail page (`/family/[groupId].tsx`)
- [ ] Share children into groups
- [ ] Show posts shared with group (timeline view)
- [ ] Member roles (admin/member), invite/remove
- [ ] (Optional) Chat feature (basic text)

#### 🧩 VIII. UI & Utility
- [ ] Shared components: InputField, Avatar, Tabs, Card...
- [ ] Media upload (image, video, audio) + preview
- [ ] Responsive styling & keyboard handling
- [ ] Error handling & loading indicators
- [ ] Fonts, splash screen, app icon, theme

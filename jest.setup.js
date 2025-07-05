jest.mock("expo", () => ({}));
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));
jest.mock("expo-constants", () => ({}));
jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
}));
jest.mock("expo-image", () => ({}));
jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-linking", () => ({}));
jest.mock("expo-splash-screen", () => ({}));
jest.mock("expo-status-bar", () => ({}));
jest.mock("expo-system-ui", () => ({}));
jest.mock("expo-web-browser", () => ({}));
jest.mock("expo-av", () => ({}));
jest.mock("expo-blur", () => ({}));
jest.mock("expo-haptics", () => ({}));
jest.mock("expo-symbols", () => ({}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));
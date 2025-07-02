jest.mock("expo", () => ({}));
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));
jest.mock("expo-constants", () => ({}));
jest.mock("expo-font", () => ({}));
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
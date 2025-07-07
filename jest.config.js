// jest.config.js
module.exports = {
  preset: "jest-expo",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "@testing-library/jest-native/extend-expect"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native" +
      "|@react-native" +
      "|@react-navigation" +
      "|expo(nent)?" +
      "|@expo" +
      "|@unimodules" +
      "|@react-native/js-polyfills" +
      ")",
  ],
  moduleDirectories: ["node_modules", "app", "<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  roots: ["<rootDir>/app", "<rootDir>/tests"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^expo($|/.+)": "<rootDir>/mocks/expo-winter.js",
  },
  testTimeout: 10000,
};

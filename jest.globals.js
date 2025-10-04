// jest.globals.js - Global mocks that need to be set up before anything else

// Mock Metro runtime before it can be loaded
global.__ExpoImportMetaRegistry = {
  TextDecoder: function() { return new TextDecoder(); }
};

// Mock window object for React Native components
global.window = global.window || {};

// Mock TextDecoder and TextEncoder
global.TextDecoder = class TextDecoder {
  decode(input) {
    return input ? input.toString() : '';
  }
};

global.TextEncoder = class TextEncoder {
  encode(input) {
    return new Uint8Array(Buffer.from(input || ''));
  }
};

// Prevent Metro runtime from loading
jest.mock('expo/src/winter/runtime.native', () => ({
  __ExpoImportMetaRegistry: {},
  importMetaRegistry: {},
}), { virtual: true });
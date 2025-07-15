// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'import/no-unresolved': 'off', // Disable this rule as it can be problematic with React Native/Expo
      'import/no-named-as-default': 'off', // Common pattern in React Native services
      'no-unused-vars': 'warn', // Change to warning instead of error
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/mocks/**', '**/tests/**', 'jest.setup.js'],
    rules: {
      'no-unused-vars': 'off', // More lenient for test files
    },
  },
];

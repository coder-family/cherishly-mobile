// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

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
      'no-unused-vars': 'off', // Disable unused vars warning to reduce noisenp
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Disable TypeScript ESLint unused vars rule
      'no-unused-vars': 'off', // Disable unused vars warning to reduce noise
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/mocks/**', '**/tests/**', 'jest.setup.js'],
    rules: {
      'no-unused-vars': 'off', // More lenient for test files
    },
  },
];

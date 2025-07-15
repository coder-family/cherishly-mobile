import * as Linking from 'expo-linking';

export const linkingUtils = {
  // Generate deep links for testing
  generateDeepLink: (path: string, params?: Record<string, string>) => {
    const baseUrl = 'growing-together://';
    const url = new URL(path, baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  },

  // Generate web links that can redirect to your app
  generateWebLink: (path: string, params?: Record<string, string>) => {
    const baseUrl = 'https://growing-together.com/';
    const url = new URL(path, baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  },

  // Test if a URL can be opened
  canOpenURL: async (url: string) => {
    try {
      return await Linking.canOpenURL(url);
    } catch (error) {
      console.error('Error checking if URL can be opened:', error);
      return false;
    }
  },

  // Open a URL
  openURL: async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  },

  // Get the app's deep link scheme
  getScheme: () => {
    return 'growing-together://';
  },

  // Get the app's web domain
  getWebDomain: () => {
    return 'https://growing-together.com';
  }
};

// Common deep link patterns
export const deepLinkPatterns = {
  login: () => linkingUtils.generateDeepLink('login'),
  register: () => linkingUtils.generateDeepLink('register'),
  home: () => linkingUtils.generateDeepLink('home'),
  profile: () => linkingUtils.generateDeepLink('profile'),
  resetPassword: (token: string) => linkingUtils.generateDeepLink('reset-password', { token }),
  childProfile: (childId: string) => linkingUtils.generateDeepLink(`children/${childId}/profile`),
  memory: (memoryId: string) => linkingUtils.generateDeepLink(`memories/${memoryId}`),
  healthRecord: (recordId: string) => linkingUtils.generateDeepLink(`health-records/${recordId}`),
}; 
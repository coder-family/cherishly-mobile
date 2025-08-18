import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export const useFooterBar = () => {
  const router = useRouter();

  const handleSettingsPress = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return {
    handleSettingsPress,
  };
};

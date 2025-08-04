import { useCallback } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { fetchFamilyGroup } from '../redux/slices/familySlice';

export const useGroupRefresh = (groupId: string) => {
  const dispatch = useAppDispatch();

  const refreshGroupData = useCallback(async () => {
    try {
      console.log('Refreshing group data for:', groupId);
      
      // Refresh the family group data in Redux
      await dispatch(fetchFamilyGroup(groupId)).unwrap();
      console.log('Family group data refreshed successfully');
      
    } catch (error) {
      console.error('Error refreshing group data:', error);
    }
  }, [dispatch, groupId]);

  return { refreshGroupData };
}; 
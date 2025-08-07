import { useAppSelector } from '../redux/hooks';

export interface ContentItem {
  id: string;
  visibility?: 'private' | 'public';
  creator?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  parentId?: string;
  authorId?: string;
}

/**
 * Filter content based on user permissions and visibility settings
 * @param items Array of content items to filter
 * @param currentUserId Current user's ID
 * @param isFamilyMember Whether the current user is a family member (has access to public content)
 * @returns Filtered array of content items
 */
export function filterContentByPermissions<T extends ContentItem>(
  items: T[],
  currentUserId: string,
  isFamilyMember: boolean = false
): T[] {
  return items.filter(item => {
    // If item has no visibility setting, treat as private
    const visibility = item.visibility || 'private';
    
    // If item is public, show to everyone
    if (visibility === 'public') {
      return true;
    }
    
    // If item is private, only show to creator
    if (visibility === 'private') {
      // Check if current user is the creator
      const creatorId = item.creator?.id || item.parentId || item.authorId;
      return creatorId === currentUserId;
    }
    
    // Default: don't show private content to non-creators
    return false;
  });
}

/**
 * Hook to get filtered content based on current user permissions
 * @param items Array of content items to filter
 * @returns Filtered array of content items
 */
export function useFilteredContent<T extends ContentItem>(items: T[]): T[] {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { familyGroups } = useAppSelector((state) => state.family);
  
  if (!currentUser) {
    return [];
  }
  
  // Check if user is in any family groups (has access to public content)
  const isFamilyMember = familyGroups && familyGroups.length > 0;
  
  return filterContentByPermissions(items, currentUser.id, isFamilyMember);
}

/**
 * Check if current user can view a specific content item
 * @param item Content item to check
 * @param currentUserId Current user's ID
 * @param isFamilyMember Whether the current user is a family member
 * @returns Boolean indicating if user can view the content
 */
export function canViewContent(
  item: ContentItem,
  currentUserId: string,
  isFamilyMember: boolean = false
): boolean {
  const visibility = item.visibility || 'private';
  
  // Public content is viewable by everyone
  if (visibility === 'public') {
    return true;
  }
  
  // Private content is only viewable by creator
  if (visibility === 'private') {
    const creatorId = item.creator?.id || item.parentId || item.authorId;
    return creatorId === currentUserId;
  }
  
  return false;
}

/**
 * Check if current user can edit a specific content item
 * @param item Content item to check
 * @param currentUserId Current user's ID
 * @returns Boolean indicating if user can edit the content
 */
export function canEditContent(
  item: ContentItem,
  currentUserId: string
): boolean {
  const creatorId = item.creator?.id || item.parentId || item.authorId;
  return creatorId === currentUserId;
}

/**
 * Check if current user can delete a specific content item
 * @param item Content item to check
 * @param currentUserId Current user's ID
 * @returns Boolean indicating if user can delete the content
 */
export function canDeleteContent(
  item: ContentItem,
  currentUserId: string
): boolean {
  const creatorId = item.creator?.id || item.parentId || item.authorId;
  return creatorId === currentUserId;
} 
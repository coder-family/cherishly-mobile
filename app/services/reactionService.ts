import apiService from './apiService';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
export type TargetType = 'PromptResponse' | 'Memory' | 'HealthRecord' | 'GrowthRecord' | 'Comment';

export interface ReactionUser {
  id?: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface ReactionEntry {
  user: ReactionUser;
  type: ReactionType;
  createdAt: string;
}

export interface ReactionsByType {
  like?: ReactionEntry[];
  love?: ReactionEntry[];
  haha?: ReactionEntry[];
  wow?: ReactionEntry[];
  sad?: ReactionEntry[];
  angry?: ReactionEntry[];
}

export interface GetReactionsResponse {
  reactions: ReactionsByType;
  total: number;
}

// Validation function for MongoDB ObjectId
function validateObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const trimmedId = id.trim();
  if (!trimmedId) return false;
  
  // MongoDB ObjectId validation: 24 character hex string
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(trimmedId);
}

export async function getReactions(
  targetType: TargetType,
  targetId: string
): Promise<GetReactionsResponse> {
  try {
    const params = { targetType, targetId };
    
    const res = await apiService.get(`/reactions`, { params });
    const data = (res.data || res)?.data || (res.data || res);
    const reactions = data.reactions || {};
    const total = typeof data.total === 'number'
      ? data.total
      : (Object.values(reactions) as (ReactionEntry[] | undefined)[])
          .reduce((acc: number, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    return { reactions, total } as GetReactionsResponse;
  } catch (error) {
    console.error('❌ Error getting reactions:', error);
    throw error;
  }
}

export async function setReaction(
  targetType: TargetType,
  targetId: string,
  type: ReactionType
): Promise<void> {
  try {
    const requestBody = { targetType, targetId, type };
    
    await apiService.post(`/reactions`, requestBody);
  } catch (error) {
    console.error('❌ Error setting reaction:', error);
    throw error;
  }
}

export async function deleteReaction(
  targetType: TargetType,
  targetId: string
): Promise<void> {
  try {
    const params = { targetType, targetId };
    
    await apiService.delete(`/reactions`, { params });
  } catch (error) {
    console.error('❌ Error deleting reaction:', error);
    throw error;
  }
}

export function getReactionUsers(reactions: ReactionEntry[], type: string): ReactionUser[] {
  return (reactions as ReactionEntry[]).filter(reaction => reaction.type === type).map(reaction => reaction.user);
}

export default {
  getReactions,
  setReaction,
  deleteReaction,
}; 
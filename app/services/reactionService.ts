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

export async function getReactions(
  targetType: TargetType,
  targetId: string
): Promise<GetReactionsResponse> {
  try {
    const res = await apiService.get(`/reactions`, {
      params: { targetType, targetId },
    });
    const data = (res.data || res)?.data || (res.data || res);
    const reactions = data.reactions || {};
    const total = typeof data.total === 'number'
      ? data.total
      : (Object.values(reactions) as Array<ReactionEntry[] | undefined>)
          .reduce((acc: number, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    return { reactions, total } as GetReactionsResponse;
  } catch (error) {
    console.error('Error getting reactions:', error);
    throw error;
  }
}

export async function setReaction(
  targetType: TargetType,
  targetId: string,
  type: ReactionType
): Promise<void> {
  try {
    await apiService.post(`/reactions`, { targetType, targetId, type });
  } catch (error) {
    console.error('Error setting reaction:', error);
    throw error;
  }
}

export async function deleteReaction(
  targetType: TargetType,
  targetId: string
): Promise<void> {
  try {
    await apiService.delete(`/reactions`, {
      params: { targetType, targetId },
    });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    throw error;
  }
}

export default {
  getReactions,
  setReaction,
  deleteReaction,
}; 
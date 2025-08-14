import apiService, { ApiResponse } from './apiService';

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  targetType: 'promptResponse' | 'memory' | 'healthRecord' | 'growthRecord' | 'comment';
  targetId: string;
  user: User;
  parentComment?: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface CreateCommentData {
  content: string;
  targetType: 'promptResponse' | 'memory' | 'healthRecord' | 'growthRecord' | 'comment';
  targetId: string;
  parentCommentId?: string | null;
}

interface UpdateCommentData {
  content: string;
}

interface CommentsResponse extends ApiResponse<Comment[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CommentResponse extends ApiResponse<Comment> {
  // Extends ApiResponse<Comment> with additional properties if needed
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

class CommentService {
  private static instance: CommentService;

  private constructor() {}

  static getInstance(): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  async createComment(data: CreateCommentData): Promise<Comment> {
    try {
      const response = await apiService.post('/comments', data) as any;
      
      // Handle nested response format from backend
      let commentData: Comment;
      if (response.success) {
        // Backend returns: { success: true, data: { data: commentData } }
        if (response.data?.data) {
          commentData = response.data.data;
        } else {
          commentData = response.data;
        }
      } else if (response.data) {
        // Direct data format
        commentData = response.data;
      } else {
        throw new Error(response.message || 'Failed to create comment');
      }
      
      return commentData;
    } catch (error: any) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async getComments(
    targetType: string,
    targetId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CommentsResponse> {
    try {
      const response = await apiService.get(
        `/comments?targetType=${targetType}&targetId=${targetId}&page=${page}&limit=${limit}`
      ) as CommentsResponse;
      

      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async updateComment(commentId: string, data: UpdateCommentData): Promise<Comment> {
    try {
      const response = await apiService.put(`/comments/${commentId}`, data) as any;
      
      // Handle both response formats
      if (response.success) {
        return response.data;
      } else if (response.data) {
        // Backend returns: { data: commentData }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/comments/${commentId}`) as ApiResponse;
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  async getComment(commentId: string): Promise<Comment> {
    try {
      const response = await apiService.get(`/comments/${commentId}`) as CommentResponse;
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch comment');
      }
    } catch (error) {
      console.error('Error fetching comment:', error);
      throw error;
    }
  }
}

export const commentService = CommentService.getInstance();
export type { Comment, CommentResponse, CommentsResponse, CreateCommentData, UpdateCommentData };

import {
    addChildToFamilyGroup,
    cancelInvitation,
    createFamilyGroup,
    deleteFamilyGroup,
    getFamilyGroupChildren,
    getInvitationStats,
    getPendingInvitations,
    inviteToFamilyGroup,
    joinFamilyGroup,
    leaveFamilyGroup,
    removeChildFromFamilyGroup,
    resendInvitation,
    updateFamilyGroup
} from '../app/services/familyService';
import apiService from '../app/services/apiService';

// Mock apiService
jest.mock('../app/services/apiService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  API_BASE_URL_EXPORT: 'https://test-api.com',
}));

// Mock authService
jest.mock('../app/services/authService', () => ({
  __esModule: true,
  default: {
    getAccessToken: jest.fn().mockResolvedValue('test-token'),
  },
}));

// Mock conditionalLog
jest.mock('../app/utils/logUtils', () => ({
  conditionalLog: {
    family: jest.fn(),
    familyError: jest.fn(),
  },
}));

describe('FamilyService Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cancelInvitation', () => {
    it('should handle 404 error correctly', async () => {
      const error = {
        response: { status: 404, data: { message: 'Invitation not found' } }
      };
      apiService.delete.mockRejectedValue(error);

      await expect(cancelInvitation('group1', 'invite1')).rejects.toThrow('Invitation not found or already cancelled');
    });

    it('should handle 403 error correctly', async () => {
      const error = {
        response: { status: 403, data: { message: 'Permission denied' } }
      };
      apiService.delete.mockRejectedValue(error);

      await expect(cancelInvitation('group1', 'invite1')).rejects.toThrow('You do not have permission to cancel this invitation');
    });

    it('should handle network error correctly', async () => {
      const error = { request: {} };
      apiService.delete.mockRejectedValue(error);

      await expect(cancelInvitation('group1', 'invite1')).rejects.toThrow('Network error: Unable to cancel invitation');
    });
  });

  describe('resendInvitation', () => {
    it('should handle 404 error correctly', async () => {
      const error = {
        response: { status: 404, data: { message: 'Invitation not found' } }
      };
      apiService.post.mockRejectedValue(error);

      await expect(resendInvitation('group1', 'invite1')).rejects.toThrow('Invitation not found or already expired');
    });

    it('should handle 429 error correctly', async () => {
      const error = {
        response: { status: 429, data: { message: 'Too many requests' } }
      };
      apiService.post.mockRejectedValue(error);

      await expect(resendInvitation('group1', 'invite1')).rejects.toThrow('Too many resend attempts. Please wait before trying again');
    });
  });

  describe('getInvitationStats', () => {
    it('should handle 404 error correctly', async () => {
      const error = {
        response: { status: 404, data: { message: 'Group not found' } }
      };
      apiService.get.mockRejectedValue(error);

      await expect(getInvitationStats('group1')).rejects.toThrow('Family group not found');
    });

    it('should handle 403 error correctly', async () => {
      const error = {
        response: { status: 403, data: { message: 'Permission denied' } }
      };
      apiService.get.mockRejectedValue(error);

      await expect(getInvitationStats('group1')).rejects.toThrow('You do not have permission to view invitation stats');
    });
  });

  describe('createFamilyGroup', () => {
    it('should handle 409 error correctly', async () => {
      const error = {
        response: { status: 409, data: { message: 'Already has group' } }
      };
      apiService.post.mockRejectedValue(error);

      await expect(createFamilyGroup({ name: 'Test Group' })).rejects.toThrow('You already have a family group');
    });
  });

  describe('updateFamilyGroup', () => {
    it('should handle 403 error correctly', async () => {
      const error = {
        response: { status: 403, data: { message: 'Permission denied' } }
      };
      apiService.patch.mockRejectedValue(error);

      await expect(updateFamilyGroup('group1', { name: 'New Name' })).rejects.toThrow('You do not have permission to update this family group');
    });
  });

  describe('deleteFamilyGroup', () => {
    it('should handle 403 error correctly', async () => {
      const error = {
        response: { status: 403, data: { message: 'Permission denied' } }
      };
      apiService.delete.mockRejectedValue(error);

      await expect(deleteFamilyGroup('group1')).rejects.toThrow('You do not have permission to delete this family group');
    });
  });

  describe('joinFamilyGroup', () => {
    it('should handle 409 error correctly', async () => {
      const error = {
        response: { status: 409, data: { message: 'Already member' } }
      };
      apiService.post.mockRejectedValue(error);

      await expect(joinFamilyGroup('group1')).rejects.toThrow('You are already a member of this family group');
    });
  });

  describe('leaveFamilyGroup', () => {
    it('should handle 403 error correctly', async () => {
      const error = {
        response: { status: 403, data: { message: 'Cannot leave' } }
      };
      apiService.post.mockRejectedValue(error);

      await expect(leaveFamilyGroup('group1')).rejects.toThrow('You cannot leave this family group');
    });
  });

  describe('inviteToFamilyGroup', () => {
    it('should handle 409 error correctly', async () => {
      const error = {
        response: { status: 409, data: { message: 'Already member' } }
      };
      apiService.post.mockRejectedValue(error);

      await expect(inviteToFamilyGroup('group1', 'test@example.com')).rejects.toThrow('User is already a member of this family group');
    });
  });

  describe('getPendingInvitations', () => {
    it('should handle 403 error correctly', async () => {
      const error = {
        response: { status: 403, data: { message: 'Permission denied' } }
      };
      apiService.get.mockRejectedValue(error);

      await expect(getPendingInvitations('group1')).rejects.toThrow('You do not have permission to view invitations');
    });
  });

  describe('addChildToFamilyGroup', () => {
    it('should handle 409 error correctly', async () => {
      const error = {
        response: { status: 409, data: { message: 'Already member' } }
      };
      apiService.post.mockRejectedValue(error);

      await expect(addChildToFamilyGroup('group1', 'child1')).rejects.toThrow('Child is already a member of this family group');
    });
  });

  describe('removeChildFromFamilyGroup', () => {
    it('should handle 403 error correctly', async () => {
      const error = {
        response: { status: 403, data: { message: 'Permission denied' } }
      };
      apiService.delete.mockRejectedValue(error);

      await expect(removeChildFromFamilyGroup('group1', 'child1')).rejects.toThrow('You do not have permission to remove children from this group');
    });
  });

  describe('getFamilyGroupChildren', () => {
    it('should handle 403 error correctly', async () => {
      const error = {
        response: { status: 403, data: { message: 'Permission denied' } }
      };
      apiService.get.mockRejectedValue(error);

      await expect(getFamilyGroupChildren('group1')).rejects.toThrow('You do not have permission to view children in this group');
    });
  });
}); 
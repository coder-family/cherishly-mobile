# User Service Updates - Backend Integration

This document explains the updates made to the user service to match your actual backend API endpoints.

## Overview

The user service has been updated to use the exact endpoints from your Express.js backend router. All functions now match your backend API structure.

## Updated User Service (`app/services/userService.ts`)

### Available Functions

1. **`getCurrentUserById(userId)`** - Get current user profile by ID
   ```typescript
   const user = await getCurrentUserById(userId);
   ```

2. **`getUser(userId)`** - Get any user by ID
   ```typescript
   const user = await getUser(userId);
   ```

3. **`getAllUsers()`** - Get all users (admin only)
   ```typescript
   const users = await getAllUsers();
   ```

4. **`getUsersInGroup()`** - Get users in the same family group
   ```typescript
   const groupUsers = await getUsersInGroup();
   ```

5. **`updateUser(userId, data)`** - Update user profile
   ```typescript
   await updateUser(userId, {
     firstName: 'John',
     lastName: 'Doe',
     dateOfBirth: '1990-01-01',
     avatar: 'https://example.com/avatar.jpg'
   });
   ```

6. **`changePassword(data)`** - Change user password
   ```typescript
   await changePassword({
     currentPassword: 'oldPassword',
     newPassword: 'newPassword'
   });
   ```

7. **`deleteUser(userId)`** - Delete user account
   ```typescript
   await deleteUser(userId);
   ```

8. **`restoreUser(userId)`** - Restore deleted user
   ```typescript
   await restoreUser(userId);
   ```

9. **`forgotPassword(email)`** - Request password reset
   ```typescript
   await forgotPassword('user@example.com');
   ```

10. **`resetPassword(token, data)`** - Reset password with token
    ```typescript
    await resetPassword(token, { newPassword: 'newPassword' });
    ```

11. **`verifyResetToken(token)`** - Verify reset token validity
    ```typescript
    const result = await verifyResetToken(token);
    ```

12. **`logout()`** - Logout user
    ```typescript
    await logout();
    ```

### Type Definitions

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  avatar?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ResetPasswordData {
  newPassword: string;
}
```

## Updated Redux Slice (`app/redux/slices/userSlice.ts`)

### Async Thunks

- `fetchCurrentUser(userId)` - Load current user data by ID
- `fetchUser(userId)` - Load any user by ID
- `fetchAllUsers()` - Load all users
- `fetchUsersInGroup()` - Load users in family group
- `updateUser({ userId, data })` - Update user profile
- `changePassword(data)` - Change password
- `deleteUser(userId)` - Delete user
- `restoreUser(userId)` - Restore user
- `logout()` - Logout user

### State Management

```typescript
interface UserState {
  currentUser: User | null;
  users: User[];
  groupUsers: User[];
  loading: boolean;
  error: string | null;
}
```

## Updated Home Screen

The home screen now uses the updated user service:

1. **User ID Required**: `fetchCurrentUser` now requires the user ID from auth state
2. **Correct Endpoints**: Uses `PUT /users/:id` for updates instead of `PATCH /users/me`
3. **Proper Error Handling**: Matches backend validation and error responses

### Key Changes

- Updated to use `updateUser({ userId, data })` instead of `updateCurrentUser(data)`
- `fetchCurrentUser(userId)` now requires user ID parameter
- All endpoints match your backend router exactly

## Backend Endpoints Mapping

| Frontend Function | Backend Endpoint | Method | Description |
|------------------|------------------|--------|-------------|
| `getCurrentUserById` | `/users/:id` | GET | Get user by ID |
| `getAllUsers` | `/users` | GET | Get all users (admin) |
| `getUsersInGroup` | `/users/group` | GET | Get users in family group |
| `updateUser` | `/users/:id` | PUT | Update user |
| `changePassword` | `/users/change-password` | PUT | Change password |
| `deleteUser` | `/users/:id` | DELETE | Delete user |
| `restoreUser` | `/users/:id/restore` | PATCH | Restore user |
| `forgotPassword` | `/users/forgot-password` | POST | Request password reset |
| `resetPassword` | `/users/reset-password/:token` | POST | Reset password |
| `verifyResetToken` | `/users/verify-reset-token/:token` | GET | Verify reset token |
| `logout` | `/users/logout` | POST | Logout user |

## Testing

To test the user service:

1. **Start the app**: `npm start`
2. **Login** with valid credentials
3. **Go to home screen** and try updating profile information
4. **Check console** for API calls and responses
5. **Verify** that the UI updates correctly

## Next Steps

1. **Test with your backend** to ensure all endpoints work correctly
2. **Add password change functionality** to the UI
3. **Implement user management features** (delete, restore, etc.)
4. **Add family group user fetching** when that feature is ready

## Notes

- **Authentication**: All endpoints (except login/register) require authentication via the `protect` middleware
- **Validation**: Backend includes validation middleware for all endpoints
- **Error Handling**: Backend returns proper error responses that the frontend can handle
- **User ID**: Since there's no `/me` endpoint, the frontend uses the user ID from auth state 
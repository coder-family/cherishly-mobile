# Family Group Edit Features

## Overview

Tab "Edit" trong Family Group Detail Screen cung cấp các tính năng để quản lý và chỉnh sửa thông tin family group.

## Components

### 1. EditFamilyGroupModal

- **Location**: `app/components/family/EditFamilyGroupModal.tsx`
- **Purpose**: Modal để chỉnh sửa thông tin family group
- **Features**:
  - Chỉnh sửa tên group
  - Chỉnh sửa mô tả
  - Upload avatar cho group
  - Validation form
  - Loading states
  - Success/error handling

### 2. FamilyGroupPermissions

- **Location**: `app/components/family/FamilyGroupPermissions.tsx`
- **Purpose**: Hiển thị thông tin về vai trò và quyền hạn của user
- **Features**:
  - Hiển thị vai trò hiện tại (Owner/Admin/Member/Guest)
  - Liệt kê các quyền hạn
  - Thông tin về group (số lượng members, children, ngày tạo)

## Permissions System

### Owner

- ✅ Edit group settings
- ✅ Add/remove members
- ✅ Manage invitations
- ✅ Delete group
- ✅ Add/remove children
- ✅ View all content

### Admin

- ✅ Edit group settings
- ✅ Add/remove members
- ✅ Manage invitations
- ✅ Add/remove children
- ✅ View all content

### Member

- ✅ View group content
- ✅ Add children (if owner)
- ✅ Participate in timeline

### Guest

- ❌ Limited access

## Usage

### Accessing Edit Tab

1. Navigate to Family Group Detail Screen
2. Tap on "Edit" tab
3. View your role and permissions
4. If you're owner/admin, you can edit group settings

### Editing Group Settings

1. Tap "Edit Group Settings" button
2. Modify group name, description, or avatar
3. Tap "Save" to apply changes
4. Changes are immediately reflected in the UI

## API Integration

### Update Family Group

```typescript
// Service function
export async function updateFamilyGroup(
  groupId: string,
  data: UpdateFamilyGroupData
): Promise<FamilyGroup>;

// Redux action
export const updateFamilyGroup = createAsyncThunk(
  "family/updateFamilyGroup",
  async ({
    groupId,
    data,
  }: {
    groupId: string;
    data: UpdateFamilyGroupData;
  }) => {
    return await familyService.updateFamilyGroup(groupId, data);
  }
);
```

### Data Structure

```typescript
interface UpdateFamilyGroupData {
  name?: string;
  description?: string;
  avatarUrl?: string;
}
```

## UI/UX Features

### Form Validation

- Group name is required
- Character limits (name: 50 chars, description: 200 chars)
- Real-time character count
- Disable save button when no changes

### Loading States

- Loading spinner during API calls
- Disabled interactions during submission
- Success/error alerts

### Responsive Design

- Works on different screen sizes
- Proper spacing and typography
- Consistent with app design system

## Error Handling

### Common Errors

- Network connectivity issues
- Invalid group ID
- Permission denied
- Validation errors

### User Feedback

- Clear error messages
- Retry mechanisms
- Graceful fallbacks

## Security

### Permission Checks

- Server-side validation
- Client-side role checking
- UI reflects actual permissions

### Data Protection

- Only authorized users can edit
- Input sanitization
- Secure API calls

## Future Enhancements

### Planned Features

- [ ] Bulk member management
- [ ] Advanced permission settings
- [ ] Group templates
- [ ] Activity logs
- [ ] Backup/restore settings

### Technical Improvements

- [ ] Offline support
- [ ] Real-time updates
- [ ] Advanced caching
- [ ] Performance optimizations

## Testing

### Unit Tests

- Component rendering
- Form validation
- API integration
- Error handling

### Integration Tests

- End-to-end workflows
- Permission scenarios
- Data persistence

### Manual Testing

- Different user roles
- Various screen sizes
- Network conditions
- Edge cases

## Dependencies

### Required Packages

- `@expo/vector-icons` - Icons
- `expo-image-picker` - Avatar upload
- `@reduxjs/toolkit` - State management
- `react-native` - Core components

### Internal Dependencies

- `AvatarUpload` component
- `LoadingSpinner` component
- Family service functions
- Redux store configuration

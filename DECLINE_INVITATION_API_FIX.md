# Sửa API Route cho Decline Invitation

## Vấn đề

Frontend đang gọi sai API route cho decline invitation.

## Backend Route

```javascript
// Decline an invitation
router.post(
  "/decline-invitation",
  protect,
  validateRequiredFields(["token"]),
  validate,
  declineInvitation
);
```

## Frontend đang gọi sai

```typescript
// Sai - đang gọi
await apiService.post(`/family-groups/invitations/${invitationId}/decline`);

// Đúng - cần gọi
await apiService.post("/decline-invitation", { token });
```

## Thay đổi đã thực hiện

### 1. Family Service (`app/services/familyService.ts`)

```typescript
// Trước
export async function declineInvitation(invitationId: string): Promise<void> {
  try {
    await apiService.post(`/family-groups/invitations/${invitationId}/decline`);
  }

// Sau
export async function declineInvitation(token: string): Promise<void> {
  try {
    await apiService.post('/family-groups/decline-invitation', { token });
  }
```

### 2. Redux Slice (`app/redux/slices/familySlice.ts`)

```typescript
// Trước
export const declineInvitation = createAsyncThunk(
  "family/declineInvitation",
  async (invitationId: string) => {
    return await familyService.declineInvitation(invitationId);
  }
);

// Sau
export const declineInvitation = createAsyncThunk(
  "family/declineInvitation",
  async (token: string) => {
    return await familyService.declineInvitation(token);
  }
);
```

### 3. Component (`app/components/family/MyInvitationsSection.tsx`)

```typescript
// Trước
await dispatch(declineInvitation(invitation._id)).unwrap();

// Sau
await dispatch(declineInvitation(invitation.token)).unwrap();
```

## API Request Format

```json
POST /family-groups/decline-invitation
{
  "token": "YOUR_TOKEN_HERE"
}
```

## Testing

- ✅ API route đúng
- ✅ Request body format đúng
- ✅ Token được truyền đúng
- ✅ Error handling được cập nhật

## Kết quả

Bây giờ decline invitation sẽ hoạt động đúng với backend API.

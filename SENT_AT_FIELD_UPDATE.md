# Cập nhật sentAt Field cho Invitations

## Backend Update

Backend đã thêm field `sentAt` vào invitation response:

```json
{
  "email": "trungtambdct2008@gmail.com",
  "token": "de3b07c484fc288ba2631afbeba6a205",
  "status": "pending",
  "role": "member",
  "sentAt": "2025-08-05T08:29:09.854+00:00",
  "_id": "6891c0d5a54dda27f0e14e0"
}
```

## Frontend Updates

### 1. Family Service (`app/services/familyService.ts`)

- Thêm `sentAt?: string` vào interface `getMyPendingInvitations`
- Cập nhật `expiresAt` thành optional: `expiresAt?: string`

### 2. Redux Slice (`app/redux/slices/familySlice.ts`)

- Thêm `sentAt?: string` vào interface `myInvitations`
- Cập nhật `expiresAt` thành optional: `expiresAt?: string`

### 3. MyInvitationsSection (`app/components/family/MyInvitationsSection.tsx`)

- Ưu tiên sử dụng `sentAt` trước, sau đó fallback về `createdAt` hoặc `expiresAt`
- Xử lý TypeScript cho optional fields

### 4. PendingInvitationsModal (`app/components/family/PendingInvitationsModal.tsx`)

- Cập nhật interface `PendingInvitation` để include `sentAt?: string`
- Ưu tiên sử dụng `sentAt` cho date display

## Date Display Priority

1. `sentAt` - Thời gian thực tế gửi lời mời
2. `createdAt` - Thời gian tạo lời mời (fallback)
3. `expiresAt` - Thời gian hết hạn (fallback)
4. "Date not available" - Nếu không có field nào

## Testing

- ✅ TypeScript compilation
- ✅ Optional field handling
- ✅ Date format validation
- ✅ Fallback logic

## Kết quả

Bây giờ ngày tháng sẽ hiển thị chính xác từ field `sentAt` thay vì "Invalid Date".

# Thêm Role "Member" vào Hệ thống

## Tổng quan

Đã thêm role "member" vào hệ thống invitation để cung cấp thêm lựa chọn quyền hạn cho người dùng.

## Thay đổi

### 1. Family Service (`app/services/familyService.ts`)

- Cập nhật type definition cho `inviteToFamilyGroup` function:

  ```typescript
  // Trước
  role: 'parent' | 'admin' = 'parent'

  // Sau
  role: 'parent' | 'admin' | 'member' = 'parent'
  ```

- Cập nhật `FamilyMember` interface:

  ```typescript
  // Trước
  role: "owner" | "admin" | "member";

  // Sau
  role: "owner" | "admin" | "parent" | "member";
  ```

### 2. Redux Slice (`app/redux/slices/familySlice.ts`)

- Cập nhật type definition cho `inviteToFamilyGroup` thunk:

  ```typescript
  // Trước
  role?: 'parent' | 'admin'

  // Sau
  role?: 'parent' | 'admin' | 'member'
  ```

### 3. UI Component (`app/components/family/InviteMemberModal.tsx`)

- Thêm button cho role "Member"
- Cập nhật state type:

  ```typescript
  // Trước
  useState<"parent" | "admin">("parent");

  // Sau
  useState<"parent" | "admin" | "member">("parent");
  ```

- Thêm description cho role member:
  ```
  "Members can view public content but cannot create or edit content."
  ```

### 4. Validation (`app/utils/validation.ts`)

- Cập nhật register schema để validate role:
  ```typescript
  role: yup
    .string()
    .oneOf(
      ["parent", "admin", "member"],
      "Role must be parent, admin, or member"
    )
    .required("Role is required");
  ```

### 5. Documentation Updates

- Cập nhật text trong `app/family/join-group.tsx`
- Cập nhật text trong `app/family/invite-join.tsx`

### 6. Test Updates

- Cập nhật `tests/authSlice.test.ts` để include role field

## Quyền hạn theo Role

### Admin (Quản trị viên)

- ✅ Tạo nhóm gia đình
- ✅ Mời thành viên mới (invite member)
- ✅ Xóa thành viên khỏi nhóm
- ✅ Cập nhật thông tin nhóm (tên, mô tả, avatar)
- ✅ Xóa nhóm
- ✅ Gửi lại lời mời (resend invitation)
- ✅ Hủy lời mời (cancel invitation)
- ✅ Xem tất cả lời mời đang chờ (pending invitations)
- ✅ Thêm/xóa trẻ em khỏi nhóm
- ✅ Xem tất cả nội dung (memories, growth records, health records, prompt responses)
- ✅ Tạo/sửa/xóa nội dung cho trẻ em trong nhóm

### Parent (Cha mẹ)

- ✅ Mời thành viên mới
- ✅ Xóa thành viên khỏi nhóm
- ✅ Cập nhật thông tin nhóm
- ✅ Gửi lại lời mời
- ✅ Hủy lời mời
- ✅ Xem tất cả lời mời đang chờ
- ✅ Thêm/xóa trẻ em khỏi nhóm
- ✅ Xem tất cả nội dung
- ✅ Tạo/sửa/xóa nội dung cho trẻ em trong nhóm

### Member (Thành viên)

- ✅ Xem nội dung công khai (public content) của trẻ em trong nhóm
- ❌ Không thể tạo/sửa/xóa nội dung
- ❌ Không thể mời thành viên mới
- ❌ Không thể xóa thành viên
- ❌ Không thể cập nhật thông tin nhóm
- ❌ Không thể gửi lại/hủy lời mời
- ❌ Không thể thêm/xóa trẻ em

## Backend Requirements

**Lưu ý**: Backend cần được cập nhật để hỗ trợ role "member" trong enum:

```javascript
role: { type: String, enum: ["parent", "admin", "member"], default: "parent" }
```

## Testing

- ✅ TypeScript compilation
- ✅ UI component rendering
- ✅ Role selection functionality
- ✅ Validation schema updates

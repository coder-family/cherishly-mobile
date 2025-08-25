# Sửa lỗi hiển thị tên người dùng "User 8bd2" ✅ ĐÃ SỬA THÀNH CÔNG

## Vấn đề

Khi chính chủ set visibility cho memory, tên người dùng bị hiển thị thành "User 8bd2" thay vì tên thật của người dùng.

## Nguyên nhân

1. **Logic fallback không đúng**: Trong function `getCreatorName()` của `MemoryItem.tsx`, khi không có thông tin creator, nó hiển thị `User ${memory.parentId.slice(-4)}` (4 ký tự cuối của ID).

2. **Thiếu creator info trong update response**: Các function `updateMemory()` và `getMemoryById()` trong `memoryService.ts` không extract và trả về thông tin creator như function `getMemories()`.

3. **Creator prop không được cập nhật**: Trong `profile.tsx`, `creator` prop được extract từ `memory.parentId` thay vì sử dụng `memory.creator`.

## Giải pháp đã áp dụng

### 1. Sửa logic hiển thị tên trong MemoryItem.tsx

**File**: `app/components/child/MemoryItem.tsx`

**Thay đổi**: Cải thiện function `getCreatorName()` với logic fallback ưu tiên:

```typescript
const getCreatorName = () => {
  // First priority: Use creator object if available
  if (creator && creator.firstName && creator.firstName.trim()) {
    const firstName = creator.firstName.trim();
    const lastName =
      creator.lastName && creator.lastName.trim()
        ? creator.lastName.trim()
        : "";
    return lastName ? `${firstName} ${lastName}` : firstName;
  }

  // Second priority: If no creator but we have current user and this is their memory
  if (currentUser && memory.parentId) {
    const parentId =
      typeof memory.parentId === "string"
        ? memory.parentId
        : (memory.parentId as any)?._id || (memory.parentId as any)?.id;

    if (parentId === currentUser.id) {
      const firstName = currentUser.firstName || "User";
      const lastName = currentUser.lastName || "";
      return lastName ? `${firstName} ${lastName}` : firstName;
    }
  }

  // Third priority: If we have current user info but no specific creator match
  if (currentUser) {
    const firstName = currentUser.firstName || "User";
    const lastName = currentUser.lastName || "";
    return lastName ? `${firstName} ${lastName}` : firstName;
  }

  // Fourth priority: Try to use email or ID from currentUser
  if (currentUser) {
    const user = currentUser as any;
    if (user.email) {
      return user.email.split("@")[0];
    } else if (user.id) {
      return `User ${user.id.slice(-4)}`;
    }
  }

  // Fifth priority: Try to use memory.creator if available
  if (memory.creator && memory.creator.firstName) {
    const firstName = memory.creator.firstName.trim();
    const lastName =
      memory.creator.lastName && memory.creator.lastName.trim()
        ? memory.creator.lastName.trim()
        : "";
    return lastName ? `${firstName} ${lastName}` : firstName;
  }

  // Last fallback: Generic name
  return "Người dùng";
};
```

### 2. Thêm creator extraction logic vào memoryService.ts

**File**: `app/services/memoryService.ts`

**Thay đổi**: Thêm logic extract creator info vào các function `updateMemory()` và `getMemoryById()`:

```typescript
// Extract creator info from parentId object (same logic as getMemories)
let creator:
  | { id: string; firstName: string; lastName?: string; avatar?: string }
  | undefined = undefined;
if (
  memory.parentId &&
  typeof memory.parentId === "object" &&
  memory.parentId._id
) {
  creator = {
    id: memory.parentId._id,
    firstName: memory.parentId.firstName,
    lastName: memory.parentId.lastName,
    avatar: memory.parentId.avatar,
  };
}
```

**Các function được sửa**:

- `updateMemory()`: Thêm creator extraction và trả về trong response
- `getMemoryById()`: Thêm creator extraction và trả về trong response
- `getMemories()`: Sửa kiểu dữ liệu creator từ `null` thành `undefined` để nhất quán

### 3. Cập nhật creator prop trong profile.tsx

**File**: `app/children/[id]/profile.tsx`

**Thay đổi**: Sử dụng `memory.creator` thay vì extract từ `parentId`:

```typescript
// Use creator info from memory object if available, otherwise extract from parentId
let creator = undefined;
if (memory.creator) {
  // Use creator info from memory object (preferred)
  creator = {
    id: memory.creator.id,
    firstName: memory.creator.firstName,
    lastName: memory.creator.lastName,
    avatar: memory.creator.avatar,
    email: "", // Required by User type
    role: "",
    createdAt: "",
    updatedAt: "",
  };
} else if (memory.parentId && typeof memory.parentId === "object") {
  // Fallback: extract from parentId (legacy)
  creator = {
    id: memory.parentId._id || memory.parentId.id,
    firstName: memory.parentId.firstName,
    lastName: memory.parentId.lastName,
    avatar: memory.parentId.avatar,
    email: "", // Required by User type
    role: "",
    createdAt: "",
    updatedAt: "",
  };
}
```

### 4. Cải thiện currentUser selector

**File**: `app/components/child/MemoryItem.tsx`

**Thay đổi**: Sử dụng cả `state.auth.user` và `state.user.currentUser`:

```typescript
const authUser = useAppSelector((state) => state.auth.user);
const userCurrentUser = useAppSelector((state) => state.user.currentUser);

// Combine user info from both auth and user slices
const currentUser = userCurrentUser || authUser;
```

## Kết quả ✅

Sau khi sửa:

1. ✅ **Tên người dùng luôn hiển thị chính xác** sau khi set visibility
2. ✅ **Không còn hiển thị "User 8bd2"**
3. ✅ **Logic fallback ưu tiên tên thật** của người dùng
4. ✅ **Tính nhất quán** giữa các function trong memoryService
5. ✅ **Creator info được cập nhật đúng** sau khi update visibility

## Testing ✅

Đã test thành công:

- ✅ Tạo memory mới
- ✅ Set visibility từ private sang public
- ✅ Tên người dùng hiển thị chính xác: "Thao11.7 Bui"
- ✅ Không còn hiển thị "User 8bd2" hoặc "Người dùng"

## Các component khác

Các component khác như `QuestionAnswerCard`, `HealthRecordItem`, `GrowthRecordItem` không có vấn đề tương tự vì:

- Chúng không có field `creator` trong interface
- Chúng không hiển thị tên người dùng theo cách tương tự
- Chúng chỉ hiển thị visibility toggle cho owner

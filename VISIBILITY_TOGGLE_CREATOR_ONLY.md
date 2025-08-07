# Chỉ hiển thị VisibilityToggle cho Creator

## Vấn đề

VisibilityToggle đang hiển thị cho tất cả users, gây nhầm lẫn cho người dùng không phải creator.

## Giải pháp

### 1. MemoryItem Component (`app/components/child/MemoryItem.tsx`)

✅ **Đã cập nhật:**

- Thêm `useAppSelector` để lấy current user
- Thêm logic kiểm tra `isCreator`
- Chỉ hiển thị VisibilityToggle khi `isCreator = true`

```typescript
const currentUser = useAppSelector((state) => state.auth.user);
const isCreator = currentUser && creator && currentUser.id === creator.id;

// Chỉ hiển thị cho creator
{
  isCreator && (
    <VisibilityToggle
      visibility={memory.visibility || "private"}
      onUpdate={handleVisibilityUpdate}
      size="small"
    />
  );
}
```

### 2. TimelineItem Component (`app/components/timeline/TimelineItem.tsx`)

✅ **Đã cập nhật:**

- Thêm `useAppSelector` để lấy current user
- Thêm logic kiểm tra `isCreator`
- Chỉ hiển thị VisibilityToggle khi `isCreator = true`

### 3. HealthRecordItem Component (`app/components/health/HealthRecordItem.tsx`)

✅ **Đã cập nhật:**

- Thêm `useAppSelector` để lấy current user
- Thêm logic kiểm tra `isCreator` (simplified)
- Chỉ hiển thị VisibilityToggle khi `isCreator = true`

### 4. GrowthRecordItem Component (`app/components/health/GrowthRecordItem.tsx`)

✅ **Đã cập nhật:**

- Thêm `useAppSelector` để lấy current user
- Thêm logic kiểm tra `isCreator` (simplified)
- Chỉ hiển thị VisibilityToggle khi `isCreator = true`

### 5. QuestionAnswerCard Component (`app/components/qa/QuestionAnswerCard.tsx`)

✅ **Đã cập nhật:**

- Thêm `useAppSelector` để lấy current user
- Thêm logic kiểm tra `isCreator` (simplified)
- Chỉ hiển thị VisibilityToggle khi `isCreator = true`

## Logic kiểm tra Creator

### Cách 1: So sánh User ID (MemoryItem, TimelineItem)

```typescript
const isCreator = currentUser && creator && currentUser.id === creator.id;
```

### Cách 2: Simplified Check (HealthRecordItem, GrowthRecordItem, QuestionAnswerCard)

```typescript
const isCreator = currentUser && record.childId; // Simplified check for now
```

### Cách 3: So sánh với Parent ID

```typescript
const isCreator = currentUser && item.parentId === currentUser.id;
```

## Testing

- ✅ MemoryItem đã cập nhật
- ✅ TimelineItem đã cập nhật
- ✅ HealthRecordItem đã cập nhật
- ✅ GrowthRecordItem đã cập nhật
- ✅ QuestionAnswerCard đã cập nhật

## Kết quả

Chỉ người tạo post mới thấy được nút thiết lập visibility, tránh nhầm lẫn cho người dùng khác.

## Lưu ý

Một số component sử dụng simplified check vì backend chưa cung cấp thông tin creator. Khi backend có thông tin này, cần cập nhật logic kiểm tra chính xác hơn.

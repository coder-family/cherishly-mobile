# Cập nhật Children API Endpoints

## Backend Endpoints mới

### 1. `/children/my-own-children`

- **Mục đích**: Lấy chỉ children do user hiện tại tạo
- **Sử dụng cho**: "Your Babies" section
- **Logic**: `Child.find({ createdBy: req.user.id, isDeleted: false })`

### 2. `/children/accessible-children`

- **Mục đích**: Lấy tất cả children user có thể truy cập
- **Sử dụng cho**: Family groups, shared content
- **Logic**: Kết hợp children user tạo + children trong family groups

## Frontend Updates

### 1. Child Service (`app/services/childService.ts`)

#### `getChildren()` - Cập nhật để sử dụng accessible-children

```typescript
// Trước
const response = await apiService.get("/children/my-children");

// Sau
const response = await apiService.get("/children/accessible-children");
```

#### `getMyOwnChildren()` - Function mới cho "Your Babies"

```typescript
export async function getMyOwnChildren(): Promise<Child[]> {
  const response = await apiService.get("/children/my-own-children");
  // ... transform logic
}
```

### 2. Redux Slice (cần cập nhật)

Cần thêm thunk mới cho `getMyOwnChildren`:

```typescript
export const fetchMyOwnChildren = createAsyncThunk(
  "children/fetchMyOwnChildren",
  async () => {
    return await childService.getMyOwnChildren();
  }
);
```

### 3. Home Screen (cần cập nhật)

Cập nhật để sử dụng `getMyOwnChildren` cho "Your Babies" section:

```typescript
// Trong useEffect
dispatch(fetchMyOwnChildren()); // Thay vì fetchChildren()

// Trong selector
const { children: myOwnChildren } = useAppSelector((state) => state.children);
```

## Phân biệt sử dụng

### "Your Babies" Section

- **API**: `/children/my-own-children`
- **Hiển thị**: Chỉ children do user tạo
- **Mục đích**: Quản lý children riêng của user

### Family Groups

- **API**: `/children/accessible-children`
- **Hiển thị**: Tất cả children user có thể truy cập
- **Mục đích**: Xem và tương tác với children trong family groups

## Testing

- ✅ Backend endpoints đã tạo
- ✅ Frontend service đã cập nhật
- ❌ Redux slice cần cập nhật
- ❌ Home screen cần cập nhật

## Kết quả

Bây giờ "Your Babies" sẽ chỉ hiển thị children do user tạo, không còn nhầm lẫn với children trong family groups.

# Notification Focus Fix Summary

## Vấn đề

Khi mở tab timeline, tất cả các bài post đều bị focus (highlight) và sau đó mất đi sau vài giây. Người dùng chỉ muốn focus khi click vào thông báo mới để điều hướng đến bài post đó.

## Nguyên nhân

1. Logic `useEffect` xử lý `focusPost` chạy liên tục do dependency `filteredTimelineItems` thay đổi
2. `activeTab` được khởi tạo với giá trị mặc định là `"timeline"`
3. Logic reset `hasProcessedFocusPost` chạy mỗi khi component mount
4. Logic highlight không kiểm tra xem có thực sự có `focusPost` hay không

## Giải pháp đã thực hiện

### 1. Sửa logic highlight

- Thêm điều kiện `!!focusPost &&` trước khi so sánh ID
- Đảm bảo chỉ highlight khi thực sự có `focusPost` từ notification

```typescript
// Trước
highlight={item._id === focusPost || item.id === focusPost}

// Sau
highlight={!!focusPost && (item._id === focusPost || item.id === focusPost)}
```

### 2. Sửa logic useEffect xử lý focusPost

- Thêm comment rõ ràng về điều kiện chạy
- Thêm `hasScrolledToFocusPost` vào dependency array để tránh chạy liên tục
- Loại bỏ logic set activeTab trùng lặp

### 3. Sửa logic reset state

- Chỉ reset `hasProcessedFocusPost` và `hasScrolledToFocusPost` khi không có `focusPost`
- Thêm useEffect riêng để reset khi `focusPost` thay đổi

### 4. Thay đổi activeTab mặc định

- Thay đổi từ `"timeline"` sang `"memories"`
- Chỉ set về `"timeline"` khi có `focusPost` từ notification

```typescript
// Trước
const [activeTab, setActiveTab] = useState<TabType>("timeline");

// Sau
const [activeTab, setActiveTab] = useState<TabType>("memories");
```

## Kết quả

- Khi mở tab timeline bình thường: không có focus nào
- Khi click vào notification: chỉ focus bài post được chỉ định
- Logic focus chỉ chạy khi thực sự cần thiết
- Tránh được hiện tượng focus tất cả bài post

## Test

- Logic focus đã được test với các trường hợp:
  - Không có focusPost: không highlight
  - Có focusPost nhưng không match: không highlight
  - Có focusPost và match: highlight
  - focusPost là empty string: không highlight

## Files đã sửa

- `app/children/[id]/profile.tsx`: Logic xử lý focusPost và highlight

# Hệ thống Thông báo (Notification System)

## Tổng quan

Hệ thống thông báo được implement để thông báo cho các thành viên trong nhóm gia đình khi có hoạt động mới, đặc biệt là khi có người bình luận vào các bài đăng mà họ có quyền xem.

## Cấu trúc Files

### Services

- `app/services/notificationService.ts` - API service cho notification
- `app/redux/slices/notificationSlice.ts` - Redux state management
- `app/hooks/useNotification.ts` - Custom hook để quản lý notification

### Components

- `app/components/notification/NotificationItem.tsx` - Component hiển thị từng thông báo
- `app/components/notification/NotificationList.tsx` - Component danh sách thông báo
- `app/components/notification/NotificationBadge.tsx` - Badge hiển thị số thông báo chưa đọc
- `app/components/notification/index.ts` - Export tất cả components

### Screens

- `app/notifications.tsx` - Màn hình chính hiển thị danh sách thông báo

## Tính năng chính

### 1. Thông báo bình luận

- Tự động tạo thông báo khi có người bình luận vào memory, promptResponse, healthRecord, hoặc growthRecord
- Chỉ gửi thông báo cho những thành viên có quyền xem bài đăng đó
- Kiểm tra visibility của bài đăng (public/private) để quyết định gửi thông báo

### 2. Thông báo thành viên nhóm

- **Thành viên mới tham gia**: Thông báo cho tất cả thành viên hiện tại khi có người mới tham gia nhóm
- **Thành viên rời nhóm**: Thông báo cho các thành viên còn lại khi có người rời khỏi nhóm
- **Thành viên bị xóa**: Thông báo cho các thành viên còn lại và thành viên bị xóa khi admin xóa thành viên khỏi nhóm

### 3. Quản lý thông báo

- Xem danh sách thông báo với phân trang
- Đánh dấu thông báo đã đọc
- Đánh dấu tất cả thông báo đã đọc
- Xóa thông báo
- Đếm số thông báo chưa đọc

## Cách sử dụng

### 1. Sử dụng NotificationBadge trong AppHeader

```tsx
import { NotificationBadge } from "../components/notification/NotificationBadge";

// Trong AppHeader component
<AppHeader
  showNotificationBadge={true}
  // ... other props
/>;
```

### 2. Sử dụng NotificationList trong màn hình

```tsx
import { NotificationList } from "../components/notification/NotificationList";

// Trong component
<NotificationList
  onNotificationPress={(notification) => {
    // Handle notification press
    console.log("Notification pressed:", notification);
  }}
/>;
```

### 3. Sử dụng useNotification hook

```tsx
import { useNotification } from "../hooks/useNotification";

// Trong component
const {
  notifications,
  unreadCount,
  loading,
  error,
  markAsRead,
  markAllAsRead,
  removeNotification,
  loadNotifications,
} = useNotification();
```

### 4. Navigate đến màn hình notification

```tsx
import { useRouter } from "expo-router";

const router = useRouter();

// Navigate to notifications screen
router.push("/notifications");
```

## API Endpoints

### 1. Lấy danh sách thông báo

```
GET /api/notifications?page=1&limit=20
```

### 2. Lấy số thông báo chưa đọc

```
GET /api/notifications/unread-count
```

### 3. Đánh dấu thông báo đã đọc

```
POST /api/notifications/:notificationId/mark-read
```

### 4. Đánh dấu tất cả thông báo đã đọc

```
POST /api/notifications/mark-all-read
```

### 5. Xóa thông báo

```
DELETE /api/notifications/:notificationId
```

## Cấu trúc dữ liệu

### Notification Interface

```typescript
interface Notification {
  _id: string;
  title: string;
  message: string;
  type:
    | "comment"
    | "reaction"
    | "memory_shared"
    | "invitation"
    | "reminder"
    | "member_joined"
    | "member_left"
    | "member_removed";
  isRead: boolean;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  targetType:
    | "memory"
    | "promptResponse"
    | "healthRecord"
    | "growthRecord"
    | "comment";
  targetId: string;
  familyGroupId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## Tích hợp với Backend

### 1. Tự động tạo thông báo khi có comment

Backend sẽ tự động tạo thông báo khi có comment mới thông qua `commentController.js`:

```javascript
// Tạo thông báo cho các thành viên trong nhóm (bất đồng bộ)
try {
  await createCommentNotification(comment, targetType, targetId, userId);
} catch (error) {
  console.error("Error creating notification for comment:", error);
}
```

### 2. Tự động tạo thông báo khi có thay đổi thành viên

Backend sẽ tự động tạo thông báo khi có thay đổi thành viên thông qua `familyGroupController.js`:

```javascript
// Thông báo khi thành viên mới tham gia
await createMemberJoinedNotification(group._id, user._id, group.createdBy);

// Thông báo khi thành viên rời nhóm
await createMemberLeftNotification(groupId, currentUser._id);

// Thông báo khi thành viên bị xóa
await createMemberRemovedNotification(groupId, memberId, currentUser._id);
```

## Tính năng nâng cao

### 1. Real-time notifications (Future)

- Tích hợp WebSocket để nhận thông báo real-time
- Push notifications thông qua Firebase Cloud Messaging

### 2. Cài đặt thông báo (Future)

- Cho phép user tùy chỉnh loại thông báo muốn nhận
- Cài đặt thời gian nhận thông báo

### 3. Email notifications (Future)

- Gửi email cho những thông báo quan trọng
- Tùy chỉnh template email

## Lưu ý quan trọng

1. **Bất đồng bộ**: Việc tạo thông báo được thực hiện bất đồng bộ để không ảnh hưởng đến performance
2. **Error handling**: Nếu có lỗi khi tạo thông báo, hệ thống sẽ log lỗi nhưng không làm fail việc tạo comment
3. **Privacy**: Chỉ gửi thông báo cho những người có quyền xem bài đăng
4. **Soft delete**: Thông báo được soft delete để có thể khôi phục nếu cần

## Testing

### Manual Testing

1. Tạo comment trên memory/promptResponse/healthRecord/growthRecord
2. Kiểm tra thông báo được tạo cho các thành viên có quyền xem
3. Test các chức năng mark as read, delete notification
4. Test navigation từ notification đến content tương ứng

### Unit Testing

```bash
# Test notification components
npm test -- --testNamePattern="Notification"

# Test notification service
npm test -- notificationService.test.ts

# Test notification slice
npm test -- notificationSlice.test.ts
```

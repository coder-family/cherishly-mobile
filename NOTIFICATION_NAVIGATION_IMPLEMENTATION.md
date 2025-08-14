# Notification Navigation Implementation

Tài liệu này mô tả cách implement tính năng điều hướng từ notification đến post tương ứng trong ứng dụng Growing Together.

## Tổng quan

Khi người dùng click vào một thông báo, hệ thống sẽ:

1. Lấy thông tin điều hướng từ notification (bao gồm childId)
2. Điều hướng đến child profile với focus vào post cụ thể
3. Hiển thị post trong tab timeline với context đầy đủ

## Cấu trúc Backend

### 1. Notification Model

Notification model đã được cập nhật với trường `childId`:

```javascript
{
  recipient: ObjectId,        // Người nhận
  sender: ObjectId,          // Người gửi
  type: String,              // Loại thông báo
  title: String,             // Tiêu đề
  message: String,           // Nội dung
  targetType: String,        // Loại nội dung đích
  targetId: ObjectId,        // ID của nội dung đích
  childId: ObjectId,         // ID của child liên quan (MỚI)
  familyGroupId: ObjectId,   // ID nhóm gia đình
  deepLinks: Object,         // Deep links (tùy chọn)
  isRead: Boolean,           // Đã đọc chưa
  isDeleted: Boolean         // Đã xóa chưa
}
```

### 2. API Endpoints

#### Lấy thông tin điều hướng

```http
GET /api/notifications/:notificationId/navigation
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "notification": { ... },
    "navigation": {
      "targetType": "memory",
      "targetId": "507f1f77bcf86cd799439011",
      "childId": "507f1f77bcf86cd799439012",
      "deepLinks": {
        "mobile": "growing-together://children/507f1f77bcf86cd799439012?focusPost=507f1f77bcf86cd799439011&postType=memory",
        "web": "https://growing-together.com/children/507f1f77bcf86cd799439012?focusPost=507f1f77bcf86cd799439011&postType=memory"
      },
      "route": "children"
    }
  }
}
```

## Cấu trúc Frontend

### 1. NotificationNavigationService

Service chính để xử lý navigation:

```typescript
import NotificationNavigationService from "./notificationNavigationService";

const notificationService = new NotificationNavigationService(apiBaseUrl);

// Xử lý click notification
await notificationService.handleNotificationClick(
  notification,
  navigation,
  token
);
```

### 2. NotificationList Component

Component hiển thị danh sách notification với khả năng điều hướng:

```typescript
import NotificationList from "./NotificationList";

<NotificationList
  navigation={navigation}
  token={userToken}
  apiBaseUrl={API_BASE_URL}
/>;
```

## Cách hoạt động

### 1. Khi tạo notification

Backend tự động thêm `childId` vào notification khi tạo:

```javascript
// Ví dụ: Comment notification
const notification = await createNotification({
  recipient: memberId,
  sender: senderId,
  type: "comment",
  title: "New comment",
  message: "Someone commented on your post",
  targetType: "memory",
  targetId: memoryId,
  childId: memory.childId, // Tự động thêm childId
  familyGroupId: groupId,
});
```

### 2. Khi click notification

Frontend xử lý click notification:

```typescript
const handleNotificationPress = async (notification: Notification) => {
  // Kiểm tra xem notification có childId không
  if (notification.childId) {
    // Điều hướng trực tiếp đến child profile
    await notificationService.navigateToChildProfile(
      notification.targetType,
      notification.targetId,
      notification.childId,
      navigation
    );
  } else {
    // Fallback: Lấy thông tin từ API
    const navigationInfo = await notificationService.getNotificationNavigation(
      notification._id,
      token
    );
    await notificationService.navigateToContent(
      navigationInfo.data.navigation,
      navigation
    );
  }
};
```

### 3. Điều hướng đến child profile

Service tạo URL với focusPost:

```typescript
private async navigateToChildProfile(
  targetType: string,
  targetId: string,
  childId: string,
  navigation: any
): Promise<void> {
  // Chuyển đổi targetType thành postType
  let postType = targetType;
  if (targetType === 'prompt_response') {
    postType = 'prompt_response';
  } else if (targetType === 'health_record') {
    postType = 'health_record';
  } else if (targetType === 'growth_record') {
    postType = 'growth_record';
  }

  // Điều hướng đến child profile với focusPost
  router.push(`/children/${childId}?focusPost=${targetId}&postType=${postType}`);
}
```

### 4. Child profile xử lý focusPost

Child profile component tự động scroll đến post:

```typescript
// Trong child profile component
useEffect(() => {
  if (focusPost && postType) {
    // Set active tab dựa trên post type
    switch (postType) {
      case "memory":
        setActiveTab("memories");
        break;
      case "prompt_response":
        setActiveTab("qa");
        break;
      case "health_record":
      case "growth_record":
        setActiveTab("health");
        break;
      default:
        setActiveTab("timeline");
    }

    // Scroll đến post sau khi content load xong
    setTimeout(() => {
      const postIndex = filteredTimelineItems.findIndex(
        (item) => item._id === focusPost || item.id === focusPost
      );
      if (postIndex !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: postIndex * 200,
          animated: true,
        });
      }
    }, 1000);
  }
}, [focusPost, postType, filteredTimelineItems]);
```

## Các loại thông báo được hỗ trợ

### 1. Comment Notifications

- **targetType**: `memory`, `prompt_response`, `health_record`, `growth_record`
- **Navigation**: Điều hướng đến child profile với focus vào post có comment
- **Tab**: Tự động chuyển đến tab tương ứng (memories, qa, health)

### 2. Member Notifications

- **targetType**: Không có (chỉ thông báo thông thường)
- **Navigation**: Không điều hướng (chỉ hiển thị thông báo)

### 3. Reaction Notifications

- **targetType**: `memory`, `prompt_response`, `health_record`, `growth_record`
- **Navigation**: Điều hướng đến child profile với focus vào post có reaction

## Deep Links

Hệ thống sử dụng deep links với format:

```
growing-together://children/{childId}?focusPost={targetId}&postType={targetType}
```

Ví dụ:

- `growing-together://children/123?focusPost=456&postType=memory`
- `growing-together://children/123?focusPost=789&postType=prompt_response`
- `growing-together://children/123?focusPost=101&postType=health_record`

## Error Handling

### 1. Backend Errors

- Notification không tồn tại: 404
- Không có quyền truy cập: 403
- TargetType không được hỗ trợ: 400
- ChildId không tồn tại: 400

### 2. Frontend Errors

- Network error: Fallback về Home screen
- Invalid deep link: Fallback về Home screen
- Navigation error: Fallback về Home screen
- Missing childId: Fallback về Home screen

## Testing

### 1. Test API

```bash
# Test navigation API
curl -X GET \
  http://localhost:3001/api/notifications/{notificationId}/navigation \
  -H "Authorization: Bearer {token}"
```

### 2. Test Frontend

```bash
# Chạy test script
node test-notification-navigation.js
```

### 3. Test Manual

1. Tạo một comment trên memory
2. Kiểm tra notification được tạo với childId
3. Click vào notification
4. Verify điều hướng đến child profile với focus vào memory

## Performance Considerations

1. **Lazy Loading**: Deep links được tạo khi cần thiết
2. **Caching**: Có thể cache navigation info
3. **Pagination**: Notification list hỗ trợ pagination
4. **Error Recovery**: Fallback mechanisms cho errors

## Security

1. **Authentication**: Tất cả API calls cần token
2. **Authorization**: Kiểm tra quyền truy cập content
3. **Validation**: Validate notification ownership
4. **Sanitization**: Sanitize deep link parameters

## Troubleshooting

### 1. Notification không điều hướng

- Kiểm tra `childId` có được set trong notification không
- Kiểm tra `targetType` và `targetId` có đúng không
- Kiểm tra route navigation có tồn tại không
- Kiểm tra console logs để debug

### 2. Deep link không hoạt động

- Kiểm tra app scheme configuration
- Kiểm tra URL format
- Kiểm tra navigation setup

### 3. API errors

- Kiểm tra authentication token
- Kiểm tra notification permissions
- Kiểm tra database connection

## Future Improvements

1. **Analytics**: Track notification click rates
2. **Personalization**: Customize navigation based on user preferences
3. **Offline Support**: Cache navigation info for offline use
4. **Push Notifications**: Extend to handle push notification navigation

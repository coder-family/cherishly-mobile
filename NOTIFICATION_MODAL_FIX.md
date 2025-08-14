# Sửa lỗi Notification Modal cho Member Joined

## Vấn đề

Khi người dùng click vào thông báo có người mới được thêm vào nhóm, ứng dụng không hiển thị modal thông tin về người dùng đó mà vẫn đứng nguyên tại chỗ. Ngoài ra, avatar của thành viên không hiển thị trong danh sách thông báo.

## Nguyên nhân

1. `NotificationList` component sử dụng `NotificationItem` cho tất cả các loại notification, bao gồm cả `member_joined`
2. `MemberJoinedNotification` component đã được tạo nhưng không được sử dụng
3. Logic xử lý click cho `member_joined` notification chưa được implement đúng cách
4. Avatar không hiển thị do URL không đúng format
5. `MemberJoinedNotification` component sử dụng icon generic thay vì hiển thị avatar của thành viên

## Giải pháp

### 1. Sửa `NotificationList.tsx`

- Import `MemberJoinedNotification` component và `PopulatedNotification` type
- Thêm logic để sử dụng `MemberJoinedNotification` cho notification type `member_joined`
- Chuyển đổi `Notification` thành `PopulatedNotification` cho `member_joined` notification
- Xử lý mark as read riêng cho `member_joined` notification
- Thêm debug log để kiểm tra dữ liệu notification

### 2. Sửa `MemberJoinedNotification.tsx`

- Cập nhật interface để `onPress` có thể nhận notification parameter
- Sửa logic để gọi `onPress` callback trước khi hiển thị modal (để mark as read)
- Đảm bảo modal chỉ hiển thị cho `member_joined` notification
- **Thay thế icon generic bằng Avatar component để hiển thị avatar của thành viên**
- **Thêm icon overlay (person-add) trên avatar để phân biệt với notification khác**
- **Thêm logic xử lý avatar URL để đảm bảo URL đúng format**
- Thêm debug log để kiểm tra avatar URL

### 3. Sửa `useMemberInfoModal.ts`

- Sửa import từ `getUserById` thành `getUser`
- Xử lý `lastName` có thể undefined
- Thêm logic xử lý avatar URL để đảm bảo URL đúng format
- Thêm debug log để kiểm tra dữ liệu từ API

### 4. Sửa `MemberInfoModal.tsx`

- Sử dụng `Avatar` component thay vì `Image` component để hiển thị avatar
- Thêm debug log để kiểm tra việc hiển thị avatar
- Cập nhật styles để phù hợp với Avatar component

### 5. Logic hoạt động

1. Khi click vào `member_joined` notification:

   - Gọi `onPress` callback để mark as read
   - Gọi `showMemberInfo(notification.sender._id)` để hiển thị modal
   - Modal sẽ fetch thông tin user từ API và hiển thị
   - Avatar URL được xử lý để đảm bảo đúng format

2. Các notification khác vẫn sử dụng `NotificationItem` và logic điều hướng bình thường

## Files đã sửa

- `app/components/notification/NotificationList.tsx`
- `app/components/notification/MemberJoinedNotification.tsx`
- `app/hooks/useMemberInfoModal.ts`
- `app/components/family/MemberInfoModal.tsx`

## Kết quả

- Khi click vào thông báo `member_joined`, modal thông tin thành viên sẽ hiển thị
- Avatar của thành viên sẽ hiển thị đúng cách trong cả danh sách thông báo và modal
- Icon overlay (person-add) trên avatar giúp phân biệt với notification khác
- Notification được mark as read đúng cách
- Các notification khác vẫn hoạt động bình thường
- Không có lỗi TypeScript

## Test

- Logic đã được test với mock data và hoạt động đúng
- Avatar URL processing đã được test với nhiều trường hợp khác nhau
- Modal sẽ hiển thị thông tin: avatar, tên, email, vai trò, ngày tham gia
- Có các button "Xem hồ sơ" và "Nhắn tin" (hiện tại hiển thị alert)

## Debug Logs

- Thêm debug logs để kiểm tra dữ liệu từ API
- Thêm debug logs để kiểm tra việc hiển thị avatar
- Thêm debug logs để kiểm tra notification data trong NotificationList
- Có thể theo dõi quá trình xử lý avatar URL

## UI/UX Improvements

- Avatar hiển thị trong danh sách thông báo thay vì icon generic
- Icon overlay giúp người dùng dễ dàng nhận biết loại notification
- Giao diện nhất quán với các notification khác

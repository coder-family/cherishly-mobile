# Keyboard Avoidance Fix

## Vấn đề

Khi test ứng dụng trên điện thoại thật với Expo, bàn phím ảo của điện thoại che mất ô nhập text khi bình luận và nhập liệu trong các modal.

## Giải pháp

Đã thêm `KeyboardAvoidingView` vào các component có TextInput để tự động điều chỉnh layout khi bàn phím xuất hiện. Ô nhập text được đặt ở vị trí cố định phía dưới và sẽ hiển thị ngay trên bàn phím ảo.

## Các file đã sửa

### 1. `app/components/CommentModal.tsx`

- Thêm import: `KeyboardAvoidingView`, `Platform`
- Wrap toàn bộ modal content trong `KeyboardAvoidingView`
- Sử dụng behavior: `Platform.OS === 'ios' ? 'padding' : 'height'`
- Điều chỉnh `keyboardVerticalOffset` xuống 0 (iOS) và 5 (Android) để ô nhập text sát bàn phím
- Loại bỏ `position: 'absolute'` để ô nhập text hiển thị đúng vị trí phía trên bàn phím
- Loại bỏ `paddingBottom` cho commentsList vì không cần thiết
- Thêm `contentContainerStyle` với `paddingBottom: 20` cho FlatList
- Thêm `elevation: 5` cho Android shadow

### 2. `app/components/CommentSystem.tsx`

- Thêm import: `KeyboardAvoidingView`, `Platform`
- Wrap toàn bộ component trong `KeyboardAvoidingView`
- Sử dụng behavior: `Platform.OS === 'ios' ? 'padding' : 'height'`
- Điều chỉnh `keyboardVerticalOffset` xuống 10 (iOS) và 20 (Android) để ô nhập text chỉ cách bàn phím một khoảng nhỏ
- Loại bỏ `position: 'absolute'` để ô nhập text hiển thị đúng vị trí phía trên bàn phím
- Loại bỏ `paddingBottom` cho commentsList vì không cần thiết
- Thêm `elevation: 5` cho Android shadow

### 3. `app/components/qa/AskChildModal.tsx`

- Thêm import: `KeyboardAvoidingView`, `Platform`
- Wrap modal content trong `KeyboardAvoidingView`
- Sử dụng behavior: `Platform.OS === 'ios' ? 'padding' : 'height'`
- Điều chỉnh `keyboardVerticalOffset` xuống 10 (iOS) và 20 (Android) để ô nhập text chỉ cách bàn phím một khoảng nhỏ

### 4. `app/components/qa/EditResponseModal.tsx`

- Thêm import: `KeyboardAvoidingView`, `Platform`
- Wrap modal content trong `KeyboardAvoidingView`
- Sử dụng behavior: `Platform.OS === 'ios' ? 'padding' : 'height'`
- Điều chỉnh `keyboardVerticalOffset` xuống 10 (iOS) và 20 (Android) để ô nhập text chỉ cách bàn phím một khoảng nhỏ

## Cách hoạt động

- **iOS**: Sử dụng `padding` behavior để thêm padding bottom khi bàn phím xuất hiện
- **Android**: Sử dụng `height` behavior để điều chỉnh chiều cao của view
- **keyboardVerticalOffset**: Giảm xuống 10 (iOS) và 20 (Android) để ô nhập text chỉ cách bàn phím một khoảng nhỏ
- **Loại bỏ position absolute**: Để ô nhập text hiển thị đúng vị trí phía trên bàn phím
- **Minimal padding**: Chỉ 20px cho FlatList để tối ưu khoảng cách

## Kết quả

- Ô nhập text hiển thị đúng vị trí phía trên bàn phím ảo với khoảng cách nhỏ (giống Zalo)
- Layout tự động điều chỉnh khi bàn phím xuất hiện/biến mất
- Trải nghiệm người dùng tự nhiên và quen thuộc trên cả iOS và Android
- Không còn bị che mất nội dung khi nhập liệu
- Không còn khoảng trống lớn phía trên bàn phím

## Lưu ý

- Các component khác đã có sẵn `KeyboardAvoidingView` không cần sửa
- Test trên cả iOS và Android để đảm bảo hoạt động tốt
- Có thể cần điều chỉnh thêm style nếu layout vẫn chưa tối ưu

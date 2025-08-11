# Comment System Component

## Tổng quan

CommentSystem là một component React Native hoàn chỉnh để hiển thị và quản lý bình luận cho các bài post trong ứng dụng Growing Together. Component này hỗ trợ:

- ✅ Tạo bình luận mới
- ✅ Hiển thị danh sách bình luận với pagination
- ✅ Chỉnh sửa bình luận (chỉ owner)
- ✅ Xóa bình luận (chỉ owner)
- ✅ Trả lời bình luận (nested comments)
- ✅ Pull-to-refresh
- ✅ Infinite scroll
- ✅ Loading states
- ✅ Error handling
- ✅ Theme support (light/dark mode)

## Cách sử dụng

### 1. Import component

```tsx
import CommentSystem from "./components/family/CommentSystem";
```

### 2. Sử dụng cơ bản

```tsx
import React from "react";
import { View } from "react-native";
import CommentSystem from "./components/family/CommentSystem";

const MyComponent = () => {
  const handleCommentAdded = (comment) => {
    console.log("Comment added:", comment);
  };

  const handleCommentDeleted = (commentId) => {
    console.log("Comment deleted:", commentId);
  };

  const handleCommentEdited = (comment) => {
    console.log("Comment edited:", comment);
  };

  return (
    <View style={{ flex: 1 }}>
      <CommentSystem
        targetType="Memory"
        targetId="507f1f77bcf86cd799439011"
        onCommentAdded={handleCommentAdded}
        onCommentDeleted={handleCommentDeleted}
        onCommentEdited={handleCommentEdited}
      />
    </View>
  );
};
```

### 3. Sử dụng với các loại target khác nhau

```tsx
// Cho Memory
<CommentSystem
  targetType="Memory"
  targetId="memory-id-here"
/>

// Cho HealthRecord
<CommentSystem
  targetType="HealthRecord"
  targetId="health-record-id-here"
/>

// Cho GrowthRecord
<CommentSystem
  targetType="GrowthRecord"
  targetId="growth-record-id-here"
/>

// Cho PromptResponse
<CommentSystem
  targetType="PromptResponse"
  targetId="prompt-response-id-here"
/>
```

## Props

| Prop               | Type                                                                            | Required | Description               |
| ------------------ | ------------------------------------------------------------------------------- | -------- | ------------------------- |
| `targetType`       | `'PromptResponse' \| 'Memory' \| 'HealthRecord' \| 'GrowthRecord' \| 'Comment'` | ✅       | Loại target để comment    |
| `targetId`         | `string`                                                                        | ✅       | ID của target             |
| `onCommentAdded`   | `(comment: Comment) => void`                                                    | ❌       | Callback khi thêm comment |
| `onCommentDeleted` | `(commentId: string) => void`                                                   | ❌       | Callback khi xóa comment  |
| `onCommentEdited`  | `(comment: Comment) => void`                                                    | ❌       | Callback khi edit comment |

## Types

### Comment Interface

```tsx
interface Comment {
  _id: string;
  content: string;
  targetType:
    | "PromptResponse"
    | "Memory"
    | "HealthRecord"
    | "GrowthRecord"
    | "Comment";
  targetId: string;
  user: User;
  parentComment?: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}
```

### User Interface

```tsx
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}
```

## Features

### 1. Comment Input

- Text input với multiline support
- Character limit (1000 ký tự)
- Loading state khi submit
- Validation (không cho phép comment rỗng)

### 2. Comment List

- FlatList với performance optimization
- Pull-to-refresh
- Infinite scroll (load more)
- Empty state khi chưa có comment
- Loading indicator

### 3. Comment Item

- Hiển thị avatar và tên user
- Format thời gian (vừa xong, X giờ trước, ngày tháng)
- Actions cho owner (edit, delete)
- Reply functionality
- Nested comments support

### 4. Edit/Delete

- Chỉ owner mới thấy edit/delete buttons
- Confirmation dialog khi delete
- Inline edit với cancel/save actions

### 5. Nested Comments

- Hiển thị replies với indentation
- Toggle show/hide replies
- Reply input cho từng comment

## API Integration

Component sử dụng `commentService` để gọi API:

```tsx
import { commentService } from "../../services/commentService";

// Tạo comment
const newComment = await commentService.createComment({
  content: "Nội dung comment",
  targetType: "Memory",
  targetId: "memory-id",
  parentCommentId: null, // null cho comment gốc
});

// Lấy comments
const response = await commentService.getComments("Memory", "memory-id", 1, 10);

// Update comment
const updatedComment = await commentService.updateComment("comment-id", {
  content: "Nội dung mới",
});

// Delete comment
await commentService.deleteComment("comment-id");
```

## Styling

Component sử dụng theme colors từ `useThemeColor` hook:

```tsx
const backgroundColor = useThemeColor({}, "background");
const textColor = useThemeColor({}, "text");
```

### Custom Styles

Bạn có thể customize styles bằng cách override:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  commentContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  // ... other styles
});
```

## Error Handling

Component có built-in error handling:

- Network errors
- API errors
- Validation errors
- User-friendly error messages

## Performance

- Virtualized list với FlatList
- Lazy loading cho replies
- Optimistic updates
- Debounced input handling

## Accessibility

- Proper accessibility labels
- Screen reader support
- Keyboard navigation
- High contrast support

## Testing

```tsx
import { render, fireEvent } from "@testing-library/react-native";
import CommentSystem from "./CommentSystem";

test("renders comment system", () => {
  const { getByPlaceholderText } = render(
    <CommentSystem targetType="Memory" targetId="test-id" />
  );

  expect(getByPlaceholderText("Viết bình luận...")).toBeTruthy();
});
```

## Dependencies

- `react-native`
- `@expo/vector-icons`
- `react-redux`
- `../../services/commentService`
- `../../hooks/useThemeColor`
- `../../constants/Colors`

## Notes

1. Component cần Redux store để lấy thông tin user hiện tại
2. API calls được handle bởi commentService
3. Authentication được handle bởi apiService interceptor
4. Theme support được handle bởi useThemeColor hook

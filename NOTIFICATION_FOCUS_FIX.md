# Notification Focus Post Fix

## Vấn đề

Khi click vào notification, app đã điều hướng đúng đến child profile nhưng chưa scroll đến đúng bài post được focus.

## Nguyên nhân

1. `scrollViewRef` chưa được gán cho ScrollView chính (Animated.ScrollView)
2. Logic scroll sử dụng ước tính chiều cao không chính xác
3. Timing issue - content chưa load xong khi scroll

## Giải pháp

### 1. Sửa `app/services/notificationNavigationService.ts`

- Xử lý `childId` có thể là object thay vì string
- Cập nhật route từ `/children/${childId}` thành `/children/${childId}/profile`

```typescript
// Xử lý childId có thể là object hoặc string
const childId =
  typeof notification.childId === "object" && notification.childId !== null
    ? (notification.childId as any)._id
    : notification.childId;

// Điều hướng đến child profile với focusPost
router.push(
  `/children/${childId}/profile?focusPost=${targetId}&postType=${postType}`
);
```

### 2. Cập nhật interface trong `app/services/notificationService.ts`

```typescript
childId?: string | { _id: string; firstName?: string; lastName?: string; avatar?: string };
```

### 3. Sửa logic scroll trong `app/children/[id]/profile.tsx`

- Gán `scrollViewRef` cho Animated.ScrollView chính
- Cải thiện logic tính toán vị trí scroll
- Thêm logging để debug
- Tăng delay để đảm bảo content load xong

```typescript
// Gán ref cho ScrollView chính
<Animated.ScrollView ref={scrollViewRef} ...>

// Cải thiện logic scroll
const postIndex = filteredTimelineItems.findIndex(item => item._id === focusPost || item.id === focusPost);
if (postIndex !== -1 && scrollViewRef.current) {
  const estimatedPosition = postIndex * 350 + 200; // 350px per item + 200px header offset
  scrollViewRef.current.scrollTo({
    y: estimatedPosition,
    animated: true
  });
}
```

### 4. Sửa logic set active tab

- Tất cả post types (memory, prompt_response, health_record, growth_record) đều hiển thị trong tab "timeline"

### 5. Cập nhật tests

- Cập nhật tất cả test cases để sử dụng route `/children/${childId}/profile` thay vì `/children/${childId}`

## Kết quả

- Notification navigation hoạt động chính xác
- Scroll đến đúng bài post được focus
- Tất cả tests pass
- Logging giúp debug dễ dàng hơn

## Testing

Chạy test để verify:

```bash
npm test -- tests/notificationService.test.ts
```

## Lưu ý

- Logic scroll vẫn sử dụng ước tính chiều cao. Để chính xác hơn, có thể implement `onLayout` callback để lấy chiều cao thực tế của từng item.
- Delay 800ms được điều chỉnh để load nhanh hơn.

## Fix thêm - Tránh force chuyển tab liên tục

### Vấn đề

Logic `useEffect` xử lý `focusPost` chạy liên tục do dependency `filteredTimelineItems` thay đổi, khiến tab bị force chuyển về "timeline" mặc dù user đã click chuyển tab khác.

### Giải pháp

1. **Tách logic thành 2 useEffect riêng biệt**:

   - useEffect đầu tiên chỉ xử lý set active tab (chỉ chạy khi `focusPost` hoặc `postType` thay đổi)
   - useEffect thứ hai chỉ xử lý scroll (chạy khi `filteredTimelineItems` thay đổi)

2. **Thêm state tracking**:

   - `hasProcessedFocusPost`: đảm bảo logic chỉ chạy một lần
   - Reset state khi component mount hoặc `id` thay đổi

3. **Loại bỏ dependency không cần thiết**:
   - Không include `filteredTimelineItems` trong dependency của useEffect set active tab

### Code thay đổi

```typescript
// State tracking
const [hasProcessedFocusPost, setHasProcessedFocusPost] = useState(false);

// useEffect 1: Chỉ set active tab
useEffect(() => {
  if (focusPost && postType && !hasProcessedFocusPost) {
    setActiveTab("timeline");
    setHasProcessedFocusPost(true);
  }
}, [focusPost, postType, hasProcessedFocusPost]);

// useEffect 2: Chỉ scroll
useEffect(() => {
  if (focusPost && filteredTimelineItems.length > 0) {
    // Logic scroll...
  }
}, [focusPost, filteredTimelineItems]);
```

## Fix thêm - Tránh API calls liên tục và cải thiện scroll chính xác

### Vấn đề

1. **API calls liên tục**: useEffect load Q&A và health data chạy liên tục khi `activeTab === 'timeline'`
2. **Scroll không chính xác**: Ước tính chiều cao không phù hợp với từng loại content
3. **Delay quá lâu**: 1500ms làm user chờ quá lâu

### Giải pháp

1. **Thêm state tracking cho timeline data**:

   - `hasLoadedTimelineData`: đảm bảo chỉ load data một lần
   - Reset khi component mount hoặc `id` thay đổi

2. **Cải thiện logic scroll**:

   - Tính toán chiều cao khác nhau cho từng loại content
   - Memory: 400px, Q&A: 300px, Health: 250px
   - Tăng header offset từ 200px lên 300px

3. **Giảm delay**:
   - Từ 1500ms xuống 800ms để load nhanh hơn

### Code thay đổi

```typescript
// State tracking cho timeline data
const [hasLoadedTimelineData, setHasLoadedTimelineData] = useState(false);

// useEffect load timeline data (chỉ một lần)
useEffect(() => {
  if (id && activeTab === "timeline" && !hasLoadedTimelineData) {
    // Load Q&A, health, growth data...
    setHasLoadedTimelineData(true);
  }
}, [id, activeTab, dispatch, hasLoadedTimelineData]);

// Cải thiện logic scroll
const estimatedPosition = postIndex * itemHeight + 300; // 300px header offset
```

## Fix cuối cùng - Sử dụng onLayout và requestAnimationFrame cho scroll chính xác

### Vấn đề

- Ước tính chiều cao vẫn không chính xác vì mỗi item có thể có chiều cao khác nhau
- Cần scroll đến vị trí thực tế của item, không phải ước tính

### Giải pháp

1. **Lưu toạ độ thực bằng onLayout**:

   - Thêm `itemPositions` state để lưu vị trí Y của từng item
   - Wrap mỗi TimelineItem trong View với onLayout callback

2. **Scroll sau khi layout hoàn tất**:

   - Sử dụng `requestAnimationFrame` để đảm bảo layout đã hoàn tất
   - Retry mechanism nếu item position chưa có

3. **Trừ TOP_OFFSET cố định**:
   - Sử dụng `TOP_OFFSET = 80` (AppHeader height)
   - Scroll đến `itemPosition - TOP_OFFSET`

### Code thay đổi

```typescript
// Store layout positions for each timeline item
const [itemPositions, setItemPositions] = useState<Record<string, number>>({});
const TOP_OFFSET = 80; // AppHeader height

// Handle onLayout for timeline items
const handleItemLayout = useCallback((itemId: string, event: any) => {
  const { y } = event.nativeEvent.layout;
  setItemPositions((prev) => ({
    ...prev,
    [itemId]: y,
  }));
}, []);

// Scroll logic với onLayout
const scrollToItem = () => {
  const itemPosition = itemPositions[targetItem.id];
  if (itemPosition !== undefined) {
    scrollViewRef.current?.scrollTo({
      y: itemPosition - TOP_OFFSET,
      animated: true,
    });
    setHasScrolledToFocusPost(true);
  } else {
    // Retry after a short delay
    setTimeout(scrollToItem, 100);
  }
};

// Use requestAnimationFrame to ensure layout is complete
requestAnimationFrame(() => {
  requestAnimationFrame(scrollToItem);
});
```

## Fix cuối cùng - Thêm highlight animation cho bài post có bình luận mới

### Vấn đề

- User cần thấy rõ ràng bài post nào có bình luận mới
- Cần visual feedback để user biết đã scroll đến đúng bài post

### Giải pháp

1. **Truyền prop highlight vào TimelineItem**:

   - So sánh `item._id === focusPost` hoặc `item.id === focusPost`
   - Truyền prop `highlight={true}` cho item cần highlight

2. **Animation highlight trong TimelineItem**:

   - Background color fade in/out: `rgba(79, 140, 255, 0.1)`
   - Border animation: 3px border với màu `#4f8cff`
   - Pulse effect: 3 lần pulse trong 2-3 giây

3. **Animation sequence**:
   - Fade in highlight (300ms)
   - Pulse border animation (3 iterations, 2s each)
   - Fade out highlight (500ms)

### Code thay đổi

```typescript
// Trong child profile - truyền prop highlight
<TimelineItem
  item={item}
  highlight={item._id === focusPost || item.id === focusPost}
  // ... other props
/>

// Trong TimelineItem - animation logic
const highlightAnimation = useRef(new Animated.Value(0)).current;
const borderAnimation = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (highlight) {
    Animated.sequence([
      // Fade in highlight
      Animated.timing(highlightAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      // Pulse border animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(borderAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
        { iterations: 3 }
      ),
      // Fade out highlight
      Animated.timing(highlightAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }
}, [highlight]);

// Animated styles
<Animated.View
  style={[
    styles.container,
    {
      backgroundColor: highlightAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', 'rgba(79, 140, 255, 0.1)'],
      }),
      borderWidth: borderAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 3],
      }),
      borderColor: borderAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', '#4f8cff'],
      }),
    },
  ]}
>
```

### Lưu ý quan trọng

- **Import đúng cách**: Phải import `useRef` từ React và `Animated` từ react-native
- **useNativeDriver**: Sử dụng `useNativeDriver: false` để support background color animation
- **Performance**: Animation chỉ chạy khi `highlight={true}` để tối ưu performance
- **Tránh infinite loop**: Không include `highlightAnimation` và `borderAnimation` trong dependency array của useEffect
- **Scroll retry limit**: Thêm `MAX_SCROLL_RETRIES = 10` để tránh infinite retry khi scroll
- **Video loading optimization**: Sử dụng `useMemo` cho `videoPlayers` để tránh re-create video players liên tục

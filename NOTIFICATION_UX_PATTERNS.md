# 🔔 Notification UX Patterns

## 🎯 **Best Practices cho Notification Navigation**

### ✅ **Khi user click vào notification:**

1. **Mark as Read ngay lập tức**

   - ✅ Tự động đánh dấu đã đọc khi click
   - ✅ Cập nhật badge count real-time
   - ✅ Cải thiện UX - user không cần thao tác thêm

2. **Điều hướng đến context gốc**

   - ✅ Memory → Memory post cụ thể
   - ✅ Comment → Bài post có comment
   - ✅ Health record → Health section
   - ✅ Growth record → Growth section
   - ✅ Family group → Family group page

3. **Fallback navigation**
   - ✅ Nếu không tìm thấy route → Home screen
   - ✅ Tránh crash app

## 🗺️ **Navigation Mapping:**

### **Memory Notifications:**

```
Notification → /children/{familyGroupId}?focusPost={memoryId}&postType=memory
```

- User được đưa đến timeline của bé
- Tab "Memories" được active
- Scroll tự động đến memory post cụ thể
- Context đầy đủ

### **Prompt Response Notifications:**

```
Notification → /children/{familyGroupId}?focusPost={responseId}&postType=prompt_response
```

- User được đưa đến timeline của bé
- Tab "Q&A" được active
- Scroll tự động đến response cụ thể
- Context đầy đủ

### **Health Record Notifications:**

```
Notification → /children/{familyGroupId}?focusPost={recordId}&postType=health_record
```

- User được đưa đến timeline của bé
- Tab "Health" được active
- Scroll tự động đến health record cụ thể
- Context đầy đủ

### **Growth Record Notifications:**

```
Notification → /children/{familyGroupId}?focusPost={recordId}&postType=growth_record
```

- User được đưa đến timeline của bé
- Tab "Health" được active (growth records nằm trong health tab)
- Scroll tự động đến growth record cụ thể
- Context đầy đủ

### **Family Group Notifications:**

```
Notification → /family/{familyGroupId}
```

- User thấy family group page
- Có thể xem members, activities
- Context tổng quan

## 💡 **UX Benefits:**

### **1. Immediate Feedback:**

- ✅ Badge count giảm ngay lập tức
- ✅ Visual feedback rõ ràng
- ✅ User biết action đã được thực hiện

### **2. Context Preservation:**

- ✅ User không bị mất context
- ✅ Dễ dàng tìm thấy content gốc
- ✅ Giảm cognitive load

### **3. Seamless Navigation:**

- ✅ Không cần back nhiều lần
- ✅ Direct access đến content
- ✅ Intuitive user flow

## 🔧 **Implementation:**

### **Code Structure:**

```typescript
const handleNotificationPress = useCallback(
  (notification: Notification) => {
    // 1. Mark as read first
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id));
    }

    // 2. Navigate based on type with focus params
    switch (notification.targetType) {
      case "memory":
        router.push({
          pathname: `/children/${notification.familyGroupId}`,
          params: {
            focusPost: notification.targetId,
            postType: "memory",
          },
        });
        break;
      case "prompt_response":
        router.push({
          pathname: `/children/${notification.familyGroupId}`,
          params: {
            focusPost: notification.targetId,
            postType: "prompt_response",
          },
        });
        break;
      // ... other cases
    }
  },
  [router, dispatch]
);
```

### **Key Features:**

- ✅ **Conditional mark as read** - Chỉ mark nếu chưa đọc
- ✅ **Smart navigation** - Điều hướng đến timeline của bé
- ✅ **Tab auto-switching** - Tự động chuyển tab phù hợp
- ✅ **Auto-scroll focus** - Scroll tự động đến post cụ thể
- ✅ **Family group context** - Sử dụng familyGroupId
- ✅ **Deep linking support** - URL params cho focus

## 🚀 **Future Enhancements:**

### **1. Deep Linking:**

- ✅ Support app links từ email
- ✅ Direct navigation từ push notifications
- ✅ Share links với context

### **2. Smart Navigation:**

- ✅ Remember user's last position
- ✅ Suggest related content
- ✅ Batch navigation cho multiple notifications

### **3. Analytics:**

- ✅ Track notification engagement
- ✅ Measure navigation success rate
- ✅ Optimize based on user behavior

---

**Status**: ✅ **IMPLEMENTED** | 🎉 **Production Ready**

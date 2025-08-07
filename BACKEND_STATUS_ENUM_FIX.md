# Backend Status Enum Issue

## Vấn đề

Backend không chấp nhận status `declined` hoặc `rejected` cho invitation. Lỗi validation:

```
FamilyGroup validation failed: invitations.1.status: `declined` is not a valid enum value for path `status`.
```

## Nguyên nhân

Backend enum `status` không bao gồm giá trị `declined`. Có thể chỉ có:

- `pending`
- `accepted`
- `expired`

## Giải pháp tạm thời (Frontend)

Đã cập nhật error handling để hiển thị thông báo rõ ràng:

```typescript
if (error.message && error.message.includes("validation failed")) {
  if (
    error.message.includes("status") &&
    (error.message.includes("declined") || error.message.includes("rejected"))
  ) {
    throw new Error(
      "Backend does not support declined/rejected status. Please contact administrator."
    );
  } else {
    throw new Error("Invalid invitation data. Please try again.");
  }
}
```

## Backend cần cập nhật

### 1. Cập nhật Invitation Schema

```javascript
// Trong invitation schema
status: {
  type: String,
  enum: ["pending", "accepted", "expired", "rejected"], // Thêm "rejected"
  default: "pending"
}
```

### 2. Cập nhật Decline Logic

```javascript
// Trong declineInvitation controller
const invitation = await Invitation.findOne({ token });
if (!invitation) {
  return res.status(404).json({ message: "Invitation not found" });
}

// Cập nhật status thành rejected
invitation.status = "rejected";
await invitation.save();
```

### 3. Cập nhật FamilyGroup Schema (nếu cần)

```javascript
// Nếu invitations được lưu trong FamilyGroup
invitations: [
  {
    email: String,
    role: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "declined"],
    },
    token: String,
    createdAt: Date,
  },
];
```

## Testing

- ✅ Frontend error handling đã được cập nhật
- ❌ Backend cần cập nhật enum values
- ❌ Decline functionality chưa hoạt động đầy đủ

## Kết quả

Hiện tại decline invitation sẽ hiển thị thông báo lỗi rõ ràng thay vì crash app.

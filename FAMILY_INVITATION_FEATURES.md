# Family Group Invitation Features

## Tổng quan

Chức năng mời và join nhóm gia đình cho phép người dùng:

- Mời thành viên mới vào nhóm gia đình
- Chấp nhận lời mời từ email
- Tạo tài khoản mới khi join từ invitation
- Quản lý pending invitations
- Tạo QR code cho invitation
- Theo dõi thống kê invitations

## Các API Endpoints

### 1. Mời thành viên (`POST /family-groups/:groupId/invite`)

**Request Body:**

```json
{
  "email": "user@example.com",
  "groupId": "group_id",
  "role": "parent" // hoặc "admin"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "invitation_token_32_chars"
  },
  "message": "Invitation sent successfully"
}
```

### 2. Join từ invitation (chưa có tài khoản) (`POST /family-groups/join-from-invitation`)

**Request Body:**

```json
{
  "token": "invitation_token_32_chars",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "dateOfBirth": "1990-01-01"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "groupId": "group_id",
    "role": "parent"
  },
  "message": "Account created and joined family group successfully"
}
```

### 3. Chấp nhận invitation (đã có tài khoản) (`POST /family-groups/accept-invitation`)

**Request Body:**

```json
{
  "token": "invitation_token_32_chars"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "groupId": "group_id",
    "role": "parent"
  },
  "message": "Successfully joined the family group"
}
```

### 4. Lấy danh sách pending invitations (`GET /family-groups/:groupId/pending-invitations`)

**Response:**

```json
{
  "success": true,
  "data": {
    "invitations": [
      {
        "_id": "invitation_id",
        "email": "user@example.com",
        "role": "parent",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "expiresAt": "2024-01-02T00:00:00.000Z"
      }
    ]
  }
}
```

### 5. Hủy invitation (`DELETE /family-groups/:groupId/invitations/:invitationId`)

**Response:**

```json
{
  "success": true,
  "message": "Invitation cancelled successfully"
}
```

### 6. Gửi lại invitation (`POST /family-groups/:groupId/invitations/:invitationId/resend`)

**Response:**

```json
{
  "success": true,
  "message": "Invitation resent successfully"
}
```

### 7. Lấy thống kê invitations (`GET /family-groups/:groupId/invitation-stats`)

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalInvitations": 10,
      "pendingInvitations": 3,
      "acceptedInvitations": 5,
      "expiredInvitations": 2
    }
  }
}
```

## Các màn hình trong ứng dụng

### 1. Trang Invite & Join (`/family/invite-join`)

Có 2 tab:

- **Accept Invitation**: Nhập token để chấp nhận lời mời
- **Send Invitation**: Mời người khác vào nhóm

### 2. Trang Join từ Invitation (`/family/join-from-invitation?token=xxx`)

Dành cho người chưa có tài khoản:

- Validate token
- Form tạo tài khoản mới
- Tự động join vào nhóm sau khi tạo tài khoản

### 3. Trang Quản lý Invitations (`/family/invitations`)

Trang quản lý tổng quan:

- Thống kê invitations
- Các action nhanh
- Thông tin về invitations

### 4. Modal Invite Member

Trong trang chi tiết nhóm (`/family/[id]`):

- Tab "Members" có nút "Invite"
- Modal để nhập email và chọn role
- Gửi invitation qua email

### 5. Modal Pending Invitations

Hiển thị danh sách invitations đang pending:

- Thông tin chi tiết từng invitation
- Actions: Resend, Cancel
- Hiển thị trạng thái expired

### 6. Modal QR Code

Tạo QR code cho invitation:

- Hiển thị QR code
- Share invitation link
- Copy link to clipboard

## Luồng hoạt động

### Mời thành viên:

1. User vào trang chi tiết nhóm
2. Tab "Members" → Nút "Invite"
3. Nhập email và chọn role
4. Gửi invitation
5. Người được mời nhận email với link invitation

### Chấp nhận lời mời:

**Trường hợp 1: Đã có tài khoản**

1. Click link trong email
2. Vào trang `/family/invite-join`
3. Tab "Accept Invitation"
4. Nhập token và chấp nhận

**Trường hợp 2: Chưa có tài khoản**

1. Click link trong email
2. Tự động vào trang `/family/join-from-invitation?token=xxx`
3. Điền form tạo tài khoản
4. Tự động join vào nhóm

### Quản lý invitations:

1. Vào trang `/family/invitations`
2. Xem thống kê tổng quan
3. Click "View Pending" để quản lý
4. Resend hoặc cancel invitations

## Các tính năng bảo mật

1. **Token validation**: Token phải đúng format 32 ký tự hex
2. **Token expiration**: Token hết hạn sau 24 giờ
3. **Email validation**: Kiểm tra email đã tồn tại trong nhóm
4. **Role validation**: Chỉ cho phép role "parent" hoặc "admin"
5. **Duplicate invitation check**: Không cho phép mời trùng email
6. **Rate limiting**: Giới hạn số lượng invitations gửi
7. **Audit trail**: Ghi log tất cả actions

## Email Templates

### Invitation Email

- Subject: "You're invited to join [Group Name]"
- Content: Link invitation, thông tin người mời, role được gán

### Welcome Email

- Subject: "Welcome to [Group Name]"
- Content: Thông tin tài khoản, role, người gán role

### Resend Email

- Subject: "Reminder: Invitation to join [Group Name]"
- Content: Link invitation mới, thông tin về expiration

## Cấu trúc Database

### FamilyGroup Schema

```javascript
{
  invitations: [{
    _id: ObjectId,
    email: String,
    token: String,
    role: String,
    status: String, // "pending", "accepted", "expired"
    expiresAt: Date,
    createdAt: Date,
    resentAt: Date,
    acceptedAt: Date
  }],
  members: [{
    userId: ObjectId,
    role: String,
    joinedAt: Date
  }]
}
```

## Components mới

### 1. InvitationStats

Hiển thị thống kê invitations với 4 metrics:

- Total invitations
- Pending invitations
- Accepted invitations
- Expired invitations

### 2. PendingInvitationsModal

Modal quản lý pending invitations:

- Danh sách invitations
- Actions: Resend, Cancel
- Hiển thị trạng thái expired

### 3. InvitationQRModal

Modal tạo QR code:

- Generate QR code từ invitation link
- Share functionality
- Copy link to clipboard

### 4. InvitationsScreen

Trang quản lý tổng quan:

- Thống kê invitations
- Quick actions
- Navigation đến các tính năng khác

## Testing

### Test Cases

1. Mời thành viên mới
2. Mời email đã tồn tại trong nhóm
3. Mời email đã có invitation pending
4. Chấp nhận invitation với token hợp lệ
5. Chấp nhận invitation với token hết hạn
6. Tạo tài khoản mới từ invitation
7. Validate form tạo tài khoản
8. Quản lý pending invitations
9. Resend expired invitations
10. Cancel invitations
11. Generate QR codes
12. Share invitations

### Test Data

```javascript
// Valid invitation token
const validToken = "a1b2c3d4e5f678901234567890123456";

// Test email
const testEmail = "test@example.com";

// Test user data
const testUserData = {
  firstName: "John",
  lastName: "Doe",
  password: "password123",
  dateOfBirth: "1990-01-01",
};

// Test invitation data
const testInvitationData = {
  token: "a1b2c3d4e5f678901234567890123456",
  groupName: "Test Family",
  role: "parent",
  expiresAt: "2024-01-02T00:00:00.000Z",
};
```

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid invitation token format"**: Token không đúng format 32 ký tự hex
2. **"Invalid or expired invitation"**: Token hết hạn hoặc không tồn tại
3. **"User is already a member"**: Email đã có trong nhóm
4. **"Invitation already sent"**: Đã có invitation pending cho email này
5. **"This email is already associated with an existing account"**: Email đã có tài khoản, cần dùng flow login
6. **"Cannot resend expired invitation"**: Không thể resend invitation đã hết hạn
7. **"QR code generation failed"**: Lỗi khi tạo QR code

### Debug Tips:

- Check token format: `/^[a-fA-F0-9]{32}$/`
- Check token expiration: `expiresAt > Date.now()`
- Check invitation status: `status === "pending"`
- Check user existence: `User.findOne({ email })`
- Check group membership: `group.members.some(m => m.userId === userId)`
- Check invitation count: `group.invitations.filter(i => i.status === "pending").length`
- Check rate limiting: `invitationsSentInLastHour < MAX_INVITATIONS_PER_HOUR`

## Performance Considerations

1. **Caching**: Cache invitation stats để giảm API calls
2. **Pagination**: Phân trang cho danh sách invitations lớn
3. **Real-time updates**: WebSocket cho real-time status updates
4. **Background jobs**: Cleanup expired invitations
5. **Rate limiting**: Giới hạn số invitations gửi per hour
6. **Email queuing**: Queue emails để tránh blocking

# Avatar Upload Fix

## Vấn đề

Avatar không hiển thị sau khi edit thành công vì:

1. **AvatarUpload component** chỉ trả về local URI (file://...)
2. **Server không thể xử lý** local URI từ device
3. **Data không được refresh** sau khi update
4. **Cache issue** với remote images

## Giải pháp đã thực hiện

### 1. Tạo Upload Service cho Family Group

```typescript
// app/services/familyService.ts
export async function uploadFamilyGroupAvatar(
  groupId: string,
  fileUri: string
): Promise<{ avatar: string }> {
  // Upload avatar to /family-groups/{groupId}/avatar endpoint
  const formData = new FormData();
  formData.append("avatar", {
    uri: fileUri,
    type: "image/jpeg",
    name: fileName,
  } as any);

  const response = await fetch(
    `${apiService.defaults.baseURL}/family-groups/${groupId}/avatar`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    }
  );

  return response.json();
}
```

### 2. Cập nhật EditFamilyGroupModal

```typescript
// Kiểm tra nếu avatar là local file
if (avatarUrl && avatarUrl.startsWith("file://")) {
  const uploadedAvatarUrl = await uploadAvatar(avatarUrl);
  updateData.avatarUrl = uploadedAvatarUrl;
}
```

### 3. Refresh Data sau khi Edit

```typescript
onClose={() => {
  setShowEditGroupModal(false);
  // Refresh family group data after edit
  if (id) {
    dispatch(fetchFamilyGroup(id as string));
  }
}}
```

### 4. Cache Busting cho Images

```typescript
// app/utils/imageUtils.ts
export function addCacheBusting(url: string): string {
  const timestamp = Date.now();
  return `${url}?t=${timestamp}`;
}
```

## Flow hoạt động

### Trước khi sửa:

1. User chọn ảnh → Local URI (file://...)
2. Gửi local URI lên server → Server không xử lý được
3. Avatar không được lưu → Không hiển thị

### Sau khi sửa:

1. User chọn ảnh → Local URI (file://...)
2. **Upload avatar trực tiếp lên `/family-groups/{groupId}/avatar`** → Nhận Cloudinary URL
3. **Refresh data** → Avatar hiển thị ngay lập tức
4. **Cache busting** → Đảm bảo ảnh mới được load

## API Endpoints cần thiết

### Upload Endpoint

```
POST /family-groups/{groupId}/avatar
Content-Type: multipart/form-data

Body:
- avatar: File (image)
```

### Response

```json
{
  "avatar": "https://res.cloudinary.com/xxx/image/upload/v123/family-group-avatars/avatar.jpg",
  "message": "Group avatar uploaded successfully"
}
```

## Testing

### Manual Testing

1. Edit family group
2. Chọn avatar mới
3. Save changes
4. Avatar sẽ hiển thị ngay lập tức

## Debugging

### Console Logs

```javascript
// Trong EditFamilyGroupModal
console.log("Uploading avatar...");
console.log("Avatar uploaded successfully:", uploadedAvatarUrl);
```

### Network Tab

- Kiểm tra upload request
- Kiểm tra update family group request
- Kiểm tra refresh data request

## Common Issues

### 1. Upload Failed

- Kiểm tra network connection
- Kiểm tra server endpoint
- Kiểm tra file size limits

### 2. Avatar Still Not Showing

- Kiểm tra cache busting
- Kiểm tra refresh data
- Kiểm tra image URL format

### 3. Permission Issues

- Kiểm tra file permissions
- Kiểm tra server permissions
- Kiểm tra CORS settings

## Future Improvements

### 1. Image Compression

```typescript
// Compress image before upload
const compressedImage = await ImageManipulator.manipulateAsync(
  uri,
  [{ resize: { width: 300, height: 300 } }],
  { compress: 0.8, format: "jpeg" }
);
```

### 2. Progress Indicator

```typescript
// Show upload progress
const onUploadProgress = (progress: number) => {
  setUploadProgress(progress);
};
```

### 3. Retry Mechanism

```typescript
// Retry upload on failure
const uploadWithRetry = async (uri: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await uploadAvatar(uri);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
```

## Dependencies

### Required Packages

- `expo-image-picker` - Image selection
- `expo-image-manipulator` - Image compression (optional)

### Backend Requirements

- File upload endpoint
- File storage (local/cloud)
- CORS configuration
- File size limits

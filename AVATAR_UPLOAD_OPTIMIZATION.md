# Avatar Upload Optimization

## Approach: 2 Endpoints Riêng Biệt

### **1. Upload Avatar Endpoint**

```javascript
// Route: POST /family-groups/{groupId}/avatar
exports.uploadGroupAvatar = asyncHandler(async (req, res) => {
  // Xử lý file upload
  // Upload to Cloudinary
  // Update group.avatar trong database
});
```

### **2. Update Group Details Endpoint**

```javascript
// Route: PATCH /family-groups/{groupId}
exports.updateGroupDetails = asyncHandler(async (req, res) => {
  const { name, description, avatar } = req.body;
  // Update text fields
});
```

## 🎯 Lý do chọn approach này

### **Ưu điểm:**

#### 1. **File Upload Optimization**

```javascript
// Route avatar có thể optimize cho file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});
```

#### 2. **Cloudinary Integration**

```javascript
// Upload riêng có thể optimize cho Cloudinary
const uploaded = await cloudinary.uploader.upload_stream({
  folder: "family-group-avatars",
  transformation: [
    { width: 200, height: 200, crop: "fill" },
    { quality: "auto:good" },
  ],
});
```

#### 3. **Error Handling**

```javascript
// Có thể handle upload errors riêng biệt
if (!req.file) {
  return sendError(res, StatusCodes.BAD_REQUEST, "No avatar file uploaded");
}
```

#### 4. **Performance**

- Avatar upload có thể mất thời gian
- Text fields update nhanh
- Có thể retry riêng biệt

## 🔄 Flow hoạt động

### **Frontend Logic:**

```typescript
const handleSubmit = async () => {
  // 1. Upload avatar nếu có file mới
  if (avatarUrl.startsWith("file://")) {
    await uploadFamilyGroupAvatar(groupId, avatarUrl);
    // Avatar đã được lưu vào database
  }

  // 2. Update text fields
  await updateFamilyGroupDetails(groupId, {
    name: name.trim(),
    description: description.trim(),
    // Không gửi avatar URL vì đã upload riêng
  });
};
```

### **Backend Processing:**

#### **Avatar Upload:**

```
1. protect middleware → Check authentication
2. validateObjectId → Validate groupId
3. uploadSingle("avatar") → Handle file upload
4. handleUploadError → Handle upload errors
5. uploadGroupAvatar → Upload to Cloudinary + Update database
```

#### **Group Details Update:**

```
1. protect middleware → Check authentication
2. validateObjectId → Validate groupId
3. updateGroupDetails → Update text fields
```

## 📊 So sánh với Single Endpoint

### **Option A: 2 Endpoints Riêng (Recommended)**

```javascript
// Avatar Upload
POST /family-groups/{groupId}/avatar
Body: multipart/form-data (file)

// Group Update
PATCH /family-groups/{groupId}
Body: application/json (text fields)
```

**Ưu điểm:**

- ✅ File upload optimization
- ✅ Cloudinary integration
- ✅ Error handling riêng biệt
- ✅ Performance tốt hơn
- ✅ Retry logic riêng biệt

### **Option B: Single Endpoint**

```javascript
// Combined Update
PATCH / family - groups / { groupId };
Body: multipart / form - data(file + text);
```

**Nhược điểm:**

- ❌ Mixed concerns
- ❌ Khó optimize cho file upload
- ❌ Error handling phức tạp
- ❌ Performance kém hơn

## 🚀 Implementation

### **Frontend Service:**

```typescript
// app/services/familyService.ts
export async function uploadFamilyGroupAvatar(
  groupId: string,
  fileUri: string
): Promise<{ avatar: string }> {
  // Upload file to /family-groups/{groupId}/avatar
}

export async function updateFamilyGroupDetails(
  groupId: string,
  data: {
    name: string;
    description?: string;
    avatar?: string;
  }
): Promise<FamilyGroup> {
  // Update text fields via PATCH /family-groups/{groupId}
}
```

### **Frontend Component:**

```typescript
// app/components/family/EditFamilyGroupModal.tsx
const handleSubmit = async () => {
  // 1. Upload avatar if needed
  if (isNewAvatar) {
    await uploadFamilyGroupAvatar(groupId, avatarUrl);
  }

  // 2. Update group details
  await updateFamilyGroupDetails(groupId, {
    name: name.trim(),
    description: description.trim(),
  });
};
```

## 🔧 Error Handling

### **Avatar Upload Errors:**

```typescript
try {
  await uploadFamilyGroupAvatar(groupId, avatarUrl);
} catch (error) {
  // Handle upload errors
  Alert.alert(
    "Warning",
    "Avatar upload failed. Group will be updated without avatar."
  );
}
```

### **Group Update Errors:**

```typescript
try {
  await updateFamilyGroupDetails(groupId, updateData);
} catch (error) {
  // Handle update errors
  Alert.alert("Error", "Failed to update group details");
}
```

## 📈 Performance Benefits

### **1. Parallel Processing**

```typescript
// Có thể upload avatar và update text cùng lúc
const [avatarResult, groupResult] = await Promise.all([
  uploadFamilyGroupAvatar(groupId, avatarUrl),
  updateFamilyGroupDetails(groupId, { name, description }),
]);
```

### **2. Retry Logic**

```typescript
// Retry avatar upload nếu fail
const uploadWithRetry = async (uri: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await uploadFamilyGroupAvatar(groupId, uri);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
```

### **3. Progress Tracking**

```typescript
// Track upload progress
const onUploadProgress = (progress: number) => {
  setUploadProgress(progress);
};
```

## 🎯 Kết luận

**Sử dụng 2 endpoints riêng biệt là approach tốt nhất vì:**

1. **Separation of Concerns**: File upload và text update tách biệt
2. **Optimization**: Mỗi endpoint có thể optimize cho use case riêng
3. **Error Handling**: Có thể handle errors riêng biệt
4. **Performance**: Upload và update có thể chạy song song
5. **Maintainability**: Code dễ maintain và debug hơn

**Flow recommended:**

```
1. Upload avatar (nếu có file mới) → POST /avatar
2. Update group details → PATCH /group
3. Refresh data → GET /group
4. Display updated info
```

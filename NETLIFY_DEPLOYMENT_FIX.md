# 🔧 Khắc phục lỗi "Unexpected login error: API Error" trên Netlify

## 🚨 Vấn đề

Lỗi "Unexpected login error: API Error" sau khi deploy frontend thường do kết nối Frontend (Netlify) ⇄ Backend (Render) bị lỗi.

## 🔍 Nguyên nhân

1. **File `.env` local** sử dụng URL local (`http://192.168.1.3:3001/api`)
2. **Khi deploy lên Netlify**, ứng dụng web không thể truy cập được IP local
3. **Thiếu cấu hình biến môi trường** trong Netlify

## ✅ Giải pháp đã áp dụng

### 1. Cập nhật `netlify.toml`

```toml
[build.environment]
  NODE_VERSION = "18"
  API_BASE_URL = "https://growing-together-app.onrender.com/api"
```

### 2. Cải thiện `apiService.ts`

- Thêm function `getApiBaseUrl()` để xử lý môi trường
- Thêm logging để debug
- Fallback URL cho production

### 3. Cập nhật `env.example`

- Thêm hướng dẫn cho cả development và production

## 🛠️ Các bước thực hiện

### Bước 1: Kiểm tra cấu hình Netlify

1. Vào **Netlify Dashboard** → **Site settings** → **Environment variables**
2. Thêm biến môi trường:
   ```
   API_BASE_URL = https://growing-together-app.onrender.com/api
   ```

### Bước 2: Redeploy ứng dụng

1. Commit và push code mới
2. Netlify sẽ tự động rebuild với biến môi trường mới

### Bước 3: Kiểm tra logs

1. Vào **Netlify Dashboard** → **Deploys** → **Latest deploy** → **Functions logs**
2. Tìm log có chứa "Using API_BASE_URL from env" hoặc "Using fallback API URL"

## 🧪 Test kết nối

### Chạy script test local:

```bash
node scripts/test-api-connection.js
```

### Test trực tiếp API:

```bash
curl -X POST https://growing-together-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

## 🔧 Troubleshooting

### Nếu vẫn lỗi:

1. **Kiểm tra CORS trên backend**

   ```javascript
   // Backend cần cho phép Netlify domain
   app.use(
     cors({
       origin: ["https://your-app.netlify.app", "http://localhost:3000"],
     })
   );
   ```

2. **Kiểm tra biến môi trường trong build**

   - Vào **Netlify Dashboard** → **Deploys** → **Build logs**
   - Tìm log "Using API_BASE_URL from env"

3. **Test API endpoint trực tiếp**
   ```bash
   curl https://growing-together-app.onrender.com/api/users
   ```

### Debug trong browser:

1. Mở **Developer Tools** → **Console**
2. Tìm log từ `apiService.ts`
3. Kiểm tra Network tab để xem API calls

## 📋 Checklist

- [x] Cập nhật `netlify.toml` với `API_BASE_URL`
- [x] Cải thiện `apiService.ts` với fallback URL
- [x] Test kết nối API thành công
- [x] Tạo script test kết nối
- [ ] Cấu hình biến môi trường trong Netlify Dashboard
- [ ] Redeploy ứng dụng
- [ ] Test login flow trên production

## 🎯 Kết quả mong đợi

Sau khi áp dụng các fix:

- ✅ Login không còn lỗi "API Error"
- ✅ API calls hoạt động bình thường
- ✅ Ứng dụng có thể kết nối với backend Render
- ✅ Logs hiển thị đúng URL được sử dụng

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề:

1. Kiểm tra logs trong Netlify Dashboard
2. Chạy script test kết nối
3. Kiểm tra CORS configuration trên backend
4. Verify biến môi trường trong Netlify

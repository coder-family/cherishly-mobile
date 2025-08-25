# 🚀 Quick Fix: Netlify API Error

## Vấn đề

❌ "Unexpected login error: API Error" trên Netlify

## Nguyên nhân

- File `.env` local dùng URL local (`http://192.168.1.3:3001/api`)
- Netlify không thể truy cập IP local

## ✅ Fix ngay lập tức

### 1. Vào Netlify Dashboard

- **Site settings** → **Environment variables**
- Thêm: `API_BASE_URL = https://growing-together-app.onrender.com/api`

### 2. Redeploy

- Commit & push code
- Netlify tự động rebuild

### 3. Test

```bash
npm run test-api
```

## 🎯 Kết quả

✅ Login hoạt động bình thường trên Netlify

---

📖 Chi tiết: [NETLIFY_DEPLOYMENT_FIX.md](./NETLIFY_DEPLOYMENT_FIX.md)

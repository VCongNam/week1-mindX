# 🔐 Authentication Implementation Guide

## ✅ ĐÃ TẠO XONG

### Frontend Files
- ✅ `webapp/src/contexts/AuthContext.jsx` - Authentication context
- ✅ `webapp/src/components/Callback.jsx` - OAuth callback handler
- ✅ `webapp/src/components/ProtectedRoute.jsx` - Protected route wrapper
- ✅ `webapp/src/pages/Login.jsx` - Login page
- ✅ `webapp/src/pages/Dashboard.jsx` - Protected dashboard
- ✅ `webapp/src/pages/Home.jsx` - Home page with auth
- ✅ `webapp/src/App.jsx` - Router setup
- ✅ `webapp/.env.local` - Local environment variables

### Backend Files
- ✅ `api/src/index.js` - Updated với authentication endpoints
- ✅ `api/.env.local` - Local environment variables

---

## 🚀 TEST LOCAL

### Bước 1: Cài đặt dependencies

**Frontend:**
```powershell
cd webapp
npm install react-router-dom jwt-decode axios
```

**Backend:**
```powershell
cd api
npm install jsonwebtoken jwks-rsa axios dotenv
```

---

### Bước 2: Start Backend

```powershell
cd api
npm start
```

**Phải thấy:**
```
Server is running on port 3000
OpenID Configuration:
- Provider: https://id-dev.mindx.edu.vn
- Client ID: mindx-onboarding
- Redirect URI: http://localhost:5173/callback
```

---

### Bước 3: Start Frontend

**Terminal mới:**
```powershell
cd webapp
npm run dev
```

**Mở browser:** http://localhost:5173/

---

### Bước 4: Test Authentication Flow

1. **Click "Login" button**
2. **Redirect tới** https://id-dev.mindx.edu.vn
3. **Login với tài khoản** mentor cung cấp
4. **Redirect về** http://localhost:5173/callback
5. **Xem user info** hiển thị ở header
6. **Click vào avatar** → Dropdown menu
7. **Click "Dashboard"** → Xem protected page
8. **Click "Logout"** → Logout thành công

---

## 🧪 TEST ENDPOINTS

### Public Endpoints
```powershell
# Health check
curl http://localhost:3000/api/health

# Hello
curl http://localhost:3000/api/hello
```

### Protected Endpoints (cần token)
```powershell
# Get user info (thay <TOKEN>)
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/auth/me

# Protected endpoint
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/protected
```

---

## 📝 AUTHENTICATION FLOW

```
1. User clicks "Login"
   ↓
2. Redirect to https://id-dev.mindx.edu.vn/auth
   ↓
3. User enters credentials
   ↓
4. Redirect to http://localhost:5173/callback?code=xxx
   ↓
5. Frontend sends code to backend /api/auth/callback
   ↓
6. Backend exchanges code for tokens
   ↓
7. Backend returns JWT token + user info
   ↓
8. Frontend stores token in localStorage
   ↓
9. Frontend includes token in API requests
   ↓
10. Backend validates token
```

---

## 🔧 TROUBLESHOOTING

### Lỗi: "redirect_uri_mismatch"
**Giải pháp:** Kiểm tra REDIRECT_URI trong .env.local phải match với registered URI

### Lỗi: "invalid_client"
**Giải pháp:** Kiểm tra CLIENT_ID và CLIENT_SECRET đúng chưa

### Lỗi: "CORS"
**Giải pháp:** Backend đã config CORS cho localhost:5173

### Lỗi: "Token expired"
**Giải pháp:** Logout và login lại

---

## 🚀 DEPLOY LÊN AKS

Sau khi test local OK, làm theo các bước:

### 1. Update .env.production

**Frontend (`webapp/.env.production`):**
```
VITE_API_URL=/api
VITE_OIDC_CLIENT_ID=mindx-onboarding
VITE_OIDC_REDIRECT_URI=http://4.190.61.4/callback
```

**Backend:** Dùng Kubernetes secrets

### 2. Rebuild và Deploy

```powershell
# Frontend
cd webapp
npm run build
docker build -t mindx-webapp:latest .
docker tag mindx-webapp:latest mindxacrnamvc.azurecr.io/mindx-webapp:latest
docker push mindxacrnamvc.azurecr.io/mindx-webapp:latest

# Backend
cd api
docker build -t mindx-api:latest .
docker tag mindx-api:latest mindxacrnamvc.azurecr.io/mindx-api:latest
docker push mindxacrnamvc.azurecr.io/mindx-api:latest

# Restart deployments
kubectl delete pods -l app=mindx-webapp
kubectl delete pods -l app=mindx-api
```

### 3. Test Production

```
http://4.190.61.4/
```

---

## ✅ CHECKLIST

- [ ] Dependencies đã cài đặt
- [ ] Backend chạy ở port 3000
- [ ] Frontend chạy ở port 5173
- [ ] Click Login redirect đúng
- [ ] Login thành công
- [ ] User info hiển thị
- [ ] Dashboard accessible
- [ ] Logout hoạt động
- [ ] Protected endpoints work với token

---

🎉 **Authentication đã hoàn thành!**

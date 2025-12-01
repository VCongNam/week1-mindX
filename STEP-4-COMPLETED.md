# ✅ BƯỚC 4 ĐÃ HOÀN THÀNH - Deploy React Web App lên AKS

**Ngày hoàn thành**: 29/11/2024  
**Người thực hiện**: NamVC  
**Thời gian**: Week 1 - MindX Engineer Onboarding

---

## 🎯 Mục tiêu đã đạt được

Tạo React frontend application, containerize với nginx, deploy lên AKS, và configure Ingress với path-based routing để có full-stack application hoàn chỉnh.

---

## 📝 CÁC BƯỚC ĐÃ THỰC HIỆN

### **Bước 1: Tạo React Application**
- ✅ Tạo React app với Vite
- ✅ Sửa `App.jsx` để fetch data từ API
- ✅ Tạo UI với 4 cards: Health Status, API Response, Error, Information
- ✅ Configure API URL với environment variables
- ✅ Setup Vite proxy cho development
- ✅ Test React app với API local thành công

### **Bước 2: Containerize React App**
- ✅ Build React app cho production (`npm run build`)
- ✅ Tạo `nginx.conf` để serve static files
- ✅ Tạo Dockerfile với multi-stage build
- ✅ Tạo `.dockerignore`
- ✅ Build Docker image thành công
- ✅ Test container locally

### **Bước 3: Push Image lên ACR**
- ✅ Login vào Azure Container Registry
- ✅ Tag image cho ACR
- ✅ Push image lên ACR
- ✅ Verify image trong ACR

### **Bước 4: Tạo Kubernetes Manifests**
- ✅ Tạo `webapp-deployment.yaml` với 2 replicas
- ✅ Tạo `webapp-service.yaml` với ClusterIP
- ✅ Configure imagePullSecrets cho ACR

### **Bước 5: Deploy lên AKS**
- ✅ Apply Deployment
- ✅ Apply Service
- ✅ Verify Pods running
- ✅ Verify Service created

### **Bước 6: Update Ingress**
- ✅ Backup Ingress hiện tại
- ✅ Update Ingress với path-based routing
- ✅ Apply updated Ingress
- ✅ Verify routing rules

### **Bước 7: Test Full-Stack Application**
- ✅ Test Frontend qua External IP
- ✅ Test Backend API qua External IP
- ✅ Test Frontend call Backend
- ✅ Verify không có CORS errors

---

## 🏗️ KIẾN TRÚC ĐÃ XÂY DỰNG

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                      │
│                                                                             │
│                         Users (Browser, Mobile, etc.)                       │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTP
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AZURE CLOUD                                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              Azure Load Balancer (External IP)                       │  │
│  │              http://20.123.45.67                                     │  │
│  └───────────────────────────────┬───────────────────────────────────────┘  │
│                                  │                                          │
│  ┌───────────────────────────────▼───────────────────────────────────────┐  │
│  │         Azure Kubernetes Service (AKS) - Japan East                  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Ingress Controller (nginx-ingress)                 │  │  │
│  │  │                                                                 │  │  │
│  │  │  Path-based Routing:                                           │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │  /api/*  →  API Service (Backend)                       │   │  │  │
│  │  │  │  /       →  React Service (Frontend)                    │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                    │                              │                    │  │
│  │                    │                              │                    │  │
│  │         ┌──────────▼──────────┐      ┌───────────▼──────────┐         │  │
│  │         │  API Service        │      │  React Service       │         │  │
│  │         │  (ClusterIP)        │      │  (ClusterIP)         │         │  │
│  │         │  Port: 80→3000      │      │  Port: 80→80         │         │  │
│  │         └──────────┬──────────┘      └───────────┬──────────┘         │  │
│  │                    │                              │                    │  │
│  │         ┌──────────▼──────────┐      ┌───────────▼──────────┐         │  │
│  │         │  API Deployment     │      │  React Deployment    │         │  │
│  │         │  Replicas: 2        │      │  Replicas: 2         │         │  │
│  │         │                     │      │                      │         │  │
│  │         │  ┌────────────────┐ │      │  ┌────────────────┐ │         │  │
│  │         │  │ Pod 1          │ │      │  │ Pod 1          │ │         │  │
│  │         │  │ Node.js + API  │ │      │  │ nginx + React  │ │         │  │
│  │         │  │ Port: 3000     │ │      │  │ Port: 80       │ │         │  │
│  │         │  └────────────────┘ │      │  └────────────────┘ │         │  │
│  │         │                     │      │                      │         │  │
│  │         │  ┌────────────────┐ │      │  ┌────────────────┐ │         │  │
│  │         │  │ Pod 2          │ │      │  │ Pod 2          │ │         │  │
│  │         │  │ Node.js + API  │ │      │  │ nginx + React  │ │         │  │
│  │         │  │ Port: 3000     │ │      │  │ Port: 80       │ │         │  │
│  │         │  └────────────────┘ │      │  └────────────────┘ │         │  │
│  │         └─────────────────────┘      └──────────────────────┘         │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Kubernetes Secrets                                 │  │  │
│  │  │              acr-secret (ACR credentials)                       │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    ▲                                        │
│                                    │ docker pull                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              Azure Container Registry (ACR)                          │  │
│  │              mindxacrnamvc.azurecr.io                                │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐         ┌─────────────────┐                    │  │
│  │  │ mindx-api       │         │ mindx-webapp    │                    │  │
│  │  │ :latest         │         │ :latest         │                    │  │
│  │  └─────────────────┘         └─────────────────┘                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 AZURE & KUBERNETES RESOURCES

### Azure Resources
| Resource Type | Name | Location | Status | Details |
|--------------|------|----------|--------|---------|
| AKS Cluster | `mindx-aks-cluster` | Japan East | Running | 1 node, v1.32.9 |
| Container Registry | `mindxacrnamvc` | Southeast Asia | Active | 2 images |
| Load Balancer | Auto-created | Japan East | Active | External IP assigned |

### Kubernetes Resources
| Resource Type | Name | Namespace | Replicas | Status |
|--------------|------|-----------|----------|--------|
| Deployment | `mindx-api` | default | 2/2 | Running |
| Deployment | `mindx-webapp` | default | 2/2 | Running |
| Service | `mindx-api-service` | default | ClusterIP | Active |
| Service | `mindx-webapp-service` | default | ClusterIP | Active |
| Ingress | `mindx-api-ingress` | default | nginx | Configured |
| Secret | `acr-secret` | default | - | Active |

### Container Images in ACR
| Image Name | Tag | Size | Purpose |
|-----------|-----|------|---------|
| `mindx-api` | latest | ~150MB | Backend API (Node.js) |
| `mindx-webapp` | latest | ~50MB | Frontend (React + nginx) |

---

## 📁 PROJECT STRUCTURE (Updated)

```
week1-mindX/
├── api/
│   ├── src/
│   │   └── index.js              # API server (updated với /api/health)
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── webapp/                        # ← NEW: React application
│   ├── src/
│   │   ├── App.jsx               # ← Main React component
│   │   ├── App.css               # ← Styling
│   │   └── main.jsx
│   ├── dist/                     # ← Build output
│   ├── nginx.conf                # ← nginx configuration
│   ├── Dockerfile                # ← Multi-stage Dockerfile
│   ├── .dockerignore
│   ├── .env
│   ├── package.json
│   └── vite.config.js            # ← Vite config với proxy
├── k8s/
│   ├── deployment.yaml           # API deployment
│   ├── service.yaml              # API service
│   ├── webapp-deployment.yaml    # ← NEW: React deployment
│   ├── webapp-service.yaml       # ← NEW: React service
│   ├── ingress.yaml              # ← UPDATED: Path-based routing
│   └── ingress-backup.yaml       # Backup
├── week-1/
│   ├── overview.md
│   ├── tasks.md
│   └── architecture.md
├── .gitignore
├── README.md
├── STEP-1-COMPLETED.md
├── STEP-2-COMPLETED.md
├── STEP-3-GUIDE.md
└── STEP-4-COMPLETED.md          # This file
```

---

## 🌐 ENDPOINTS & URLS

### Public URLs (via External IP)

**External IP**: `http://20.123.45.67` (thay bằng IP của bạn)

| Endpoint | URL | Purpose | Response |
|----------|-----|---------|----------|
| Frontend | `http://20.123.45.67/` | React Web App | HTML page |
| API Hello | `http://20.123.45.67/api/hello` | API endpoint | JSON |
| API Health | `http://20.123.45.67/api/health` | Health check | JSON |

### Test Commands
```powershell
# Get External IP
kubectl get ingress

# Test Frontend
curl http://20.123.45.67/

# Test Backend
curl http://20.123.45.67/api/hello
curl http://20.123.45.67/api/health
```

---

## 🎓 KIẾN THỨC ĐÃ HỌC

### 1. **React Development**
- Tạo React app với Vite (modern build tool)
- React Hooks: `useState`, `useEffect`
- Fetch API để call backend
- Environment variables với Vite (`VITE_*`)
- Vite dev server với proxy configuration
- Production build optimization

### 2. **Frontend-Backend Integration**
- API calls từ React
- CORS handling
- Error handling và loading states
- Environment-based configuration
- Proxy setup cho development

### 3. **nginx Configuration**
- Serve static files
- React Router support (`try_files`)
- Gzip compression
- Cache headers cho static assets
- Health check endpoint

### 4. **Docker Multi-Stage Build**
- Build stage: Node.js để build React
- Production stage: nginx để serve
- Optimize image size (50MB vs 150MB+)
- Copy artifacts giữa stages
- Health checks trong Docker

### 5. **Kubernetes Full-Stack Deployment**
- Deploy multiple applications trong cùng cluster
- Service-to-service communication
- Resource management cho frontend vs backend
- imagePullSecrets cho private registry

### 6. **Ingress Path-Based Routing**
- Route traffic dựa trên URL path
- Path order matters (`/api` trước `/`)
- Multiple backends trong cùng Ingress
- Rewrite rules và annotations

### 7. **Full-Stack Architecture**
- Frontend (React + nginx) serve static files
- Backend (Node.js) handle API logic
- Ingress làm reverse proxy
- Load balancing cho cả frontend và backend
- Separation of concerns

---

## 💻 KEY COMMANDS USED

### React Development
```powershell
# Create React app
npm create vite@latest webapp -- --template react

# Install dependencies
cd webapp
npm install

# Development
npm run dev

# Production build
npm run build
```

### Docker Commands
```powershell
# Build image
docker build -t mindx-webapp:latest .

# Test locally
docker run -d -p 8080:80 --name mindx-webapp-test mindx-webapp:latest

# Tag for ACR
docker tag mindx-webapp:latest mindxacrnamvc.azurecr.io/mindx-webapp:latest

# Push to ACR
docker push mindxacrnamvc.azurecr.io/mindx-webapp:latest

# Cleanup
docker stop mindx-webapp-test
docker rm mindx-webapp-test
```

### Kubernetes Commands
```powershell
# Deploy React app
kubectl apply -f k8s/webapp-deployment.yaml
kubectl apply -f k8s/webapp-service.yaml

# Update Ingress
kubectl apply -f k8s/ingress.yaml

# Verify
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress

# Describe
kubectl describe ingress mindx-api-ingress

# Logs
kubectl logs -l app=mindx-webapp
kubectl logs -l app=mindx-api

# Restart
kubectl rollout restart deployment mindx-webapp
kubectl rollout restart deployment mindx-api
```

### Azure CLI Commands
```powershell
# ACR
az acr login --name mindxacrnamvc
az acr repository list --name mindxacrnamvc --output table
```

---

## 🧪 TESTING & VERIFICATION

### Local Testing (Development)
```powershell
# Terminal 1: API
cd api
npm start

# Terminal 2: React
cd webapp
npm run dev

# Browser: http://localhost:5173/
```

### Docker Testing (Local)
```powershell
# Build and run
docker build -t mindx-webapp:latest .
docker run -d -p 8080:80 --name test mindx-webapp:latest

# Test
curl http://localhost:8080/
curl http://localhost:8080/health

# Cleanup
docker stop test && docker rm test
```

### Production Testing (AKS)
```powershell
# Get External IP
kubectl get ingress

# Test Frontend
curl http://<EXTERNAL-IP>/

# Test Backend
curl http://<EXTERNAL-IP>/api/hello
curl http://<EXTERNAL-IP>/api/health

# Browser test
# Open: http://<EXTERNAL-IP>/
```

---

## ✅ ACCEPTANCE CRITERIA - STEP 4

- ✅ React application created và functional
- ✅ React app call API successfully local
- ✅ Dockerfile created với multi-stage build
- ✅ Docker image built và tested locally
- ✅ Image pushed to ACR
- ✅ Kubernetes manifests created (Deployment + Service)
- ✅ React app deployed to AKS
- ✅ Pods running (STATUS = "Running")
- ✅ Ingress updated với path-based routing
- ✅ Frontend accessible via `/`
- ✅ Backend accessible via `/api/*`
- ✅ Frontend-Backend communication working
- ✅ No CORS errors
- ✅ Load balancing working for both services

---

## 🔧 TROUBLESHOOTING NOTES

### Issues Encountered

#### 1. **API endpoint `/api/health` not found (404)**
**Problem**: React app gọi `/api/health` nhưng API chỉ có `/health`

**Solution**: 
- Thêm endpoint `/api/health` vào API code
- Rebuild và redeploy API
```powershell
cd api
docker build -t mindx-api:latest .
docker tag mindx-api:latest mindxacrnamvc.azurecr.io/mindx-api:latest
docker push mindxacrnamvc.azurecr.io/mindx-api:latest
kubectl rollout restart deployment mindx-api
```

---

#### 2. **Docker Desktop not running**
**Problem**: `error during connect: open //./pipe/dockerDesktopLinuxEngine`

**Solution**: 
- Mở Docker Desktop
- Đợi icon màu xanh
- Verify: `docker info`

---

#### 3. **Ingress routing order**
**Problem**: Path `/` match tất cả requests, `/api` không hoạt động

**Solution**: 
- Path `/api` phải đứng TRƯỚC path `/` trong Ingress manifest
- Order matters trong Kubernetes Ingress!

---

#### 4. **CORS errors**
**Problem**: Frontend không call được Backend do CORS

**Solution**: 
- API đã có `app.use(cors())` → OK
- Cả Frontend và Backend dùng cùng domain (External IP) → No CORS issues

---

### Useful Debug Commands
```powershell
# Check all resources
kubectl get all

# Check Ingress routing
kubectl describe ingress mindx-api-ingress

# Check endpoints
kubectl get endpoints mindx-api-service
kubectl get endpoints mindx-webapp-service

# Test from inside cluster
kubectl run test --image=curlimages/curl -it --rm -- curl http://mindx-api-service/api/health

# View logs
kubectl logs -l app=mindx-webapp --tail=50
kubectl logs -l app=mindx-api --tail=50

# Restart deployments
kubectl rollout restart deployment mindx-webapp
kubectl rollout restart deployment mindx-api
```

---

## 📈 METRICS & PERFORMANCE

- **React Build Time**: ~3-5 giây
- **Docker Build Time**: ~3-5 phút (lần đầu)
- **Image Push Time**: ~2-3 phút
- **Pod Startup Time**: ~30 giây - 1 phút
- **Frontend Image Size**: ~50MB (nginx Alpine + static files)
- **Backend Image Size**: ~150MB (Node.js Alpine)
- **Frontend Response Time**: <50ms (static files)
- **Backend Response Time**: <100ms (API calls)

---

## 💡 LESSONS LEARNED

### 1. **Vite vs Create React App**
- Vite nhanh hơn nhiều (build trong giây, không phải phút)
- Dev server start nhanh
- Hot Module Replacement (HMR) tốt hơn

### 2. **Multi-Stage Docker Build**
- Giảm image size đáng kể
- Separate build và runtime environments
- Security: Production image không chứa build tools

### 3. **nginx cho React**
- Cần config `try_files` cho React Router
- Gzip compression quan trọng
- Cache headers cho performance

### 4. **Ingress Path Routing**
- Order matters! Specific paths trước, generic paths sau
- `/api` phải trước `/`
- Test routing với `kubectl describe ingress`

### 5. **Environment Variables**
- Vite dùng `VITE_*` prefix
- Build time vs runtime variables
- Proxy cho development, direct calls cho production

### 6. **Full-Stack Deployment**
- Frontend và Backend có resource requirements khác nhau
- Frontend: Ít CPU/RAM (static files)
- Backend: Nhiều CPU/RAM hơn (processing)

### 7. **Debugging in Kubernetes**
- Logs quan trọng: `kubectl logs`
- Describe cho events: `kubectl describe`
- Test từ trong cluster: `kubectl run test`
- Port-forward cho local testing

---

## 🚀 NEXT STEPS - BƯỚC 5

### Objectives
- Implement Authentication (OpenID hoặc custom)
- Protected routes trong React
- JWT token management
- Login/Logout functionality

### Prerequisites
- ✅ Completed Step 4
- ✅ Full-stack application running
- ✅ Frontend và Backend communicate successfully

### What to Learn
- Authentication flows
- JWT tokens
- Protected routes
- Session management
- OpenID Connect (optional)

---

## 📚 REFERENCES

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## 📝 NOTES

- React app dùng Vite (modern, fast)
- nginx serve static files (production)
- Path-based routing: `/api` → Backend, `/` → Frontend
- Cả 2 apps dùng cùng External IP (no CORS issues)
- Multi-stage build giảm image size
- Health checks cho cả Frontend và Backend

---

**Status**: ✅ COMPLETED  
**Date**: 29/11/2024  
**Duration**: ~2-3 giờ (bao gồm troubleshooting)

---

🎉 **Chúc mừng đã hoàn thành Bước 4!**

**Full-stack application đã chạy trên Azure Kubernetes Service!**
- Frontend: React + nginx
- Backend: Node.js + Express
- Infrastructure: AKS + Ingress + Load Balancer
- All accessible via single External IP! 🚀

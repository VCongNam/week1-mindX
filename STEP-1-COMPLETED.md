# ✅ BƯỚC 1 ĐÃ HOÀN THÀNH - Deploy API lên Azure

**Ngày hoàn thành**: 27/11/2024  
**Người thực hiện**: NamVC  
**Thời gian**: Week 1 - MindX Engineer Onboarding

---

## 🎯 Mục tiêu đã đạt được

Tạo một REST API đơn giản với Node.js, đóng gói thành Docker container, push lên Azure Container Registry, và deploy lên Azure Web App với HTTPS.

---

## 📝 CÁC BƯỚC ĐÃ THỰC HIỆN

### **Bước 1: Chuẩn bị môi trường**
- ✅ Cài đặt Node.js, Docker Desktop, Azure CLI, Git
- ✅ Login Azure: `az login`
- ✅ Kiểm tra Resource Group có sẵn: `mindx-namvc-rg`

### **Bước 2: Tạo API với Node.js**
- ✅ Tạo Express API với JavaScript
- ✅ Endpoints: `/health`, `/api/hello`, `/`
- ✅ Test local thành công

### **Bước 3: Containerize với Docker**
- ✅ Tạo `Dockerfile`
- ✅ Build image: `docker build -t mindx-api:latest .`
- ✅ Test container local thành công

### **Bước 4: Push lên Azure Container Registry**
- ✅ Tạo ACR: `mindxacrnamvc`
- ✅ Login ACR
- ✅ Tag và push image
- ✅ Verify image trong ACR

### **Bước 5: Deploy lên Azure Web App**
- ✅ Tạo App Service Plan: `mindx-plan` (B1, Linux)
- ✅ Tạo Web App: `mindx-api-namvc`
- ✅ Configure ACR credentials
- ✅ Deploy container thành công

### **Bước 6: Verify & Test**
- ✅ API accessible qua HTTPS
- ✅ Tất cả endpoints hoạt động
- ✅ Logs hiển thị đúng

---

## 🏗️ KIẾN TRÚC ĐÃ XÂY DỰNG

```
┌─────────────────────────────────────────────────────────────┐
│                   LOCAL DEVELOPMENT                         │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │  Source Code │ ──────> │ Docker Image │                 │
│  │  (Node.js)   │  build  │ mindx-api    │                 │
│  └──────────────┘         └──────────────┘                 │
│                                  │                          │
└──────────────────────────────────┼──────────────────────────┘
                                   │ docker push
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      AZURE CLOUD                            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     Azure Container Registry (ACR)                   │  │
│  │     mindxacrnamvc.azurecr.io                         │  │
│  │                                                       │  │
│  │     Repository: mindx-api:latest                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │ docker pull                      │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     Azure Web App (App Service)                      │  │
│  │     mindx-api-namvc.azurewebsites.net                │  │
│  │                                                       │  │
│  │     ┌─────────────────────────────────┐              │  │
│  │     │  Container: mindx-api:latest    │              │  │
│  │     │  Port: 3000                     │              │  │
│  │     │  Status: Running                │              │  │
│  │     └─────────────────────────────────┘              │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS
                           ▼
                    ┌──────────────┐
                    │ Internet     │
                    │ Users        │
                    └──────────────┘
```

---

## 📊 AZURE RESOURCES ĐÃ TẠO

| Resource Type | Name | Location | Status |
|--------------|------|----------|--------|
| Resource Group | `mindx-namvc-rg` | Southeast Asia | Existing |
| Container Registry | `mindxacrnamvc` | Southeast Asia | Created |
| App Service Plan | `mindx-plan` | Southeast Asia | Created |
| Web App | `mindx-api-namvc` | Southeast Asia | Running |

---

## 🌐 ENDPOINTS

### Production URLs (HTTPS)
- **Base URL**: https://mindx-api-namvc.azurewebsites.net
- **Health Check**: https://mindx-api-namvc.azurewebsites.net/health
- **API Hello**: https://mindx-api-namvc.azurewebsites.net/api/hello

### Test Commands
```powershell
# Health check
curl https://mindx-api-namvc.azurewebsites.net/health

# API endpoint
curl https://mindx-api-namvc.azurewebsites.net/api/hello

# Root endpoint
curl https://mindx-api-namvc.azurewebsites.net/
```

---

## 📁 PROJECT STRUCTURE

```
week1-mindX/
├── api/
│   ├── src/
│   │   └── index.js              # Main API server (JavaScript)
│   ├── Dockerfile                # Docker configuration
│   ├── .dockerignore            # Docker ignore rules
│   ├── package.json             # Node.js dependencies
│   └── README.md                # API documentation
├── week-1/                      # Week 1 requirements
│   ├── overview.md
│   ├── tasks.md
│   └── architecture.md
├── .gitignore                   # Git ignore rules
├── README.md                    # Project overview
├── STEP-1-GUIDE.md             # Detailed guide
├── QUICK-REFERENCE.md          # Command reference
├── PROGRESS.md                 # Progress tracker
└── STEP-1-COMPLETED.md         # This file
```

---

## 🎓 KIẾN THỨC ĐÃ HỌC

### 1. **Node.js & Express**
- REST API development
- Middleware và routing
- JSON responses
- Health check patterns

### 2. **Docker**
- Dockerfile syntax
- Build và run containers
- Image tagging
- Port mapping
- Container logs

### 3. **Azure Services**
- Resource Groups
- Azure Container Registry (ACR)
- App Service Plan
- Azure Web App
- Azure CLI

### 4. **DevOps Practices**
- Containerization workflow
- Container registry management
- Cloud deployment
- Logging và monitoring
- Infrastructure as Code

### 5. **Security**
- ACR authentication
- HTTPS by default
- Credential management
- `.gitignore` best practices

---

## 💻 KEY COMMANDS USED

### Docker Commands
```powershell
docker build -t mindx-api:latest .
docker run -d -p 3000:3000 --name mindx-api-test mindx-api:latest
docker logs mindx-api-test
docker stop mindx-api-test
docker rm mindx-api-test
docker tag mindx-api:latest mindxacrnamvc.azurecr.io/mindx-api:latest
docker push mindxacrnamvc.azurecr.io/mindx-api:latest
```

### Azure CLI Commands
```powershell
# Login
az login

# Resource Group
az group list --output table

# ACR
az acr create --resource-group mindx-namvc-rg --name mindxacrnamvc --sku Basic
az acr login --name mindxacrnamvc
az acr repository list --name mindxacrnamvc --output table

# App Service
az appservice plan create --name mindx-plan --resource-group mindx-namvc-rg --is-linux --sku B1 --location southeastasia
az webapp create --resource-group mindx-namvc-rg --plan mindx-plan --name mindx-api-namvc --deployment-container-image-name mindxacrnamvc.azurecr.io/mindx-api:latest

# Configuration
az acr update -n mindxacrnamvc --admin-enabled true
az acr credential show --name mindxacrnamvc
az webapp config appsettings set --resource-group mindx-namvc-rg --name mindx-api-namvc --settings DOCKER_REGISTRY_SERVER_URL=https://mindxacrnamvc.azurecr.io DOCKER_REGISTRY_SERVER_USERNAME=mindxacrnamvc DOCKER_REGISTRY_SERVER_PASSWORD=<password>
az webapp restart --name mindx-api-namvc --resource-group mindx-namvc-rg

# Monitoring
az webapp log tail --name mindx-api-namvc --resource-group mindx-namvc-rg
```

---

## ✅ ACCEPTANCE CRITERIA - STEP 1

- ✅ Backend API deployed và accessible via public HTTPS endpoint
- ✅ Container image stored trong Azure Container Registry
- ✅ API responds correctly to all endpoints
- ✅ HTTPS enforced (Azure Web App default)
- ✅ Logs available for monitoring
- ✅ Source code committed với proper `.gitignore`
- ✅ Documentation provided

---

## 🔧 TROUBLESHOOTING NOTES

### Issues Encountered
1. **Permission Error**: Không có quyền tạo Resource Group mới
   - **Solution**: Sử dụng Resource Group có sẵn `mindx-namvc-rg`

2. **ACR Name Conflict**: Tên ACR có thể bị trùng
   - **Solution**: Thêm suffix unique (ví dụ: `mindxacrnamvc`)

### Useful Debug Commands
```powershell
# Check Azure login
az account show

# View Web App logs
az webapp log tail --name mindx-api-namvc --resource-group mindx-namvc-rg

# Check container status
az webapp show --name mindx-api-namvc --resource-group mindx-namvc-rg --query state

# Verify ACR image
az acr repository show-tags --name mindxacrnamvc --repository mindx-api --output table
```

---

## 📈 METRICS & PERFORMANCE

- **Build Time**: ~2 phút (Docker image)
- **Push Time**: ~1-3 phút (tùy tốc độ mạng)
- **Deployment Time**: ~3-5 phút (Web App pull và start)
- **API Response Time**: <100ms (health check)
- **Image Size**: ~150MB (Node.js Alpine)

---

## 💡 LESSONS LEARNED

1. **Docker containerization** giúp đảm bảo consistency giữa local và production
2. **Azure CLI** mạnh mẽ cho automation và scripting
3. **Logs quan trọng** để debug production issues
4. **Permissions matter** - cần đúng role để làm việc với Azure
5. **HTTPS tự động** từ Azure Web App rất tiện lợi
6. **Resource naming** phải unique globally cho ACR và Web App

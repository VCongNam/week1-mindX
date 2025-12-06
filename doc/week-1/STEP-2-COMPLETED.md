# ✅ BƯỚC 2 ĐÃ HOÀN THÀNH - Deploy API lên Azure Kubernetes Service (AKS)

**Ngày hoàn thành**: 27/11/2024  
**Người thực hiện**: NamVC  
**Thời gian**: Week 1 - MindX Engineer Onboarding

---

## 🎯 Mục tiêu đã đạt được

Deploy containerized API từ Bước 1 lên Azure Kubernetes Service (AKS), học về Kubernetes fundamentals, container orchestration, và quản lý applications trong Kubernetes cluster.

---

## 📝 CÁC BƯỚC ĐÃ THỰC HIỆN

### **Bước 1: Chuẩn bị môi trường Kubernetes**
- ✅ Cài đặt kubectl (Kubernetes CLI)
- ✅ Kiểm tra quyền và quota trên Azure
- ✅ Xử lý vấn đề vCPU quota (không đủ quota ở Southeast Asia)
- ✅ Chuyển sang region Japan East có quota

### **Bước 2: Tạo AKS Cluster**
- ✅ Tạo AKS cluster với 1 node (Standard_B2s)
- ✅ Xử lý lỗi attach ACR (thiếu quyền Owner)
- ✅ Tạo cluster không attach ACR, sẽ dùng Image Pull Secret
- ✅ Cluster tạo thành công ở region Japan East

### **Bước 3: Configure kubectl**
- ✅ Lấy credentials từ AKS cluster
- ✅ Configure kubectl để kết nối với cluster
- ✅ Verify kết nối: `kubectl cluster-info`
- ✅ Xem nodes: Node STATUS = "Ready"

### **Bước 4: Tạo Image Pull Secret**
- ✅ Lấy ACR credentials (username + password)
- ✅ Tạo Kubernetes secret `acr-secret`
- ✅ Verify secret đã tạo thành công

### **Bước 5: Tạo Kubernetes Manifests**
- ✅ Tạo folder `k8s/`
- ✅ Tạo `deployment.yaml` với:
  - 2 replicas
  - Resource limits
  - Health checks (liveness + readiness probes)
  - imagePullSecrets
- ✅ Tạo `service.yaml` với ClusterIP type

### **Bước 6: Deploy lên AKS**
- ✅ Apply Deployment: `kubectl apply -f k8s/deployment.yaml`
- ✅ Apply Service: `kubectl apply -f k8s/service.yaml`
- ✅ Verify Deployment: READY = 2/2
- ✅ Verify Pods: STATUS = "Running"
- ✅ Verify Service: ClusterIP assigned

### **Bước 7: Test API**
- ✅ Port forward: `kubectl port-forward service/mindx-api-service 8080:80`
- ✅ Test health endpoint: `/health`
- ✅ Test API endpoint: `/api/hello`
- ✅ Verify load balancing giữa 2 Pods

---

## 🏗️ KIẾN TRÚC ĐÃ XÂY DỰNG

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AZURE CLOUD                                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              Azure Container Registry (ACR)                          │  │
│  │              mindxacrnamvc.azurecr.io                                │  │
│  │                                                                       │  │
│  │              Repository: mindx-api:latest                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    │ docker pull (via secret)               │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │         Azure Kubernetes Service (AKS) - Japan East                  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Worker Node (Standard_B2s)                   │  │  │
│  │  │                    STATUS: Ready                                │  │  │
│  │  │                                                                 │  │  │
│  │  │  ┌──────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │           Deployment: mindx-api (replicas: 2)           │  │  │  │
│  │  │  │                                                          │  │  │  │
│  │  │  │  ┌────────────────────┐    ┌────────────────────┐      │  │  │  │
│  │  │  │  │   Pod 1            │    │   Pod 2            │      │  │  │  │
│  │  │  │  │   STATUS: Running  │    │   STATUS: Running  │      │  │  │  │
│  │  │  │  │                    │    │                    │      │  │  │  │
│  │  │  │  │  Container:        │    │  Container:        │      │  │  │  │
│  │  │  │  │  mindx-api:latest  │    │  mindx-api:latest  │      │  │  │  │
│  │  │  │  │  Port: 3000        │    │  Port: 3000        │      │  │  │  │
│  │  │  │  │  Health: OK        │    │  Health: OK        │      │  │  │  │
│  │  │  │  └────────────────────┘    └────────────────────┘      │  │  │  │
│  │  │  │                 │                     │                 │  │  │  │
│  │  │  └─────────────────┼─────────────────────┼─────────────────┘  │  │  │
│  │  │                    │                     │                    │  │  │
│  │  │                    └──────────┬──────────┘                    │  │  │
│  │  │                               │                               │  │  │
│  │  │                    ┌──────────▼──────────┐                    │  │  │
│  │  │                    │  Service (ClusterIP)│                    │  │  │
│  │  │                    │  mindx-api-service  │                    │  │  │
│  │  │                    │  Port: 80 → 3000    │                    │  │  │
│  │  │                    │  Load Balancing     │                    │  │  │
│  │  │                    └─────────────────────┘                    │  │  │
│  │  │                                                                │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Kubernetes Secrets                           │  │  │
│  │  │                    acr-secret (ACR credentials)                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ kubectl port-forward
                                     ▼
                              ┌──────────────┐
                              │ Local Machine│
                              │ localhost:8080│
                              └──────────────┘
```

---

## 📊 AZURE RESOURCES ĐÃ TẠO

| Resource Type | Name | Location | Status | Details |
|--------------|------|----------|--------|---------|
| AKS Cluster | `mindx-aks-cluster` | Japan East | Running | 1 node, v1.32.9 |
| Node Pool | `nodepool1` | Japan East | Ready | Standard_B2s |
| Worker Node | `aks-nodepool1-19541244-vmss000000` | Japan East | Ready | 2 vCPU, 4GB RAM |

---

## 🎮 KUBERNETES RESOURCES ĐÃ TẠO

| Resource Type | Name | Namespace | Details |
|--------------|------|-----------|---------|
| Deployment | `mindx-api` | default | 2 replicas |
| Pods | `mindx-api-xxxxx-xxxxx` | default | 2 pods running |
| Service | `mindx-api-service` | default | ClusterIP, Port 80→3000 |
| Secret | `acr-secret` | default | Docker registry credentials |

---

## 📁 PROJECT STRUCTURE (Updated)

```
week1-mindX/
├── api/
│   ├── src/
│   │   └── index.js              # Main API server (JavaScript)
│   ├── Dockerfile                # Docker configuration
│   ├── .dockerignore            # Docker ignore rules
│   ├── package.json             # Node.js dependencies
│   └── README.md                # API documentation
├── k8s/                         # ← NEW: Kubernetes manifests
│   ├── deployment.yaml          # ← Deployment configuration
│   └── service.yaml             # ← Service configuration
├── week-1/                      # Week 1 requirements
│   ├── overview.md
│   ├── tasks.md
│   └── architecture.md
├── .gitignore                   # Git ignore rules
├── README.md                    # Project overview
├── STEP-1-COMPLETED.md         # Step 1 summary
└── STEP-2-COMPLETED.md         # This file
```

---

## 🎓 KIẾN THỨC ĐÃ HỌC

### 1. **Kubernetes Fundamentals**

#### **Cluster Architecture**
- **Master Node**: Quản lý cluster (managed by Azure)
- **Worker Nodes**: Chạy applications (bạn quản lý)
- **Control Plane**: API Server, Scheduler, Controller Manager

#### **Core Concepts**
- **Pod**: Đơn vị nhỏ nhất, chứa 1+ containers
- **Deployment**: Quản lý Pods, auto-healing, scaling
- **Service**: Expose Pods, load balancing
- **Secret**: Lưu trữ sensitive data (credentials)
- **Namespace**: Phân chia resources trong cluster

### 2. **Azure Kubernetes Service (AKS)**
- Managed Kubernetes service
- Azure quản lý master nodes
- Tích hợp với ACR, Azure Monitor
- Auto-scaling, auto-upgrade
- RBAC và Azure AD integration

### 3. **kubectl Commands**
```powershell
# Cluster info
kubectl cluster-info
kubectl get nodes

# Deployments
kubectl get deployments
kubectl describe deployment <name>
kubectl scale deployment <name> --replicas=3

# Pods
kubectl get pods
kubectl describe pod <name>
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # Follow logs
kubectl exec -it <pod-name> -- sh

# Services
kubectl get services
kubectl describe service <name>

# Secrets
kubectl get secrets
kubectl create secret docker-registry <name> --docker-server=<server> --docker-username=<user> --docker-password=<pass>

# Apply manifests
kubectl apply -f <file.yaml>
kubectl delete -f <file.yaml>

# Port forwarding
kubectl port-forward service/<name> <local-port>:<service-port>

# Debugging
kubectl get events
kubectl get all
```

### 4. **Kubernetes YAML Manifests**

#### **Deployment Structure**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-name
spec:
  replicas: 2                    # Số Pods
  selector:
    matchLabels:
      app: app-name
  template:
    metadata:
      labels:
        app: app-name
    spec:
      containers:
      - name: container-name
        image: registry/image:tag
        ports:
        - containerPort: 3000
        resources:                # Resource limits
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:           # Health check
          httpGet:
            path: /health
            port: 3000
        readinessProbe:          # Ready check
          httpGet:
            path: /health
            port: 3000
      imagePullSecrets:          # ACR credentials
      - name: acr-secret
```

#### **Service Structure**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: service-name
spec:
  type: ClusterIP              # Internal only
  selector:
    app: app-name              # Route to Pods
  ports:
  - protocol: TCP
    port: 80                   # Service port
    targetPort: 3000           # Container port
```

### 5. **Container Orchestration**
- **Auto-healing**: Kubernetes tự động restart failed Pods
- **Load balancing**: Service phân phối traffic đều giữa Pods
- **Scaling**: Dễ dàng scale up/down số Pods
- **Rolling updates**: Update không downtime
- **Self-healing**: Maintain desired state

### 6. **Image Pull Secrets**
- Kubernetes cần credentials để pull private images
- Tạo secret với ACR credentials
- Reference secret trong Deployment
- Alternative: Attach ACR to AKS (cần quyền Owner)

### 7. **Health Checks**
- **Liveness Probe**: Kiểm tra container còn sống không
- **Readiness Probe**: Kiểm tra container sẵn sàng nhận traffic
- **Startup Probe**: Kiểm tra container đã start xong chưa

### 8. **Resource Management**
- **Requests**: Minimum resources cần thiết
- **Limits**: Maximum resources được phép dùng
- Kubernetes scheduler dùng requests để quyết định Pod chạy ở node nào

---

## 💻 KEY COMMANDS USED

### Azure CLI Commands
```powershell
# AKS Cluster
az aks create --resource-group mindx-namvc-rg --name mindx-aks-cluster --node-count 1 --node-vm-size Standard_B2s --enable-managed-identity --generate-ssh-keys --location japaneast

az aks list --output table
az aks show --resource-group mindx-namvc-rg --name mindx-aks-cluster
az aks get-credentials --resource-group mindx-namvc-rg --name mindx-aks-cluster

# ACR
az acr credential show --name mindxacrnamvc

# Quota check
az vm list-usage --location japaneast --output table
```

### kubectl Commands
```powershell
# Cluster
kubectl cluster-info
kubectl get nodes
kubectl describe node <node-name>

# Secrets
kubectl create secret docker-registry acr-secret --docker-server=mindxacrnamvc.azurecr.io --docker-username=mindxacrnamvc --docker-password=<password> --docker-email=namvc@mindx.edu.vn
kubectl get secrets

# Deploy
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Verify
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get all

# Debug
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl logs -f <pod-name>

# Test
kubectl port-forward service/mindx-api-service 8080:80
```

---

## 🧪 TESTING & VERIFICATION

### Test Commands
```powershell
# Port forward (terminal 1)
kubectl port-forward service/mindx-api-service 8080:80

# Test API (terminal 2)
curl http://localhost:8080/health
curl http://localhost:8080/api/hello
curl http://localhost:8080/
```

### Expected Responses
```json
// /health
{"status":"healthy","timestamp":"2024-11-27T...","uptime":123.456}

// /api/hello
{"message":"Hello from MindX API!","version":"1.0.0","timestamp":"2024-11-27T..."}

// /
{"name":"MindX Onboarding API","version":"1.0.0","endpoints":[...]}
```

---

## ✅ ACCEPTANCE CRITERIA - STEP 2

- ✅ AKS cluster created và running
- ✅ kubectl configured và connected to cluster
- ✅ Node STATUS = "Ready"
- ✅ Image Pull Secret created
- ✅ Kubernetes manifests created (Deployment + Service)
- ✅ Deployment applied successfully
- ✅ Pods running (STATUS = "Running", READY = 1/1)
- ✅ Service created (ClusterIP assigned)
- ✅ API accessible via port-forward
- ✅ All endpoints responding correctly
- ✅ Load balancing working between Pods

---

## 🔧 TROUBLESHOOTING NOTES

### Issues Encountered

#### 1. **vCPU Quota Insufficient**
**Problem**: Không đủ vCPU quota ở Southeast Asia
```
Insufficient regional vcpu quota left for location southeastasia
```

**Solution**: Chuyển sang region Japan East có quota
```powershell
az aks create --location japaneast
```

---

#### 2. **Cannot Attach ACR - Permission Denied**
**Problem**: Thiếu quyền Owner để attach ACR
```
Could not create a role assignment for ACR. Are you an Owner on this subscription?
```

**Solution**: Dùng Image Pull Secret thay vì attach ACR
```powershell
kubectl create secret docker-registry acr-secret --docker-server=mindxacrnamvc.azurecr.io --docker-username=mindxacrnamvc --docker-password=<password>
```

---

#### 3. **Cluster Not Found**
**Problem**: Cluster bị xóa hoặc tạo thất bại
```
The Resource 'Microsoft.ContainerService/managedClusters/mindx-aks-cluster' was not found
```

**Solution**: 
- Xóa kubectl context cũ
- Tạo lại cluster
```powershell
kubectl config delete-context mindx-aks-cluster
az aks create ...
```

---

#### 4. **Node NotReady**
**Problem**: Node STATUS = "NotReady" sau khi tạo cluster

**Solution**: Đợi 5-10 phút để node khởi động hoàn tất
```powershell
kubectl get nodes --watch
```

---

#### 5. **ImagePullBackOff**
**Problem**: Pods không pull được image từ ACR
```
STATUS: ImagePullBackOff
```

**Solution**: 
- Verify secret exists: `kubectl get secrets`
- Check password đúng chưa
- Recreate secret với password đúng
- Restart deployment: `kubectl rollout restart deployment mindx-api`

---

### Useful Debug Commands
```powershell
# Check cluster status
az aks show --resource-group mindx-namvc-rg --name mindx-aks-cluster --query provisioningState

# Check node details
kubectl describe node <node-name>

# Check Pod details
kubectl describe pod <pod-name>

# View Pod logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>

# View events
kubectl get events --sort-by='.lastTimestamp'

# Check all resources
kubectl get all

# Port forward for testing
kubectl port-forward service/mindx-api-service 8080:80
```

---

## 📈 METRICS & PERFORMANCE

- **Cluster Creation Time**: ~5-10 phút
- **Node Ready Time**: ~5-10 phút sau khi cluster tạo xong
- **Image Pull Time**: ~1-2 phút (lần đầu)
- **Pod Startup Time**: ~30 giây - 1 phút
- **API Response Time**: <100ms (health check)
- **Pod Count**: 2 replicas
- **Resource Usage**: 
  - CPU Request: 100m per Pod
  - Memory Request: 128Mi per Pod
  - CPU Limit: 200m per Pod
  - Memory Limit: 256Mi per Pod

---

## 💡 LESSONS LEARNED

### 1. **Azure Quota Management**
- Luôn kiểm tra quota trước khi tạo resources
- Các regions khác nhau có quota khác nhau
- Có thể request tăng quota từ Sys Admin

### 2. **Kubernetes Permissions**
- Attach ACR cần quyền Owner
- Image Pull Secret là alternative không cần quyền cao
- RBAC quan trọng trong production

### 3. **Cluster Lifecycle**
- Node cần thời gian để ready (5-10 phút)
- Pods cần thời gian để pull image và start
- Health checks đảm bảo Pods ready trước khi nhận traffic

### 4. **Debugging Skills**
- `kubectl describe` cho thông tin chi tiết
- `kubectl logs` cho application logs
- `kubectl get events` cho cluster events
- Port-forward hữu ích cho testing internal services

### 5. **Kubernetes Best Practices**
- Luôn set resource requests và limits
- Dùng health checks (liveness + readiness)
- Dùng labels để organize resources
- Dùng secrets cho sensitive data
- Multiple replicas cho high availability

---

## 🚀 NEXT STEPS - BƯỚC 3

### Objectives
- Setup Ingress Controller để expose API ra internet
- Không cần port-forward nữa
- Public access với external IP
- Path-based routing

### Prerequisites
- ✅ Completed Step 2
- ✅ AKS cluster running
- ✅ API deployed và accessible via port-forward

### What to Learn
- Ingress Controllers (nginx-ingress)
- Load Balancers
- External IP allocation
- Path-based routing
- DNS configuration

---

## 📚 REFERENCES

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Azure Kubernetes Service (AKS)](https://docs.microsoft.com/en-us/azure/aks/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Azure CLI Documentation](https://docs.microsoft.com/en-us/cli/azure/)

---

## 📝 NOTES

- AKS Cluster location: **Japan East** (do Southeast Asia không đủ quota)
- Node VM Size: **Standard_B2s** (2 vCPU, 4GB RAM)
- Kubernetes Version: **v1.32.9**
- Image Pull Method: **Secret** (không dùng ACR attach do thiếu quyền)
- Service Type: **ClusterIP** (internal only, sẽ expose qua Ingress ở Bước 3)
- Replicas: **2** (high availability)

---

## 🎯 KEY ACHIEVEMENTS

✅ Học được Kubernetes fundamentals  
✅ Tạo và quản lý AKS cluster  
✅ Deploy containerized application lên Kubernetes  
✅ Hiểu về Pods, Deployments, Services  
✅ Sử dụng kubectl thành thạo  
✅ Troubleshooting Kubernetes issues  
✅ Container orchestration hands-on experience  
✅ Load balancing và auto-healing  


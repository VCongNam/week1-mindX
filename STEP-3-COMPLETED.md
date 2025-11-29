# 📘 HƯỚNG DẪN CHI TIẾT BƯỚC 3: Setup Ingress Controller

**Mục tiêu**: Cài đặt Ingress Controller để expose API ra internet với External IP

**Thời gian**: 30-45 phút

---

## 🎯 MỤC TIÊU

Sau khi hoàn thành Bước 3, bạn sẽ có:
- ✅ Ingress Controller (nginx) chạy trong AKS
- ✅ Azure Load Balancer với External IP public
- ✅ API accessible từ internet (không cần port-forward)
- ✅ Routing rules để direct traffic tới API

---

## 📚 KIẾN THỨC NỀN TẢNG

### Ingress là gì?

**Trước Bước 3 (Bước 2):**
```
Internet ❌ Không thể access

AKS Cluster:
  └─ Service (ClusterIP) → Pods
  
Bạn phải: kubectl port-forward → localhost:8080
```

**Sau Bước 3:**
```
Internet ✅ Có thể access
    ↓
External IP (20.123.45.67)
    ↓
Load Balancer (Azure tự động tạo)
    ↓
Ingress Controller (nginx trong cluster)
    ↓
Service (ClusterIP) → Pods
```

### Các thành phần:

**1. Ingress Controller**
- Application chạy trong Kubernetes
- Nhận traffic từ internet qua Load Balancer
- Route traffic tới Services dựa trên rules
- Phổ biến: nginx-ingress, Traefik, HAProxy

**2. Load Balancer**
- Azure tự động tạo khi cài Ingress Controller
- Có External IP public
- Forward traffic vào Ingress Controller

**3. Ingress Resource**
- YAML file định nghĩa routing rules
- Ví dụ: `/api/*` → API Service, `/` → Web App

---

## 📋 CHUẨN BỊ

### Bước 0.1: Kiểm tra cluster

```powershell
kubectl get nodes
```

**Kết quả mong đợi:**
```
NAME                                STATUS   ROLES    AGE   VERSION
aks-nodepool1-xxxxx-vmss000000      Ready    <none>   2h    v1.32.9
```

✅ STATUS phải là "Ready"

---

### Bước 0.2: Kiểm tra API đang chạy

```powershell
kubectl get pods
kubectl get services
```

**Kết quả mong đợi:**
```
NAME                         READY   STATUS    RESTARTS   AGE
mindx-api-xxxxx-xxxxx        1/1     Running   0          1h
mindx-api-xxxxx-xxxxx        1/1     Running   0          1h

NAME                TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
mindx-api-service   ClusterIP   10.0.123.45    <none>        80/TCP    1h
```

✅ Pods STATUS = "Running", Service TYPE = "ClusterIP"

---

### Bước 0.3: Cài đặt Helm

Helm là package manager cho Kubernetes.

**Kiểm tra Helm:**
```powershell
helm version
```

**Nếu chưa có, cài đặt:**

**Cách 1: Dùng winget (Khuyến nghị)**
```powershell
winget install Helm.Helm
```

**Cách 2: Dùng Chocolatey**
```powershell
# PowerShell as Administrator
choco install kubernetes-helm
```

**Sau khi cài, đóng và mở lại PowerShell.**

**Verify:**
```powershell
helm version
```

✅ Phải thấy version (ví dụ: v3.13.x)

---

## 🚀 PHẦN 1: CÀI ĐẶT INGRESS CONTROLLER

### Bước 1.1: Add Helm repository

```powershell
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
```

**Kết quả:**
```
"ingress-nginx" has been added to your repositories
```

**Update repo:**
```powershell
helm repo update
```

**Kết quả:**
```
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "ingress-nginx" chart repository
Update Complete. ⎈Happy Helming!⎈
```

---


### Bước 1.2: Cài đặt nginx-ingress controller

```powershell
helm install nginx-ingress ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz
```

**Giải thích lệnh:**
- `helm install nginx-ingress`: Tên installation
- `ingress-nginx/ingress-nginx`: Chart từ repo
- `--namespace ingress-nginx`: Tạo namespace riêng
- `--create-namespace`: Tự động tạo namespace
- `--set controller.service.annotations...`: Azure health check config

**Quá trình cài đặt mất 2-3 phút.**

**Kết quả:**
```
NAME: nginx-ingress
LAST DEPLOYED: Wed Nov 27 15:30:00 2024
NAMESPACE: ingress-nginx
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
The ingress-nginx controller has been installed.
It may take a few minutes for the LoadBalancer IP to be available.
You can watch the status by running:
  kubectl --namespace ingress-nginx get services -o wide -w nginx-ingress-ingress-nginx-controller
```

✅ STATUS: deployed

---

### Bước 1.3: Đợi Ingress Controller Pods sẵn sàng

**Xem Pods:**
```powershell
kubectl get pods -n ingress-nginx
```

**Kết quả ban đầu:**
```
NAME                                        READY   STATUS              RESTARTS   AGE
nginx-ingress-ingress-nginx-controller-xxx  0/1     ContainerCreating   0          30s
```

**Đợi 1-2 phút, chạy lại:**
```powershell
kubectl get pods -n ingress-nginx
```

**Kết quả khi ready:**
```
NAME                                        READY   STATUS    RESTARTS   AGE
nginx-ingress-ingress-nginx-controller-xxx  1/1     Running   0          2m
```

✅ STATUS = "Running", READY = 1/1

**Nếu STATUS không phải "Running" sau 5 phút:**
```powershell
kubectl describe pod -n ingress-nginx <pod-name>
kubectl logs -n ingress-nginx <pod-name>
```

---

### Bước 1.4: Đợi Azure tạo Load Balancer và External IP

**Xem Service của Ingress Controller:**
```powershell
kubectl get service -n ingress-nginx
```

**Kết quả ban đầu (đang tạo):**
```
NAME                                 TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)
nginx-ingress-ingress-nginx-controller   LoadBalancer   10.0.234.56    <pending>     80:31234/TCP,443:31567/TCP
```

**EXTERNAL-IP = `<pending>`** → Azure đang tạo Load Balancer

**Đợi 2-5 phút. Chạy lệnh này để watch realtime:**
```powershell
kubectl get service -n ingress-nginx --watch
```

**Khi có External IP:**
```
NAME                                 TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)
nginx-ingress-ingress-nginx-controller   LoadBalancer   10.0.234.56    20.123.45.67     80:31234/TCP,443:31567/TCP
```

**EXTERNAL-IP = `20.123.45.67`** (IP thật sẽ khác)

**📝 GHI LẠI EXTERNAL IP NÀY!**

Nhấn `Ctrl+C` để thoát watch mode.

---

### Bước 1.5: Verify Ingress Controller hoạt động

**Test External IP bằng curl:**
```powershell
curl http://20.123.45.67
```

**Thay `20.123.45.67` bằng External IP của bạn.**

**Kết quả mong đợi:**
```html
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

✅ **404 là bình thường!** Nghĩa là nginx đang chạy, nhưng chưa có routing rules.

**Hoặc test bằng browser:**
- Mở browser
- Truy cập: `http://20.123.45.67`
- Thấy trang 404 nginx

---

## 📝 PHẦN 2: TẠO INGRESS RESOURCE

### Bước 2.1: Tạo Ingress manifest file

```powershell
# Đảm bảo đang ở root folder của project
cd D:\MindX\Onboarding\code\week1-mindX

# Tạo file ingress.yaml
notepad k8s\ingress.yaml
```

**Copy nội dung này vào file:**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mindx-api-ingress
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mindx-api-service
            port:
              number: 80
```

**Giải thích từng phần:**

**metadata:**
- `name: mindx-api-ingress`: Tên Ingress resource
- `namespace: default`: Namespace (cùng với API service)
- `annotations`: Cấu hình cho nginx
  - `rewrite-target: /`: Rewrite URL path
  - `ssl-redirect: "false"`: Tắt auto redirect HTTPS (chưa có SSL cert)

**spec:**
- `ingressClassName: nginx`: Dùng nginx ingress controller
- `rules`: Routing rules
  - `http`: HTTP traffic (chưa có HTTPS)
  - `paths`: Danh sách paths
    - `path: /`: Match tất cả requests
    - `pathType: Prefix`: Match paths bắt đầu với `/`
    - `backend.service.name`: Route tới service `mindx-api-service`
    - `backend.service.port.number`: Port 80 của service

**Lưu file:**
- Nhấn `Ctrl+S`
- Đóng notepad

---

### Bước 2.2: Apply Ingress resource

```powershell
kubectl apply -f k8s/ingress.yaml
```

**Kết quả:**
```
ingress.networking.k8s.io/mindx-api-ingress created
```

✅ Ingress resource đã được tạo

---

### Bước 2.3: Verify Ingress resource

**Xem Ingress:**
```powershell
kubectl get ingress
```

**Kết quả:**
```
NAME                CLASS   HOSTS   ADDRESS         PORTS   AGE
mindx-api-ingress   nginx   *       20.123.45.67    80      30s
```

**Quan trọng:**
- **CLASS**: nginx (đúng ingress controller)
- **HOSTS**: * (accept tất cả hostnames)
- **ADDRESS**: External IP của Load Balancer
- **PORTS**: 80 (HTTP)

**Xem chi tiết:**
```powershell
kubectl describe ingress mindx-api-ingress
```

**Xem phần "Rules":**
```
Rules:
  Host        Path  Backends
  ----        ----  --------
  *           
              /   mindx-api-service:80 (10.244.0.10:3000,10.244.0.11:3000)
```

**Backends** phải có Pod IPs (10.244.0.10:3000, 10.244.0.11:3000)

**Xem phần "Events":**
```
Events:
  Type    Reason  Message
  ----    ------  -------
  Normal  Sync    Scheduled for sync
```

✅ Không có errors

---

## 🧪 PHẦN 3: TEST API QUA EXTERNAL IP

### Bước 3.1: Lấy External IP

```powershell
kubectl get ingress
```

**Hoặc:**
```powershell
kubectl get service -n ingress-nginx
```

**Copy External IP** (ví dụ: 20.123.45.67)

---

### Bước 3.2: Test health endpoint

```powershell
curl http://20.123.45.67/health
```

**Thay `20.123.45.67` bằng External IP của bạn.**

**Kết quả mong đợi:**
```json
{"status":"healthy","timestamp":"2024-11-27T15:45:30.123Z","uptime":3456.789}
```

✅ API response thành công!

---

### Bước 3.3: Test API hello endpoint

```powershell
curl http://20.123.45.67/api/hello
```

**Kết quả mong đợi:**
```json
{"message":"Hello from MindX API!","version":"1.0.0","timestamp":"2024-11-27T15:45:31.456Z"}
```

✅ API response thành công!

---

### Bước 3.4: Test root endpoint

```powershell
curl http://20.123.45.67/
```

**Kết quả mong đợi:**
```json
{"name":"MindX Onboarding API","version":"1.0.0","endpoints":[{"path":"/health","method":"GET","description":"Health check"},{"path":"/api/hello","method":"GET","description":"Hello world"}]}
```

✅ API response thành công!

---

### Bước 3.5: Test từ browser

**Mở browser và truy cập:**
- `http://20.123.45.67/health`
- `http://20.123.45.67/api/hello`
- `http://20.123.45.67/`

**Bạn sẽ thấy JSON response hiển thị đẹp trên browser!**

✅ API accessible từ browser!

---

### Bước 3.6: Test từ máy khác hoặc điện thoại

**API giờ đã public trên internet!**

Bạn có thể:
- Share External IP cho đồng nghiệp test
- Test từ điện thoại (4G/5G hoặc WiFi khác)
- Test từ máy tính khác
- Test từ bất kỳ đâu có internet

**Không cần port-forward nữa!** 🎉

---

## 📊 PHẦN 4: VERIFY VÀ MONITOR

### Bước 4.1: Xem logs của Ingress Controller

**Lấy tên Pod:**
```powershell
kubectl get pods -n ingress-nginx
```

**Xem logs:**
```powershell
kubectl logs -n ingress-nginx <pod-name>
```

**Hoặc follow logs realtime:**
```powershell
kubectl logs -f -n ingress-nginx <pod-name>
```

**Bạn sẽ thấy access logs:**
```
10.240.0.4 - - [27/Nov/2024:15:45:30 +0000] "GET /health HTTP/1.1" 200 85 "-" "curl/7.68.0"
10.240.0.4 - - [27/Nov/2024:15:45:31 +0000] "GET /api/hello HTTP/1.1" 200 102 "-" "curl/7.68.0"
```

✅ Mỗi request đều được log

Nhấn `Ctrl+C` để thoát.

---

### Bước 4.2: Test load balancing

**Gọi API nhiều lần:**
```powershell
for ($i=1; $i -le 10; $i++) {
    Write-Host "Request $i"
    curl http://20.123.45.67/api/hello
    Start-Sleep -Seconds 1
}
```

**Thay External IP của bạn.**

**Mở 2 terminals để xem logs của cả 2 API Pods:**

**Terminal 1:**
```powershell
kubectl logs -f <api-pod-1-name>
```

**Terminal 2:**
```powershell
kubectl logs -f <api-pod-2-name>
```

**Bạn sẽ thấy requests được phân phối đều giữa 2 Pods!**

✅ Load balancing hoạt động!

---

### Bước 4.3: Xem tất cả resources

```powershell
kubectl get all -n ingress-nginx
```

**Kết quả:**
```
NAME                                            READY   STATUS    RESTARTS   AGE
pod/nginx-ingress-ingress-nginx-controller-xxx  1/1     Running   0          15m

NAME                                         TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)
service/nginx-ingress-ingress-nginx-controller   LoadBalancer   10.0.234.56    20.123.45.67     80:31234/TCP,443:31567/TCP

NAME                                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/nginx-ingress-ingress-nginx-controller   1/1     1            1           15m
```

✅ Tất cả resources healthy

---

## ✅ HOÀN THÀNH BƯỚC 3!

### Checklist

- [x] Helm đã cài đặt
- [x] nginx-ingress controller đã cài đặt
- [x] Ingress Controller Pods STATUS = "Running"
- [x] Azure Load Balancer đã tạo
- [x] External IP đã được assign
- [x] Ingress resource đã tạo
- [x] API accessible qua External IP
- [x] `/health` endpoint works
- [x] `/api/hello` endpoint works
- [x] `/` endpoint works
- [x] Test từ browser thành công
- [x] Không cần port-forward nữa
- [x] Load balancing hoạt động

---

## 🎯 SO SÁNH TRƯỚC VÀ SAU

### Trước Bước 3 (Bước 2):

**Access API:**
```powershell
# Phải port-forward
kubectl port-forward service/mindx-api-service 8080:80

# Chỉ access được từ localhost
curl http://localhost:8080/health
```

**Hạn chế:**
- ❌ Chỉ access được từ máy local
- ❌ Phải giữ terminal port-forward mở
- ❌ Không thể share cho người khác
- ❌ Không giống production

---

### Sau Bước 3:

**Access API:**
```powershell
# Không cần port-forward
# Access trực tiếp qua External IP
curl http://20.123.45.67/health
```

**Ưu điểm:**
- ✅ Access từ bất kỳ đâu (internet)
- ✅ Không cần port-forward
- ✅ Share External IP cho team
- ✅ Giống production environment
- ✅ Load balancing tự động
- ✅ High availability

---

## 🔧 TROUBLESHOOTING

### Vấn đề 1: External IP vẫn `<pending>` sau 10 phút

**Kiểm tra:**
```powershell
kubectl describe service -n ingress-nginx nginx-ingress-ingress-nginx-controller
```

**Xem phần "Events" có lỗi gì không.**

**Nguyên nhân thường gặp:**
- Azure quota không đủ cho Load Balancer
- Network policy block
- Region không support Load Balancer

**Giải pháp:**
1. Đợi thêm 5 phút
2. Kiểm tra Azure Portal → Load Balancers
3. Liên hệ Sys Admin kiểm tra quota
4. Xem logs: `kubectl logs -n ingress-nginx <pod-name>`

---

### Vấn đề 2: 404 Not Found khi access External IP

**Kiểm tra Ingress:**
```powershell
kubectl get ingress
kubectl describe ingress mindx-api-ingress
```

**Xem phần "Rules" và "Backends":**
- Rules phải có path `/`
- Backends phải có Pod IPs

**Nếu Backends trống:**
```powershell
# Kiểm tra Service
kubectl get service mindx-api-service

# Kiểm tra Endpoints
kubectl get endpoints mindx-api-service
```

**Nếu Endpoints trống:**
- Service selector không match với Pod labels
- Sửa Service hoặc Deployment labels

---

### Vấn đề 3: 502 Bad Gateway

**Nghĩa là:** Ingress Controller không connect được tới Pods

**Kiểm tra:**
```powershell
# Pods có running không?
kubectl get pods

# Pods có healthy không?
kubectl describe pod <pod-name>

# Service có endpoints không?
kubectl get endpoints mindx-api-service

# Test từ trong cluster
kubectl run test-pod --image=curlimages/curl -it --rm -- curl http://mindx-api-service/health
```

**Nếu test từ trong cluster OK nhưng qua Ingress lỗi:**
- Kiểm tra Ingress annotations
- Kiểm tra Ingress rules
- Xem logs Ingress Controller

---

### Vấn đề 4: Connection timeout

**Kiểm tra:**
```powershell
# External IP đúng chưa?
kubectl get service -n ingress-nginx

# Ingress Controller running chưa?
kubectl get pods -n ingress-nginx

# Test từ trong cluster
kubectl exec -it <api-pod-name> -- curl http://localhost:3000/health
```

**Nếu từ trong cluster OK:**
- Có thể firewall block (ít gặp trên Azure)
- Kiểm tra Network Security Groups trong Azure Portal

---

### Vấn đề 5: Helm command not found

**Giải pháp:**
```powershell
# Cài Helm
winget install Helm.Helm

# Đóng và mở lại PowerShell
helm version
```

---

## 📝 LỆNH TÓM TẮT

```powershell
# 1. Cài Helm (nếu chưa có)
winget install Helm.Helm
# Đóng và mở lại PowerShell

# 2. Add Helm repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# 3. Cài nginx-ingress
helm install nginx-ingress ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz

# 4. Đợi Pods ready
kubectl get pods -n ingress-nginx --watch

# 5. Đợi External IP
kubectl get service -n ingress-nginx --watch

# 6. Tạo Ingress resource
notepad k8s\ingress.yaml
kubectl apply -f k8s/ingress.yaml

# 7. Verify
kubectl get ingress
kubectl describe ingress mindx-api-ingress

# 8. Test
curl http://<EXTERNAL-IP>/health
curl http://<EXTERNAL-IP>/api/hello
curl http://<EXTERNAL-IP>/
```

---

## 💡 TÓM TẮT

**Bạn đã làm được:**
- ✅ Cài đặt Helm package manager
- ✅ Cài đặt nginx-ingress controller vào AKS
- ✅ Azure tự động tạo Load Balancer với External IP
- ✅ Tạo Ingress resource với routing rules
- ✅ API accessible từ internet qua External IP
- ✅ Không cần port-forward nữa
- ✅ Load balancing tự động giữa Pods

**External IP của bạn:**
```
http://<EXTERNAL-IP>/health
http://<EXTERNAL-IP>/api/hello
http://<EXTERNAL-IP>/
```

**Bạn có thể share External IP này cho bất kỳ ai để test API!**

---

## 📚 KIẾN THỨC ĐÃ HỌC

### 1. Helm Package Manager
- Cài đặt applications vào Kubernetes dễ dàng
- Quản lý Kubernetes manifests
- Version control cho deployments

### 2. Ingress Controller
- Application chạy trong Kubernetes
- Nhận traffic từ internet
- Route traffic tới Services
- nginx-ingress là phổ biến nhất

### 3. Azure Load Balancer
- Tự động tạo khi cài Ingress Controller
- Có External IP public
- Forward traffic vào cluster
- Health checks tự động

### 4. Ingress Resource
- YAML file định nghĩa routing rules
- Path-based routing
- Host-based routing (sẽ học ở Bước 6)

### 5. Service Types
- **ClusterIP**: Internal only (API service)
- **LoadBalancer**: External access (Ingress Controller)
- **NodePort**: Expose qua node port

---


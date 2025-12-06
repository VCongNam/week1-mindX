# MindX Onboarding - Weeks 1 & 2

Full-stack application deployed on Azure Kubernetes Service with OpenID Connect authentication, HTTPS, and comprehensive monitoring.

## 🚀 Live Application

- **HTTPS (Production):** https://namvc.4.190.61.4.nip.io
- **HTTP (Fallback):** http://4.190.61.4

## 📋 Project Overview

This project demonstrates a complete DevOps workflow for deploying a full-stack application to Azure Cloud:

- **Backend API:** Node.js/Express with OpenID Connect authentication
- **Frontend:** React + Vite SPA with Ant Design
- **Infrastructure:** Azure Kubernetes Service (AKS)
- **Container Registry:** Azure Container Registry (ACR)
- **Ingress:** NGINX Ingress Controller with path-based routing
- **SSL/TLS:** Let's Encrypt certificates via cert-manager
- **Authentication:** OpenID Connect integration with MindX ID
- **Monitoring:** Azure Application Insights for backend metrics
- **Analytics:** Google Analytics 4 for user behavior tracking

## 🏗️ Architecture

```
Internet
    ↓
HTTPS/HTTP (namvc.4.190.61.4.nip.io / 4.190.61.4)
    ↓
NGINX Ingress Controller (TLS Termination)
    ↓
    ├─→ /api/* → API Service (ClusterIP) → API Pods
    └─→ /*     → Webapp Service (ClusterIP) → Webapp Pods
```

### Components

- **AKS Cluster:** Kubernetes orchestration platform
- **ACR:** Private container registry for Docker images
- **Ingress Controller:** Routes external traffic to services
- **cert-manager:** Automatic SSL certificate management
- **Secrets:** Kubernetes secrets for sensitive data (OIDC credentials)

## 📁 Repository Structure

```
.
├── api/                    # Backend API
│   ├── src/
│   │   └── index.js       # Express server with OIDC
│   ├── Dockerfile         # API container image
│   └── package.json
├── webapp/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Auth context
│   │   └── pages/         # Page components
│   ├── Dockerfile         # Webapp container image
│   ├── nginx.conf         # NGINX config for SPA
│   ├── .env.production    # Production environment variables
│   └── package.json
├── k8s/                    # Kubernetes manifests
│   ├── deployment.yaml    # Deployments for API and Webapp
│   ├── service.yaml       # ClusterIP services
│   ├── ingress.yaml       # Ingress with TLS configuration
│   └── cluster-issuer.yaml # Let's Encrypt issuer
└── week-1/                 # Documentation
    ├── overview.md
    ├── tasks.md
    └── step-6-completed.md
```

## 🔧 Technology Stack

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Authentication:** OpenID Connect (OIDC)
- **JWT:** jsonwebtoken
- **HTTP Client:** axios

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **UI Library:** Ant Design
- **Routing:** React Router v6
- **HTTP Client:** axios

### Infrastructure
- **Cloud Provider:** Microsoft Azure
- **Container Orchestration:** Kubernetes (AKS)
- **Container Registry:** Azure Container Registry
- **Ingress Controller:** NGINX Ingress Controller
- **Certificate Manager:** cert-manager
- **SSL Provider:** Let's Encrypt

## 🚀 Deployment Guide

### Prerequisites

- Azure CLI installed and configured
- kubectl installed and configured
- Docker installed
- Access to Azure subscription
- Access to ACR (mindxacrnamvc.azurecr.io)

### 1. Build and Push Docker Images

```bash
# Login to ACR
az acr login --name mindxacrnamvc

# Build and push API
docker build -t mindxacrnamvc.azurecr.io/mindx-api:latest ./api
docker push mindxacrnamvc.azurecr.io/mindx-api:latest

# Build and push Webapp
docker build -t mindxacrnamvc.azurecr.io/mindx-webapp:latest ./webapp
docker push mindxacrnamvc.azurecr.io/mindx-webapp:latest
```

### 2. Create Kubernetes Secrets

```bash
# Create OIDC secret
kubectl create secret generic oidc-secret \
  --from-literal=client-id=mindx-onboarding \
  --from-literal=client-secret=<CLIENT_SECRET> \
  --from-literal=issuer=https://id-dev.mindx.edu.vn \
  --from-literal=jwt-secret=<JWT_SECRET>

# Create ACR pull secret
kubectl create secret docker-registry acr-secret \
  --docker-server=mindxacrnamvc.azurecr.io \
  --docker-username=<ACR_USERNAME> \
  --docker-password=<ACR_PASSWORD>
```

### 3. Install cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager pods to be ready
kubectl get pods -n cert-manager -w
```

### 4. Deploy Application

```bash
# Apply ClusterIssuer for Let's Encrypt
kubectl apply -f k8s/cluster-issuer.yaml

# Deploy services
kubectl apply -f k8s/service.yaml

# Deploy applications
kubectl apply -f k8s/deployment.yaml

# Deploy ingress with TLS
kubectl apply -f k8s/ingress.yaml
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# Check certificate
kubectl get certificate

# View logs
kubectl logs -l app=mindx-api --tail=50
kubectl logs -l app=mindx-webapp --tail=50
```

## 🔐 Authentication Flow

### OpenID Connect Integration

The application uses OpenID Connect (OIDC) for authentication with MindX ID provider.

#### Flow Diagram

```
User → Webapp → API /api/auth/login
                  ↓
            Generate auth URL
                  ↓
User → MindX ID (https://id-dev.mindx.edu.vn)
                  ↓
            User authenticates
                  ↓
MindX ID → Webapp /callback?code=xxx
                  ↓
Webapp → API /api/auth/callback (POST with code)
                  ↓
            Exchange code for tokens
                  ↓
            Get user info
                  ↓
            Generate JWT token
                  ↓
Webapp ← API (JWT token + user info)
                  ↓
            Store token in localStorage
                  ↓
            Redirect to dashboard
```

#### API Endpoints

**Authentication Endpoints:**
- `GET /api/auth/login` - Get OIDC authorization URL
- `POST /api/auth/callback` - Exchange authorization code for JWT token
- `GET /api/auth/me` - Get current user info (protected)
- `POST /api/auth/logout` - Logout and get end session URL

**Public Endpoints:**
- `GET /health` - Health check
- `GET /api/hello` - Hello world test endpoint

**Protected Endpoints:**
- `GET /api/protected` - Example protected endpoint

#### Environment Variables

**API (k8s/deployment.yaml):**
```yaml
- OIDC_CLIENT_ID: mindx-onboarding
- OIDC_CLIENT_SECRET: <from secret>
- OIDC_ISSUER: https://id-dev.mindx.edu.vn
- OIDC_REDIRECT_URI: http://4.190.61.4/callback
- JWT_SECRET: <from secret>
- CORS_ORIGIN: https://namvc.4.190.61.4.nip.io,http://4.190.61.4
```

**Webapp (.env.production):**
```env
VITE_API_URL=/api
VITE_GA_MEASUREMENT_ID=G-ZNBDKG2FPQ
VITE_OIDC_ISSUER=https://id-dev.mindx.edu.vn
VITE_OIDC_CLIENT_ID=mindx-onboarding
VITE_OIDC_REDIRECT_URI=http://4.190.61.4/callback
```

## 🔒 HTTPS & SSL Configuration

### Domain Setup

Using **nip.io** wildcard DNS service for automatic domain resolution:
- Domain: `namvc.4.190.61.4.nip.io`
- Automatically resolves to: `4.190.61.4`
- No DNS configuration required

### SSL Certificate

- **Provider:** Let's Encrypt (Production)
- **Manager:** cert-manager
- **Challenge Type:** HTTP-01
- **Auto-Renewal:** 30 days before expiry
- **Valid Until:** March 2, 2026

### Certificate Status

```bash
# Check certificate
kubectl get certificate mindx-tls-cert

# View certificate details
kubectl describe certificate mindx-tls-cert

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

## 🧪 Testing

### Local Testing

```bash
# Test API health
curl http://4.190.61.4/api/hello
curl https://namvc.4.190.61.4.nip.io/api/hello

# Test HTTPS redirect
curl -I http://4.190.61.4/

# Test authentication (requires browser)
open http://4.190.61.4
open https://namvc.4.190.61.4.nip.io
```

### Browser Testing

1. Open application in browser
2. Click "Login" button
3. Redirected to MindX ID login page
4. Enter credentials
5. Redirected back to application
6. User info displayed on dashboard

## 📊 Monitoring

### View Logs

```bash
# API logs
kubectl logs -l app=mindx-api --tail=100 -f

# Webapp logs
kubectl logs -l app=mindx-webapp --tail=100 -f

# Ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=100
```

### Check Resources

```bash
# Pod status
kubectl get pods -o wide

# Service endpoints
kubectl get endpoints

# Ingress status
kubectl describe ingress mindx-api-ingress

# Certificate status
kubectl get certificate -o wide
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Common causes:
# - Image pull errors (check ACR credentials)
# - Missing secrets
# - Resource constraints
```

#### 2. Certificate Not Issuing

```bash
# Check certificate status
kubectl describe certificate mindx-tls-cert

# Check certificate request
kubectl get certificaterequest

# Check challenges
kubectl get challenges

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

#### 3. Authentication Errors

```bash
# Check API logs for OIDC errors
kubectl logs -l app=mindx-api | grep -i error

# Verify secrets
kubectl get secret oidc-secret -o yaml

# Common causes:
# - Wrong client ID/secret
# - Redirect URI not whitelisted
# - CORS issues
```

#### 4. Ingress Not Working

```bash
# Check ingress status
kubectl describe ingress mindx-api-ingress

# Check ingress controller
kubectl get pods -n ingress-nginx

# Check service endpoints
kubectl get endpoints
```

### Known Issues

**OIDC Provider Consent Error After Logout:**
- **Issue:** After logout, re-login may show "Consent Error" from OIDC provider
- **Root Cause:** Provider-side session management issue (not application code)
- **Workaround:** Use incognito mode or clear browser cookies
- **Impact:** Does not affect core functionality - first login always works

## 📝 Development

### Local Development Setup

#### API

```bash
cd api
npm install

# Create .env file
cat > .env << EOF
PORT=3000
OIDC_CLIENT_ID=mindx-onboarding
OIDC_CLIENT_SECRET=<secret>
OIDC_ISSUER=https://id-dev.mindx.edu.vn
OIDC_REDIRECT_URI=http://localhost:5173/callback
JWT_SECRET=<secret>
CORS_ORIGIN=http://localhost:5173
EOF

# Run development server
npm run dev
```

#### Webapp

```bash
cd webapp
npm install

# Create .env.local file
cat > .env.local << EOF
VITE_API_URL=http://localhost:3000/api
VITE_OIDC_ISSUER=https://id-dev.mindx.edu.vn
VITE_OIDC_CLIENT_ID=mindx-onboarding
VITE_OIDC_REDIRECT_URI=http://localhost:5173/callback
EOF

# Run development server
npm run dev
```

### Build for Production

```bash
# API
cd api
npm run build  # If using TypeScript

# Webapp
cd webapp
npm run build
```

## 🔄 Update Deployment

### Rolling Update

```bash
# Build new images with version tag
docker build -t mindxacrnamvc.azurecr.io/mindx-api:v1.1 ./api
docker push mindxacrnamvc.azurecr.io/mindx-api:v1.1

# Update deployment
kubectl set image deployment/mindx-api mindx-api=mindxacrnamvc.azurecr.io/mindx-api:v1.1

# Check rollout status
kubectl rollout status deployment/mindx-api

# Rollback if needed
kubectl rollout undo deployment/mindx-api
```

### Configuration Changes

```bash
# Update environment variables
kubectl set env deployment/mindx-api NEW_VAR=value

# Update secrets
kubectl delete secret oidc-secret
kubectl create secret generic oidc-secret --from-literal=...

# Restart deployment to pick up changes
kubectl rollout restart deployment/mindx-api
```

## 📚 Documentation

- [Week 1 Overview](week-1/overview.md)
- [Week 1 Tasks](week-1/tasks.md)
- [Step 6 Completion Report](week-1/step-6-completed.md)

## 🎯 Completed Steps

- ✅ Step 1: Azure Container Registry and API Deployment
- ✅ Step 2: Deploy Application to AKS
- ✅ Step 3: Setup Ingress Controller
- ✅ Step 4: Deploy React Web App to AKS
- ✅ Step 5: Implement Authentication (OpenID)
- ✅ Step 6: Setup HTTPS Domain and SSL Certificate

## 🔗 Resources

- **Azure AKS:** https://azure.microsoft.com/en-us/services/kubernetes-service/
- **cert-manager:** https://cert-manager.io/
- **Let's Encrypt:** https://letsencrypt.org/
- **NGINX Ingress:** https://kubernetes.github.io/ingress-nginx/
- **nip.io:** https://nip.io/

## 👤 Author

**NamVC**  
MindX Engineer Onboarding Program - Week 1

## 📄 License

This project is part of the MindX Onboarding Program.


---

## 📊 Week 2: Monitoring & Analytics

### Production Metrics (Azure Application Insights)

**Resource:** `mindx-api-insights`  
**Dashboard:** [Azure Portal](https://portal.azure.com)

**Features:**
- ✅ Real-time API monitoring
- ✅ Error tracking and logging
- ✅ Performance metrics (response time, throughput)
- ✅ Custom event tracking (20+ events)
- ✅ Automated alerts (3 critical alerts)
- ✅ Dependency tracking

**Key Metrics:**
- Request rate and response times
- Failed requests and exceptions
- Authentication success/failure rates
- User activity patterns

**Alerts Configured:**
1. High Error Rate (>5 errors/5min)
2. Slow Response Time (>2s average)
3. High Exception Rate (>3 exceptions/5min)

### Product Metrics (Google Analytics 4)

**Property:** `MindX Onboarding App`  
**Dashboard:** [Google Analytics](https://analytics.google.com)  
**Measurement ID:** `G-ZNBDKG2FPQ`

**Features:**
- ✅ Page view tracking (all routes)
- ✅ User session analytics
- ✅ Custom event tracking
- ✅ User journey analysis
- ✅ Real-time monitoring

**Tracked Events:**
- Page views (Home, Login, Dashboard)
- Login button clicks
- Authentication success/failure
- User logout
- Custom test events

**Test Page:** http://localhost:5173/ga-test

### Monitoring Documentation

- [Complete Metrics Setup Guide](doc/week-2/METRICS_SETUP.md)
- [Tracking Events Reference](doc/week-2/TRACKING_EVENTS.md)
- [Deployment Steps](doc/week-2/DEPLOYMENT_STEPS.md)
- [GA Test Guide](doc/week-2/GA_TEST_GUIDE.md)
- [Progress Tracker](doc/week-2/PROGRESS.md)

---

## 🎯 Completed Milestones

### Week 1: Infrastructure & Authentication ✅
- [x] Azure Container Registry setup
- [x] AKS cluster deployment
- [x] NGINX Ingress Controller
- [x] React webapp deployment
- [x] OpenID Connect authentication
- [x] HTTPS with Let's Encrypt

### Week 2: Monitoring & Analytics ✅
- [x] Azure Application Insights integration
- [x] Custom event tracking (20+ events)
- [x] Automated alerts (3 alerts)
- [x] Google Analytics 4 integration
- [x] GA test page with 6 test scenarios
- [x] Comprehensive documentation

---

## 📈 Monitoring Access

### Azure Application Insights
1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Application Insights"
3. Select: `mindx-api-insights`
4. View: Live Metrics, Failures, Performance, Logs

### Google Analytics
1. Go to [Google Analytics](https://analytics.google.com)
2. Select property: `MindX Onboarding App`
3. View: Realtime, Engagement, Events
4. Debug: Admin → DebugView

---

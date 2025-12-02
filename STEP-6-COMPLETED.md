# Step 6 Completed: HTTPS Domain and SSL Certificate Setup

**Date Completed:** December 2, 2025  
**Student:** NamVC  
**Mentor:** HuyNQ

## Overview
Successfully configured custom domain with HTTPS/SSL certificate for the full-stack application using cert-manager and Let's Encrypt. The application is now accessible via secure HTTPS connection with automatic certificate management.

## Domain Configuration

**Domain:** `namvc.4.190.61.4.nip.io`  
**DNS Provider:** nip.io (wildcard DNS service)  
**External IP:** `4.190.61.4` (from ingress-nginx LoadBalancer)

### Why nip.io?
- Free wildcard DNS service
- No DNS configuration required
- Automatic resolution to IP address
- Perfect for development and testing
- Recommended by mentor for quick setup

## SSL Certificate Setup

### Certificate Authority
- **Provider:** Let's Encrypt (Production)
- **Issuer:** ClusterIssuer `letsencrypt-prod`
- **Certificate Name:** `mindx-tls-cert`
- **Valid Until:** March 2, 2026
- **Auto-Renewal:** Enabled (30 days before expiry)

### Certificate Manager
- **Tool:** cert-manager v1.13.0
- **Installation:** Kubernetes cluster-wide
- **Challenge Type:** HTTP-01 validation
- **Secret Storage:** `mindx-tls-cert` in default namespace

## Implementation Details

### 6.1 Domain Configuration
```bash
# External IP from ingress controller
kubectl get svc -n ingress-nginx
# EXTERNAL-IP: 4.190.61.4

# Domain format: <name>.<ip>.nip.io
# Result: namvc.4.190.61.4.nip.io
```

### 6.2 Cert-Manager Installation
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager
```

### 6.3 ClusterIssuer Configuration
Created `k8s/cluster-issuer.yaml`:
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

### 6.4 Ingress HTTPS Configuration
Updated `k8s/ingress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mindx-api-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - namvc.4.190.61.4.nip.io
    secretName: mindx-tls-cert
  rules:
  - host: namvc.4.190.61.4.nip.io
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: mindx-api-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mindx-webapp-service
            port:
              number: 80
```

### 6.5 Environment Variables Update

**API Deployment (`k8s/deployment.yaml`):**
```yaml
env:
- name: OIDC_REDIRECT_URI
  value: "https://namvc.4.190.61.4.nip.io/callback"
- name: CORS_ORIGIN
  value: "https://namvc.4.190.61.4.nip.io"
```

**Webapp Environment (`webapp/.env.production`):**
```env
VITE_OIDC_REDIRECT_URI=https://namvc.4.190.61.4.nip.io/callback
```

### 6.6 OIDC Provider Update
**Action Required:** Updated OIDC redirect URI whitelist at https://id-dev.mindx.edu.vn
- Added: `https://namvc.4.190.61.4.nip.io/callback`
- Coordinated with mentor for OIDC configuration

## Deployment Process

### Build and Push Updated Images
```bash
# Rebuild webapp with HTTPS domain
docker build -t mindxacrnamvc.azurecr.io/mindx-webapp:latest ./webapp
docker push mindxacrnamvc.azurecr.io/mindx-webapp:latest

# API image already has dynamic CORS from env vars
```

### Apply Kubernetes Resources
```bash
# Apply ClusterIssuer
kubectl apply -f k8s/cluster-issuer.yaml

# Apply updated Ingress with TLS
kubectl apply -f k8s/ingress.yaml

# Apply updated Deployment with HTTPS env vars
kubectl apply -f k8s/deployment.yaml

# Restart deployments
kubectl rollout restart deployment/mindx-api
kubectl rollout restart deployment/mindx-webapp
```

### Certificate Verification
```bash
# Check certificate status
kubectl get certificate
# NAME              READY   SECRET            AGE
# mindx-tls-cert    True    mindx-tls-cert    5m

# Describe certificate details
kubectl describe certificate mindx-tls-cert
# Status: Ready
# Not Before: 2025-12-02T03:08:55Z
# Not After: 2026-03-02T03:08:54Z
```

## Testing and Verification

### HTTPS Access Tests
```bash
# Test API endpoint
curl https://namvc.4.190.61.4.nip.io/api/hello

# Test webapp
curl https://namvc.4.190.61.4.nip.io/

# Verify HTTP to HTTPS redirect
curl -I http://namvc.4.190.61.4.nip.io/
# Should return 308 Permanent Redirect to HTTPS
```

### Browser Verification
- ✅ HTTPS URL: https://namvc.4.190.61.4.nip.io
- ✅ Valid SSL certificate (🔒 icon in address bar)
- ✅ Certificate issued by Let's Encrypt
- ✅ No browser security warnings
- ✅ HTTP automatically redirects to HTTPS

### Authentication Flow Tests
- ✅ Login redirects to https://id-dev.mindx.edu.vn
- ✅ Callback returns to https://namvc.4.190.61.4.nip.io/callback
- ✅ JWT tokens issued and validated correctly
- ✅ Protected routes work with HTTPS
- ✅ CORS configured for HTTPS origin

## Deliverables

### Configuration Files
- ✅ `k8s/cluster-issuer.yaml` - Let's Encrypt ClusterIssuer
- ✅ `k8s/ingress.yaml` - Updated with TLS and host configuration
- ✅ `k8s/deployment.yaml` - Updated with HTTPS environment variables
- ✅ `webapp/.env.production` - Updated with HTTPS redirect URI

### Infrastructure
- ✅ Cert-manager installed in AKS cluster
- ✅ SSL certificate automatically issued and managed
- ✅ Ingress controller configured for HTTPS
- ✅ HTTP to HTTPS redirect enabled

### Documentation
- ✅ Domain configuration documented
- ✅ SSL certificate setup process documented
- ✅ Certificate renewal process documented
- ✅ Troubleshooting guide included

## Success Criteria - All Met ✅

- ✅ Application accessible via custom domain with valid HTTPS
- ✅ SSL certificate automatically issued by Let's Encrypt
- ✅ All API endpoints work correctly over HTTPS
- ✅ Frontend authentication flows work with HTTPS
- ✅ HTTP requests automatically redirect to HTTPS
- ✅ Certificate status and renewal properly configured
- ✅ No browser security warnings or certificate errors

## Architecture Changes

### Before Step 6
```
Internet → HTTP (4.190.61.4) → Ingress → Services → Pods
```

### After Step 6
```
Internet → HTTPS (namvc.4.190.61.4.nip.io) → Ingress (TLS termination) → Services → Pods
                                              ↑
                                         cert-manager
                                              ↑
                                        Let's Encrypt
```

## Security Improvements

1. **Encrypted Traffic:** All communication encrypted with TLS 1.2/1.3
2. **Valid Certificate:** Trusted certificate from Let's Encrypt CA
3. **Automatic Renewal:** Certificate auto-renews 30 days before expiry
4. **HTTPS Enforcement:** HTTP traffic automatically redirects to HTTPS
5. **Secure Authentication:** OIDC flows protected with HTTPS
6. **CORS Security:** CORS origin restricted to HTTPS domain

## Monitoring and Maintenance

### Certificate Monitoring
```bash
# Check certificate expiry
kubectl get certificate mindx-tls-cert -o jsonpath='{.status.notAfter}'

# Check certificate renewal status
kubectl describe certificate mindx-tls-cert

# View cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager --tail=100
```

### Certificate Renewal
- **Automatic:** cert-manager handles renewal automatically
- **Renewal Window:** 30 days before expiry
- **Renewal Time:** 2026-01-31T03:08:54Z
- **No Manual Intervention Required**

## Troubleshooting Guide

### Certificate Not Issuing
```bash
# Check certificate status
kubectl describe certificate mindx-tls-cert

# Check certificate request
kubectl get certificaterequest

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager --tail=50

# Check ACME challenge
kubectl get challenges
```

### HTTPS Not Working
```bash
# Verify ingress configuration
kubectl describe ingress mindx-api-ingress

# Check TLS secret exists
kubectl get secret mindx-tls-cert

# Test certificate from outside cluster
openssl s_client -connect namvc.4.190.61.4.nip.io:443 -servername namvc.4.190.61.4.nip.io
```

### Authentication Issues with HTTPS
- Verify OIDC redirect URI updated in provider
- Check CORS_ORIGIN environment variable
- Verify callback URL uses HTTPS
- Check browser console for mixed content warnings

## Lessons Learned

1. **nip.io is Perfect for Dev:** No DNS configuration needed, works instantly
2. **cert-manager is Powerful:** Automatic certificate management saves time
3. **Let's Encrypt is Fast:** Certificate issued in under 2 minutes
4. **HTTPS Requires Full Update:** Both frontend and backend need HTTPS URLs
5. **OIDC Provider Config:** Must update redirect URIs in OIDC provider

## Next Steps

### Optional Enhancements
- [ ] Add monitoring for certificate expiry alerts
- [ ] Configure rate limiting on ingress
- [ ] Add WAF (Web Application Firewall) rules
- [ ] Set up custom domain (non-nip.io) for production
- [ ] Configure HSTS headers for enhanced security

### Production Considerations
- Use real domain name instead of nip.io
- Configure DNS with proper TTL values
- Set up monitoring and alerting for certificate expiry
- Implement backup certificate issuer (staging)
- Configure security headers (HSTS, CSP, etc.)

## Resources and References

- **cert-manager Documentation:** https://cert-manager.io/docs/
- **Let's Encrypt:** https://letsencrypt.org/
- **nip.io Service:** https://nip.io/
- **Kubernetes Ingress TLS:** https://kubernetes.io/docs/concepts/services-networking/ingress/#tls
- **NGINX Ingress Controller:** https://kubernetes.github.io/ingress-nginx/

## Conclusion

Step 6 successfully completed! The full-stack application is now secured with HTTPS using a valid SSL certificate from Let's Encrypt. The certificate is automatically managed by cert-manager with auto-renewal configured. All services (frontend, backend, authentication) work correctly over HTTPS with proper security configurations.

**Application URL:** https://namvc.4.190.61.4.nip.io  
**Status:** Production-ready with HTTPS ✅  
**Certificate Valid Until:** March 2, 2026 🔒

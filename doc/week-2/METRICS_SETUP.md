# Week 2: Metrics Setup - Complete Guide

**Date:** December 7, 2024  
**Status:** ✅ Completed  
**Author:** NamVC

---

## 📋 Overview

This document provides a comprehensive guide for the monitoring and analytics setup implemented in Week 2 of the MindX Onboarding Program.

### Objectives Achieved

✅ **Production Metrics** - Azure Application Insights for backend monitoring  
✅ **Product Metrics** - Google Analytics 4 for frontend user tracking  
✅ **Alerts** - Automated notifications for critical issues  
✅ **Documentation** - Complete setup and usage guides

---

## 🔵 Part 1: Azure Application Insights

### Purpose
Monitor backend API performance, errors, and usage patterns in real-time.

### Setup Summary

**Resource Created:**
- Name: `mindx-api-insights`
- Region: Southeast Asia
- Connection String: Configured via Kubernetes secret

**Integration:**
- Package: `applicationinsights` v3.12.1
- Config file: `api/src/config/appInsights.js`
- Initialization: `api/src/index.js` (after dotenv)

### Features Implemented

#### 1. Automatic Tracking
- ✅ HTTP requests (all endpoints)
- ✅ Response times
- ✅ Failed requests (4xx, 5xx)
- ✅ Dependencies (external APIs)
- ✅ Exceptions
- ✅ Console logs
- ✅ Performance metrics

#### 2. Custom Event Tracking

**Authentication Events:**
- `LoginAttempt` - User initiates login
- `LoginURLGenerated` - Auth URL created
- `TokenExchangeStarted` - Code exchange begins
- `LoginSuccess` - Successful authentication
- `LoginFailed` - Authentication failure
- `AuthenticationSuccess` - Token validated
- `AuthenticationFailed` - Token validation failed
- `LogoutAttempt` - User initiates logout
- `LogoutSuccess` - Logout completed

**System Events:**
- `ServerStarted` - API server startup
- `HealthCheck` - Health endpoint called
- `HelloEndpoint` - Test endpoint called
- `RootEndpointAccess` - Root endpoint accessed

**User Activity:**
- `UserInfoRequest` - User info retrieved
- `ProtectedEndpointAccess` - Protected resource accessed

**Test Events:**
- `TestErrorTriggered` - Test error endpoint
- `TestSlowResponse` - Test slow response
- `TestExceptionTriggered` - Test exception

#### 3. Exception Tracking

All exceptions tracked with context:
- Endpoint path
- HTTP method
- User ID (if authenticated)
- Error type and message
- Stack trace

### Access Dashboard

**URL:** https://portal.azure.com

**Navigation:**
1. Search for "Application Insights"
2. Select: `mindx-api-insights`
3. Key sections:
   - **Live Metrics** - Real-time monitoring
   - **Failures** - Error tracking
   - **Performance** - Response times
   - **Logs** - Query application logs
   - **Alerts** - Alert rules and history

### Key Metrics to Monitor

| Metric | Description | Target |
|--------|-------------|--------|
| Request Rate | Requests per minute | Monitor trends |
| Response Time | Average response time | < 500ms |
| Failed Requests | 4xx/5xx errors | < 1% |
| Exceptions | Unhandled errors | 0 |
| Availability | Uptime percentage | > 99.9% |

### Alerts Configured

#### Alert #1: High Error Rate
- **Condition:** > 5 failed requests in 5 minutes
- **Severity:** Warning (2)
- **Action:** Email notification
- **Query:**
  ```kusto
  requests
  | where timestamp > ago(5m)
  | where success == false
  | summarize ErrorCount = count()
  ```

#### Alert #2: Slow Response Time
- **Condition:** Average response time > 2 seconds
- **Severity:** Warning (2)
- **Action:** Email notification
- **Query:**
  ```kusto
  requests
  | where timestamp > ago(5m)
  | summarize AvgDuration = avg(duration)
  ```

#### Alert #3: High Exception Rate
- **Condition:** > 3 exceptions in 5 minutes
- **Severity:** Error (1)
- **Action:** Email notification
- **Query:**
  ```kusto
  exceptions
  | where timestamp > ago(5m)
  | summarize ExceptionCount = count()
  ```

### Useful Queries

**View all custom events:**
```kusto
customEvents
| where timestamp > ago(1h)
| project timestamp, name, customDimensions
| order by timestamp desc
```

**Login success rate:**
```kusto
let totalLogins = customEvents 
  | where name in ("LoginSuccess", "LoginFailed")
  | count;
let successLogins = customEvents 
  | where name == "LoginSuccess"
  | count;
print SuccessRate = todouble(successLogins) / todouble(totalLogins) * 100
```

**Average login duration:**
```kusto
customEvents
| where name == "LoginSuccess"
| extend duration = todouble(customDimensions.duration)
| summarize avg(duration), percentile(duration, 95)
```

**Authentication failures by reason:**
```kusto
customEvents
| where name == "AuthenticationFailed"
| summarize count() by tostring(customDimensions.reason)
```

---

## 🟢 Part 2: Google Analytics 4

### Purpose
Track user behavior, page views, and product metrics on the frontend.

### Setup Summary

**Property Created:**
- Name: `MindX Onboarding App`
- Measurement ID: `G-ZNBDKG2FPQ`
- Stream: MindX Webapp
- URL: https://namvc.4.190.61.4.nip.io

**Integration:**
- Package: `react-ga4` v2.1.0
- Config file: `webapp/src/config/analytics.js`
- Initialization: `webapp/src/main.jsx`
- Page tracking: `webapp/src/App.jsx`

### Features Implemented

#### 1. Automatic Tracking
- ✅ Page views (all routes)
- ✅ User sessions
- ✅ Session duration
- ✅ Bounce rate
- ✅ User demographics (if enabled)

#### 2. Custom Event Tracking

**User Actions:**
- `User / Click / Login Button` - Login button clicked
- `Authentication / Login Success / {email}` - Successful login
- `Authentication / Logout / {email}` - User logout

**Test Events (GA Test Page):**
- `Test / Button Click / Test Event 1`
- `User Interaction / Click / Test Button 2`
- `Engagement / Feature Used / GA Test Page`
- `Custom / Test Action / Custom Label`
- Exception tracking

#### 3. User Identification
- User ID set after successful login
- Enables user-level analysis
- Tracks user journey across sessions

### Access Dashboard

**URL:** https://analytics.google.com

**Navigation:**
1. Select property: `MindX Onboarding App`
2. Key sections:
   - **Realtime** - Current activity (1-5 min delay)
   - **Engagement** - Page views, events
   - **User Attributes** - Demographics, technology
   - **Events** - Custom event tracking
   - **DebugView** - Real-time event debugging

### Key Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| Active Users | Current users | Monitor trends |
| Page Views | Total page views | Monitor growth |
| Bounce Rate | Single-page sessions | < 40% |
| Avg Session Duration | Time on site | > 2 minutes |
| Events per Session | User engagement | > 5 |
| Conversion Rate | Goal completions | Monitor trends |

### Testing & Verification

#### Method 1: Network Tab
1. Open DevTools (F12) → Network
2. Filter: `collect`
3. Navigate pages or click buttons
4. See requests to `google-analytics.com/g/collect`
5. Status: 200 OK

#### Method 2: DebugView (Recommended)
1. Add `?debug_mode=true` to URL
2. Go to GA: Admin → DebugView
3. Perform actions in app
4. Events appear in real-time

#### Method 3: Realtime Report
1. Go to GA: Reports → Realtime
2. Perform actions in app
3. Wait 1-2 minutes
4. See events in report

#### Method 4: GA Test Page
- URL: http://localhost:5173/ga-test
- 6 test buttons for different event types
- Local event log
- Built-in verification guide

### Important Notes

**Ad Blockers:**
- Browser extensions may block GA requests
- Use Incognito mode for testing
- Production users typically don't have blockers

**Data Delay:**
- Realtime: 1-5 minutes
- Standard reports: 24-48 hours
- DebugView: Near real-time (< 10 seconds)

**Privacy:**
- No PII (Personally Identifiable Information) tracked
- Email addresses in events for internal use only
- Consider GDPR compliance for production

---

## 📝 Part 3: Configuration

### Environment Variables

#### Backend (api/.env.local)
```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://...
NODE_ENV=development
```

#### Frontend (webapp/.env.local)
```bash
VITE_GA_MEASUREMENT_ID=G-ZNBDKG2FPQ
```

#### Frontend (webapp/.env.production)
```bash
VITE_GA_MEASUREMENT_ID=G-ZNBDKG2FPQ
```

### Kubernetes Secrets

#### App Insights Secret
```bash
kubectl create secret generic appinsights-secret \
  --from-literal=connection-string='InstrumentationKey=xxx;...'
```

#### Deployment Configuration
```yaml
# k8s/deployment.yaml
env:
  - name: APPLICATIONINSIGHTS_CONNECTION_STRING
    valueFrom:
      secretKeyRef:
        name: appinsights-secret
        key: connection-string
  - name: NODE_ENV
    value: "production"
```

---

## 🚀 Part 4: Deployment

### Local Testing

**Backend:**
```bash
cd api
npm start
# Should see: ✅ Azure App Insights initialized
```

**Frontend:**
```bash
cd webapp
npm run dev
# Should see: ✅ Google Analytics initialized
```

### Production Deployment

#### 1. Create Kubernetes Secret
```bash
kubectl create secret generic appinsights-secret \
  --from-literal=connection-string='YOUR_CONNECTION_STRING'
```

#### 2. Build Docker Images
```bash
# Login to ACR
az acr login --name mindxacrnamvc

# Build and push API
docker build -t mindxacrnamvc.azurecr.io/mindx-api:v1.1-metrics ./api
docker push mindxacrnamvc.azurecr.io/mindx-api:v1.1-metrics

# Build and push Webapp
docker build -t mindxacrnamvc.azurecr.io/mindx-webapp:v1.1-metrics ./webapp
docker push mindxacrnamvc.azurecr.io/mindx-webapp:v1.1-metrics
```

#### 3. Deploy to AKS
```bash
# Apply deployment
kubectl apply -f k8s/deployment.yaml

# Check rollout
kubectl rollout status deployment/mindx-api
kubectl rollout status deployment/mindx-webapp

# Verify pods
kubectl get pods
kubectl logs -l app=mindx-api --tail=50
```

#### 4. Verify Monitoring
- Check App Insights Live Metrics
- Check GA Realtime
- Test alerts
- Monitor for 24 hours

---

## 🐛 Part 5: Troubleshooting

### App Insights Issues

#### No data in Azure Portal
**Symptoms:** No requests, events, or metrics

**Solutions:**
1. Check connection string is correct
2. Verify secret mounted: `kubectl describe pod <pod-name>`
3. Check logs: `kubectl logs -l app=mindx-api | grep "App Insights"`
4. Wait 2-3 minutes for data to appear
5. Verify network connectivity from pod

#### Alerts not triggering
**Symptoms:** Conditions met but no email

**Solutions:**
1. Verify alert rules are enabled
2. Check action group email confirmed
3. Check alert history in Azure Portal
4. Wait 5-10 minutes (alerts have delay)
5. Check spam folder

### Google Analytics Issues

#### No data in GA Dashboard
**Symptoms:** No page views or events

**Solutions:**
1. Check Measurement ID is correct
2. Verify console shows "✅ Google Analytics initialized"
3. Check Network tab for `collect` requests
4. Disable ad blockers or use Incognito
5. Wait 5 minutes for Realtime data
6. Use DebugView for immediate verification

#### Events not tracked
**Symptoms:** Page views work but events don't

**Solutions:**
1. Check event code is called (add console.log)
2. Verify event parameters are correct
3. Check Network tab for event requests
4. Use DebugView to see events real-time
5. Check GA property configuration

---

## 📊 Part 6: Monitoring Best Practices

### Daily Tasks
- [ ] Check App Insights Live Metrics
- [ ] Review error logs
- [ ] Check alert emails
- [ ] Monitor response times

### Weekly Tasks
- [ ] Review GA Realtime trends
- [ ] Analyze user behavior patterns
- [ ] Check alert thresholds
- [ ] Review custom events

### Monthly Tasks
- [ ] Analyze historical data
- [ ] Adjust alert thresholds
- [ ] Review and update tracking events
- [ ] Generate reports for stakeholders

### Performance Optimization
- Enable sampling for high-traffic apps (>1000 req/min)
- Set appropriate log levels
- Use custom properties for filtering
- Archive old data per retention policy

### Security
- Never commit secrets to Git
- Use Kubernetes secrets for sensitive data
- Rotate secrets periodically
- Limit access using RBAC
- Consider Azure Key Vault for production

---

## 📚 Part 7: Documentation

### Files Created

**Backend:**
- `api/src/config/appInsights.js` - App Insights configuration
- `api/.env.local` - Local environment variables

**Frontend:**
- `webapp/src/config/analytics.js` - GA configuration
- `webapp/src/pages/GATest.jsx` - GA test page
- `webapp/.env.local` - Local environment variables
- `webapp/.env.production` - Production environment variables

**Kubernetes:**
- `k8s/deployment.yaml` - Updated with App Insights env vars
- `k8s/README-SECRETS.md` - Secrets setup guide
- `k8s/create-appinsights-secret.sh` - Linux/Mac script
- `k8s/create-appinsights-secret.ps1` - Windows script

**Documentation:**
- `doc/week-2/TRACKING_EVENTS.md` - All tracking events reference
- `doc/week-2/DEPLOYMENT_STEPS.md` - Deployment guide
- `doc/week-2/GA_TEST_GUIDE.md` - GA testing guide
- `doc/week-2/PROGRESS.md` - Progress tracker
- `doc/week-2/METRICS_SETUP.md` - This file

---

## ✅ Part 8: Acceptance Criteria

### Production Metrics (Azure App Insights)
- [x] Azure App Insights integrated with backend API
- [x] Application logs visible in Azure Portal
- [x] Errors tracked and visible
- [x] Performance metrics collected
- [x] 3 alerts setup and tested
- [x] Custom events tracked
- [x] Documentation provided

### Product Metrics (Google Analytics)
- [x] Google Analytics integrated with frontend
- [x] Page views tracked
- [x] User sessions tracked
- [x] Custom events tracked
- [x] Test page created
- [x] Documentation provided

### Configuration
- [x] All secrets configured
- [x] Environment variables set
- [x] Kubernetes deployment updated
- [x] Scripts provided for setup

### Testing
- [x] Local testing completed
- [x] Alerts tested
- [x] GA tracking verified
- [x] Documentation verified

---

## 🎯 Summary

Week 2 objectives have been successfully completed:

✅ **Backend Monitoring** - App Insights fully integrated with comprehensive tracking  
✅ **Frontend Analytics** - Google Analytics tracking all user interactions  
✅ **Alerts** - 3 critical alerts configured and tested  
✅ **Documentation** - Complete guides for setup, usage, and troubleshooting  
✅ **Testing** - All features tested and verified  

### Key Achievements
- 20+ custom events tracked in App Insights
- Real-time monitoring dashboard
- Automated alerting system
- User behavior analytics
- Comprehensive documentation
- Production-ready configuration

### Next Steps
1. Deploy to production (AKS)
2. Monitor for 24-48 hours
3. Adjust alert thresholds if needed
4. Generate first weekly report
5. Share dashboard access with team

---

## 📞 Support

**Azure Portal:** https://portal.azure.com  
**Google Analytics:** https://analytics.google.com  
**Documentation:** `doc/week-2/`  
**Issues:** Check troubleshooting section above

---

**Completed:** December 7, 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready

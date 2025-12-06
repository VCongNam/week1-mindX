# Week 2 Implementation Checklist

Use this checklist to track your Week 2 implementation progress.

---

## 📋 Pre-requisites

- [ ] Week 1 completed
- [ ] App running locally
- [ ] Azure account access
- [ ] Google account access

---

## 🔵 Azure App Insights Setup

### Resource Creation
- [ ] Logged into Azure Portal
- [ ] Created App Insights resource
- [ ] Named: `mindx-api-insights`
- [ ] Region: Southeast Asia
- [ ] Copied Connection String

### Code Integration
- [ ] Package installed: `applicationinsights`
- [ ] Created: `api/src/config/appInsights.js`
- [ ] Updated: `api/src/index.js`
- [ ] Added tracking to endpoints
- [ ] Added custom events

### Configuration
- [ ] Added connection string to `api/.env.local`
- [ ] Verified dotenv loads first
- [ ] Tested locally
- [ ] Console shows: "✅ Azure App Insights initialized"

### Verification
- [ ] Data visible in Azure Portal
- [ ] Live Metrics working
- [ ] Custom events in Logs
- [ ] Failures tracked
- [ ] Performance metrics collected

---

## 🚨 Alerts Setup

### Action Group
- [ ] Created Action Group
- [ ] Named: `mindx-alerts-email`
- [ ] Added email address
- [ ] Confirmed email subscription

### Alert Rules
- [ ] Alert #1: High Error Rate
  - [ ] Query created
  - [ ] Threshold: > 5
  - [ ] Frequency: 1 minute
  - [ ] Action group linked
  - [ ] Enabled

- [ ] Alert #2: Slow Response Time
  - [ ] Query created
  - [ ] Threshold: > 2000ms
  - [ ] Frequency: 1 minute
  - [ ] Action group linked
  - [ ] Enabled

- [ ] Alert #3: High Exception Rate
  - [ ] Query created
  - [ ] Threshold: > 3
  - [ ] Frequency: 1 minute
  - [ ] Action group linked
  - [ ] Enabled

### Testing
- [ ] Test endpoints created
- [ ] Alert #1 tested
- [ ] Alert #2 tested
- [ ] Alert #3 tested
- [ ] Email notifications received

---

## 🟢 Google Analytics Setup

### Property Creation
- [ ] Logged into analytics.google.com
- [ ] Created GA4 property
- [ ] Named: `MindX Onboarding App`
- [ ] Created Web stream
- [ ] Copied Measurement ID

### Code Integration
- [ ] Package installed: `react-ga4`
- [ ] Created: `webapp/src/config/analytics.js`
- [ ] Updated: `webapp/src/main.jsx`
- [ ] Updated: `webapp/src/App.jsx`
- [ ] Added event tracking

### Configuration
- [ ] Added Measurement ID to `webapp/.env.local`
- [ ] Added Measurement ID to `webapp/.env.production`
- [ ] Tested locally
- [ ] Console shows: "✅ Google Analytics initialized"

### Test Page
- [ ] Created: `webapp/src/pages/GATest.jsx`
- [ ] Added route: `/ga-test`
- [ ] Added to navigation menu
- [ ] 6 test buttons working
- [ ] Event log displaying

### Verification
- [ ] Network tab shows `collect` requests
- [ ] GA Realtime shows data (Incognito mode)
- [ ] Page views tracked
- [ ] Custom events tracked
- [ ] Test page functional

---

## 📝 Documentation

### Created Files
- [ ] `doc/week-2/README.md`
- [ ] `doc/week-2/METRICS_SETUP.md`
- [ ] `doc/week-2/QUICK_START.md`
- [ ] `doc/week-2/CHECKLIST.md` (this file)
- [ ] `doc/week-2/COMPLETION_SUMMARY.md`
- [ ] `doc/week-2/overview.md` (updated)

### Updated Files
- [ ] `README.md` (root)
- [ ] `k8s/deployment.yaml`
- [ ] `k8s/README-SECRETS.md`

### Scripts Created
- [ ] `k8s/create-appinsights-secret.sh`
- [ ] `k8s/create-appinsights-secret.ps1`

---

## ⚙️ Kubernetes Configuration

### Secrets
- [ ] Documented secret creation
- [ ] Created scripts for secret creation
- [ ] Tested secret creation locally

### Deployment
- [ ] Updated `k8s/deployment.yaml`
- [ ] Added App Insights env var
- [ ] Added NODE_ENV
- [ ] Verified configuration

---

## 🧪 Testing

### Local Testing
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] App Insights initialized
- [ ] GA initialized
- [ ] Test endpoints work
- [ ] GA test page works

### Integration Testing
- [ ] API calls tracked
- [ ] Page views tracked
- [ ] Custom events tracked
- [ ] Errors tracked
- [ ] Alerts triggered

### Verification
- [ ] Azure Portal shows data
- [ ] GA Dashboard shows data
- [ ] Alerts working
- [ ] Email notifications received

---

## 🚀 Deployment (Optional)

### Pre-deployment
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Configuration verified
- [ ] Secrets documented

### Kubernetes
- [ ] Created App Insights secret
- [ ] Built Docker images
- [ ] Pushed to ACR
- [ ] Applied deployment
- [ ] Verified pods running

### Post-deployment
- [ ] Production data flowing
- [ ] Alerts working in production
- [ ] GA tracking production traffic
- [ ] Monitoring for 24 hours

---

## 📊 Final Verification

### Acceptance Criteria
- [ ] App Insights integrated with backend
- [ ] Logs/errors/performance visible
- [ ] Alerts setup and tested
- [ ] Google Analytics integrated
- [ ] Key metrics tracked
- [ ] Documentation provided
- [ ] Configuration committed

### Quality Checks
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Code committed
- [ ] Ready for review

---

## ✅ Completion

- [ ] All checkboxes above checked
- [ ] Week 2 objectives met
- [ ] Acceptance criteria satisfied
- [ ] Documentation complete
- [ ] Code committed and pushed
- [ ] Ready for Week 3

---

**Progress:** ___/100 items completed  
**Status:** ⏳ In Progress / ✅ Complete  
**Date:** ___________

---

## 📞 Need Help?

If stuck on any item:
1. Check [QUICK_START.md](QUICK_START.md)
2. Review [METRICS_SETUP.md](METRICS_SETUP.md)
3. Check troubleshooting sections
4. Review code examples

---

**Good luck with Week 2!** 🚀

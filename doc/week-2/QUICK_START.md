# Week 2 Quick Start Guide

**Time to complete:** 30 minutes  
**Prerequisites:** Week 1 completed

---

## 🚀 Quick Setup

### Step 1: Azure App Insights (10 min)

1. **Create resource:**
   - Go to Azure Portal
   - Create App Insights: `mindx-api-insights`
   - Copy Connection String

2. **Add to code:**
   ```bash
   cd api
   # Already installed: applicationinsights
   # Already created: src/config/appInsights.js
   # Already integrated: src/index.js
   ```

3. **Configure:**
   ```bash
   # Add to api/.env.local
   APPLICATIONINSIGHTS_CONNECTION_STRING=your-connection-string
   ```

4. **Test:**
   ```bash
   npm start
   # Should see: ✅ Azure App Insights initialized
   ```

---

### Step 2: Setup Alerts (10 min)

1. **Create Action Group:**
   - Azure Portal → Alerts → Action groups
   - Name: `mindx-alerts-email`
   - Add your email

2. **Create 3 Alerts:**
   - Go to App Insights → Logs
   - Use these queries:

**Alert #1: High Error Rate**
```kusto
requests
| where timestamp > ago(5m)
| where success == false
| summarize ErrorCount = count()
```
- Threshold: > 5
- Click "New alert rule"

**Alert #2: Slow Response**
```kusto
requests
| where timestamp > ago(5m)
| summarize AvgDuration = avg(duration)
```
- Threshold: > 2000

**Alert #3: High Exceptions**
```kusto
exceptions
| where timestamp > ago(5m)
| summarize ExceptionCount = count()
```
- Threshold: > 3

---

### Step 3: Google Analytics (10 min)

1. **Create GA4 property:**
   - Go to analytics.google.com
   - Create property: `MindX Onboarding App`
   - Create Web stream
   - Copy Measurement ID: `G-XXXXXXXXXX`

2. **Add to code:**
   ```bash
   cd webapp
   # Already installed: react-ga4
   # Already created: src/config/analytics.js
   # Already integrated: src/main.jsx, src/App.jsx
   ```

3. **Configure:**
   ```bash
   # Add to webapp/.env.local
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Add to webapp/.env.production
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. **Test:**
   ```bash
   npm run dev
   # Open: http://localhost:5173/ga-test
   # Click buttons and check Network tab
   ```

---

## ✅ Verification

### App Insights
- [ ] Console shows: "✅ Azure App Insights initialized"
- [ ] Azure Portal shows Live Metrics
- [ ] Custom events visible in Logs
- [ ] 3 alerts created and enabled

### Google Analytics
- [ ] Console shows: "✅ Google Analytics initialized"
- [ ] Network tab shows `collect` requests
- [ ] GA Realtime shows active users
- [ ] Test page works: `/ga-test`

---

## 🎯 What's Tracked

### Backend (App Insights)
- All HTTP requests
- Response times
- Errors and exceptions
- Login/logout events
- Authentication events
- User activity

### Frontend (GA)
- Page views (all routes)
- User sessions
- Login button clicks
- Authentication success/failure
- Logout events

---

## 📊 Access Dashboards

**App Insights:**
- URL: https://portal.azure.com
- Resource: `mindx-api-insights`
- View: Live Metrics, Failures, Performance, Logs

**Google Analytics:**
- URL: https://analytics.google.com
- Property: `MindX Onboarding App`
- View: Realtime, Engagement, Events

---

## 🐛 Common Issues

### App Insights not working
- Check connection string is correct
- Verify dotenv loaded before App Insights
- Wait 2-3 minutes for data

### GA not tracking
- Disable ad blockers
- Use Incognito mode
- Check Measurement ID
- Wait 1-2 minutes

---

## 📚 Full Documentation

For detailed guides, see:
- [Complete Setup](METRICS_SETUP.md)
- [All Events](TRACKING_EVENTS.md)
- [Deployment](DEPLOYMENT_STEPS.md)
- [GA Testing](GA_TEST_GUIDE.md)

---

**Time saved:** 2+ hours with this quick start!  
**Status:** ✅ Ready to use

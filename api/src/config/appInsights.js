const appInsights = require('applicationinsights');

function setupAppInsights() {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  
  if (!connectionString) {
    console.warn('⚠️  App Insights connection string not found. Monitoring disabled.');
    return;
  }

  try {
    appInsights
      .setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();

    console.log('✅ Azure App Insights initialized');
    
    // Set cloud role name for better identification
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'mindx-api';
    
  } catch (error) {
    console.error('❌ Failed to initialize App Insights:', error.message);
  }
}

// Helper functions for custom tracking
function trackEvent(name, properties = {}) {
  if (appInsights.defaultClient) {
    appInsights.defaultClient.trackEvent({
      name,
      properties: {
        ...properties,
        timestamp: new Date().toISOString()
      }
    });
  }
}

function trackMetric(name, value, properties = {}) {
  if (appInsights.defaultClient) {
    appInsights.defaultClient.trackMetric({
      name,
      value,
      properties
    });
  }
}

function trackException(error, properties = {}) {
  if (appInsights.defaultClient) {
    appInsights.defaultClient.trackException({
      exception: error,
      properties
    });
  }
}

module.exports = {
  setupAppInsights,
  trackEvent,
  trackMetric,
  trackException
};

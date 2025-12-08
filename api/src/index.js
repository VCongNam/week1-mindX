// ⚠️ PHẢI LOAD DOTENV TRƯỚC để có environment variables
require('dotenv').config();

// SAU ĐÓ MỚI setup App Insights
const { setupAppInsights, trackEvent, trackException } = require('./config/appInsights');
setupAppInsights();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Environment variables
const {
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  OIDC_ISSUER,
  JWT_SECRET,
  OIDC_REDIRECT_URI
} = process.env;

// Fallback to old env var names for compatibility
const CLIENT_ID = OIDC_CLIENT_ID || process.env.CLIENT_ID;
const CLIENT_SECRET = OIDC_CLIENT_SECRET || process.env.CLIENT_SECRET;
const OPENID_PROVIDER = OIDC_ISSUER || process.env.OPENID_PROVIDER;
const REDIRECT_URI = OIDC_REDIRECT_URI || process.env.REDIRECT_URI;

// Middleware
// Parse CORS_ORIGIN - support comma-separated multiple origins
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://4.190.61.4'];

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  ...corsOrigins
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    trackEvent('AuthenticationFailed', { 
      reason: 'MissingToken',
      endpoint: req.path,
      method: req.method
    });
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      trackEvent('AuthenticationFailed', { 
        reason: err.name === 'TokenExpiredError' ? 'ExpiredToken' : 'InvalidToken',
        endpoint: req.path,
        method: req.method,
        errorMessage: err.message
      });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    trackEvent('AuthenticationSuccess', { 
      userId: user.sub,
      email: user.email,
      endpoint: req.path,
      method: req.method
    });
    
    req.user = user;
    next();
  });
};

// Health check endpoint (both /health and /api/health)
app.get('/health', (req, res) => {
  trackEvent('HealthCheck', { endpoint: '/health' });
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  trackEvent('HealthCheck', { endpoint: '/api/health' });
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Hello world endpoint
app.get('/api/hello', (req, res) => {
  trackEvent('HelloEndpoint', { 
    endpoint: '/api/hello',
    userAgent: req.headers['user-agent']
  });
  res.json({
    message: 'Hello from MindX API!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============ AUTHENTICATION ENDPOINTS ============

// 1. Login endpoint - Generate authorization URL
app.get('/api/auth/login', async (req, res) => {
  const startTime = Date.now();
  
  try {
    trackEvent('LoginAttempt', { 
      method: 'OIDC',
      provider: OPENID_PROVIDER,
      userAgent: req.headers['user-agent']
    });

    // Discover OIDC endpoints
    const discoveryResponse = await axios.get(`${OPENID_PROVIDER}/.well-known/openid-configuration`);
    const { authorization_endpoint } = discoveryResponse.data;

    // Use configured redirect URI (from env var)
    const redirectUri = REDIRECT_URI;

    const state = Math.random().toString(36).substring(7);
    const authUrl = `${authorization_endpoint}?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid profile email&` +
      `state=${state}`;

    trackEvent('LoginURLGenerated', { 
      duration: Date.now() - startTime,
      provider: OPENID_PROVIDER
    });

    res.json({ authUrl, state });
  } catch (error) {
    console.error('OIDC discovery error:', error.message);
    
    trackException(error, { 
      endpoint: '/api/auth/login',
      provider: OPENID_PROVIDER,
      errorType: 'OIDCDiscoveryError'
    });
    
    res.status(500).json({ error: 'Failed to get authorization URL' });
  }
});

// 2. Callback endpoint - Exchange code for token
app.post('/api/auth/callback', async (req, res) => {
  const startTime = Date.now();
  const { code } = req.body;

  if (!code) {
    trackEvent('LoginFailed', { 
      reason: 'MissingAuthCode',
      endpoint: '/api/auth/callback'
    });
    return res.status(400).json({ error: 'Authorization code required' });
  }

  try {
    trackEvent('TokenExchangeStarted', { 
      provider: OPENID_PROVIDER 
    });

    // Discover OIDC endpoints
    const discoveryResponse = await axios.get(`${OPENID_PROVIDER}/.well-known/openid-configuration`);
    const { token_endpoint, userinfo_endpoint } = discoveryResponse.data;

    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      token_endpoint,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    // Decode id_token to get user info (without verification for simplicity)
    const idTokenPayload = JSON.parse(
      Buffer.from(id_token.split('.')[1], 'base64').toString()
    );

    // Get user info from userinfo endpoint
    let userInfo;
    try {
      const userInfoResponse = await axios.get(
        userinfo_endpoint,
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      );
      userInfo = userInfoResponse.data;
    } catch (error) {
      // Fallback to id_token claims if userinfo endpoint fails
      trackEvent('UserinfoFallback', { 
        reason: error.message,
        usedIdToken: true
      });
      
      userInfo = {
        sub: idTokenPayload.sub,
        email: idTokenPayload.email,
        name: idTokenPayload.name || idTokenPayload.email
      };
    }

    // Create our own JWT token
    const jwtToken = jwt.sign(
      {
        sub: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Track successful login
    trackEvent('LoginSuccess', { 
      userId: userInfo.sub,
      email: userInfo.email,
      provider: OPENID_PROVIDER,
      duration: Date.now() - startTime,
      hasName: !!userInfo.name
    });

    res.json({
      access_token: jwtToken,
      token_type: 'Bearer',
      user: {
        sub: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name
      }
    });

  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    
    trackException(error, { 
      endpoint: '/api/auth/callback',
      provider: OPENID_PROVIDER,
      errorType: 'TokenExchangeError',
      errorDetails: error.response?.data || error.message,
      duration: Date.now() - startTime
    });
    
    trackEvent('LoginFailed', { 
      reason: 'TokenExchangeError',
      errorMessage: error.message,
      provider: OPENID_PROVIDER
    });
    
    res.status(500).json({
      error: 'Failed to exchange authorization code',
      details: error.response?.data || error.message
    });
  }
});

// 3. Get current user info (protected endpoint)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  trackEvent('UserInfoRequest', { 
    userId: req.user.sub,
    email: req.user.email,
    endpoint: '/api/auth/me'
  });
  
  res.json({
    user: {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name
    }
  });
});

// 4. Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  // Try to get user info from token for tracking
  let userId = 'unknown';
  let userEmail = 'unknown';
  
  if (token) {
    try {
      const decoded = jwt.decode(token);
      userId = decoded?.sub || 'unknown';
      userEmail = decoded?.email || 'unknown';
    } catch (err) {
      // Ignore decode errors
    }
  }
  
  try {
    trackEvent('LogoutAttempt', { 
      userId,
      email: userEmail,
      provider: OPENID_PROVIDER
    });

    // Discover OIDC endpoints
    const discoveryResponse = await axios.get(`${OPENID_PROVIDER}/.well-known/openid-configuration`);
    const { end_session_endpoint } = discoveryResponse.data;

    // Return logout URL for client-side redirect
    const logoutUrl = end_session_endpoint 
      ? `${end_session_endpoint}?post_logout_redirect_uri=${encodeURIComponent(REDIRECT_URI.replace('/callback', ''))}`
      : null;

    trackEvent('LogoutSuccess', { 
      userId,
      email: userEmail,
      hasLogoutUrl: !!logoutUrl
    });

    res.json({ 
      message: 'Logged out successfully',
      logoutUrl 
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    
    trackException(error, { 
      endpoint: '/api/auth/logout',
      userId,
      errorType: 'LogoutError'
    });
    
    res.json({ message: 'Logged out successfully' });
  }
});

// Protected example endpoint
app.get('/api/protected', authenticateToken, (req, res) => {
  trackEvent('ProtectedEndpointAccess', { 
    userId: req.user.sub,
    email: req.user.email,
    endpoint: '/api/protected'
  });
  
  res.json({
    message: 'This is a protected endpoint',
    user: req.user
  });
});

// Root endpoint
app.get('/', (req, res) => {
  trackEvent('RootEndpointAccess', { 
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer'] || 'direct'
  });
  
  res.json({
    name: 'MindX Onboarding API',
    version: '1.0.0',
    endpoints: [
      { path: '/health', method: 'GET', description: 'Health check' },
      { path: '/api/hello', method: 'GET', description: 'Hello world' },
      { path: '/api/auth/login', method: 'GET', description: 'Get authorization URL' },
      { path: '/api/auth/callback', method: 'POST', description: 'Exchange code for token' },
      { path: '/api/auth/me', method: 'GET', description: 'Get current user (protected)' },
      { path: '/api/auth/logout', method: 'POST', description: 'Logout' },
      { path: '/api/protected', method: 'GET', description: 'Protected endpoint example' }
    ]
  });
});

// ============ TEST ENDPOINTS (for testing App Insights alerts) ============
// Remove these in production or protect them

app.get('/api/test/error', (req, res) => {
  trackEvent('TestErrorTriggered', { 
    endpoint: '/api/test/error',
    intentional: true
  });
  
  const error = new Error('Test error for App Insights alert');
  trackException(error, { 
    endpoint: '/api/test/error',
    testType: 'IntentionalError'
  });
  
  throw error;
});

app.get('/api/test/slow', async (req, res) => {
  const delay = parseInt(req.query.delay) || 3000;
  
  trackEvent('TestSlowResponse', { 
    endpoint: '/api/test/slow',
    delay,
    intentional: true
  });
  
  // Simulate slow response
  await new Promise(resolve => setTimeout(resolve, delay));
  
  res.json({ 
    message: 'Slow response test completed',
    delay: `${delay}ms`
  });
});

app.get('/api/test/exception', (req, res) => {
  trackEvent('TestExceptionTriggered', { 
    endpoint: '/api/test/exception',
    intentional: true
  });
  
  try {
    // Simulate an exception
    const data = null;
    data.someProperty.nestedProperty; // This will throw
  } catch (error) {
    trackException(error, { 
      endpoint: '/api/test/exception',
      testType: 'NullReferenceError'
    });
    
    res.status(500).json({ 
      error: 'Exception occurred',
      message: error.message 
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  trackException(err, { 
    endpoint: req.path,
    method: req.method,
    errorType: 'UnhandledError',
    statusCode: err.status || 500
  });
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/hello`);
  console.log(`Auth login: http://localhost:${PORT}/api/auth/login`);
  console.log('\nOpenID Configuration:');
  console.log(`- Provider: ${OPENID_PROVIDER}`);
  console.log(`- Client ID: ${CLIENT_ID}`);
  console.log(`- Redirect URI: ${REDIRECT_URI}`);
  
  // Track server startup
  trackEvent('ServerStarted', { 
    port: PORT,
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development',
    provider: OPENID_PROVIDER
  });
});

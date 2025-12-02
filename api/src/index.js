require('dotenv').config();
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
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint (both /health and /api/health)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Hello world endpoint
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from MindX API!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============ AUTHENTICATION ENDPOINTS ============

// 1. Login endpoint - Generate authorization URL
app.get('/api/auth/login', async (req, res) => {
  try {
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

    res.json({ authUrl, state });
  } catch (error) {
    console.error('OIDC discovery error:', error.message);
    res.status(500).json({ error: 'Failed to get authorization URL' });
  }
});

// 2. Callback endpoint - Exchange code for token
app.post('/api/auth/callback', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }

  try {
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
    res.status(500).json({
      error: 'Failed to exchange authorization code',
      details: error.response?.data || error.message
    });
  }
});

// 3. Get current user info (protected endpoint)
app.get('/api/auth/me', authenticateToken, (req, res) => {
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
  try {
    // Discover OIDC endpoints
    const discoveryResponse = await axios.get(`${OPENID_PROVIDER}/.well-known/openid-configuration`);
    const { end_session_endpoint } = discoveryResponse.data;

    // Return logout URL for client-side redirect
    const logoutUrl = end_session_endpoint 
      ? `${end_session_endpoint}?post_logout_redirect_uri=${encodeURIComponent(REDIRECT_URI.replace('/callback', ''))}`
      : null;

    res.json({ 
      message: 'Logged out successfully',
      logoutUrl 
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.json({ message: 'Logged out successfully' });
  }
});

// Protected example endpoint
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected endpoint',
    user: req.user
  });
});

// Root endpoint
app.get('/', (req, res) => {
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
});

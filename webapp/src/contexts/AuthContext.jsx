import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode(storedToken)
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } else {
          // Token expired, clear storage
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = () => {
    const clientId = import.meta.env.VITE_OIDC_CLIENT_ID
    const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI
    const issuer = import.meta.env.VITE_OIDC_ISSUER
    const scope = import.meta.env.VITE_OIDC_SCOPE || 'openid profile email'

    // Build authorization URL
    const authUrl = `${issuer}/auth?` + new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      state: Math.random().toString(36).substring(7) // Random state for security
    })

    // Redirect to OpenID provider
    window.location.href = authUrl
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    
    // Optional: Redirect to OpenID provider logout
    // const issuer = import.meta.env.VITE_OIDC_ISSUER
    // window.location.href = `${issuer}/logout`
  }

  const setAuthData = (accessToken, userData) => {
    setToken(accessToken)
    setUser(userData)
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const isAuthenticated = !!user && !!token

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    setAuthData
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

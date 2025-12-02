import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spin, Result, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const Callback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuthData } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        setError(`Authentication error: ${error}`)
        setLoading(false)
        return
      }

      if (!code) {
        setError('No authorization code received')
        setLoading(false)
        return
      }

      // Validate state parameter
      const storedState = sessionStorage.getItem('oauth_state')
      if (state && storedState && state !== storedState) {
        setError('Invalid state parameter - possible CSRF attack')
        setLoading(false)
        return
      }

      // Clear state after validation
      sessionStorage.removeItem('oauth_state')

      try {
        // Exchange code for tokens via backend
        const apiUrl = import.meta.env.VITE_API_URL || '/api'
        const response = await fetch(`${apiUrl}/auth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to exchange authorization code')
        }

        const data = await response.json()
        
        // Store tokens and user info
        setAuthData(data.access_token, data.user)

        // Redirect to home
        navigate('/', { replace: true })
      } catch (err) {
        console.error('Callback error:', err)
        setError(err.message || 'Authentication failed')
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, navigate, setAuthData])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <div style={{ fontSize: '18px', color: '#666' }}>
          Authenticating...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Result
          status="error"
          title="Authentication Failed"
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          }
        />
      </div>
    )
  }

  return null
}

export default Callback

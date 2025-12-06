import { Card, Button, Typography, Space } from 'antd'
import { LoginOutlined, RocketOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { logEvent } from '../config/analytics'

const { Title, Paragraph } = Typography

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = () => {
    logEvent('User', 'Click', 'Login Button');
    login();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 400, 
          textAlign: 'center',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <RocketOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          
          <div>
            <Title level={2} style={{ marginBottom: '8px' }}>
              Welcome to MindX Onboarding
            </Title>
            <Paragraph type="secondary">
              Please login to continue
            </Paragraph>
          </div>

          <Button 
            type="primary" 
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLogin}
            block
            style={{ height: '48px', fontSize: '16px' }}
          >
            Login with MindX ID
          </Button>

          <Paragraph type="secondary" style={{ fontSize: '12px', margin: 0 }}>
            You will be redirected to MindX authentication service
          </Paragraph>
        </Space>
      </Card>
    </div>
  )
}

export default Login

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Card, Statistic, Row, Col, Typography, Space, Avatar, Dropdown } from 'antd'
import { 
  HomeOutlined, 
  ApiOutlined, 
  UserOutlined, 
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined,
  HeartOutlined,
  RocketOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Header, Content, Footer } = Layout
const { Title, Text, Paragraph } = Typography

function Home() {
  const [apiData, setApiData] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated, login, logout, token } = useAuth()
  const navigate = useNavigate()

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  // Fetch API data with token if authenticated
  const fetchApiHello = async () => {
    setLoading(true)
    try {
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_URL}/hello`, { headers })
      const data = await response.json()
      setApiData(data)
    } catch (err) {
      console.error('Error fetching API:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch health data
  const fetchHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/health`)
      const data = await response.json()
      setHealthData(data)
    } catch (err) {
      console.error('Error fetching health:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto fetch on mount
  useEffect(() => {
    fetchHealth()
    fetchApiHello()
  }, [token])

  // User menu items
  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#001529',
        padding: '0 50px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RocketOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '16px' }} />
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            MindX Onboarding
          </Title>
        </div>

        <Space size="large">
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['home']}
            items={[
              {
                key: 'home',
                icon: <HomeOutlined />,
                label: 'Home',
              },
              {
                key: 'api',
                icon: <ApiOutlined />,
                label: 'API',
              },
            ]}
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none' }}
          />

          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <Text style={{ color: 'white' }}>{user?.name}</Text>
              </Space>
            </Dropdown>
          ) : (
            <Button 
              type="primary" 
              icon={<LoginOutlined />}
              onClick={login}
            >
              Login
            </Button>
          )}
        </Space>
      </Header>

      {/* Content */}
      <Content style={{ padding: '50px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Hero Section */}
          <Card 
            style={{ 
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                🚀 Week 1: Full-stack Application on Azure
              </Title>
              <Paragraph style={{ color: 'white', fontSize: '16px', margin: 0 }}>
                Full-stack Application deployed on Azure Kubernetes Service with React + Node.js + OpenID Authentication
              </Paragraph>
            </Space>
          </Card>

          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="API Status"
                  value={healthData?.status || 'Loading...'}
                  valueStyle={{ color: healthData?.status === 'healthy' ? '#3f8600' : '#cf1322' }}
                  prefix={<HeartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Uptime"
                  value={healthData?.uptime ? Math.floor(healthData.uptime) : 0}
                  suffix="seconds"
                  prefix={<RocketOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="API Version"
                  value={apiData?.version || '1.0.0'}
                  prefix={<ApiOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Auth Status"
                  value={isAuthenticated ? 'Logged In' : 'Guest'}
                  valueStyle={{ color: isAuthenticated ? '#3f8600' : '#666' }}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Content */}
          <Row gutter={[16, 16]}>
            {/* API Health */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <HeartOutlined style={{ color: '#52c41a' }} />
                    <span>API Health Status</span>
                  </Space>
                }
                extra={
                  <Button 
                    type="primary" 
                    size="small"
                    loading={loading}
                    onClick={fetchHealth}
                  >
                    Refresh
                  </Button>
                }
              >
                {healthData ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Status: </Text>
                      <Text type="success">{healthData.status}</Text>
                    </div>
                    <div>
                      <Text strong>Uptime: </Text>
                      <Text>{Math.floor(healthData.uptime)} seconds</Text>
                    </div>
                    <div>
                      <Text strong>Timestamp: </Text>
                      <Text>{new Date(healthData.timestamp).toLocaleString()}</Text>
                    </div>
                  </Space>
                ) : (
                  <Text type="secondary">Loading health data...</Text>
                )}
              </Card>
            </Col>

            {/* API Response */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <ApiOutlined style={{ color: '#1890ff' }} />
                    <span>API Response</span>
                  </Space>
                }
                extra={
                  <Button 
                    type="primary" 
                    size="small"
                    loading={loading}
                    onClick={fetchApiHello}
                  >
                    Call API
                  </Button>
                }
              >
                {apiData ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Message: </Text>
                      <Text>{apiData.message}</Text>
                    </div>
                    <div>
                      <Text strong>Version: </Text>
                      <Text>{apiData.version}</Text>
                    </div>
                    <div>
                      <Text strong>Timestamp: </Text>
                      <Text>{new Date(apiData.timestamp).toLocaleString()}</Text>
                    </div>
                  </Space>
                ) : (
                  <Text type="secondary">Loading API data...</Text>
                )}
              </Card>
            </Col>

            {/* System Info */}
            <Col xs={24}>
              <Card title="System Information">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Text strong>Frontend: </Text>
                    <Text>React + Vite + Ant Design</Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text strong>Backend: </Text>
                    <Text>Node.js + Express</Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text strong>Infrastructure: </Text>
                    <Text>Azure Kubernetes Service (AKS)</Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text strong>Authentication: </Text>
                    <Text>OpenID Connect</Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text strong>Auth Status: </Text>
                    <Text type={isAuthenticated ? 'success' : 'secondary'}>
                      {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                    </Text>
                  </Col>
                  {isAuthenticated && (
                    <Col xs={24} sm={8}>
                      <Text strong>User: </Text>
                      <Text>{user?.name || 'N/A'}</Text>
                    </Col>
                  )}
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <Space direction="vertical">
          <Text>MindX Engineer Onboarding Program - Week 1</Text>
          <Text type="secondary">Deployed on Azure Cloud ☁️</Text>
        </Space>
      </Footer>
    </Layout>
  )
}

export default Home

import { Card, Typography, Space, Avatar, Descriptions, Tag } from 'antd'
import { UserOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Title } = Typography

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Welcome, {user?.name || 'User'}!
                </Title>
                <Tag color="success">Authenticated</Tag>
              </div>
            </div>
          </Space>
        </Card>

        <Card title="User Information">
          <Descriptions column={1}>
            <Descriptions.Item label={<><UserOutlined /> Name</>}>
              {user?.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<><MailOutlined /> Email</>}>
              {user?.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<><SafetyOutlined /> User ID</>}>
              {user?.sub || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Protected Content">
          <Space direction="vertical">
            <Typography.Paragraph>
              This is a protected page. Only authenticated users can see this content.
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary">
              Your authentication token is being sent with every API request to access protected endpoints.
            </Typography.Paragraph>
          </Space>
        </Card>
      </Space>
    </div>
  )
}

export default Dashboard

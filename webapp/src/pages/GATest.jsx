import { Card, Button, Space, Typography, Divider, Tag, Alert } from 'antd'
import { 
  RocketOutlined, 
  ThunderboltOutlined, 
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined
} from '@ant-design/icons'
import { logEvent, logException } from '../config/analytics'
import { useState } from 'react'

const { Title, Paragraph, Text } = Typography

const GATest = () => {
  const [eventLog, setEventLog] = useState([])

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setEventLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10))
  }

  const handleTestEvent1 = () => {
    logEvent('Test', 'Button Click', 'Test Event 1')
    addLog('✅ Event sent: Test / Button Click / Test Event 1')
  }

  const handleTestEvent2 = () => {
    logEvent('User Interaction', 'Click', 'Test Button 2', 100)
    addLog('✅ Event sent: User Interaction / Click / Test Button 2 (value: 100)')
  }

  const handleTestEvent3 = () => {
    logEvent('Engagement', 'Feature Used', 'GA Test Page')
    addLog('✅ Event sent: Engagement / Feature Used / GA Test Page')
  }

  const handleTestException = () => {
    logException('Test exception from GA Test page', false)
    addLog('⚠️ Exception logged: Test exception (non-fatal)')
  }

  const handleMultipleEvents = () => {
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        logEvent('Batch Test', 'Multiple Events', `Event ${i}`)
        addLog(`✅ Batch event ${i}/5 sent`)
      }, i * 500)
    }
  }

  const handleCustomEvent = () => {
    logEvent('Custom', 'Test Action', 'Custom Label', 999)
    addLog('✅ Custom event sent with value: 999')
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '20px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Title level={2}>
              <RocketOutlined /> Google Analytics Test Page
            </Title>
            <Paragraph>
              Click các buttons bên dưới để test GA tracking. 
              Mở <Text code>Network tab</Text> (filter: <Text code>collect</Text>) để xem requests.
            </Paragraph>
            <Alert
              message="Debug Mode"
              description={
                <>
                  Để xem events trong GA DebugView, thêm <Text code>?debug_mode=true</Text> vào URL:
                  <br />
                  <Text code>http://localhost:5173/ga-test?debug_mode=true</Text>
                </>
              }
              type="info"
              showIcon
            />
          </Space>
        </Card>

        <Card 
          title={<><ThunderboltOutlined /> Test Events</>}
          style={{ marginBottom: '20px' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Paragraph>
                <Tag color="blue">Basic Event</Tag>
                Click để gửi event đơn giản
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={handleTestEvent1}
                icon={<CheckCircleOutlined />}
              >
                Test Event 1
              </Button>
            </div>

            <Divider />

            <div>
              <Paragraph>
                <Tag color="green">Event with Value</Tag>
                Event có giá trị số (value: 100)
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={handleTestEvent2}
                icon={<CheckCircleOutlined />}
                style={{ background: '#52c41a' }}
              >
                Test Event 2 (with value)
              </Button>
            </div>

            <Divider />

            <div>
              <Paragraph>
                <Tag color="purple">Engagement Event</Tag>
                Track user engagement
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={handleTestEvent3}
                icon={<FireOutlined />}
                style={{ background: '#722ed1' }}
              >
                Test Event 3 (Engagement)
              </Button>
            </div>

            <Divider />

            <div>
              <Paragraph>
                <Tag color="orange">Exception Tracking</Tag>
                Log một exception (non-fatal)
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={handleTestException}
                icon={<BugOutlined />}
                danger
              >
                Test Exception
              </Button>
            </div>

            <Divider />

            <div>
              <Paragraph>
                <Tag color="cyan">Batch Events</Tag>
                Gửi 5 events liên tiếp (mỗi 0.5s)
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={handleMultipleEvents}
                icon={<ClockCircleOutlined />}
                style={{ background: '#13c2c2' }}
              >
                Test Multiple Events
              </Button>
            </div>

            <Divider />

            <div>
              <Paragraph>
                <Tag color="magenta">Custom Event</Tag>
                Event tùy chỉnh với value cao
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={handleCustomEvent}
                icon={<RocketOutlined />}
                style={{ background: '#eb2f96' }}
              >
                Test Custom Event
              </Button>
            </div>
          </Space>
        </Card>

        <Card 
          title="📊 Event Log (Local)"
          style={{ marginBottom: '20px' }}
        >
          {eventLog.length === 0 ? (
            <Paragraph type="secondary">
              Chưa có events. Click các buttons phía trên để test.
            </Paragraph>
          ) : (
            <div style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              {eventLog.map((log, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="🔍 How to Verify">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Title level={4}>1. Network Tab</Title>
              <Paragraph>
                • Mở DevTools (F12) → Network tab<br />
                • Filter: <Text code>collect</Text><br />
                • Click buttons phía trên<br />
                • Bạn sẽ thấy requests đến <Text code>google-analytics.com/g/collect</Text>
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={4}>2. GA DebugView</Title>
              <Paragraph>
                • Thêm <Text code>?debug_mode=true</Text> vào URL<br />
                • Vào GA: Admin → DebugView<br />
                • Click buttons<br />
                • Events sẽ xuất hiện real-time trong DebugView
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={4}>3. GA Realtime</Title>
              <Paragraph>
                • Vào GA: Reports → Realtime<br />
                • Click buttons nhiều lần<br />
                • Đợi 1-2 phút<br />
                • Events sẽ xuất hiện trong Realtime report
              </Paragraph>
            </div>
          </Space>
        </Card>

        <Card style={{ marginTop: '20px', background: '#f0f2f5' }}>
          <Space direction="vertical" size="small">
            <Text strong>Quick Links:</Text>
            <div>
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                📊 Google Analytics Dashboard
              </a>
            </div>
            <div>
              <a href="/" style={{ color: '#1890ff' }}>
                🏠 Back to Home
              </a>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  )
}

export default GATest

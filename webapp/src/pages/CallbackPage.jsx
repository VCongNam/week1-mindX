import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Spin, Result, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const CallbackPage = () => {
  const { handleCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      // Get authorization code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        setError(`Authentication error: ${error}`);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        return;
      }

      try {
        await handleCallback(code);
        // Redirect to home page
        window.location.href = '/';
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to complete authentication');
      }
    };

    processCallback();
  }, [handleCallback]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <Result
          status="error"
          title="Authentication Failed"
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      gap: '20px'
    }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      <h2>Completing authentication...</h2>
      <p>Please wait while we log you in.</p>
    </div>
  );
};

export default CallbackPage;

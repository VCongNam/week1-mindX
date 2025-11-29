import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiData, setApiData] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // API URL - sẽ dùng /api khi deploy, localhost khi dev
  const API_URL = import.meta.env.VITE_API_URL || '/api'

  // Fetch API hello endpoint
  const fetchApiHello = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/hello`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setApiData(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching API:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch health endpoint
  const fetchHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/health`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setHealthData(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching health:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto fetch on component mount
  useEffect(() => {
    fetchHealth()
    fetchApiHello()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 MindX Onboarding - Week 1</h1>
        <p>Full-stack Application on Azure Kubernetes Service</p>
      </header>

      <main className="App-main">
        {/* Health Status Section */}
        <section className="card">
          <h2>🏥 API Health Status</h2>
          {healthData ? (
            <div className="data-display">
              <p><strong>Status:</strong> <span className="status-healthy">{healthData.status}</span></p>
              <p><strong>Uptime:</strong> {Math.floor(healthData.uptime)} seconds</p>
              <p><strong>Timestamp:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <p>Loading health data...</p>
          )}
          <button onClick={fetchHealth} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Health'}
          </button>
        </section>

        {/* API Data Section */}
        <section className="card">
          <h2>📡 API Response</h2>
          {apiData ? (
            <div className="data-display">
              <p><strong>Message:</strong> {apiData.message}</p>
              <p><strong>Version:</strong> {apiData.version}</p>
              <p><strong>Timestamp:</strong> {new Date(apiData.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <p>Loading API data...</p>
          )}
          <button onClick={fetchApiHello} disabled={loading}>
            {loading ? 'Loading...' : 'Call API'}
          </button>
        </section>

        {/* Error Display */}
        {error && (
          <section className="card error-card">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <p className="error-hint">
              Make sure the API is running and accessible.
            </p>
          </section>
        )}

        {/* Info Section */}
        <section className="card info-card">
          <h2>ℹ️ Information</h2>
          <p><strong>Frontend:</strong> React + Vite</p>
          <p><strong>Backend:</strong> Node.js + Express</p>
          <p><strong>Infrastructure:</strong> Azure Kubernetes Service (AKS)</p>
          <p><strong>API Endpoint:</strong> {API_URL}</p>
        </section>
      </main>

      <footer className="App-footer">
        <p>MindX Engineer Onboarding Program - Week 1</p>
        <p>Deployed on Azure Cloud ☁️</p>
      </footer>
    </div>
  )
}

export default App

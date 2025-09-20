import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import UserManagement from './components/UserManagement'
import { authAPI } from './services/api'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [authMode, setAuthMode] = useState('login')
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          // Verify token with backend
          const response = await authAPI.verify()
          if (response.valid) {
            setIsLoggedIn(true)
            setCurrentUser(JSON.parse(userData))
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('Auth verification failed:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  const handleLogin = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    setIsLoggedIn(true)
  }

  const handleSignupSuccess = () => {
    setAuthMode('login')
  }

  const switchToSignup = () => {
    setAuthMode('signup')
  }

  const switchToLogin = () => {
    setAuthMode('login')
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentView('dashboard')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <>
        {authMode === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />
        ) : (
          <Signup onSignupSuccess={handleSignupSuccess} onSwitchToLogin={switchToLogin} />
        )}
      </>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Welcome to the Dashboard</h1>
        <div className="header-info">
          <span className="user-info">
            Hello, {currentUser?.name} ({currentUser?.role})
          </span>
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={currentView === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentView('users')}
          className={currentView === 'users' ? 'nav-btn active' : 'nav-btn'}
        >
          User Management
        </button>
      </nav>

      <main className="app-main">
        {currentView === 'dashboard' && (
          <div className="dashboard-content">
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard, {currentUser?.name}!</p>
            
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>Your Profile</h3>
                <p><strong>Name:</strong> {currentUser?.name}</p>
                <p><strong>Email:</strong> {currentUser?.email}</p>
                <p><strong>Role:</strong> {currentUser?.role}</p>
                <p><strong>Member since:</strong> {new Date(currentUser?.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="dashboard-card">
                <h3>Quick Actions</h3>
                <button 
                  onClick={() => setCurrentView('users')}
                  className="action-btn"
                >
                  Manage Users
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'users' && (
          <UserManagement />
        )}
      </main>
    </div>
  )
}

export default App

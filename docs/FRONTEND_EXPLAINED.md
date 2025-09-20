# Frontend Code Explanation

## App.jsx - Main Application Component

```javascript
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import UserManagement from './components/UserManagement'
import { authAPI } from './services/api'
import './App.css'

function App() {
  // STATE MANAGEMENT
  // State is data that can change and cause re-renders
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // Tracks if user is authenticated
  
  const [currentUser, setCurrentUser] = useState(null)
  // Stores current user's information
  
  const [authMode, setAuthMode] = useState('login')
  // Switches between 'login' and 'signup' forms
  
  const [currentView, setCurrentView] = useState('dashboard')
  // Controls which page to show when logged in
  
  const [loading, setLoading] = useState(true)
  // Shows loading screen while checking authentication

  // CHECK AUTHENTICATION ON APP START
  useEffect(() => {
    const checkAuth = async () => {
      // Get stored token and user data
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          // Verify token with backend
          const response = await authAPI.verify()
          if (response.valid) {
            // Token is valid, user is logged in
            setIsLoggedIn(true)
            setCurrentUser(JSON.parse(userData))
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('Auth verification failed:', error)
          // Clear invalid tokens
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])  // Empty dependency array = run once on component mount

  // EVENT HANDLERS
  // Functions that respond to user actions

  const handleLogin = () => {
    // Called after successful login
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    setIsLoggedIn(true)
  }

  const handleSignupSuccess = () => {
    // Called after successful signup
    setAuthMode('login')  // Switch back to login form
  }

  const switchToSignup = () => {
    setAuthMode('signup')
  }

  const switchToLogin = () => {
    setAuthMode('login')
  }

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentView('dashboard')
  }

  // CONDITIONAL RENDERING
  // Show different components based on state

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
      </div>
    )
  }

  // Show login/signup forms if not authenticated
  if (!isLoggedIn) {
    return (
      <>
        {authMode === 'login' ? (
          <Login 
            onLogin={handleLogin} 
            onSwitchToSignup={switchToSignup} 
          />
        ) : (
          <Signup 
            onSignupSuccess={handleSignupSuccess} 
            onSwitchToLogin={switchToLogin} 
          />
        )}
      </>
    )
  }

  // Show dashboard if authenticated
  return (
    <div className="app">
      <header className="app-header">
        <h1>Welcome to the Dashboard</h1>
        <div className="header-info">
          <span className="user-info">
            Hello, {currentUser?.name} ({currentUser?.role})
          </span>
          <button onClick={handleLogout} className="logout-btn">
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
```

**Key React Concepts:**

1. **useState**: Manages component data that can change
2. **useEffect**: Runs code when component mounts or dependencies change
3. **Conditional Rendering**: Shows different JSX based on state
4. **Props**: Data passed from parent to child components
5. **Event Handlers**: Functions that respond to user interactions

## components/Login.jsx - Login Form Component

```javascript
import { useState } from 'react'
import { authAPI } from '../services/api'
import './Login.css'

function Login({ onLogin, onSwitchToSignup }) {
  // FORM STATE
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [errors, setErrors] = useState({})
  // Stores validation error messages
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Prevents multiple form submissions

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Update form data
    setFormData(prev => ({
      ...prev,           // Keep existing data
      [name]: value      // Update specific field
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // FORM VALIDATION
  const validateForm = () => {
    const newErrors = {}
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  // HANDLE FORM SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault()  // Prevent page refresh
    
    // Validate form
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Call login API
      const result = await authAPI.login(formData)
      
      // Store authentication data
      localStorage.setItem('authToken', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      
      // Notify parent component
      if (onLogin) onLogin()
      
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ 
        submit: error.response?.data?.error || 'Login failed. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // RENDER FORM
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Please sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          {/* EMAIL FIELD */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* PASSWORD FIELD */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* SUBMIT ERROR */}
          {errors.submit && <div className="error-text">{errors.submit}</div>}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            className="login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* SWITCH TO SIGNUP */}
        <div className="login-footer">
          <p>Don't have an account?</p>
          <button onClick={onSwitchToSignup} className="switch-btn">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
```

**Form Handling Concepts:**

1. **Controlled Components**: Input values controlled by React state
2. **Event Handling**: `onChange` and `onSubmit` events
3. **Validation**: Check data before submitting
4. **Error Handling**: Show user-friendly error messages
5. **Loading States**: Disable form during submission

## services/api.js - API Communication Layer

```javascript
import axios from 'axios'

// CREATE AXIOS INSTANCE
const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// REQUEST INTERCEPTOR
// Runs before every request is sent
api.interceptors.request.use(
  (config) => {
    // Add JWT token to every request
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('API Request:', config.method.toUpperCase(), config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// RESPONSE INTERCEPTOR
// Runs after every response is received
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    // Handle authentication errors globally
    if (error.response?.status === 401) {
      console.log('Authentication failed, redirecting to login')
      
      // Clear invalid tokens
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      // Redirect to login page
      window.location.href = '/'
    }
    
    console.error('API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

// AUTHENTICATION API METHODS
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Login existing user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Verify JWT token
  verify: async () => {
    const response = await api.post('/auth/verify')
    return response.data
  }
}

// USER MANAGEMENT API METHODS
export const userAPI = {
  // Get all users
  getAll: async () => {
    const response = await api.get('/users')
    return response.data
  },

  // Create new user
  create: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  // Update existing user
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // Delete user
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  }
}

// Export the configured axios instance for custom requests
export default api
```

**API Layer Benefits:**

1. **Centralized Configuration**: All API settings in one place
2. **Automatic Token Handling**: Adds JWT tokens automatically
3. **Error Handling**: Manages authentication errors globally
4. **Logging**: Tracks all API requests and responses
5. **Reusable Methods**: Clean API methods for components

## React Component Lifecycle

```
1. Component Creation
   ├── constructor() or useState()
   ├── useEffect(() => {}, [])  // componentDidMount equivalent
   └── render() // return JSX

2. Component Updates
   ├── useState setter called
   ├── useEffect(() => {}, [dependency])  // componentDidUpdate equivalent
   └── re-render with new data

3. Component Cleanup
   └── useEffect(() => { return cleanup }, [])  // componentWillUnmount equivalent
```

## State Management Flow

```
User Action (click, type, submit)
        ↓
Event Handler Function
        ↓
setState() call
        ↓
Component Re-render
        ↓
Updated UI
```

**Example:**
```javascript
// User types in input field
const handleChange = (e) => {
  setFormData({ ...formData, email: e.target.value })
  // This triggers a re-render with new email value
}
```

## Data Flow Between Components

```
App.jsx (Parent)
    ├── Manages global state (isLoggedIn, currentUser)
    ├── Passes props to child components
    └── Receives callbacks from children
            ↓
Login.jsx (Child)
    ├── Receives onLogin prop from parent
    ├── Manages local form state
    └── Calls onLogin() when login succeeds
```

This architecture keeps data flowing in one direction and makes the app predictable and easy to debug.

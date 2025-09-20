import { useState } from 'react'
import { authAPI } from '../services/api'
import './Login.css'

function Login({ onLogin, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Try to login first
      let result = null
      
      try {
        result = await authAPI.login(formData)
        console.log('Login successful:', result)
        
        // Store token and user data
        localStorage.setItem('authToken', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        alert(`Welcome back, ${result.user.name}!`)
        if (onLogin) onLogin()
        
      } catch (loginError) {
        // If login fails, try to register
        if (loginError.response?.status === 400) {
          try {
            const registerData = {
              name: formData.email.split('@')[0], // Use email prefix as name
              email: formData.email,
              password: formData.password
            }
            
            result = await authAPI.register(registerData)
            console.log('Registration successful:', result)
            
            // Store token and user data
            localStorage.setItem('authToken', result.token)
            localStorage.setItem('user', JSON.stringify(result.user))
            
            alert(`Welcome, ${result.user.name}! Account created successfully.`)
            if (onLogin) onLogin()
            
          } catch (registerError) {
            console.error('Registration error:', registerError)
            setErrors({ 
              submit: registerError.response?.data?.error || 'Registration failed. Please try again.' 
            })
          }
        } else {
          console.error('Login error:', loginError)
          setErrors({ 
            submit: loginError.response?.data?.error || 'Login failed. Please try again.' 
          })
        }
      }
      
    } catch (error) {
      setErrors({ submit: 'Login failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Please sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="login-form">
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

          {errors.submit && <div className="error-text">{errors.submit}</div>}

          <button 
            type="submit" 
            className="login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

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

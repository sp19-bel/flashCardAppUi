import express from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

const router = express.Router()


const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Please provide name, email, and password' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      })
    }

    
    const user = await User.create({ name, email, password })
    
  
    const token = generateToken(user.id)

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    })
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(400).json({ error: error.message })
    }
    
    console.error('Register error:', error)
    res.status(500).json({ error: 'Server error during registration' })
  }
})


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

  
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Please provide email and password' 
      })
    }

    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

 
    const isMatch = await User.verifyPassword(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    
    const token = generateToken(user.id)

   
    const { password: _, ...userWithoutPassword } = user

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error during login' })
  }
})


router.post('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    res.json({
      valid: true,
      user
    })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(401).json({ 
      valid: false, 
      error: 'Invalid token' 
    })
  }
})

export default router

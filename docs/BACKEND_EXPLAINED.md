# Backend Code Explanation

## server.js - Main Server File

```javascript
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'

// Create Express application
const app = express()
const PORT = process.env.PORT || 5000

// MIDDLEWARE SETUP
// Middleware runs before your route handlers
// Think of it as "preparation steps" before handling requests

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
// CORS = Cross-Origin Resource Sharing
// Allows frontend (port 5173) to talk to backend (port 5000)
// Without this, browsers block the communication for security

app.use(express.json())
// Parses incoming JSON data from requests
// Converts JSON strings to JavaScript objects
// Makes req.body available in your routes

// ROUTES SETUP
app.use('/api/auth', authRoutes)
// All routes in authRoutes will be prefixed with /api/auth
// Example: POST /register becomes POST /api/auth/register

app.use('/api/users', userRoutes)
// All routes in userRoutes will be prefixed with /api/users
// Example: GET / becomes GET /api/users

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Frontend URL: http://localhost:5173`)
  console.log(`API Base URL: http://localhost:${PORT}/api`)
})
```

**What happens when server starts:**
1. Express app is created
2. Middleware is set up (CORS, JSON parsing)
3. Routes are connected
4. Server starts listening on port 5000
5. Now it can receive and respond to HTTP requests

## models/User.js - Database Operations

```javascript
import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

class User {
  // READ ALL USERS
  static async findAll() {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      // If file doesn't exist, return empty array
      if (error.code === 'ENOENT') {
        return []
      }
      throw error
    }
  }

  // SAVE USERS TO FILE
  static async saveUsers(users) {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    
    // Write users array to JSON file
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2))
  }

  // FIND USER BY EMAIL
  static async findByEmail(email) {
    const users = await this.findAll()
    return users.find(user => user.email === email)
  }

  // CREATE NEW USER
  static async create(userData) {
    const users = await this.findAll()
    
    // Check if email already exists
    const existingUser = users.find(user => user.email === userData.email)
    if (existingUser) {
      throw new Error('Email already exists')
    }

    // Hash the password before storing
    const saltRounds = 10  // Higher = more secure but slower
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    // Create new user object
    const newUser = {
      id: uuidv4(),                    // Generate unique ID
      name: userData.name,
      email: userData.email,
      password: hashedPassword,        // Store hashed, not plain password
      role: userData.role || 'user',   // Default role is 'user'
      createdAt: new Date().toISOString()
    }

    // Add to users array and save
    users.push(newUser)
    await this.saveUsers(users)

    // Return user without password for security
    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  // VERIFY PASSWORD
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // UPDATE USER
  static async update(id, updateData) {
    const users = await this.findAll()
    const userIndex = users.findIndex(user => user.id === id)
    
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    // Update user data (don't update password here)
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      id: users[userIndex].id,        // Keep original ID
      createdAt: users[userIndex].createdAt  // Keep original creation date
    }

    await this.saveUsers(users)
    
    // Return updated user without password
    const { password, ...userWithoutPassword } = users[userIndex]
    return userWithoutPassword
  }

  // DELETE USER
  static async delete(id) {
    const users = await this.findAll()
    const userIndex = users.findIndex(user => user.id === id)
    
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    // Remove user from array
    users.splice(userIndex, 1)
    await this.saveUsers(users)
    
    return { message: 'User deleted successfully' }
  }
}

export default User
```

**Key Concepts:**
- **Static methods**: Called on the class itself, not on instances
- **Async/await**: Handles file operations that take time
- **bcrypt**: Securely hashes passwords (one-way encryption)
- **UUID**: Creates unique IDs for each user

## routes/auth.js - Authentication Routes

```javascript
import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// REGISTER NEW USER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address' 
      })
    }

    // CREATE USER
    const user = await User.create({ name, email, password })

    // CREATE JWT TOKEN
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }  // Token expires in 24 hours
    )

    // SEND RESPONSE
    res.status(201).json({
      message: 'User created successfully',
      token,
      user
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(400).json({ 
      error: error.message 
    })
  }
})

// LOGIN EXISTING USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // VALIDATION
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      })
    }

    // FIND USER
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid email or password' 
      })
    }

    // VERIFY PASSWORD
    const isValidPassword = await User.verifyPassword(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ 
        error: 'Invalid email or password' 
      })
    }

    // CREATE JWT TOKEN
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // REMOVE PASSWORD FROM RESPONSE
    const { password: _, ...userWithoutPassword } = user

    // SEND RESPONSE
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

// VERIFY JWT TOKEN
router.post('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        valid: false, 
        error: 'No token provided' 
      })
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // CHECK IF USER STILL EXISTS
    const user = await User.findByEmail(decoded.email)
    if (!user) {
      return res.status(401).json({ 
        valid: false, 
        error: 'User not found' 
      })
    }

    res.json({ valid: true, user: decoded })

  } catch (error) {
    res.status(401).json({ 
      valid: false, 
      error: 'Invalid token' 
    })
  }
})

export default router
```

**Authentication Flow Explained:**

1. **Registration:**
   - User submits form with name, email, password
   - Backend validates data
   - Password gets hashed with bcrypt
   - User is saved to JSON file
   - JWT token is created and sent back

2. **Login:**
   - User submits email and password
   - Backend finds user by email
   - Password is compared with stored hash
   - JWT token is created and sent back

3. **Token Verification:**
   - Frontend sends token with requests
   - Backend verifies token signature
   - If valid, user data is extracted from token

## middleware/auth.js - Authentication Middleware

```javascript
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// AUTHENTICATION MIDDLEWARE
const authMiddleware = (req, res, next) => {
  try {
    // GET TOKEN FROM HEADER
    const authHeader = req.header('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    // CHECK IF TOKEN EXISTS
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      })
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // ADD USER INFO TO REQUEST OBJECT
    req.user = decoded
    
    // CONTINUE TO NEXT MIDDLEWARE/ROUTE
    next()

  } catch (error) {
    // TOKEN IS INVALID
    res.status(401).json({ 
      error: 'Invalid token.' 
    })
  }
}

// ADMIN ONLY MIDDLEWARE
const adminMiddleware = (req, res, next) => {
  // First run auth middleware
  authMiddleware(req, res, () => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin role required.' 
      })
    }
    next()
  })
}

export { authMiddleware, adminMiddleware }
```

**How Middleware Works:**
1. Request comes in
2. Middleware checks for token
3. If valid, adds user info to request
4. Calls `next()` to continue to route handler
5. If invalid, sends error response immediately

This middleware protects routes so only authenticated users can access them.

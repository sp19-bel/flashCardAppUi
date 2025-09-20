import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
})


app.use(limiter)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))


app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log(`API Base URL: http://localhost:${PORT}/api`)
})

import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ error: 'Token is not valid' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Token is not valid' })
  }
}

export default authMiddleware

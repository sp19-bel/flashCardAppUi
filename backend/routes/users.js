import express from 'express'
import { User } from '../models/User.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll()
    res.json({
      success: true,
      count: users.length,
      data: users
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Server error while fetching users' })
  }
})


router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Server error while fetching user' })
  }
})


router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, role } = req.body
    const updateData = {}

 
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role

   
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'You can only update your own profile' 
      })
    }

    const updatedUser = await User.update(req.params.id, updateData)
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Server error while updating user' })
  }
})


router.delete('/:id', authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin access required to delete users' 
      })
    }


    if (req.user.id === req.params.id) {
      return res.status(400).json({ 
        error: 'You cannot delete your own account' 
      })
    }

    const deleted = await User.delete(req.params.id)
    
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Server error while deleting user' })
  }
})


router.put('/:id/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Please provide current and new password' 
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters' 
      })
    }

   
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'You can only update your own password' 
      })
    }

   
    const user = await User.findByEmail(req.user.email)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (req.user.role !== 'admin') {
      const isMatch = await User.verifyPassword(currentPassword, user.password)
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' })
      }
    }

 
    await User.update(req.params.id, { password: newPassword })

    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Update password error:', error)
    res.status(500).json({ error: 'Server error while updating password' })
  }
})

export default router

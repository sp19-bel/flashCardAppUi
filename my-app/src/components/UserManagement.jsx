import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'
import './UserManagement.css'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  })


  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getAll()
      setUsers(response.data)
      setError('')
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    })
  }

  const handleSave = async () => {
    try {
      await userAPI.update(editingUser.id, formData)
      await loadUsers() 
      setEditingUser(null)
      setFormData({ name: '', email: '', role: 'user' })
    } catch (error) {
      console.error('Error updating user:', error)
      setError(error.response?.data?.error || 'Failed to update user')
    }
  }

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await userAPI.delete(userId)
        await loadUsers() 
      } catch (error) {
        console.error('Error deleting user:', error)
        setError(error.response?.data?.error || 'Failed to delete user')
      }
    }
  }

  const handleCancel = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', role: 'user' })
  }

  if (loading) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div className="user-management">
      <h2>User Management</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="edit-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {editingUser?.id === user.id ? (
                    <div className="edit-actions">
                      <button 
                        onClick={handleSave} 
                        className="save-btn"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="user-actions">
                      <button 
                        onClick={() => handleEdit(user)} 
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.name)} 
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="no-users">
            No users found.
          </div>
        )}
      </div>

      <div className="table-footer">
        <p>Total users: {users.length}</p>
        <button onClick={loadUsers} className="refresh-btn">
          Refresh
        </button>
      </div>
    </div>
  )
}

export default UserManagement

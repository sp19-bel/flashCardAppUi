import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcryptjs'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')


const ensureDataDir = async () => {
  try {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true })
  } catch (error) {
    
  }
}



const initUsersFile = async () => {
  try {
    await fs.access(USERS_FILE)
  } catch (error) {
   
    await fs.writeFile(USERS_FILE, JSON.stringify([]))
  }
}


const readUsers = async () => {
  await ensureDataDir()
  await initUsersFile()
  
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading users file:', error)
    return []
  }
}


const writeUsers = async (users) => {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error writing users file:', error)
    throw error
  }
}


// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const User = {
  // Get all users
  async findAll() {
    const users = await readUsers()
    return users.map(({ password, ...user }) => user)
  },
  async findById(id) {
    const users = await readUsers()
    const user = users.find(u => u.id === id)
    if (user) {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return null
  },

  async findByEmail(email) {
    const users = await readUsers()
    return users.find(u => u.email === email)
  },


  async create(userData) {
    const users = await readUsers()
    
  
    const existingUser = users.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

  
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    const newUser = {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    users.push(newUser)
    await writeUsers(users)

 
    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  },

  async update(id, updateData) {
    const users = await readUsers()
    const userIndex = users.findIndex(u => u.id === id)
    
    if (userIndex === -1) {
      return null
    }

    
    if (updateData.password) {
      const saltRounds = 12
      updateData.password = await bcrypt.hash(updateData.password, saltRounds)
    }


    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    await writeUsers(users)

    
    const { password, ...userWithoutPassword } = users[userIndex]
    return userWithoutPassword
  },



  async delete(id) {
    const users = await readUsers()
    const userIndex = users.findIndex(u => u.id === id)
    
    if (userIndex === -1) {
      return false
    }

    users.splice(userIndex, 1)
    await writeUsers(users)
    return true
  },


  
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }
}

export { User }
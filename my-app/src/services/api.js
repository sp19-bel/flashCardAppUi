import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
     
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  
  verify: async () => {
    const response = await api.post('/auth/verify')
    return response.data
  },
}

export const userAPI = {
  
  getAll: async () => {
    const response = await api.get('/users')
    return response.data
  },

  
  getById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

 
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },


  delete: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

 
  updatePassword: async (id, passwordData) => {
    const response = await api.put(`/users/${id}/password`, passwordData)
    return response.data
  },
}

export default api

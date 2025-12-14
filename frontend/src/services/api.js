import axios from 'axios'

const API_BASE_URL = '/api/v1'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login-json', credentials),
    getCurrentUser: () => api.get('/auth/me'),
    verifyToken: () => api.get('/auth/verify'),
}

export const summarizerAPI = {
    summarizeText: (data) => api.post('/summarize/text', data),
    summarizeFile: (formData) => api.post('/summarize/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    summarizeUrl: (data) => api.post('/summarize/url', data),
    getSummaryHistory: () => api.get('/summarize/history'),
    getSummaryById: (summaryId) => api.get(`/summarize/history/${summaryId}`),
}

export const chatAPI = {
    chat: (data) => api.post('/chat', data),
    getChatHistory: () => api.get('/chat/history'),
}

export default api

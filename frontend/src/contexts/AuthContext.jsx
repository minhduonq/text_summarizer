import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const response = await authAPI.getCurrentUser()
                setUser(response.data)
            } catch (error) {
                console.error('Auth check failed:', error)
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }

    const login = async (username, password) => {
        try {
            const response = await authAPI.login({ username, password })
            const { access_token } = response.data
            localStorage.setItem('token', access_token)

            // Get user info
            const userResponse = await authAPI.getCurrentUser()
            setUser(userResponse.data)
            localStorage.setItem('user', JSON.stringify(userResponse.data))

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Đăng nhập thất bại'
            }
        }
    }

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData)
            return { success: true, data: response.data }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Đăng ký thất bại'
            }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaRobot, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import './LoginPage.css'

const LoginPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, isAuthenticated } = useAuth()
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [loading, setLoading] = useState(false)

    // Check for success message from registration
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message)
            // Clear the message from location state
            window.history.replaceState({}, document.title)
        }
    }, [location])

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home')
        }
    }, [isAuthenticated, navigate])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')
        setLoading(true)

        const result = await login(formData.username, formData.password)
        setLoading(false)

        if (result.success) {
            navigate('/home')
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <Link to="/" className="back-link">
                        ← Quay lại trang chủ
                    </Link>
                    <div className="login-hero">
                        <FaRobot className="hero-icon" />
                        <h1>Chào mừng trở lại!</h1>
                        <p>Đăng nhập để tiếp tục sử dụng Text Summarizer</p>
                        <div className="features-showcase">
                            <div className="showcase-item">
                                <div className="showcase-icon">📄</div>
                                <div className="showcase-text">
                                    <h3>Tóm tắt văn bản</h3>
                                    <p>Nhanh chóng và chính xác</p>
                                </div>
                            </div>
                            <div className="showcase-item">
                                <div className="showcase-icon">🌐</div>
                                <div className="showcase-text">
                                    <h3>Trích xuất từ URL</h3>
                                    <p>Tóm tắt trực tiếp từ web</p>
                                </div>
                            </div>
                            <div className="showcase-item">
                                <div className="showcase-icon">💬</div>
                                <div className="showcase-text">
                                    <h3>AI Chat</h3>
                                    <p>Trò chuyện thông minh</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-form-container">
                        <h2>Đăng nhập</h2>
                        <p className="form-subtitle">Nhập thông tin đăng nhập của bạn</p>

                        {successMessage && (
                            <div className="alert alert-success">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="username">
                                    <FaUser /> Tên đăng nhập hoặc Email
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="username hoặc email@example.com"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    <FaLock /> Mật khẩu
                                </label>
                                <div className="password-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input type="checkbox" />
                                    <span>Ghi nhớ đăng nhập</span>
                                </label>
                                <a href="#forgot" className="forgot-link">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>

                            <div className="form-footer">
                                <p>
                                    Chưa có tài khoản?{' '}
                                    <Link to="/register" className="link">
                                        Đăng ký ngay
                                    </Link>
                                </p>
                            </div>
                        </form>

                        <div className="divider">
                            <span>hoặc</span>
                        </div>

                        <div className="social-login">
                            <button className="btn btn-social">
                                <img src="https://www.google.com/favicon.ico" alt="Google" />
                                Đăng nhập với Google
                            </button>
                            <button className="btn btn-social">
                                <img src="https://github.com/favicon.ico" alt="GitHub" />
                                Đăng nhập với GitHub
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage

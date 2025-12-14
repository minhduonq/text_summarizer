import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaRobot, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import './RegisterPage.css'

const RegisterPage = () => {
    const navigate = useNavigate()
    const { register, isAuthenticated } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password_confirm: '',
        full_name: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redirect if already authenticated
    React.useEffect(() => {
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
        setLoading(true)

        // Validation
        if (formData.password !== formData.password_confirm) {
            setError('Mật khẩu xác nhận không khớp')
            setLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            setLoading(false)
            return
        }

        const result = await register(formData)
        setLoading(false)

        if (result.success) {
            // Show success message and redirect to login
            navigate('/login', {
                state: {
                    message: 'Đăng ký thành công! Vui lòng đăng nhập.'
                }
            })
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-left">
                    <Link to="/" className="back-link">
                        ← Quay lại trang chủ
                    </Link>
                    <div className="register-hero">
                        <FaRobot className="hero-icon" />
                        <h1>Tham gia Text Summarizer</h1>
                        <p>Trải nghiệm công nghệ tóm tắt văn bản thông minh với AI</p>
                        <div className="features-list">
                            <div className="feature-item">
                                <span className="check">✓</span>
                                <span>Miễn phí sử dụng cơ bản</span>
                            </div>
                            <div className="feature-item">
                                <span className="check">✓</span>
                                <span>Không giới hạn số lần tóm tắt</span>
                            </div>
                            <div className="feature-item">
                                <span className="check">✓</span>
                                <span>Lưu trữ lịch sử tóm tắt</span>
                            </div>
                            <div className="feature-item">
                                <span className="check">✓</span>
                                <span>AI Chat Assistant</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="register-right">
                    <div className="register-form-container">
                        <h2>Đăng ký tài khoản</h2>
                        <p className="form-subtitle">Điền thông tin để bắt đầu</p>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="register-form">
                            <div className="form-group">
                                <label htmlFor="email">
                                    <FaEnvelope /> Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="username">
                                    <FaUser /> Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    minLength={3}
                                    maxLength={50}
                                    pattern="[a-zA-Z0-9_-]+"
                                    title="Chỉ chấp nhận chữ cái, số, _ và -"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="full_name">
                                    <FaUser /> Họ và tên (tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.full_name}
                                    onChange={handleChange}
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
                                        minLength={6}
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

                            <div className="form-group">
                                <label htmlFor="password_confirm">
                                    <FaLock /> Xác nhận mật khẩu
                                </label>
                                <div className="password-input">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="password_confirm"
                                        name="password_confirm"
                                        placeholder="••••••••"
                                        value={formData.password_confirm}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>

                            <div className="form-footer">
                                <p>
                                    Đã có tài khoản?{' '}
                                    <Link to="/login" className="link">
                                        Đăng nhập ngay
                                    </Link>
                                </p>
                            </div>
                        </form>

                        <div className="divider">
                            <span>hoặc</span>
                        </div>

                        <p className="terms">
                            Bằng việc đăng ký, bạn đồng ý với{' '}
                            <a href="#terms">Điều khoản dịch vụ</a> và{' '}
                            <a href="#privacy">Chính sách bảo mật</a> của chúng tôi
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage

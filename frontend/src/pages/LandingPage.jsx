import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaRobot, FaFileAlt, FaGlobe, FaChartLine, FaShieldAlt, FaBolt } from 'react-icons/fa'
import './LandingPage.css'

const LandingPage = () => {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/home')
        } else {
            navigate('/register')
        }
    }

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="navbar">
                <div className="container">
                    <div className="nav-brand">
                        <FaRobot className="brand-icon" />
                        <span className="brand-name">Text Summarizer</span>
                    </div>
                    <div className="nav-links">
                        <a href="#features">Tính năng</a>
                        <a href="#how-it-works">Cách hoạt động</a>
                        <a href="#pricing">Giá cả</a>
                        {isAuthenticated ? (
                            <Link to="/home" className="btn btn-primary">
                                Vào ứng dụng
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="btn btn-primary">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Tóm tắt văn bản thông minh
                            <br />
                            <span className="gradient-text">với AI công nghệ cao</span>
                        </h1>
                        <p className="hero-description">
                            Chuyển đổi các tài liệu dài thành bản tóm tắt ngắn gọn, dễ hiểu trong vài giây.
                            Tiết kiệm thời gian và nâng cao hiệu suất làm việc của bạn.
                        </p>
                        <div className="hero-buttons">
                            <button onClick={handleGetStarted} className="btn btn-primary btn-lg">
                                Bắt đầu ngay - Miễn phí
                            </button>
                            <button className="btn btn-outline btn-lg">
                                Xem Demo
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <strong>10,000+</strong>
                                <span>Người dùng</span>
                            </div>
                            <div className="stat">
                                <strong>500K+</strong>
                                <span>Văn bản đã tóm tắt</span>
                            </div>
                            <div className="stat">
                                <strong>99.9%</strong>
                                <span>Độ chính xác</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="floating-card">
                            <div className="card-header">
                                <FaFileAlt /> Đang tóm tắt...
                            </div>
                            <div className="card-content">
                                <div className="progress-bar">
                                    <div className="progress-fill"></div>
                                </div>
                                <p className="card-text">Phân tích nội dung và trích xuất thông tin quan trọng...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="container">
                    <h2 className="section-title">Tính năng nổi bật</h2>
                    <p className="section-description">
                        Giải pháp tóm tắt văn bản toàn diện với công nghệ AI tiên tiến
                    </p>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaFileAlt />
                            </div>
                            <h3>Tóm tắt văn bản</h3>
                            <p>
                                Tóm tắt các đoạn văn bản dài, tài liệu, bài báo một cách nhanh chóng
                                và chính xác với AI.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaGlobe />
                            </div>
                            <h3>Tóm tắt từ URL</h3>
                            <p>
                                Nhập link bài viết, blog hoặc trang web để tự động trích xuất
                                và tóm tắt nội dung.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaRobot />
                            </div>
                            <h3>AI Chat Assistant</h3>
                            <p>
                                Tương tác với chatbot thông minh để đặt câu hỏi về nội dung
                                đã tóm tắt.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaChartLine />
                            </div>
                            <h3>Lịch sử tóm tắt</h3>
                            <p>
                                Lưu trữ và quản lý tất cả các bản tóm tắt của bạn,
                                truy cập mọi lúc mọi nơi.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaShieldAlt />
                            </div>
                            <h3>Bảo mật cao</h3>
                            <p>
                                Dữ liệu của bạn được mã hóa và bảo mật tuyệt đối,
                                đảm bảo quyền riêng tư.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaBolt />
                            </div>
                            <h3>Xử lý nhanh</h3>
                            <p>
                                Tốc độ xử lý siêu nhanh, tóm tắt văn bản chỉ trong
                                vài giây.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="how-it-works">
                <div className="container">
                    <h2 className="section-title">Cách hoạt động</h2>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Đăng ký tài khoản</h3>
                            <p>Tạo tài khoản miễn phí trong vài giây</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Nhập nội dung</h3>
                            <p>Dán văn bản, tải file hoặc nhập URL</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Nhận kết quả</h3>
                            <p>Nhận bản tóm tắt chất lượng cao ngay lập tức</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <h2>Sẵn sàng trải nghiệm?</h2>
                    <p>Tham gia cùng hàng ngàn người dùng đang tiết kiệm thời gian mỗi ngày</p>
                    <button onClick={handleGetStarted} className="btn btn-primary btn-lg">
                        Bắt đầu miễn phí ngay
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <div className="footer-brand">
                                <FaRobot className="brand-icon" />
                                <span className="brand-name">Text Summarizer</span>
                            </div>
                            <p>Giải pháp tóm tắt văn bản thông minh với AI</p>
                        </div>
                        <div className="footer-section">
                            <h4>Sản phẩm</h4>
                            <ul>
                                <li><a href="#features">Tính năng</a></li>
                                <li><a href="#pricing">Giá cả</a></li>
                                <li><a href="#how-it-works">Cách hoạt động</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Công ty</h4>
                            <ul>
                                <li><a href="#about">Về chúng tôi</a></li>
                                <li><a href="#contact">Liên hệ</a></li>
                                <li><a href="#careers">Tuyển dụng</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Hỗ trợ</h4>
                            <ul>
                                <li><a href="#faq">FAQ</a></li>
                                <li><a href="#docs">Tài liệu</a></li>
                                <li><a href="#support">Hỗ trợ</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 Text Summarizer. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage

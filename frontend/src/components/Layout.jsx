import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    FaRobot, FaSignOutAlt, FaFileAlt, FaComments, FaHistory, FaUser
} from 'react-icons/fa'
import './Layout.css'

const Layout = ({ children }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path

    return (
        <div className="app-layout">
            {/* Header */}
            <header className="app-header">
                <div className="header-left">
                    <FaRobot className="logo-icon" />
                    <h1>Text Summarizer</h1>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <FaUser />
                        <span>{user?.username || user?.email}</span>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline">
                        <FaSignOutAlt /> Đăng xuất
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="app-main">
                {/* Sidebar */}
                <aside className="sidebar">
                    <nav className="sidebar-nav">
                        <button
                            className={`nav-item ${isActive('/home') || isActive('/summarize') ? 'active' : ''}`}
                            onClick={() => navigate('/summarize')}
                        >
                            <FaFileAlt /> Tóm tắt văn bản
                        </button>
                        <button
                            className={`nav-item ${isActive('/chat') ? 'active' : ''}`}
                            onClick={() => navigate('/chat')}
                        >
                            <FaComments /> AI Chat
                        </button>
                        <button
                            className={`nav-item ${isActive('/history') ? 'active' : ''}`}
                            onClick={() => navigate('/history')}
                        >
                            <FaHistory /> Lịch sử
                        </button>
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout

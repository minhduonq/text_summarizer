import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { summarizerAPI, chatAPI } from '../services/api'
import {
    FaRobot, FaSignOutAlt, FaFileAlt, FaGlobe, FaComments,
    FaHistory, FaUser, FaPaperPlane, FaCopy, FaDownload
} from 'react-icons/fa'
import './HomePage.css'

const HomePage = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('text')
    const [activeView, setActiveView] = useState('summarize')

    // Summarization states
    const [textInput, setTextInput] = useState('')
    const [urlInput, setUrlInput] = useState('')
    const [summaryResult, setSummaryResult] = useState(null)
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [summaryError, setSummaryError] = useState('')

    // Chat states
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [chatLoading, setChatLoading] = useState(false)

    // History states
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleSummarizeText = async () => {
        if (!textInput.trim()) {
            setSummaryError('Vui lòng nhập văn bản cần tóm tắt')
            return
        }

        setSummaryLoading(true)
        setSummaryError('')
        setSummaryResult(null)

        try {
            const response = await summarizerAPI.summarizeText({
                text: textInput,
                max_length: 150,
                min_length: 50
            })
            setSummaryResult(response.data)
        } catch (error) {
            setSummaryError(error.response?.data?.detail || 'Có lỗi xảy ra khi tóm tắt văn bản')
        } finally {
            setSummaryLoading(false)
        }
    }

    const handleSummarizeUrl = async () => {
        if (!urlInput.trim()) {
            setSummaryError('Vui lòng nhập URL cần tóm tắt')
            return
        }

        setSummaryLoading(true)
        setSummaryError('')
        setSummaryResult(null)

        try {
            const response = await summarizerAPI.summarizeUrl({
                url: urlInput,
                max_length: 150,
                min_length: 50
            })
            setSummaryResult(response.data)
        } catch (error) {
            setSummaryError(error.response?.data?.detail || 'Có lỗi xảy ra khi tóm tắt URL')
        } finally {
            setSummaryLoading(false)
        }
    }

    const handleSendChat = async () => {
        if (!chatInput.trim()) return

        const userMessage = { role: 'user', content: chatInput }
        setChatMessages(prev => [...prev, userMessage])
        setChatInput('')
        setChatLoading(true)

        try {
            const response = await chatAPI.chat({
                message: chatInput,
                conversation_id: 'default'
            })

            const assistantMessage = {
                role: 'assistant',
                content: response.data.response
            }
            setChatMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.'
            }
            setChatMessages(prev => [...prev, errorMessage])
        } finally {
            setChatLoading(false)
        }
    }

    const loadHistory = async () => {
        setHistoryLoading(true)
        try {
            const response = await summarizerAPI.getSummaryHistory()
            setHistory(response.data)
        } catch (error) {
            console.error('Error loading history:', error)
        } finally {
            setHistoryLoading(false)
        }
    }

    const handleCopySummary = () => {
        if (summaryResult?.summary) {
            navigator.clipboard.writeText(summaryResult.summary)
        }
    }

    const handleDownloadSummary = () => {
        if (summaryResult?.summary) {
            const element = document.createElement('a')
            const file = new Blob([summaryResult.summary], { type: 'text/plain' })
            element.href = URL.createObjectURL(file)
            element.download = 'summary.txt'
            document.body.appendChild(element)
            element.click()
            document.body.removeChild(element)
        }
    }

    React.useEffect(() => {
        if (activeView === 'history') {
            loadHistory()
        }
    }, [activeView])

    return (
        <div className="home-page">
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
                            className={`nav-item ${activeView === 'summarize' ? 'active' : ''}`}
                            onClick={() => setActiveView('summarize')}
                        >
                            <FaFileAlt /> Tóm tắt văn bản
                        </button>
                        <button
                            className="nav-item"
                            onClick={() => navigate('/chat')}
                        >
                            <FaComments /> AI Chat (Nâng cao)
                        </button>
                        <button
                            className={`nav-item ${activeView === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveView('history')}
                        >
                            <FaHistory /> Lịch sử
                        </button>
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="content-area">
                    {activeView === 'summarize' && (
                        <div className="summarize-view">
                            <div className="view-header">
                                <h2>Tóm tắt văn bản</h2>
                                <p>Nhập văn bản hoặc URL để tạo bản tóm tắt</p>
                            </div>

                            <div className="tabs">
                                <button
                                    className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('text')}
                                >
                                    <FaFileAlt /> Văn bản
                                </button>
                                <button
                                    className={`tab ${activeTab === 'url' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('url')}
                                >
                                    <FaGlobe /> URL
                                </button>
                            </div>

                            <div className="summarize-content">
                                {activeTab === 'text' ? (
                                    <div className="input-section">
                                        <textarea
                                            placeholder="Nhập hoặc dán văn bản cần tóm tắt tại đây..."
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            rows={10}
                                            className="text-input"
                                        />
                                        <button
                                            onClick={handleSummarizeText}
                                            disabled={summaryLoading || !textInput.trim()}
                                            className="btn btn-primary"
                                        >
                                            {summaryLoading ? 'Đang xử lý...' : 'Tóm tắt'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="input-section">
                                        <input
                                            type="url"
                                            placeholder="https://example.com/article"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            className="url-input"
                                        />
                                        <button
                                            onClick={handleSummarizeUrl}
                                            disabled={summaryLoading || !urlInput.trim()}
                                            className="btn btn-primary"
                                        >
                                            {summaryLoading ? 'Đang xử lý...' : 'Tóm tắt'}
                                        </button>
                                    </div>
                                )}

                                {summaryError && (
                                    <div className="alert alert-error">
                                        {summaryError}
                                    </div>
                                )}

                                {summaryResult && (
                                    <div className="result-section">
                                        <div className="result-header">
                                            <h3>Kết quả tóm tắt</h3>
                                            <div className="result-actions">
                                                <button
                                                    onClick={handleCopySummary}
                                                    className="btn btn-icon"
                                                    title="Sao chép"
                                                >
                                                    <FaCopy />
                                                </button>
                                                <button
                                                    onClick={handleDownloadSummary}
                                                    className="btn btn-icon"
                                                    title="Tải xuống"
                                                >
                                                    <FaDownload />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="result-content">
                                            <p>{summaryResult.summary}</p>
                                        </div>
                                        <div className="result-meta">
                                            <span>Độ dài gốc: {summaryResult.original_length} ký tự</span>
                                            <span>Độ dài tóm tắt: {summaryResult.summary_length} ký tự</span>
                                            <span>Tỷ lệ nén: {summaryResult.compression_ratio}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === 'chat' && (
                        <div className="chat-view">
                            <div className="view-header">
                                <h2>AI Chat Assistant</h2>
                                <p>Trò chuyện với AI để được hỗ trợ</p>
                            </div>

                            <div className="chat-container">
                                <div className="chat-messages">
                                    {chatMessages.length === 0 ? (
                                        <div className="chat-empty">
                                            <FaComments className="empty-icon" />
                                            <p>Bắt đầu cuộc trò chuyện với AI</p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg, index) => (
                                            <div key={index} className={`chat-message ${msg.role}`}>
                                                <div className="message-content">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {chatLoading && (
                                        <div className="chat-message assistant">
                                            <div className="message-content typing">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="chat-input-container">
                                    <input
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                        disabled={chatLoading}
                                        className="chat-input"
                                    />
                                    <button
                                        onClick={handleSendChat}
                                        disabled={chatLoading || !chatInput.trim()}
                                        className="btn btn-primary"
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'history' && (
                        <div className="history-view">
                            <div className="view-header">
                                <h2>Lịch sử tóm tắt</h2>
                                <p>Xem lại các bản tóm tắt trước đó</p>
                            </div>

                            <div className="history-content">
                                {historyLoading ? (
                                    <div className="loading">Đang tải...</div>
                                ) : history.length === 0 ? (
                                    <div className="history-empty">
                                        <FaHistory className="empty-icon" />
                                        <p>Chưa có lịch sử tóm tắt</p>
                                    </div>
                                ) : (
                                    <div className="history-list">
                                        {history.map((item) => (
                                            <div key={item.id} className="history-item">
                                                <div className="history-header">
                                                    <h3>{item.title || 'Không có tiêu đề'}</h3>
                                                    <span className="history-date">
                                                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <p className="history-summary">
                                                    {item.summary?.substring(0, 200)}...
                                                </p>
                                                <div className="history-meta">
                                                    <span>{item.source_type}</span>
                                                    <span>{item.summary_length} ký tự</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default HomePage

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { summarizerAPI, chatAPI } from '../services/api'
import { FaHistory, FaComments, FaFileAlt, FaTrash } from 'react-icons/fa'
import './HistoryPage.css'

const HistoryPage = () => {
    const navigate = useNavigate()
    const [summaryHistory, setSummaryHistory] = useState([])
    const [chatSessions, setChatSessions] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('chat') // 'chat' or 'summary'

    const loadHistory = async () => {
        setHistoryLoading(true)
        try {
            const [summaryResponse, chatResponse] = await Promise.all([
                summarizerAPI.getSummaryHistory(),
                chatAPI.getSessions()
            ])
            setSummaryHistory(summaryResponse.data)
            setChatSessions(chatResponse.data)
        } catch (error) {
            console.error('Error loading history:', error)
        } finally {
            setHistoryLoading(false)
        }
    }

    useEffect(() => {
        loadHistory()
    }, [])

    const handleDeleteSession = async (sessionId, e) => {
        e.stopPropagation()
        if (!window.confirm('Bạn có chắc muốn xóa hội thoại này?')) return

        try {
            await chatAPI.deleteSession(sessionId)
            setChatSessions(prev => prev.filter(s => s.session_id !== sessionId))
        } catch (error) {
            console.error('Error deleting session:', error)
        }
    }

    const handleOpenSession = (sessionId) => {
        navigate('/chat', { state: { sessionId } })
    }

    return (
        <Layout>
            <div className="history-view">
                <div className="view-header">
                    <h2>Lịch sử</h2>
                    <p>Xem lại các cuộc hội thoại và bản tóm tắt trước đó</p>
                </div>

                {/* Tabs */}
                <div className="history-tabs">
                    <button
                        className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <FaComments /> Cuộc hội thoại
                    </button>
                    <button
                        className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                        onClick={() => setActiveTab('summary')}
                    >
                        <FaFileAlt /> Bản tóm tắt
                    </button>
                </div>

                <div className="history-content">
                    {historyLoading ? (
                        <div className="loading">Đang tải...</div>
                    ) : activeTab === 'chat' ? (
                        // Chat Sessions
                        chatSessions.length === 0 ? (
                            <div className="history-empty">
                                <FaComments className="empty-icon" />
                                <p>Chưa có cuộc hội thoại nào</p>
                            </div>
                        ) : (
                            <div className="history-list">
                                {chatSessions.map((session) => (
                                    <div
                                        key={session.session_id}
                                        className="history-item chat-session"
                                        onClick={() => handleOpenSession(session.session_id)}
                                    >
                                        <div className="history-header">
                                            <h3>{session.title || 'Hội thoại mới'}</h3>
                                            <div className="session-actions">
                                                <span className="history-date">
                                                    {new Date(session.updated_at || session.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                                <button
                                                    className="delete-btn"
                                                    onClick={(e) => handleDeleteSession(session.session_id, e)}
                                                    title="Xóa"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="history-meta">
                                            <span><FaComments /> {session.message_count || 0} tin nhắn</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        // Summary History
                        summaryHistory.length === 0 ? (
                            <div className="history-empty">
                                <FaFileAlt className="empty-icon" />
                                <p>Chưa có lịch sử tóm tắt</p>
                            </div>
                        ) : (
                            <div className="history-list">
                                {summaryHistory.map((item) => (
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
                        )
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default HistoryPage

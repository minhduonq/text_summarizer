import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { chatAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
    FaPaperPlane, FaPlus, FaTrash,
    FaPaperclip, FaFile, FaTimes, FaRobot, FaUser,
    FaSignOutAlt, FaFileAlt, FaComments, FaHistory
} from 'react-icons/fa'
import './ChatPage.css'

const ChatPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)

    // States
    const [sessions, setSessions] = useState([])
    const [currentSession, setCurrentSession] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [attachedFile, setAttachedFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Load sessions on mount
    useEffect(() => {
        loadSessions()
    }, [])

    // Handle session from navigation state
    useEffect(() => {
        if (location.state?.sessionId && sessions.length > 0) {
            const targetSession = sessions.find(s => s.session_id === location.state.sessionId)
            if (targetSession) {
                setCurrentSession(targetSession)
            }
        }
    }, [location.state, sessions])

    // Load messages when session changes
    useEffect(() => {
        if (currentSession) {
            loadMessages(currentSession.session_id)
        }
    }, [currentSession])

    // Auto scroll to bottom
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadSessions = async () => {
        try {
            const response = await chatAPI.getSessions()
            setSessions(response.data)

            // Auto-select first session or create new one
            if (response.data.length === 0) {
                await createNewSession()
            } else if (!currentSession) {
                setCurrentSession(response.data[0])
            }
        } catch (error) {
            console.error('Error loading sessions:', error)
            setError('Không thể tải danh sách hội thoại')
        }
    }

    const loadMessages = async (sessionId) => {
        try {
            const response = await chatAPI.getSessionHistory(sessionId)
            setMessages(response.data.messages || [])
        } catch (error) {
            console.error('Error loading messages:', error)
            setMessages([])
        }
    }

    const createNewSession = async () => {
        try {
            const response = await chatAPI.createSession({
                title: 'Hội thoại mới'
            })
            setSessions(prev => [response.data, ...prev])
            setCurrentSession(response.data)
            setMessages([])
        } catch (error) {
            console.error('Error creating session:', error)
            setError('Không thể tạo hội thoại mới')
        }
    }

    const deleteSession = async (sessionId, e) => {
        e.stopPropagation()

        if (!window.confirm('Bạn có chắc muốn xóa hội thoại này?')) return

        try {
            await chatAPI.deleteSession(sessionId)
            setSessions(prev => prev.filter(s => s.session_id !== sessionId))

            if (currentSession?.session_id === sessionId) {
                const remaining = sessions.filter(s => s.session_id !== sessionId)
                if (remaining.length > 0) {
                    setCurrentSession(remaining[0])
                } else {
                    await createNewSession()
                }
            }
        } catch (error) {
            console.error('Error deleting session:', error)
            setError('Không thể xóa hội thoại')
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Check file type
            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                'text/plain']

            const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
            const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
                setError('Chỉ hỗ trợ file PDF, DOC, DOCX, TXT')
                return
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File không được lớn hơn 10MB')
                return
            }

            setAttachedFile(file)
            setError('')
        }
    }

    const removeAttachedFile = () => {
        setAttachedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const sendMessage = async () => {
        if (!inputMessage.trim() && !attachedFile) return
        if (!currentSession) {
            await createNewSession() // Wait for session to be created
            return
        }

        const userMessage = inputMessage.trim()
        const file = attachedFile

        // Clear input immediately
        setInputMessage('')
        setAttachedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        // Add user message to UI
        const tempUserMsg = {
            role: 'user',
            content: userMessage,
            created_at: new Date().toISOString(),
            file: file ? file.name : null
        }
        setMessages(prev => [...prev, tempUserMsg])
        setIsLoading(true)
        setError('')

        try {
            let response

            if (file) {
                // Send with file
                const formData = new FormData()
                formData.append('message', userMessage)
                formData.append('file', file)

                response = await chatAPI.sendMessageWithFile(
                    currentSession.session_id,
                    formData
                )
            } else {
                // Send text only
                response = await chatAPI.sendMessage(
                    currentSession.session_id,
                    { message: userMessage }
                )
            }

            // Add assistant response
            const assistantMsg = {
                role: 'assistant',
                content: response.data.assistant_response,
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, assistantMsg])

            // Update session in list
            setSessions(prev => prev.map(s =>
                s.session_id === currentSession.session_id
                    ? { ...s, updated_at: new Date().toISOString() }
                    : s
            ))
        } catch (error) {
            console.error('Error sending message:', error)
            setError(error.response?.data?.detail || 'Có lỗi xảy ra khi gửi tin nhắn')
            // Remove the temporary user message on error
            setMessages(prev => prev.slice(0, -1))
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="chat-page">
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
                            className="nav-item"
                            onClick={() => navigate('/home')}
                        >
                            <FaFileAlt /> Tóm tắt văn bản
                        </button>
                        <button
                            className="nav-item active"
                        >
                            <FaComments /> AI Chat
                        </button>
                        <button
                            className="nav-item"
                            onClick={() => navigate('/history')}
                        >
                            <FaHistory /> Lịch sử
                        </button>
                    </nav>
                </aside>

                {/* Main Chat Area */}
                <main className="content-area">
                    <div className="chat-header">
                        <div className="header-content">
                            <div>
                                <h2>Chat với AI</h2>
                                <p>Hỏi đáp với AI về nội dung tài liệu của bạn</p>
                            </div>
                            <div className="chat-controls">
                                <select
                                    className="session-select"
                                    value={currentSession?.session_id || ''}
                                    onChange={(e) => {
                                        const selected = sessions.find(s => s.session_id === e.target.value)
                                        if (selected) setCurrentSession(selected)
                                    }}
                                >
                                    {sessions.map(session => (
                                        <option key={session.session_id} value={session.session_id}>
                                            {session.title || 'Hội thoại mới'}
                                        </option>
                                    ))}
                                </select>
                                <button className="btn btn-primary" onClick={createNewSession}>
                                    <FaPlus /> Hội thoại mới
                                </button>
                                {currentSession && (
                                    <button
                                        className="btn btn-outline"
                                        onClick={(e) => deleteSession(currentSession.session_id, e)}
                                        title="Xóa hội thoại"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="chat-container">
                        <div className="messages-container">
                            {messages.length === 0 ? (
                                <div className="empty-state">
                                    <FaRobot className="empty-icon" />
                                    <h3>Bắt đầu hội thoại</h3>
                                    <p>Gửi tin nhắn hoặc đính kèm tài liệu để AI phân tích</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`message ${msg.role}`}>
                                            <div className="message-avatar">
                                                {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                                            </div>
                                            <div className="message-content">
                                                {msg.file && (
                                                    <div className="message-file">
                                                        <FaFile /> {msg.file}
                                                    </div>
                                                )}
                                                <div className="message-text">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="message assistant">
                                            <div className="message-avatar">
                                                <FaRobot />
                                            </div>
                                            <div className="message-content">
                                                <div className="typing-indicator">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                                <button onClick={() => setError('')}><FaTimes /></button>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="chat-input-area">
                            {attachedFile && (
                                <div className="attached-file">
                                    <FaFile />
                                    <span>{attachedFile.name}</span>
                                    <button onClick={removeAttachedFile}>
                                        <FaTimes />
                                    </button>
                                </div>
                            )}

                            <div className="input-container">
                                <button
                                    className="attach-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isLoading}
                                >
                                    <FaPaperclip />
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".pdf,.docx,.txt"
                                    style={{ display: 'none' }}
                                />

                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nhập tin nhắn hoặc đính kèm tài liệu..."
                                    disabled={isLoading}
                                    rows={1}
                                />

                                <button
                                    className="send-btn"
                                    onClick={sendMessage}
                                    disabled={isLoading || (!inputMessage.trim() && !attachedFile)}
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default ChatPage

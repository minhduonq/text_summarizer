import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SummarizePage from './pages/SummarizePage'
import HistoryPage from './pages/HistoryPage'
import ChatPage from './pages/ChatPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/home"
                        element={<Navigate to="/summarize" replace />}
                    />
                    <Route
                        path="/summarize"
                        element={
                            <ProtectedRoute>
                                <SummarizePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <HistoryPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
                                <ChatPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App

import React, { useState } from 'react'
import Layout from '../components/Layout'
import { summarizerAPI } from '../services/api'
import {
    FaFileAlt, FaGlobe, FaCopy, FaDownload
} from 'react-icons/fa'
import './SummarizePage.css'

const SummarizePage = () => {
    const [activeTab, setActiveTab] = useState('text')

    // Summarization states
    const [textInput, setTextInput] = useState('')
    const [urlInput, setUrlInput] = useState('')
    const [summaryResult, setSummaryResult] = useState(null)
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [summaryError, setSummaryError] = useState('')

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

    return (
        <Layout>
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
        </Layout>
    )
}

export default SummarizePage

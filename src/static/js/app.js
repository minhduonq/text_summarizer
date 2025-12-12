const API_BASE = '/api/v1';
let chatSessionId = null;

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    // Hide results and errors
    hideResults();
    hideError();
}

// Summarize text
async function summarizeText() {
    const text = document.getElementById('text-input').value.trim();
    const length = document.getElementById('text-length').value;

    if (!text) {
        showError('Please enter some text to summarize.');
        return;
    }

    try {
        showLoading();
        hideError();

        const response = await fetch(`${API_BASE}/summarize/text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, length })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showError(`Error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Summarize URL
async function summarizeUrl() {
    const url = document.getElementById('url-input').value.trim();
    const length = document.getElementById('url-length').value;

    if (!url) {
        showError('Please enter a URL.');
        return;
    }

    try {
        showLoading();
        hideError();

        const response = await fetch(`${API_BASE}/summarize/url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, length })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showError(`Error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Summarize file
async function summarizeFile() {
    const fileInput = document.getElementById('file-input');
    const length = document.getElementById('file-length').value;

    if (!fileInput.files.length) {
        showError('Please select a file.');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        showLoading();
        hideError();

        const response = await fetch(`${API_BASE}/summarize/file?length=${length}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showError(`Error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Display results
function displayResults(data) {
    document.getElementById('summary-text').textContent = data.summary;
    document.getElementById('original-words').textContent = data.original_length;
    document.getElementById('summary-words').textContent = data.summary_length;
    document.getElementById('compression').textContent = `${(data.compression_ratio * 100).toFixed(0)}%`;

    document.getElementById('results').classList.remove('hidden');
}

// Copy to clipboard
function copyToClipboard() {
    const summaryText = document.getElementById('summary-text').textContent;
    navigator.clipboard.writeText(summaryText).then(() => {
        alert('Summary copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Show/hide loading
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    hideResults();
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Show/hide results
function hideResults() {
    document.getElementById('results').classList.add('hidden');
}

// Show/hide error
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

// ====== CHAT FUNCTIONALITY ======

// Initialize chat session when chat tab is opened
async function initChatSession() {
    if (chatSessionId) return; // Already initialized

    try {
        const response = await fetch(`${API_BASE}/chat/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to create chat session');
        }

        const data = await response.json();
        chatSessionId = data.session_id;
        console.log('Chat session created:', chatSessionId);
    } catch (error) {
        console.error('Error creating chat session:', error);
        showError('Failed to initialize chat. Please refresh the page.');
    }
}

// Send chat message
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) {
        return;
    }

    // Initialize session if needed
    if (!chatSessionId) {
        await initChatSession();
    }

    // Add user message to UI
    addMessageToChat('user', message);
    input.value = '';

    // Show loading indicator
    const loadingId = addLoadingMessage();

    try {
        const response = await fetch(`${API_BASE}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: chatSessionId,
                message: message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to send message');
        }

        const data = await response.json();

        // Remove loading indicator
        removeLoadingMessage(loadingId);

        // Add assistant response
        addMessageToChat('assistant', data.response);

    } catch (error) {
        removeLoadingMessage(loadingId);
        addMessageToChat('assistant', `Error: ${error.message}`);
    }
}

// Add message to chat UI
function addMessageToChat(role, content) {
    const messagesContainer = document.getElementById('chat-messages');

    // Remove welcome message if it exists
    const welcomeMsg = messagesContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message message-${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;

    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();

    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timestamp);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add loading message
function addLoadingMessage() {
    const messagesContainer = document.getElementById('chat-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message message-assistant';
    loadingDiv.id = 'loading-message-' + Date.now();

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = 'Thinking...';

    loadingDiv.appendChild(bubble);
    messagesContainer.appendChild(loadingDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return loadingDiv.id;
}

// Remove loading message
function removeLoadingMessage(loadingId) {
    const loadingMsg = document.getElementById(loadingId);
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

// Clear chat
async function clearChat() {
    if (!chatSessionId) {
        return;
    }

    if (!confirm('Are you sure you want to clear the chat history?')) {
        return;
    }

    try {
        await fetch(`${API_BASE}/chat/clear/${chatSessionId}`, {
            method: 'POST'
        });

        // Clear UI
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '<div class="welcome-message">👋 Chat cleared! Start a new conversation.</div>';

    } catch (error) {
        console.error('Error clearing chat:', error);
        showError('Failed to clear chat history.');
    }
}

// Handle Enter key in chat input (Shift+Enter for new line)
function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

// Override showTab to initialize chat when chat tab is opened
const originalShowTab = showTab;
showTab = function (tabName) {
    originalShowTab(tabName);
    if (tabName === 'chat') {
        initChatSession();
    }
};

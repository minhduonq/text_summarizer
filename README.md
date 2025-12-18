# Text Summarizer Application

Ứng dụng AI để tóm tắt văn bản tiếng Anh, hỗ trợ tóm tắt bài báo và nội dung trang web.

## Tính năng

- ✅ Tóm tắt văn bản trực tiếp với Google Gemini 1.5 Flash
- ✅ Tóm tắt từ URL (web scraping)
- ✅ Tóm tắt file (PDF, TXT, DOCX)
- ✅ Nhiều độ dài tóm tắt (short, medium, detailed)
- ✅ **Đăng ký và đăng nhập user (JWT Authentication)**
- ✅ **Bảo mật API với token-based authentication**
- ✅ **Chat AI với Gemini (lưu lịch sử vào database)**
- ✅ **Quản lý chat sessions (tạo, xem, xóa)**
- ✅ **Database persistence với SQLAlchemy**
- ✅ REST API
- ✅ Web UI đơn giản

## Tech Stack

- **Backend**: Python 3.8+, FastAPI
- **AI Model**: Google Gemini 1.5 Flash API
- **Database**: SQLite với SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens) với passlib & python-jose
- **Web Scraping**: BeautifulSoup4, newspaper3k
- **Frontend**: HTML, CSS, JavaScript

## Cấu trúc dự án

```
Text_Summarizer/
├── src/
│   ├── api/              # FastAPI endpoints
│   ├── models/           # AI models wrapper
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── static/           # Frontend files
├── data/                 # Data storage
├── logs/                 # Application logs
├── tests/                # Unit tests
├── config/               # Configuration files
├── requirements.txt
└── README.md
```

## Installation

```bash
# Tạo virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt
```

## Usage

```bash
# Cấu hình Gemini API key trong .env
# Lấy API key tại: https://aistudio.google.com/app/apikey
# Mở file .env và thay GEMINI_API_KEY

# Chạy ứng dụng
cd src
python main.py
```

Truy cập: http://localhost:8000

## Database

Database SQLite sẽ tự động được tạo khi chạy lần đầu tại `data/summarizer.db`.

Các tables:
- `users` - Thông tin user
- `chat_sessions` - Các phiên chat
- `messages` - Tin nhắn trong chat

## API Documentation

Swagger UI: http://localhost:8000/docs

### Authentication Endpoints

- **POST** `/api/v1/auth/register` - Đăng ký user mới
- **POST** `/api/v1/auth/login` - Đăng nhập (form data)
- **POST** `/api/v1/auth/login-json` - Đăng nhập (JSON)
- **GET** `/api/v1/auth/me` - Lấy thông tin user hiện tại (cần token)
- **GET** `/api/v1/auth/verify` - Xác thực token

Chi tiết: 
- [AUTHENTICATION.md](docs/AUTHENTICATION.md) - Authentication API
- [CHAT_API.md](docs/CHAT_API.md) - Chat với database
- [GEMINI_MIGRATION.md](docs/GEMINI_MIGRATION.md) - Migration từ local model

### Quick Start với Authentication

```python
import requests

# 1. Đăng ký
register_data = {
    "email": "user@example.com",
    "username": "myuser",
    "password": "mypassword123",
    "password_confirm": "mypassword123"
}
requests.post("http://localhost:8000/api/v1/auth/register", json=register_data)

# 2. Đăng nhập
login_data = {"username": "myuser", "password": "mypassword123"}
response = requests.post("http://localhost:8000/api/v1/auth/login-json", json=login_data)
token = response.json()["access_token"]

# 3. Sử dụng API với token
headers = {"Authorization": f"Bearer {token}"}
response = requests.get("http://localhost:8000/api/v1/auth/me", headers=headers)
print(response.json())
```

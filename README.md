# Text Summarizer Application

Ứng dụng AI để tóm tắt văn bản tiếng Anh, hỗ trợ tóm tắt bài báo và nội dung trang web.

## Tính năng

- ✅ Tóm tắt văn bản trực tiếp
- ✅ Tóm tắt từ URL (web scraping)
- ✅ Tóm tắt file (PDF, TXT, DOCX)
- ✅ Nhiều độ dài tóm tắt (short, medium, detailed)
- ✅ REST API
- ✅ Web UI đơn giản
- ✅ **Đăng ký và đăng nhập user (JWT Authentication)**
- ✅ **Bảo mật API với token-based authentication**

## Tech Stack

- **Backend**: Python 3.8+, FastAPI
- **AI Model**: Hugging Face Transformers (BART/T5/Pegasus)
- **Web Scraping**: BeautifulSoup4, newspaper3k
- **Database**: SQLite
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
# Chạy ứng dụng
python src/main.py
```

Truy cập: http://localhost:8000

## API Documentation

Swagger UI: http://localhost:8000/docs

### Authentication Endpoints

- **POST** `/api/v1/auth/register` - Đăng ký user mới
- **POST** `/api/v1/auth/login` - Đăng nhập (form data)
- **POST** `/api/v1/auth/login-json` - Đăng nhập (JSON)
- **GET** `/api/v1/auth/me` - Lấy thông tin user hiện tại (cần token)
- **GET** `/api/v1/auth/verify` - Xác thực token

Chi tiết: Xem [AUTHENTICATION.md](docs/AUTHENTICATION.md)

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

# Text Summarizer Application

Ứng dụng AI để tóm tắt văn bản tiếng Anh, hỗ trợ tóm tắt bài báo và nội dung trang web.

## Tính năng

- ✅ Tóm tắt văn bản trực tiếp
- ✅ Tóm tắt từ URL (web scraping)
- ✅ Tóm tắt file (PDF, TXT, DOCX)
- ✅ Nhiều độ dài tóm tắt (short, medium, detailed)
- ✅ REST API
- ✅ Web UI đơn giản

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

# Text Summarizer Application

Ứng dụng AI để tóm tắt văn bản tiếng Anh, hỗ trợ tóm tắt bài báo và nội dung trang web.

## Các tính năng chính

- Tóm tắt văn bản trực tiếp với Google Gemini 2.5 Flash
- Tóm tắt từ URL (web scraping)
- Tóm tắt file (PDF, TXT, DOCX)
- Nhiều độ dài tóm tắt (short, medium, detailed) 
- Trò chuyện liên tục
- Giao diện thân thiện, dễ sử dụng

## Installation (Backend)

```bash
# Tạo virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy ứng dụng
cd src
python main.py
```

## Instalation (Frontend)
```bash
# Truy cập vào thư mục dự án (text_summarizer)
cd frontend

# Cài đặt thư viện cần thiết
npm install

# Chạy ứng dụng
npm run dev
```



# Migration Guide: Local Model → Google Gemini 1.5 Flash

## Thay đổi chính

Project đã được chuyển từ local model (BART) sang Google Gemini 1.5 Flash API.

### Ưu điểm của Gemini 1.5 Flash:
- ✅ Không cần tải model lớn về máy (tiết kiệm ~2GB disk space)
- ✅ Xử lý nhanh hơn (không cần GPU local)
- ✅ Hỗ trợ token limit cao hơn (30,000 tokens vs 1,024)
- ✅ Chất lượng tốt hơn với khả năng hiểu ngữ cảnh tốt
- ✅ Dễ dàng scale và deploy

### Các thay đổi:

1. **Dependencies:**
   - ❌ Removed: `transformers`, `torch` (heavy packages)
   - ✅ Added: `google-generativeai` (lightweight)

2. **Configuration:**
   - Thêm `GEMINI_API_KEY` trong `.env`
   - Model name: `gemini-1.5-flash`

3. **Files changed:**
   - `src/models/summarizer.py` - GeminiModel wrapper
   - `src/services/summarization_service.py` - Sử dụng Gemini
   - `src/services/chat_service.py` - Sử dụng Gemini
   - `src/config/settings.py` - Thêm cấu hình Gemini

## Setup Instructions

### 1. Lấy Gemini API Key

1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập với Google account
3. Click "Create API Key"
4. Copy API key

### 2. Cập nhật .env file

Mở file `.env` và thay thế API key:

```env
GEMINI_API_KEY="your-actual-api-key-here"
```

⚠️ **QUAN TRỌNG:** Thay `your-actual-api-key-here` bằng API key thật của bạn!

### 3. Cài đặt dependencies mới

```bash
pip install google-generativeai
```

Hoặc cài đặt tất cả:

```bash
pip install -r requirements.txt
```

### 4. Chạy ứng dụng

```bash
cd src
python main.py
```

## API Usage Examples

### Summarization

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/summarize/text",
    json={
        "text": "Your long text here...",
        "length": "medium"  # short, medium, detailed
    }
)
summary = response.json()["summary"]
```

### Chat

```python
# Create session
session_response = requests.post("http://localhost:8000/api/v1/chat/session")
session_id = session_response.json()["session_id"]

# Chat
chat_response = requests.post(
    "http://localhost:8000/api/v1/chat/message",
    json={
        "session_id": session_id,
        "message": "What is this about?"
    }
)
reply = chat_response.json()["response"]
```

## Cost Considerations

Gemini 1.5 Flash pricing (as of Dec 2025):
- **FREE tier:** 15 requests/minute, 1 million tokens/day
- **Paid tier:** Very affordable (~$0.075 per 1M tokens)

For development/testing, free tier is usually sufficient.

## Troubleshooting

### Error: "API key not valid"
- Check your API key in `.env` file
- Make sure you copied the full key
- Verify key is active at https://aistudio.google.com/app/apikey

### Error: "Quota exceeded"
- Free tier has limits: 15 requests/minute
- Wait a moment or upgrade to paid tier

### Error: "Module 'google.generativeai' not found"
```bash
pip install google-generativeai
```

## Rollback to Local Model (if needed)

Nếu muốn quay lại local model:

1. Restore `requirements.txt`:
```
transformers>=4.30.0
torch>=2.0.0
```

2. Restore model files from git history
3. Update `.env` with old MODEL_NAME

## Questions?

Check API documentation: http://localhost:8000/docs

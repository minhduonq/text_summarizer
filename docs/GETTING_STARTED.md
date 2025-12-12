# Getting Started Guide

## 1. Cài đặt môi trường

### Tạo virtual environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Cài đặt dependencies
```powershell
pip install -r requirements.txt
```

## 2. Cấu hình

### Tạo file .env
```powershell
cp .env.example .env
```

Chỉnh sửa file `.env` nếu cần thay đổi cấu hình.

## 3. Chạy ứng dụng

### Development mode
```powershell
python src/main.py
```

### Production mode (với Uvicorn)
```powershell
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## 4. Truy cập ứng dụng

- **Web UI**: http://localhost:8000/static/index.html
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

## 5. Test API với curl

### Text summarization
```powershell
curl -X POST "http://localhost:8000/api/v1/summarize/text" `
  -H "Content-Type: application/json" `
  -d '{\"text\": \"Your long text here...\", \"length\": \"medium\"}'
```

### URL summarization
```powershell
curl -X POST "http://localhost:8000/api/v1/summarize/url" `
  -H "Content-Type: application/json" `
  -d '{\"url\": \"https://example.com/article\", \"length\": \"medium\"}'
```

## 6. Chạy tests

```powershell
pytest tests/ -v
```

## Troubleshooting

### Lỗi import transformers
Đảm bảo đã cài đặt đầy đủ dependencies:
```powershell
pip install transformers torch
```

### Model download chậm
Model sẽ được tải về lần đầu chạy (khoảng 1.6GB). Có thể mất một lúc.

### Lỗi CUDA/GPU
Nếu không có GPU, model sẽ tự động chạy trên CPU (chậm hơn nhưng vẫn hoạt động).

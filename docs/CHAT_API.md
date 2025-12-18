# Chat API với Database Documentation

## Tổng quan

Hệ thống chat đã được nâng cấp với database persistence, cho phép:
- ✅ Lưu trữ lịch sử chat lâu dài
- ✅ Quản lý nhiều sessions chat
- ✅ Liên kết chat với user account
- ✅ Xem lại lịch sử chat bất kỳ lúc nào

## Database Schema

### Tables

**chat_sessions**
- `id`: Integer, Primary Key
- `session_id`: String, Unique (UUID)
- `user_id`: Integer, Foreign Key → users.id
- `title`: String, Optional
- `created_at`: DateTime
- `updated_at`: DateTime

**messages**
- `id`: Integer, Primary Key
- `session_id`: Integer, Foreign Key → chat_sessions.id
- `role`: String ("user" or "assistant")
- `content`: Text
- `created_at`: DateTime

## API Endpoints

### 1. Tạo Chat Session Mới

**POST** `/api/v1/chat/sessions`

Tạo một chat session mới cho user đã đăng nhập.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Chat về AI" // Optional
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": 1,
  "title": "Chat về AI",
  "created_at": "2025-12-15T10:00:00",
  "updated_at": null,
  "message_count": 0
}
```

---

### 2. Lấy Danh Sách Chat Sessions

**GET** `/api/v1/chat/sessions`

Lấy tất cả chat sessions của user hiện tại.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": 1,
    "title": "Chat về AI",
    "created_at": "2025-12-15T10:00:00",
    "updated_at": "2025-12-15T10:05:00",
    "message_count": 5
  },
  {
    "id": 2,
    "session_id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": 1,
    "title": "Chat về Python",
    "created_at": "2025-12-15T11:00:00",
    "updated_at": "2025-12-15T11:10:00",
    "message_count": 8
  }
]
```

---

### 3. Gửi Tin Nhắn

**POST** `/api/v1/chat/sessions/{session_id}/messages`

Gửi tin nhắn trong một chat session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "message": "What is machine learning?",
  "context": "optional context here" // Optional
}
```

**Response (200 OK):**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_message": "What is machine learning?",
  "assistant_response": "Machine learning is a subset of artificial intelligence...",
  "timestamp": "2025-12-15T10:05:00"
}
```

---

### 4. Xem Lịch Sử Chat

**GET** `/api/v1/chat/sessions/{session_id}/history`

Lấy toàn bộ lịch sử tin nhắn của một session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Chat về AI",
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "What is AI?",
      "created_at": "2025-12-15T10:00:00"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "AI stands for Artificial Intelligence...",
      "created_at": "2025-12-15T10:00:05"
    },
    {
      "id": 3,
      "role": "user",
      "content": "What is machine learning?",
      "created_at": "2025-12-15T10:05:00"
    },
    {
      "id": 4,
      "role": "assistant",
      "content": "Machine learning is a subset of AI...",
      "created_at": "2025-12-15T10:05:05"
    }
  ],
  "total_messages": 4
}
```

---

### 5. Cập Nhật Tiêu Đề Session

**PATCH** `/api/v1/chat/sessions/{session_id}/title?title=New Title`

Cập nhật tiêu đề của chat session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `title`: New title for the session

**Response (200 OK):**
```json
{
  "message": "Title updated successfully",
  "title": "New Title"
}
```

---

### 6. Xóa Chat Session

**DELETE** `/api/v1/chat/sessions/{session_id}`

Xóa một chat session và tất cả tin nhắn trong đó.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Session deleted successfully"
}
```

---

## Usage Examples

### Python Example

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# 1. Login
login_response = requests.post(
    f"{BASE_URL}/auth/login-json",
    json={"username": "myuser", "password": "mypassword"}
)
token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Tạo chat session
session_response = requests.post(
    f"{BASE_URL}/chat/sessions",
    json={"title": "My AI Chat"},
    headers=headers
)
session_id = session_response.json()["session_id"]

# 3. Gửi tin nhắn
message_response = requests.post(
    f"{BASE_URL}/chat/sessions/{session_id}/messages",
    json={"message": "Hello, how are you?"},
    headers=headers
)
assistant_reply = message_response.json()["assistant_response"]
print(f"Assistant: {assistant_reply}")

# 4. Xem lịch sử
history_response = requests.get(
    f"{BASE_URL}/chat/sessions/{session_id}/history",
    headers=headers
)
messages = history_response.json()["messages"]
for msg in messages:
    print(f"{msg['role']}: {msg['content']}")

# 5. Lấy tất cả sessions
sessions_response = requests.get(
    f"{BASE_URL}/chat/sessions",
    headers=headers
)
all_sessions = sessions_response.json()
print(f"Total sessions: {len(all_sessions)}")

# 6. Xóa session
delete_response = requests.delete(
    f"{BASE_URL}/chat/sessions/{session_id}",
    headers=headers
)
print(delete_response.json()["message"])
```

### cURL Examples

**Tạo session:**
```bash
curl -X POST "http://localhost:8000/api/v1/chat/sessions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Chat"}'
```

**Gửi tin nhắn:**
```bash
curl -X POST "http://localhost:8000/api/v1/chat/sessions/SESSION_ID/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

**Xem lịch sử:**
```bash
curl -X GET "http://localhost:8000/api/v1/chat/sessions/SESSION_ID/history" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security

- ✅ Tất cả endpoints yêu cầu authentication
- ✅ User chỉ có thể truy cập chat sessions của mình
- ✅ Session ownership được validate trước mỗi operation
- ✅ Database relationships với CASCADE delete

## Error Handling

**401 Unauthorized:**
- Token không hợp lệ hoặc hết hạn

**403 Forbidden:**
- User cố gắng truy cập session của người khác

**404 Not Found:**
- Session không tồn tại

**500 Internal Server Error:**
- Lỗi server hoặc database

---

## Database Migrations

Sau khi update code, chạy lại server để tạo tables:

```bash
cd src
python main.py
```

Database sẽ tự động khởi tạo các tables mới khi startup.

## Testing

Access Swagger UI để test: http://localhost:8000/docs

1. Authenticate với `/auth/login`
2. Click "Authorize" và nhập token
3. Test các chat endpoints

# Authentication API Documentation

## Endpoints

### 1. Register User
**POST** `/api/v1/auth/register`

Đăng ký user mới.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "password_confirm": "password123",
  "full_name": "Full Name" // optional
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2025-12-13T10:00:00",
  "updated_at": null
}
```

---

### 2. Login (Form Data)
**POST** `/api/v1/auth/login`

Đăng nhập với form data (OAuth2 standard).

**Request Body (Form Data):**
```
username=username
password=password123
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 3. Login (JSON)
**POST** `/api/v1/auth/login-json`

Đăng nhập với JSON payload.

**Request Body:**
```json
{
  "username": "username",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 4. Get Current User
**GET** `/api/v1/auth/me`

Lấy thông tin user hiện tại.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2025-12-13T10:00:00",
  "updated_at": null
}
```

---

### 5. Verify Token
**GET** `/api/v1/auth/verify`

Xác thực token có hợp lệ không.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user_id": 1,
  "username": "username",
  "email": "user@example.com"
}
```

---

## Usage Examples

### Sử dụng với cURL:

**Register:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "password_confirm": "password123",
    "full_name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Access Protected Endpoint:**
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer <your_access_token>"
```

### Sử dụng với Python:

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Register
register_data = {
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "password_confirm": "password123",
    "full_name": "Test User"
}
response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
print(response.json())

# Login
login_data = {
    "username": "testuser",
    "password": "password123"
}
response = requests.post(f"{BASE_URL}/auth/login-json", json=login_data)
token = response.json()["access_token"]

# Access protected endpoint
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
print(response.json())
```

---

## Security Notes

1. **SECRET_KEY**: Đổi SECRET_KEY trong production! Sử dụng key mạnh và ngẫu nhiên.
2. **HTTPS**: Luôn sử dụng HTTPS trong production để bảo vệ token.
3. **Token Storage**: Lưu token an toàn ở client (httpOnly cookies hoặc secure storage).
4. **Password Requirements**: Tối thiểu 6 ký tự (có thể tăng trong production).
5. **Rate Limiting**: Nên thêm rate limiting cho login endpoint để tránh brute force.

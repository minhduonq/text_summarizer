# Text Summarizer Frontend

Ứng dụng React chuyên nghiệp cho Text Summarizer với đầy đủ các tính năng authentication, tóm tắt văn bản, và AI chat.

## Cấu trúc dự án

```
frontend/
├── public/
├── src/
│   ├── components/         # React components
│   │   └── ProtectedRoute.jsx
│   ├── contexts/          # Context providers
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── HomePage.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

### 3. Build cho production

```bash
npm run build
```

## Tính năng chính

### 🏠 Landing Page
- Hero section với animation
- Giới thiệu tính năng sản phẩm
- Call-to-action buttons
- Responsive design

### 🔐 Authentication
- Đăng ký tài khoản mới
- Đăng nhập với username/email
- JWT token authentication
- Protected routes
- Session management

### 📝 Tóm tắt văn bản
- Tóm tắt từ văn bản trực tiếp
- Tóm tắt từ URL
- Tải xuống kết quả
- Sao chép kết quả
- Hiển thị thống kê

### 💬 AI Chat
- Chat với AI assistant
- Real-time messaging
- Typing indicator
- Chat history

### 📊 Lịch sử
- Xem lại các bản tóm tắt
- Tìm kiếm và filter
- Chi tiết từng bản tóm tắt

## Công nghệ sử dụng

- **React 18** - UI library
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Vite** - Build tool
- **CSS3** - Styling với CSS variables

## API Endpoints

Ứng dụng kết nối với backend qua proxy tại `/api`:

- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login-json` - Đăng nhập
- `GET /api/v1/auth/me` - Thông tin user
- `POST /api/v1/summarize/text` - Tóm tắt văn bản
- `POST /api/v1/summarize/url` - Tóm tắt URL
- `POST /api/v1/chat` - AI Chat
- `GET /api/v1/summarize/history` - Lịch sử

## Cấu hình

### Proxy
Vite proxy được cấu hình trong `vite.config.js` để forward requests từ `/api` đến backend tại `http://localhost:8000`.

### Environment Variables
Tạo file `.env` nếu cần:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Responsive Design

Ứng dụng được tối ưu cho:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (<768px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Guidelines

### Component Structure
```jsx
import React from 'react'
import './ComponentName.css'

const ComponentName = () => {
  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  )
}

export default ComponentName
```

### Naming Conventions
- Components: PascalCase (e.g., `LoginPage.jsx`)
- CSS files: Same name as component (e.g., `LoginPage.css`)
- Functions: camelCase (e.g., `handleSubmit`)
- CSS classes: kebab-case (e.g., `login-container`)

## Troubleshooting

### Port already in use
```bash
# Change port in vite.config.js
server: {
  port: 3001
}
```

### CORS errors
Đảm bảo backend đã cấu hình CORS cho `http://localhost:3000`

## License

MIT

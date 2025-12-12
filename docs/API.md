# API Documentation

## Endpoints

### Health Check
```
GET /api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T10:00:00",
  "service": "Text Summarizer API"
}
```

### Summarize Text
```
POST /api/v1/summarize/text
```

Request Body:
```json
{
  "text": "Your long text here...",
  "length": "medium"  // Options: "short", "medium", "detailed"
}
```

Response:
```json
{
  "summary": "Generated summary text...",
  "original_length": 150,
  "summary_length": 45,
  "compression_ratio": 0.30
}
```

### Summarize URL
```
POST /api/v1/summarize/url
```

Request Body:
```json
{
  "url": "https://example.com/article",
  "length": "medium"
}
```

Response: Same as text summarization

### Summarize File
```
POST /api/v1/summarize/file?length=medium
```

Form Data:
- `file`: File to upload (PDF, TXT, or DOCX)
- `length`: (Query parameter) "short", "medium", or "detailed"

Response: Same as text summarization

## Summary Length Presets

| Preset | Min Words | Max Words | Use Case |
|--------|-----------|-----------|----------|
| short | 20 | 80 | Quick overview |
| medium | 40 | 150 | Standard summary |
| detailed | 80 | 250 | Comprehensive summary |

## Error Responses

```json
{
  "detail": "Error message here"
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request (invalid input)
- 422: Validation Error
- 500: Internal Server Error

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

## Authentication

Currently no authentication required. Consider adding API keys in production.

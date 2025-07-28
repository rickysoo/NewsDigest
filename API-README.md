# FMT News Digest REST API

A comprehensive REST API system for the FMT News Digest automation application. This API provides endpoints for digest generation, history management, and system monitoring.

## 🚀 Deployment URL

When deployed on Replit, your API will be available at:
```
https://your-replit-app-name.replit.app
```

## 📋 API Endpoints

### Base URL
```
https://your-replit-app-name.replit.app/api
```

### Health & Status

#### `GET /api/health`
Health check endpoint that returns API status and uptime.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-28T16:00:00.000Z",
  "uptime": 3600000,
  "version": "1.0.0"
}
```

#### `GET /api/stats`
Returns API usage statistics and metrics.

**Response:**
```json
{
  "totalRequests": 150,
  "digestsGenerated": 12,
  "lastGenerated": "2025-07-28T15:30:00.000Z",
  "uptime": 14400000,
  "uptimeHours": 4.0
}
```

#### `GET /api/system/status`
Comprehensive system status including all services.

**Response:**
```json
{
  "api": "running",
  "database": "not connected",
  "emailService": "configured",
  "openaiService": "configured",
  "lastDigest": "2025-07-28T15:30:00.000Z",
  "nextScheduled": null,
  "environment": "production"
}
```

### Configuration

#### `GET /api/config`
Returns current system configuration (with sensitive data masked).

**Response:**
```json
{
  "sources": ["fmt"],
  "recipients": ["ri***@rickysoo.com"],
  "interval": 8,
  "lastRun": "2025-07-28T15:30:00.000Z",
  "scheduleNextRun": "2025-07-28T23:30:00.000Z"
}
```

### Digest Management

#### `POST /api/digest/generate`
Generate and send a news digest immediately.

**Rate Limit:** 10 requests per hour per IP

**Response (Success):**
```json
{
  "success": true,
  "message": "Digest generated and sent successfully",
  "timestamp": "2025-07-28T16:00:00.000Z",
  "id": 1690560000000
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "OpenAI API key not configured",
  "timestamp": "2025-07-28T16:00:00.000Z"
}
```

#### `GET /api/digest/history`
Get digest generation history with pagination.

**Query Parameters:**
- `limit` (optional): Number of results (max 100, default 20)
- `offset` (optional): Pagination offset (default 0)

**Example:** `/api/digest/history?limit=5&offset=10`

**Response:**
```json
{
  "digests": [
    {
      "id": 1690560000000,
      "timestamp": "2025-07-28T16:00:00.000Z",
      "status": "success",
      "source": "api",
      "output": "Digest generation output..."
    }
  ],
  "total": 25,
  "limit": 5,
  "offset": 10,
  "hasMore": true
}
```

#### `GET /api/digest/:id`
Get specific digest details by ID.

**Response:**
```json
{
  "id": 1690560000000,
  "timestamp": "2025-07-28T16:00:00.000Z",
  "status": "success",
  "source": "api",
  "output": "Complete digest generation output..."
}
```

### News

#### `GET /api/news/latest`
Get latest news articles (placeholder for future enhancement).

**Response:**
```json
{
  "message": "News fetching endpoint - requires extraction of news service from digest script",
  "timestamp": "2025-07-28T16:00:00.000Z",
  "note": "Use POST /api/digest/generate to get news with digest"
}
```

### Documentation

#### `GET /api/docs`
Complete API documentation in JSON format.

#### `GET /api`
API root with basic information and links.

## 🔧 Usage Examples

### cURL Examples

**Health Check:**
```bash
curl https://your-replit-app.replit.app/api/health
```

**Generate Digest:**
```bash
curl -X POST https://your-replit-app.replit.app/api/digest/generate
```

**Get History:**
```bash
curl "https://your-replit-app.replit.app/api/digest/history?limit=5"
```

**Get Configuration:**
```bash
curl https://your-replit-app.replit.app/api/config
```

### JavaScript Examples

**Using Fetch API:**
```javascript
// Generate digest
const generateDigest = async () => {
  const response = await fetch('https://your-replit-app.replit.app/api/digest/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log(data);
};

// Get digest history
const getHistory = async () => {
  const response = await fetch('https://your-replit-app.replit.app/api/digest/history?limit=10');
  const data = await response.json();
  console.log(data);
};

// Check system status
const checkStatus = async () => {
  const response = await fetch('https://your-replit-app.replit.app/api/system/status');
  const data = await response.json();
  console.log(data);
};
```

### Python Examples

**Using requests library:**
```python
import requests

BASE_URL = "https://your-replit-app.replit.app/api"

# Generate digest
def generate_digest():
    response = requests.post(f"{BASE_URL}/digest/generate")
    return response.json()

# Get digest history
def get_history(limit=10):
    response = requests.get(f"{BASE_URL}/digest/history?limit={limit}")
    return response.json()

# Check health
def check_health():
    response = requests.get(f"{BASE_URL}/health")
    return response.json()
```

## 🛡️ Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **Digest Generation:** 10 requests per hour per IP
- **Rate limit exceeded response:**
```json
{
  "error": "Too many requests, please try again later"
}
```

## 🌐 CORS & Security

- CORS enabled for all origins
- Rate limiting implemented
- No authentication required (public API)
- Sensitive configuration data is masked in responses

## 📱 Web Interface

The API includes a built-in web interface accessible at:
```
https://your-replit-app.replit.app/
```

Features:
- Real-time API status monitoring
- Interactive digest generation
- History viewing
- Complete endpoint documentation
- Usage examples with current domain

## 🚀 Deployment Steps

1. **Upload API files** to your Replit project:
   - `api-server.js` - Main API server
   - `public/index.html` - Web interface
   - `api-package.json` - API-specific package.json

2. **Update main package.json** to use API server:
   ```json
   {
     "scripts": {
       "start": "node api-server.js",
       "dev": "node api-server.js"
     }
   }
   ```

3. **Set Environment Variables** in Replit Secrets:
   - `OPENAI_API_KEY`
   - `EMAIL_USER`
   - `SMTP_PASSWORD`
   - `RECIPIENT_EMAIL`
   - `SMTP_HOST`
   - `SMTP_PORT`

4. **Deploy** using Replit's deployment feature

5. **Test** your API at `https://your-app.replit.app/api/health`

## 🔧 Integration with Existing Digest System

The API server works alongside your existing digest automation:

- **Scheduled Generation:** Your existing cron-based system continues to run
- **Manual Generation:** API provides on-demand digest generation
- **Monitoring:** API tracks all digest generations from both sources
- **History:** Unified history of scheduled and manual generations

## 📊 Monitoring & Logs

- **Real-time Stats:** Available via `/api/stats` endpoint
- **Health Monitoring:** Continuous health checks via `/api/health`
- **Generation History:** Complete log via `/api/digest/history`
- **System Status:** Component status via `/api/system/status`

## 🆘 Troubleshooting

**API not responding:**
- Check if server is running: `GET /api/health`
- Verify environment variables are set
- Check Replit deployment logs

**Digest generation fails:**
- Verify OpenAI API key: `GET /api/system/status`
- Check email configuration: `GET /api/config`
- Review error messages in generation response

**Rate limit issues:**
- Wait for rate limit window to reset
- Implement proper retry logic with exponential backoff
- Monitor usage via `/api/stats`

## 🔄 Future Enhancements

- Database integration for persistent storage
- Webhook support for digest completion notifications
- Authentication and API key management
- Advanced filtering and search capabilities
- Real-time WebSocket updates
- Metrics dashboard with charts and graphs
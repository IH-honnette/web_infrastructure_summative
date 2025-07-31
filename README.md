# IP Privacy Checker 🔒

A modern web application that helps users understand their digital footprint and privacy exposure by analyzing IP addresses. The application detects VPN, proxy, and TOR usage while providing detailed geolocation information and privacy tips.

## 🌟 Features

- **IP Address Analysis**: Check any IP address or your own IP
- **Privacy Detection**: Identify VPN, proxy, and TOR network usage
- **Geolocation**: Detailed location information with interactive maps
- **Security Assessment**: Comprehensive security analysis and risk scoring
- **Search History**: Track and filter previous searches
- **Statistics Dashboard**: View analytics on privacy patterns
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Data**: Live information from reliable APIs

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **APIs**: IP Geolocation API (RapidAPI)
- **Maps**: Leaflet.js for interactive maps
- **Styling**: Modern CSS with responsive design
- **Containerization**: Docker
- **Load Balancing**: HAProxy

## 📋 Prerequisites

- Node.js 16+ 
- Docker and Docker Compose
- RapidAPI account with IP Geolocation API access

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ip-privacy-checker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
# Copy the example file
cp config.env.example .env

# Edit the file and add your RapidAPI key
RAPIDAPI_KEY=your_rapidapi_key_here
PORT=8080
```

### 4. Get RapidAPI Key
1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to [IP Geolocation API](https://rapidapi.com/ip-geo-location-and-timezone-api)
3. Copy your API key and add it to the `.env` file

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🐳 Docker Deployment

### Build the Docker Image
```bash
# Build the image
docker build -t your-dockerhub-username/ip-privacy-checker:v1 .

# Test locally
docker run -p 8080:8080 -e RAPIDAPI_KEY=your_api_key your-dockerhub-username/ip-privacy-checker:v1

# Verify it works
curl http://localhost:8080
```

### Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Push the image
docker push your-dockerhub-username/ip-privacy-checker:v1
```

## 🌐 Production Deployment

### Deploy on Lab Infrastructure

#### 1. Deploy on Web-01
```bash
# SSH into web-01
ssh ubuntu@localhost -p 2211

# Pull and run the application
docker pull your-dockerhub-username/ip-privacy-checker:v1
docker run -d --name ip-privacy-app --restart unless-stopped \
  -p 8080:8080 \
  -e RAPIDAPI_KEY=your_api_key \
  your-dockerhub-username/ip-privacy-checker:v1

# Verify the application is running
curl http://localhost:8080
```

#### 2. Deploy on Web-02
```bash
# SSH into web-02
ssh ubuntu@localhost -p 2212

# Pull and run the application
docker pull your-dockerhub-username/ip-privacy-checker:v1
docker run -d --name ip-privacy-app --restart unless-stopped \
  -p 8080:8080 \
  -e RAPIDAPI_KEY=your_api_key \
  your-dockerhub-username/ip-privacy-checker:v1

# Verify the application is running
curl http://localhost:8080
```

#### 3. Configure Load Balancer (lb-01)
```bash
# SSH into lb-01
ssh ubuntu@localhost -p 2210

# Update HAProxy configuration
sudo tee /etc/haproxy/haproxy.cfg > /dev/null << 'EOF'
global
    daemon
    maxconn 256

defaults
    mode http
    timeout connect 5s
    timeout client  50s
    timeout server  50s

frontend http-in
    bind *:80
    default_backend webapps

backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
    http-response set-header X-Served-By %[srv_name]
EOF

# Reload HAProxy
sudo haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg
```

#### 4. Test Load Balancing
```bash
# Test from your host machine
for i in {1..6}; do
  echo "Request $i:"
  curl -I http://localhost:8082 | grep "x-served-by"
  echo
done
```

## 📊 API Endpoints

### GET `/api/ip/:ipAddress`
Check information for a specific IP address.

**Parameters:**
- `ipAddress` (path): IPv4 address to check

**Response:**
```json
{
  "success": true,
  "data": {
    "ip": "8.8.8.8",
    "type": "IPv4",
    "city": { "name": "Mountain View" },
    "country": { "name": "United States" },
    "security": {
      "is_proxy": false,
      "is_tor": false,
      "is_crawler": false,
      "is_thread": false
    }
  }
}
```

### GET `/api/my-ip`
Get information about the client's IP address.

### GET `/api/history`
Get search history with optional filtering.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `filter` (optional): Filter by security status (safe, proxy, tor)

### GET `/api/stats`
Get application statistics.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RAPIDAPI_KEY` | Your RapidAPI key | Required |
| `PORT` | Server port | 8080 |

### Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: IP address format validation
- **Rate Limiting**: API request throttling
- **Error Handling**: Comprehensive error management

## 🧪 Testing

### Manual Testing
1. **IP Lookup**: Enter a valid IP address and verify results
2. **My IP**: Click "Check My IP" to test current IP detection
3. **History**: Verify search history is saved and filterable
4. **Load Balancing**: Test round-robin distribution between servers

### Automated Testing
```bash
# Run tests (if implemented)
npm test

# Health check
curl http://localhost:8080/api/stats
```

## 📈 Performance Optimization

- **Caching**: API responses cached in memory
- **Compression**: Gzip compression enabled
- **CDN**: Static assets served efficiently
- **Database**: In-memory storage for development (use Redis/PostgreSQL for production)

## 🔒 Security Considerations

### API Key Management
- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate API keys regularly
- Monitor API usage and rate limits

### Production Hardening
- Use HTTPS in production
- Implement proper logging
- Set up monitoring and alerting
- Regular security updates
- Database security (if using persistent storage)

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error (403)**
   - Verify your RapidAPI key is correct
   - Check your RapidAPI subscription status
   - Ensure the key has proper permissions

2. **Application Not Starting**
   - Check if port 8080 is available
   - Verify all environment variables are set
   - Check Docker logs: `docker logs container_name`

3. **Load Balancer Issues**
   - Verify HAProxy configuration syntax
   - Check if both web servers are accessible
   - Test individual server connectivity

### Debug Commands
```bash
# Check application logs
docker logs ip-privacy-app

# Test API connectivity
curl http://localhost:8080/api/stats

# Check HAProxy status
docker exec -it lb-01 haproxy -c -f /etc/haproxy/haproxy.cfg

# Monitor load balancing
watch -n 1 'curl -s http://localhost:8082/api/stats | grep "x-served-by"'
```

## 📝 API Documentation

### IP Geolocation API
- **Provider**: RapidAPI
- **Documentation**: [IP Geolocation API Docs](https://rapidapi.com/ip-geo-location-and-timezone-api)
- **Rate Limits**: Varies by subscription plan
- **Features**: Geolocation, security detection, timezone info

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IP Geolocation API**: Provided by RapidAPI for geolocation data
- **Leaflet.js**: Open-source mapping library
- **Font Awesome**: Icons used throughout the application
- **OpenStreetMap**: Map tiles and location data

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for digital privacy awareness** 
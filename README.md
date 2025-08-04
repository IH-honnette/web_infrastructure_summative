# Weather & Agriculture Insights 🌾

A modern web application that empowers Rwandan farmers with data-driven weather forecasts and agricultural insights. The application provides real-time weather data, crop-specific recommendations, and planting/harvesting advice to help farmers make informed decisions and improve crop yields.

## 🌟 Features

- **Real-time Weather Data**: Current weather conditions for major Rwandan cities and villages
- **7-Day Weather Forecast**: Extended weather predictions for planning
- **Crop-Specific Analysis**: Tailored recommendations for 6 major crops (Maize, Beans, Potatoes, Rice, Coffee, Tea)
- **Agricultural Insights**: Planting advice, risk assessments, and farming recommendations
- **Interactive Interface**: Modern, responsive design optimized for mobile devices
- **Location-Based Data**: Weather information for 10 major Rwandan locations
- **Risk Assessment**: Color-coded risk levels (Low, Medium, High) for farming activities
- **Usage Statistics**: Track application usage and popular locations

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Weather API**: OpenWeatherMap API (OneCall 3.0)
- **Styling**: Modern CSS with glassmorphism design
- **Containerization**: Docker
- **Load Balancing**: HAProxy

## 📋 Prerequisites

- Node.js 16+ 
- Docker and Docker Compose
- OpenWeatherMap API key 

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone <web_infrastructure_summative>
cd weather-agriculture-insights
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

# Edit the file and add your OpenWeatherMap API key
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
PORT=8080
```

### 4. Get OpenWeatherMap API Key
1. Sign up at [OpenWeatherMap](https://openweathermap.org)
2. Subscribe to [OneCall API 3.0](https://openweathermap.org/api/one-call-3)
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
docker build -t your-dockerhub-username/weather-agriculture-insights:v1 .

# Test locally
docker run -p 8080:8080 -e OPENWEATHER_API_KEY=your_api_key your-dockerhub-username/weather-agriculture-insights:v1

# Verify it works
curl http://localhost:8080
```

### Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Push the image
docker push your-dockerhub-username/weather-agriculture-insights:v1
```

## 🌐 Production Deployment

### Deploy on Lab Infrastructure

#### 1. Deploy on Web-01
```bash
# SSH into web-01
ssh ubuntu@localhost -p 2211

# Pull and run the application
docker pull your-dockerhub-username/weather-agriculture-insights:v1
docker run -d --name weather-agriculture-app --restart unless-stopped \
  -p 8080:8080 \
  -e OPENWEATHER_API_KEY=your_api_key \
  your-dockerhub-username/weather-agriculture-insights:v1

# Verify the application is running
curl http://localhost:8080
```

#### 2. Deploy on Web-02
```bash
# SSH into web-02
ssh ubuntu@localhost -p 2212

# Pull and run the application
docker pull your-dockerhub-username/weather-agriculture-insights:v1
docker run -d --name weather-agriculture-app --restart unless-stopped \
  -p 8080:8080 \
  -e OPENWEATHER_API_KEY=your_api_key \
  your-dockerhub-username/weather-agriculture-insights:v1

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

### GET `/api/weather/:location`
Get current weather data for a specific location.

**Parameters:**
- `location` (path): Rwandan city/village name (e.g., kigali, butare)

**Response:**
```json
{
  "success": true,
  "location": "Kigali",
  "coordinates": { "lat": -1.9441, "lon": 30.0619 },
  "current_weather": {
    "temp": 23.78,
    "feels_like": 22.97,
    "humidity": 29,
    "wind_speed": 3.09,
    "weather": [{"description": "few clouds"}]
  },
  "timezone": "Africa/Kigali"
}
```

### GET `/api/forecast/:location`
Get 7-day weather forecast for a location.

### GET `/api/agriculture/:location/:crop`
Get agricultural insights for a specific crop and location.

**Parameters:**
- `location` (path): Rwandan city/village name
- `crop` (path): Crop type (maize, beans, potatoes, rice, coffee, tea)

**Response:**
```json
{
  "success": true,
  "location": "Kigali",
  "crop": "maize",
  "analysis": {
    "crop": "Maize",
    "current_conditions": {
      "temperature": 23.78,
      "humidity": 29,
      "weather": "few clouds",
      "temp_status": "optimal"
    },
    "recommendations": [
      "Excellent conditions for planting. Proceed with planting activities."
    ],
    "alerts": [],
    "planting_advice": "Excellent conditions for planting. Proceed with planting activities.",
    "risk_level": "low"
  },
  "crop_info": {
    "name": "Maize",
    "planting_season": "March-April, September-October",
    "harvesting_season": "July-August, January-February",
    "optimal_temp": {"min": 18, "max": 32},
    "drought_tolerance": "moderate",
    "flood_tolerance": "low"
  }
}
```

### GET `/api/locations`
Get list of supported Rwandan locations.

### GET `/api/crops`
Get list of supported crop types.

### GET `/api/history`
Get search history with optional filtering.

### GET `/api/stats`
Get application usage statistics.

## 🌱 Supported Crops

| Crop | Planting Season | Harvesting Season | Optimal Temp | Drought Tolerance |
|------|----------------|-------------------|--------------|-------------------|
| Maize | Mar-Apr, Sep-Oct | Jul-Aug, Jan-Feb | 18-32°C | Moderate |
| Beans | Mar-Apr, Sep-Oct | Jun-Jul, Dec-Jan | 15-30°C | Low |
| Potatoes | Feb-Mar, Aug-Sep | May-Jun, Nov-Dec | 15-25°C | Moderate |
| Rice | Mar-Apr, Sep-Oct | Jul-Aug, Jan-Feb | 20-35°C | Low |
| Coffee | Mar-Apr | Oct-Dec | 18-28°C | Moderate |
| Tea | Mar-Apr, Sep-Oct | Year-round | 15-30°C | Moderate |

## 🇷🇼 Supported Locations

- **Kigali** - Capital city
- **Butare** - Southern Rwanda
- **Gisenyi** - Western Rwanda (Lake Kivu)
- **Ruhengeri** - Northern Rwanda
- **Kibuye** - Western Rwanda
- **Kibungo** - Eastern Rwanda
- **Nyanza** - Southern Rwanda
- **Cyangugu** - Southwestern Rwanda
- **Byumba** - Northern Rwanda
- **Kayonza** - Eastern Rwanda

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENWEATHER_API_KEY` | Your OpenWeatherMap API key | Required |
| `PORT` | Server port | 8080 |

### Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Location and crop validation
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: API request throttling

## 🧪 Testing

### Manual Testing
1. **Weather Check**: Select a location and verify current weather data
2. **Crop Analysis**: Select a crop and verify agricultural insights
3. **Forecast**: Check 7-day weather forecast
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

1. **API Key Error (401)**
   - Verify your OpenWeatherMap API key is correct
   - Check your OpenWeatherMap subscription status
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
docker logs weather-agriculture-app

# Test API connectivity
curl http://localhost:8080/api/stats

# Check HAProxy status
docker exec -it lb-01 haproxy -c -f /etc/haproxy/haproxy.cfg

# Monitor load balancing
watch -n 1 'curl -s http://localhost:8082/api/stats | grep "x-served-by"'
```

## �� API Documentation

### OpenWeatherMap API
- **Provider**: OpenWeatherMap
- **Documentation**: [OneCall API 3.0 Docs](https://openweathermap.org/api/one-call-3)
- **Rate Limits**: 1000 calls/day (free tier)
- **Features**: Current weather, 7-day forecast, minutely precipitation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenWeatherMap**: Provided weather data API
- **Rwandan Farmers**: Inspiration and feedback
- **Font Awesome**: Icons used throughout the application
- **Modern CSS**: Glassmorphism design inspiration

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for Rwandan Farmers - Empowering Agriculture Through Technology**

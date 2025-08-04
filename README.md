# Weather & Agriculture Insights 🌾

A modern web application that empowers Rwandan farmers with data-driven weather forecasts and agricultural insights. The application provides real-time weather data, crop-specific recommendations, and planting/harvesting advice to help farmers make informed decisions and improve crop yields.

## 🌟 Features

- **Real-time Weather Data**: Current weather conditions for major Rwandan cities and villages
- **7-Day Weather Forecast**: Extended weather predictions for planning
- **Crop-Specific Analysis**: Tailored recommendations for 6 major crops (Maize, Beans, Potatoes, Rice, Coffee, Tea)
- **Agricultural Insights**: Planting advice, risk assessments, and farming recommendations
- **Interactive Dashboard**: Modern, responsive design with sidebar navigation
- **Location-Based Data**: Weather information for 10 major Rwandan locations
- **Risk Assessment**: Color-coded risk levels (Low, Medium, High) for farming activities
- **Usage Statistics**: Track application usage and popular locations

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Weather API**: OpenWeatherMap API (OneCall 3.0)
- **Styling**: Modern CSS with dashboard design
- **Icons**: Font Awesome

## 📋 Prerequisites

- Node.js 16+ 
- OpenWeatherMap API key 

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone <https://github.com/IH-honnette/web_infrastructure_summative.git>
cd web_infrastructure_summative
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
npm start
```

The application will be available at `http://localhost:8080`

## 🎥 Demo

**Demo Video**: [Watch the 2-minute demo here](https://your-demo-video-link.com)

The demo showcases:
- Local application setup and running
- User interaction with location and crop selection
- Weather data display and agricultural insights
- Dashboard navigation and responsive design
- Key features and functionality

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
4. **Dashboard Navigation**: Test sidebar navigation and responsive design

### Health Check
```bash
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
   - Check server logs for errors

3. **Weather Data Not Loading**
   - Verify internet connectivity
   - Check OpenWeatherMap API status
   - Ensure location names are correct

### Debug Commands
```bash
# Check application logs
npm start

# Test API connectivity
curl http://localhost:8080/api/stats

# Check environment variables
echo $OPENWEATHER_API_KEY
```

## 📚 API Documentation

### OpenWeatherMap API
- **Provider**: OpenWeatherMap
- **Documentation**: [OneCall API 3.0 Docs](https://openweathermap.org/api/one-call-3)
- **Rate Limits**: 1000 calls/day (free tier)
- **Features**: Current weather, 7-day forecast, minutely precipitation

## 🚧 Development Challenges & Solutions

### Challenges Encountered:

1. **API Rate Limiting**
   - **Challenge**: OpenWeatherMap free tier has 1000 calls/day limit
   - **Solution**: Implemented caching to reduce API calls and added usage monitoring

2. **Responsive Design**
   - **Challenge**: Creating a dashboard that works on all devices
   - **Solution**: Used CSS Grid and Flexbox with mobile-first approach

3. **Data Presentation**
   - **Challenge**: Making weather data meaningful for farmers
   - **Solution**: Created crop-specific analysis with actionable recommendations

4. **Error Handling**
   - **Challenge**: Graceful handling of API failures
   - **Solution**: Comprehensive error handling with user-friendly messages

### Technical Solutions:

- **Caching Strategy**: Implemented in-memory caching for API responses
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Accessibility**: Added proper ARIA labels and keyboard navigation
- **Performance**: Optimized bundle size and loading times

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

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for Rwandan Farmers - Empowering Agriculture Through Technology**

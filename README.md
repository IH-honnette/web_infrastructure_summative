# Weather & Agriculture Insights 🌾

A modern web application that empowers Rwandan farmers with data-driven weather forecasts and agricultural insights. The application provides real-time weather data, crop-specific recommendations, and planting/harvesting advice to help farmers make informed decisions and improve crop yields.

## 🎥 Demo
Application live at [Farm Insights](https://web-infrastructure-summative.onrender.com/)

Demo Video: [Watch the 2-minute demo here](https://www.youtube.com/)

## 🌟 Features

- **Real-time Weather Data**: Current weather conditions for major Rwandan cities 
- **Weather Forecast**: Extended weather predictions for planning
- **Crop-Specific Analysis**: Tailored recommendations for 6 major crops (Maize, Beans, Potatoes, Rice, Coffee, Tea)
- **Agricultural Insights**: Planting advice, risk assessments, and farming recommendations
- **Interactive Dashboard**: Modern, responsive design with sidebar navigation
- **Risk Assessment**: Color-coded risk levels (Low, Medium, High) for farming activities

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

# Edit the file and add your OpenWeatherMap API key
OPENWEATHER_API_KEY= your_openweathermap_api_key_here
OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0'
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

## 📊 API Endpoints

### GET `/api/weather/:location`
Get current weather data for a specific location.

**Parameters:**
- `location` (path): Rwandan city/village name (e.g., kigali, butare)

**Response:**
```json
{
  "success": true,
  "location": "Musanze",
  "coordinates": {
    "lat": -1.4997,
    "lon": 29.6344
  },
  "weekly_averages": {
    "temp": {
      "day": 23.637142857142855,
      "min": 14.609999999999998,
      "max": 23.965714285714284
    },
    "humidity": 39.285714285714285,
    "wind_speed": 2.5385714285714287,
    "precipitation": 0.20714285714285713,
    "weather_conditions": "Clouds"
  },
  "monthly_averages": {
    "temp": {
      "day": 23.564999999999998,
      "min": 14.532499999999997,
      "max": 23.8525
    },
    "humidity": 39.375,
    "wind_speed": 2.5875,
    "precipitation": 0.18375,
    "total_rainfall": 0.77,
    "weather_conditions": "Clouds"
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
```json{
  "success": true,
  "location": "Kigali",
  "crop": "maize",
  "analysis": {
    "crop": "Maize",
    "weekly_averages": {
      "temp": {
        "day": 28.012857142857143,
        "min": 15.695714285714285,
        "max": 28.557142857142857
      },
      "humidity": 29.142857142857142,
      "wind_speed": 3.025714285714286,
      "precipitation": 0.038571428571428576,
      "weather_conditions": "Clouds"
    },
    "monthly_averages": {
      "temp": {
        "day": 27.9,
        "min": 15.642499999999998,
        "max": 28.53375
      },
      "humidity": 29.5,
      "wind_speed": 2.98625,
      "precipitation": 0.03375,
      "total_rainfall": 0,
      "weather_conditions": "Clouds"
    },
    "analysis": {
      "temperature_status": "optimal",
      "rainfall_status": "insufficient",
      "humidity_status": "low"
    },
    "recommendations": [
      "Prepare irrigation systems. Consider drought-resistant crop varieties.",
      "Low humidity expected - increase irrigation frequency."
    ],
    "alerts": [
      "Low rainfall alert"
    ],
    "planting_advice": "Insufficient rainfall expected. Ensure irrigation systems are ready before planting.",
    "risk_level": "medium"
  },
  "crop_info": {
    "name": "Maize",
    "planting_season": "March-April, September-October",
    "harvesting_season": "July-August, January-February",
    "optimal_temp": {
      "min": 18,
      "max": 32
    },
    "optimal_rainfall": {
      "min": 500,
      "max": 1200
    },
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
- **Musanze** - Northern Rwanda
- **Kibuye** - Western Rwanda
- **Kibungo** - Eastern Rwanda
- **Nyanza** - Southern Rwanda
- **Cyangugu** - Southwestern Rwanda
- **Byumba** - Northern Rwanda
- **Kayonza** - Eastern Rwanda

### Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Location and crop validation
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: API request throttling

### Health Check
```bash
curl http://localhost:8080/api/stats
```

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

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'a7c13ec1d592054a3ef143dea2beeb4e';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0';

// Rwandan cities and villages with coordinates
const RWANDA_LOCATIONS = {
  'kigali': { lat: -1.9441, lon: 30.0619, name: 'Kigali' },
  'butare': { lat: -2.5967, lon: 29.7394, name: 'Butare' },
  'gisenyi': { lat: -1.7028, lon: 29.2564, name: 'Gisenyi' },
  'ruhengeri': { lat: -1.4997, lon: 29.6344, name: 'Musanze' },
  'kibuye': { lat: -2.0603, lon: 29.3478, name: 'Kibuye' },
  'kibungo': { lat: -2.1597, lon: 30.5419, name: 'Kibungo' },
  'nyanza': { lat: -2.3516, lon: 29.7414, name: 'Nyanza' },
  'cyangugu': { lat: -2.4846, lon: 28.9075, name: 'Cyangugu' },
  'byumba': { lat: -1.5763, lon: 30.0675, name: 'Byumba' },
  'kayonza': { lat: -1.9201, lon: 30.4386, name: 'Kayonza' }
};

// Crop planting and harvesting recommendations
const CROP_RECOMMENDATIONS = {
  'maize': {
    name: 'Maize',
    planting_season: 'March-April, September-October',
    harvesting_season: 'July-August, January-February',
    optimal_temp: { min: 18, max: 32 },
    optimal_rainfall: { min: 500, max: 1200 },
    drought_tolerance: 'moderate',
    flood_tolerance: 'low'
  },
  'beans': {
    name: 'Beans',
    planting_season: 'March-April, September-October',
    harvesting_season: 'June-July, December-January',
    optimal_temp: { min: 15, max: 30 },
    optimal_rainfall: { min: 400, max: 800 },
    drought_tolerance: 'low',
    flood_tolerance: 'low'
  },
  'potatoes': {
    name: 'Potatoes',
    planting_season: 'February-March, August-September',
    harvesting_season: 'May-June, November-December',
    optimal_temp: { min: 15, max: 25 },
    optimal_rainfall: { min: 300, max: 600 },
    drought_tolerance: 'moderate',
    flood_tolerance: 'low'
  },
  'rice': {
    name: 'Rice',
    planting_season: 'March-April, September-October',
    harvesting_season: 'July-August, January-February',
    optimal_temp: { min: 20, max: 35 },
    optimal_rainfall: { min: 1000, max: 2000 },
    drought_tolerance: 'low',
    flood_tolerance: 'high'
  },
  'coffee': {
    name: 'Coffee',
    planting_season: 'March-April',
    harvesting_season: 'October-December',
    optimal_temp: { min: 18, max: 28 },
    optimal_rainfall: { min: 1200, max: 2000 },
    drought_tolerance: 'moderate',
    flood_tolerance: 'low'
  },
  'tea': {
    name: 'Tea',
    planting_season: 'March-April, September-October',
    harvesting_season: 'Year-round',
    optimal_temp: { min: 15, max: 30 },
    optimal_rainfall: { min: 1200, max: 2500 },
    drought_tolerance: 'moderate',
    flood_tolerance: 'moderate'
  }
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "https://openweathermap.org"],
      connectSrc: ["'self'", "https://api.openweathermap.org"]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for search history
let searchHistory = [];
let weatherAlerts = [];

// Helper function to get weather data with daily forecast for averaging
async function getWeatherData(lat, lon) {
  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/onecall`, {
      params: {
        lat,
        lon,
        exclude: 'minutely,hourly',
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Weather API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Helper function to calculate weekly averages
function calculateWeeklyAverages(dailyData) {
  if (!dailyData || dailyData.length === 0) return null;
  
  const weekData = dailyData.slice(0, 7); // First 7 days
  
  const averages = {
    temp: {
      day: weekData.reduce((sum, day) => sum + day.temp.day, 0) / weekData.length,
      min: weekData.reduce((sum, day) => sum + day.temp.min, 0) / weekData.length,
      max: weekData.reduce((sum, day) => sum + day.temp.max, 0) / weekData.length
    },
    humidity: weekData.reduce((sum, day) => sum + day.humidity, 0) / weekData.length,
    wind_speed: weekData.reduce((sum, day) => sum + day.wind_speed, 0) / weekData.length,
    precipitation: weekData.reduce((sum, day) => sum + (day.pop || 0), 0) / weekData.length,
    weather_conditions: getMostCommonWeather(weekData)
  };
  
  return averages;
}

// Helper function to calculate monthly averages
function calculateMonthlyAverages(dailyData) {
  if (!dailyData || dailyData.length === 0) return null;
  
  const monthData = dailyData.slice(0, 30); // First 30 days (or available days)
  
  const averages = {
    temp: {
      day: monthData.reduce((sum, day) => sum + day.temp.day, 0) / monthData.length,
      min: monthData.reduce((sum, day) => sum + day.temp.min, 0) / monthData.length,
      max: monthData.reduce((sum, day) => sum + day.temp.max, 0) / monthData.length
    },
    humidity: monthData.reduce((sum, day) => sum + day.humidity, 0) / monthData.length,
    wind_speed: monthData.reduce((sum, day) => sum + day.wind_speed, 0) / monthData.length,
    precipitation: monthData.reduce((sum, day) => sum + (day.pop || 0), 0) / monthData.length,
    total_rainfall: monthData.reduce((sum, day) => sum + (day.rain || 0), 0),
    weather_conditions: getMostCommonWeather(monthData)
  };
  
  return averages;
}

// Helper function to get most common weather condition
function getMostCommonWeather(dailyData) {
  const weatherCounts = {};
  
  dailyData.forEach(day => {
    const weather = day.weather[0]?.main || 'Unknown';
    weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
  });
  
  let mostCommon = 'Unknown';
  let maxCount = 0;
  
  Object.entries(weatherCounts).forEach(([weather, count]) => {
    if (count > maxCount) {
      mostCommon = weather;
      maxCount = count;
    }
  });
  
  return mostCommon;
}

// Helper function to analyze weather for agriculture using averages
function analyzeWeatherForAgriculture(weatherData, cropType) {
  const weeklyAvg = calculateWeeklyAverages(weatherData.daily);
  const monthlyAvg = calculateMonthlyAverages(weatherData.daily);
  const crop = CROP_RECOMMENDATIONS[cropType];
  
  if (!crop) {
    return { error: 'Crop type not supported' };
  }

  if (!weeklyAvg || !monthlyAvg) {
    return { error: 'Insufficient weather data for analysis' };
  }

  const avgTemp = monthlyAvg.temp.day;
  const avgHumidity = monthlyAvg.humidity;
  const totalRainfall = monthlyAvg.total_rainfall;
  
  // Temperature analysis
  const tempStatus = avgTemp >= crop.optimal_temp.min && avgTemp <= crop.optimal_temp.max ? 'optimal' : 
                    avgTemp < crop.optimal_temp.min ? 'too_cold' : 'too_hot';
  
  // Rainfall analysis
  const rainfallStatus = totalRainfall >= crop.optimal_rainfall.min && totalRainfall <= crop.optimal_rainfall.max ? 'optimal' :
                        totalRainfall < crop.optimal_rainfall.min ? 'insufficient' : 'excessive';
  
  // Recommendations
  let recommendations = [];
  let alerts = [];
  
  if (tempStatus === 'too_cold') {
    recommendations.push('Consider delaying planting until temperatures rise. Monitor weekly forecasts.');
    alerts.push('Low temperature alert for the month');
  } else if (tempStatus === 'too_hot') {
    recommendations.push('Ensure adequate irrigation and shade for crops. Plant in cooler parts of the day.');
    alerts.push('High temperature alert for the month');
  }
  
  if (rainfallStatus === 'insufficient') {
    recommendations.push('Prepare irrigation systems. Consider drought-resistant crop varieties.');
    alerts.push('Low rainfall alert');
  } else if (rainfallStatus === 'excessive') {
    recommendations.push('Ensure proper drainage. Protect crops from waterlogging.');
    alerts.push('High rainfall alert');
  }
  
  if (avgHumidity > 80) {
    recommendations.push('High humidity expected - watch for fungal diseases. Ensure good air circulation.');
  } else if (avgHumidity < 30) {
    recommendations.push('Low humidity expected - increase irrigation frequency.');
  }
  
  // Monthly planting advice
  const plantingAdvice = getMonthlyPlantingAdvice(monthlyAvg, crop);
  
  return {
    crop: crop.name,
    weekly_averages: weeklyAvg,
    monthly_averages: monthlyAvg,
    analysis: {
      temperature_status: tempStatus,
      rainfall_status: rainfallStatus,
      humidity_status: avgHumidity > 80 ? 'high' : avgHumidity < 30 ? 'low' : 'optimal'
    },
    recommendations,
    alerts,
    planting_advice: plantingAdvice,
    risk_level: calculateRiskLevel(alerts.length, tempStatus, rainfallStatus)
  };
}

// Helper function to get monthly planting advice
function getMonthlyPlantingAdvice(monthlyAvg, crop) {
  const avgTemp = monthlyAvg.temp.day;
  const totalRainfall = monthlyAvg.total_rainfall;
  
  if (avgTemp >= crop.optimal_temp.min && avgTemp <= crop.optimal_temp.max && 
      totalRainfall >= crop.optimal_rainfall.min && totalRainfall <= crop.optimal_rainfall.max) {
    return 'Excellent conditions for planting this month. Proceed with planting activities.';
  } else if (avgTemp < crop.optimal_temp.min) {
    return 'Wait for warmer temperatures before planting. Monitor weekly forecasts for temperature improvements.';
  } else if (avgTemp > crop.optimal_temp.max) {
    return 'Consider planting in cooler parts of the day or wait for temperature to drop. Ensure adequate irrigation.';
  } else if (totalRainfall < crop.optimal_rainfall.min) {
    return 'Insufficient rainfall expected. Ensure irrigation systems are ready before planting.';
  } else if (totalRainfall > crop.optimal_rainfall.max) {
    return 'Excessive rainfall expected. Ensure proper drainage and avoid waterlogged areas for planting.';
  }
  
  return 'Moderate conditions. Monitor weather closely before planting.';
}

// Helper function to calculate risk level
function calculateRiskLevel(alertCount, tempStatus, rainfallStatus) {
  if (alertCount >= 3) return 'high';
  if (alertCount >= 2 || tempStatus !== 'optimal' || rainfallStatus !== 'optimal') return 'medium';
  return 'low';
}

// Helper function to get monthly forecast data
function getMonthlyForecastData(dailyData) {
  if (!dailyData || dailyData.length === 0) return null;
  
  // Group data by weeks
  const weeks = [];
  for (let i = 0; i < dailyData.length; i += 7) {
    const weekData = dailyData.slice(i, i + 7);
    if (weekData.length > 0) {
      const weekAvg = calculateWeeklyAverages(weekData);
      const weekStart = new Date(weekData[0].dt * 1000);
      const weekEnd = new Date(weekData[weekData.length - 1].dt * 1000);
      
      weeks.push({
        week_number: Math.floor(i / 7) + 1,
        start_date: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        end_date: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        averages: weekAvg
      });
    }
  }
  
  return weeks;
}

// API Routes
app.get('/api/weather/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const locationData = RWANDA_LOCATIONS[location.toLowerCase()];
    
    if (!locationData) {
      return res.status(400).json({ 
        error: 'Location not found',
        message: 'Please provide a valid Rwandan city/village name',
        available_locations: Object.keys(RWANDA_LOCATIONS)
      });
    }

    const weatherData = await getWeatherData(locationData.lat, locationData.lon);
    
    // Calculate averages
    const weeklyAverages = calculateWeeklyAverages(weatherData.daily);
    const monthlyAverages = calculateMonthlyAverages(weatherData.daily);
    
    // Add to search history
    const searchRecord = {
      id: Date.now(),
      location: locationData.name,
      timestamp: new Date().toISOString(),
      weekly_averages: weeklyAverages,
      monthly_averages: monthlyAverages
    };
    searchHistory.unshift(searchRecord);
    
    // Keep only last 50 searches
    if (searchHistory.length > 50) {
      searchHistory = searchHistory.slice(0, 50);
    }

    res.json({
      success: true,
      location: locationData.name,
      coordinates: { lat: locationData.lat, lon: locationData.lon },
      weekly_averages: weeklyAverages,
      monthly_averages: monthlyAverages,
      timezone: weatherData.timezone,
      searchId: searchRecord.id
    });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch weather information. Please try again.'
    });
  }
});

app.get('/api/forecast/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const locationData = RWANDA_LOCATIONS[location.toLowerCase()];
    
    if (!locationData) {
      return res.status(400).json({ 
        error: 'Location not found',
        message: 'Please provide a valid Rwandan city/village name'
      });
    }

    const weatherData = await getWeatherData(locationData.lat, locationData.lon);
    const monthlyForecast = getMonthlyForecastData(weatherData.daily);
    
    res.json({
      success: true,
      location: locationData.name,
      monthly_forecast: monthlyForecast,
      timezone: weatherData.timezone
    });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch forecast information.'
    });
  }
});

app.get('/api/agriculture/:location/:crop', async (req, res) => {
  try {
    const { location, crop } = req.params;
    const locationData = RWANDA_LOCATIONS[location.toLowerCase()];
    
    if (!locationData) {
      return res.status(400).json({ 
        error: 'Location not found',
        message: 'Please provide a valid Rwandan city/village name'
      });
    }

    if (!CROP_RECOMMENDATIONS[crop.toLowerCase()]) {
      return res.status(400).json({ 
        error: 'Crop not supported',
        message: 'Please provide a supported crop type',
        supported_crops: Object.keys(CROP_RECOMMENDATIONS)
      });
    }

    const weatherData = await getWeatherData(locationData.lat, locationData.lon);
    const analysis = analyzeWeatherForAgriculture(weatherData, crop.toLowerCase());
    
    res.json({
      success: true,
      location: locationData.name,
      crop: crop.toLowerCase(),
      analysis,
      crop_info: CROP_RECOMMENDATIONS[crop.toLowerCase()]
    });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to analyze agricultural conditions.'
    });
  }
});

app.get('/api/locations', (req, res) => {
  res.json({
    success: true,
    locations: Object.keys(RWANDA_LOCATIONS).map(key => ({
      key,
      name: RWANDA_LOCATIONS[key].name,
      coordinates: {
        lat: RWANDA_LOCATIONS[key].lat,
        lon: RWANDA_LOCATIONS[key].lon
      }
    }))
  });
});

app.get('/api/crops', (req, res) => {
  res.json({
    success: true,
    crops: Object.keys(CROP_RECOMMENDATIONS).map(key => ({
      key,
      name: CROP_RECOMMENDATIONS[key].name,
      planting_season: CROP_RECOMMENDATIONS[key].planting_season,
      harvesting_season: CROP_RECOMMENDATIONS[key].harvesting_season
    }))
  });
});

app.get('/api/history', (req, res) => {
  const { limit = 10, location } = req.query;
  
  let filteredHistory = searchHistory;
  
  if (location) {
    filteredHistory = searchHistory.filter(record => 
      record.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: filteredHistory.slice(0, parseInt(limit)),
    total: filteredHistory.length
  });
});

app.get('/api/stats', (req, res) => {
  const totalSearches = searchHistory.length;
  const locations = [...new Set(searchHistory.map(r => r.location))];
  const locationCounts = locations.map(loc => ({
    location: loc,
    count: searchHistory.filter(r => r.location === loc).length
  }));
  
  res.json({
    success: true,
    data: {
      totalSearches,
      uniqueLocations: locations.length,
      locationBreakdown: locationCounts,
      recentSearches: searchHistory.slice(0, 5)
    }
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

app.listen(PORT, () => {
  console.log(`🌾 Weather & Agriculture Insights server running on port ${PORT}`);
  console.log(`📱 Access the application at: http://localhost:${PORT}`);
  console.log(`🔍 API endpoints available at: http://localhost:${PORT}/api/`);
  console.log(`🌤️ Using OpenWeatherMap API for weather data`);
  console.log(`🇷🇼 Supporting ${Object.keys(RWANDA_LOCATIONS).length} Rwandan locations`);
  console.log(`🌱 Supporting ${Object.keys(CROP_RECOMMENDATIONS).length} crop types`);
  console.log(`📊 Providing weekly and monthly averages for better farming decisions`);
}); 
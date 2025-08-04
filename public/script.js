// DOM Elements
const locationSelect = document.getElementById('locationSelect');
const cropSelect = document.getElementById('cropSelect');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');

// Weather elements - Weekly
const locationName = document.getElementById('locationName');
const locationName2 = document.getElementById('locationName2');
const weeklyTemp = document.getElementById('weeklyTemp');
const weeklyWeatherDesc = document.getElementById('weeklyWeatherDesc');
const weeklyMin = document.getElementById('weeklyMin');
const weeklyMax = document.getElementById('weeklyMax');
const weeklyHumidity = document.getElementById('weeklyHumidity');
const weeklyWind = document.getElementById('weeklyWind');
const weeklyPrecip = document.getElementById('weeklyPrecip');

// Weather elements - Monthly
const monthlyTemp = document.getElementById('monthlyTemp');
const monthlyWeatherDesc = document.getElementById('monthlyWeatherDesc');
const monthlyMin = document.getElementById('monthlyMin');
const monthlyMax = document.getElementById('monthlyMax');
const monthlyHumidity = document.getElementById('monthlyHumidity');
const monthlyWind = document.getElementById('monthlyWind');
const monthlyRainfall = document.getElementById('monthlyRainfall');

// Agriculture elements
const agricultureCard = document.getElementById('agricultureCard');
const cropName = document.getElementById('cropName');
const riskLevel = document.getElementById('riskLevel');
const plantingAdvice = document.getElementById('plantingAdvice');
const recommendationsList = document.getElementById('recommendationsList');
const alertsSection = document.getElementById('alertsSection');
const alertsList = document.getElementById('alertsList');

// Forecast elements
const forecastCard = document.getElementById('forecastCard');
const forecastList = document.getElementById('forecastList');

// Crop info elements
const cropInfoCard = document.getElementById('cropInfoCard');
const plantingSeason = document.getElementById('plantingSeason');
const harvestingSeason = document.getElementById('harvestingSeason');
const optimalTemp = document.getElementById('optimalTemp');
const optimalRainfall = document.getElementById('optimalRainfall');
const droughtTolerance = document.getElementById('droughtTolerance');
const floodTolerance = document.getElementById('floodTolerance');

// Stats elements
const totalSearches = document.getElementById('totalSearches');
const uniqueLocations = document.getElementById('uniqueLocations');
const recentSearches = document.getElementById('recentSearches');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
locationSelect.addEventListener('change', handleLocationChange);
cropSelect.addEventListener('change', handleCropChange);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
});

// Handle search button click
async function handleSearch() {
    const location = locationSelect.value;
    const crop = cropSelect.value;
    
    if (!location) {
        showError('Please select a location');
        return;
    }
    
    showLoading();
    hideError();
    
    try {
        // Get weather data
        const weatherResponse = await fetch(`/api/weather/${location}`);
        const weatherData = await weatherResponse.json();
        
        if (!weatherData.success) {
            throw new Error(weatherData.message || 'Failed to fetch weather data');
        }
        
        // Display weather information
        displayWeather(weatherData);
        
        // If crop is selected, get agricultural insights
        if (crop) {
            const agricultureResponse = await fetch(`/api/agriculture/${location}/${crop}`);
            const agricultureData = await agricultureResponse.json();
            
            if (agricultureData.success) {
                displayAgriculture(agricultureData);
            }
        } else {
            hideAgriculture();
        }
        
        // Get forecast data
        const forecastResponse = await fetch(`/api/forecast/${location}`);
        const forecastData = await forecastResponse.json();
        
        if (forecastData.success) {
            displayForecast(forecastData);
        }
        
        showResults();
        loadStats();
        
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'An error occurred while fetching data');
    }
}

// Handle location change
function handleLocationChange() {
    const location = locationSelect.value;
    if (location) {
        // Clear previous results
        hideResults();
        hideError();
    }
}

// Handle crop change
function handleCropChange() {
    const crop = cropSelect.value;
    if (crop && locationSelect.value) {
        // Re-run search with new crop
        handleSearch();
    }
}

// Display weather information
function displayWeather(data) {
    const weekly = data.weekly_averages;
    const monthly = data.monthly_averages;
    
    // Set location names
    locationName.textContent = data.location;
    locationName2.textContent = data.location;
    
    // Display weekly averages
    if (weekly) {
        weeklyTemp.textContent = Math.round(weekly.temp.day);
        weeklyWeatherDesc.textContent = `Weekly Average - ${weekly.weather_conditions}`;
        weeklyMin.textContent = Math.round(weekly.temp.min);
        weeklyMax.textContent = Math.round(weekly.temp.max);
        weeklyHumidity.textContent = Math.round(weekly.humidity);
        weeklyWind.textContent = weekly.wind_speed.toFixed(1);
        weeklyPrecip.textContent = Math.round(weekly.precipitation * 100);
    }
    
    // Display monthly averages
    if (monthly) {
        monthlyTemp.textContent = Math.round(monthly.temp.day);
        monthlyWeatherDesc.textContent = `Monthly Average - ${monthly.weather_conditions}`;
        monthlyMin.textContent = Math.round(monthly.temp.min);
        monthlyMax.textContent = Math.round(monthly.temp.max);
        monthlyHumidity.textContent = Math.round(monthly.humidity);
        monthlyWind.textContent = monthly.wind_speed.toFixed(1);
        monthlyRainfall.textContent = Math.round(monthly.total_rainfall);
    }
}

// Display agricultural insights
function displayAgriculture(data) {
    const analysis = data.analysis;
    const cropInfo = data.crop_info;
    
    cropName.textContent = analysis.crop;
    
    // Risk level
    riskLevel.textContent = analysis.risk_level;
    riskLevel.className = `risk-badge ${analysis.risk_level}`;
    
    // Planting advice
    plantingAdvice.textContent = analysis.planting_advice;
    
    // Recommendations
    recommendationsList.innerHTML = '';
    analysis.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    });
    
    // Alerts
    if (analysis.alerts && analysis.alerts.length > 0) {
        alertsList.innerHTML = '';
        analysis.alerts.forEach(alert => {
            const li = document.createElement('li');
            li.textContent = alert;
            alertsList.appendChild(li);
        });
        alertsSection.classList.remove('hidden');
    } else {
        alertsSection.classList.add('hidden');
    }
    
    // Crop information
    plantingSeason.textContent = cropInfo.planting_season;
    harvestingSeason.textContent = cropInfo.harvesting_season;
    optimalTemp.textContent = `${cropInfo.optimal_temp.min}°C - ${cropInfo.optimal_temp.max}°C`;
    optimalRainfall.textContent = `${cropInfo.optimal_rainfall.min}mm - ${cropInfo.optimal_rainfall.max}mm`;
    droughtTolerance.textContent = cropInfo.drought_tolerance;
    floodTolerance.textContent = cropInfo.flood_tolerance;
    
    showAgriculture();
    showCropInfo();
}

// Display monthly forecast
function displayForecast(data) {
    forecastList.innerHTML = '';
    
    if (data.monthly_forecast && data.monthly_forecast.length > 0) {
        data.monthly_forecast.forEach(week => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-date">Week ${week.week_number}<br>${week.start_date} - ${week.end_date}</div>
                <div class="forecast-temp">${Math.round(week.averages.temp.day)}°C</div>
                <div class="forecast-desc">${week.averages.weather_conditions}</div>
                <div class="forecast-details">
                    <small>Min: ${Math.round(week.averages.temp.min)}°C | Max: ${Math.round(week.averages.temp.max)}°C</small><br>
                    <small>Humidity: ${Math.round(week.averages.humidity)}%</small>
                </div>
            `;
            
            forecastList.appendChild(forecastItem);
        });
    }
    
    showForecast();
}

// Show/hide functions
function showLoading() {
    loading.classList.remove('hidden');
    hideResults();
    hideError();
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showResults() {
    results.classList.remove('hidden');
    hideLoading();
}

function hideResults() {
    results.classList.add('hidden');
}

function showAgriculture() {
    agricultureCard.classList.remove('hidden');
}

function hideAgriculture() {
    agricultureCard.classList.add('hidden');
    cropInfoCard.classList.add('hidden');
}

function showCropInfo() {
    cropInfoCard.classList.remove('hidden');
}

function showForecast() {
    forecastCard.classList.remove('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    hideLoading();
    hideResults();
}

function hideError() {
    errorSection.classList.add('hidden');
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            totalSearches.textContent = data.data.totalSearches;
            uniqueLocations.textContent = data.data.uniqueLocations;
            recentSearches.textContent = data.data.recentSearches.length;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Utility functions
function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to forecast items
    forecastList.addEventListener('mouseover', function(e) {
        if (e.target.closest('.forecast-item')) {
            e.target.closest('.forecast-item').style.transform = 'scale(1.05)';
        }
    });
    
    forecastList.addEventListener('mouseout', function(e) {
        if (e.target.closest('.forecast-item')) {
            e.target.closest('.forecast-item').style.transform = 'scale(1)';
        }
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement === searchBtn) {
            handleSearch();
        }
    });
    
    // Add smooth scrolling for better UX
    searchBtn.addEventListener('click', function() {
        setTimeout(() => {
            if (!results.classList.contains('hidden')) {
                results.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    });
});

// Add weather icon mapping
const weatherIcons = {
    'clear': '☀️',
    'clouds': '☁️',
    'rain': '🌧️',
    'drizzle': '🌦️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️'
};

// Function to get weather icon
function getWeatherIcon(weatherMain) {
    const main = weatherMain.toLowerCase();
    return weatherIcons[main] || '🌤️';
}

// Add color coding for temperature
function getTemperatureColor(temp) {
    if (temp < 10) return '#3498db'; // Cold - blue
    if (temp < 20) return '#f39c12'; // Cool - orange
    if (temp < 30) return '#e67e22'; // Warm - dark orange
    return '#e74c3c'; // Hot - red
}

// Add risk level descriptions
const riskDescriptions = {
    'low': 'Good conditions for farming activities',
    'medium': 'Moderate risk - take precautions',
    'high': 'High risk - avoid farming activities if possible'
};

// Function to get risk description
function getRiskDescription(riskLevel) {
    return riskDescriptions[riskLevel] || 'Risk level unknown';
}

// Add crop-specific tips
const cropTips = {
    'maize': 'Maize requires well-drained soil and regular rainfall. Plant in rows for better yield.',
    'beans': 'Beans are nitrogen-fixing crops. Good for crop rotation with maize.',
    'potatoes': 'Potatoes prefer cool temperatures and well-drained soil. Avoid waterlogging.',
    'rice': 'Rice requires standing water. Ensure proper irrigation and drainage.',
    'coffee': 'Coffee prefers shade and moderate temperatures. Plant under trees if possible.',
    'tea': 'Tea requires acidic soil and regular pruning. Harvest young leaves for best quality.'
};

// Function to get crop tips
function getCropTips(crop) {
    return cropTips[crop.toLowerCase()] || 'General farming practices apply.';
}

// Export functions for potential future use
window.WeatherApp = {
    handleSearch,
    displayWeather,
    displayAgriculture,
    displayForecast,
    loadStats,
    getWeatherIcon,
    getTemperatureColor,
    getRiskDescription,
    getCropTips
}; 
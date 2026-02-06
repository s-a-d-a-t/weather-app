// ========================================
// MODERN WEATHER APP - ENHANCED JAVASCRIPT
// ========================================

// DOM Elements
const elements = {
  // Sidebar
  menuToggle: document.getElementById('menuToggle'),
  sidebar: document.getElementById('sidebar'),
  cityCards: document.querySelectorAll('.city-card'),
  sidebarTemp: document.getElementById('sidebarTemp'),
  sidebarWind: document.getElementById('sidebarWind'),
  
  // Search
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  
  // Time
  currentDate: document.getElementById('currentDate'),
  currentClock: document.getElementById('currentClock'),
  currentTimezone: document.getElementById('currentTimezone'),
  
  // Weather Alerts
  weatherAlerts: document.getElementById('weatherAlerts'),
  alertText: document.getElementById('alertText'),
  
  // Main Weather
  locationName: document.getElementById('locationName'),
  weatherDate: document.getElementById('weatherDate'),
  weatherIcon: document.getElementById('weatherIcon'),
  weatherDescription: document.getElementById('weatherDescription'),
  mainTemperature: document.getElementById('mainTemperature'),
  feelsLike: document.getElementById('feelsLike'),
  
  // Weather Details
  windSpeed: document.getElementById('windSpeed'),
  humidity: document.getElementById('humidity'),
  pressure: document.getElementById('pressure'),
  visibility: document.getElementById('visibility'),
  
  // Air Quality
  aqiValue: document.getElementById('aqiValue'),
  aqiLabel: document.getElementById('aqiLabel'),
  aqiCircle: document.getElementById('aqiCircle'),
  pm25: document.getElementById('pm25'),
  pm10: document.getElementById('pm10'),
  o3: document.getElementById('o3'),
  no2: document.getElementById('no2'),
  
  // Wind Compass
  windArrow: document.getElementById('windArrow'),
  windDegree: document.getElementById('windDegree'),
  windDirectionText: document.getElementById('windDirectionText'),
  
  // UV Index
  uvProgress: document.getElementById('uvProgress'),
  uvValue: document.getElementById('uvValue'),
  uvStatus: document.getElementById('uvStatus'),
  uvRecommendation: document.getElementById('uvRecommendation'),
  
  // Sun Times
  sunriseTime: document.getElementById('sunriseTime'),
  sunsetTime: document.getElementById('sunsetTime'),
  sunPosition: document.getElementById('sunPosition'),
  daylightDuration: document.getElementById('daylightDuration'),
  
  // Forecast
  forecastDaysContainer: document.getElementById('forecastDaysContainer'),
  
  // Weather Particles
  weatherParticles: document.getElementById('weatherParticles')
};

// API Configuration - PRESERVED API KEY
const API_KEY = '22cd422892aa79c6d89fa4f1b38e5766';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

// Weather Icons Mapping
const weatherIcons = {
  'clear': 'fas fa-sun',
  'clouds': 'fas fa-cloud',
  'rain': 'fas fa-cloud-rain',
  'drizzle': 'fas fa-cloud-rain',
  'thunderstorm': 'fas fa-bolt',
  'snow': 'fas fa-snowflake',
  'mist': 'fas fa-smog',
  'smoke': 'fas fa-smog',
  'haze': 'fas fa-smog',
  'dust': 'fas fa-smog',
  'fog': 'fas fa-smog',
  'sand': 'fas fa-smog',
  'ash': 'fas fa-smog',
  'squall': 'fas fa-wind',
  'tornado': 'fas fa-wind'
};

// Global Variables
let map = null;
let hourlyChart = null;
let currentLocationCoords = null;

// ========================================
// INITIALIZATION
// ========================================

function init() {
  setupEventListeners();
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // Load default city (Adama)
  updateWeather('Adama');
  setActiveCity('Adama');
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Mobile menu toggle
  elements.menuToggle?.addEventListener('click', () => {
    elements.sidebar.classList.toggle('active');
    const icon = elements.menuToggle.querySelector('i');
    icon.className = elements.sidebar.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
  });
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
      const isClickInsideSidebar = elements.sidebar.contains(e.target);
      const isClickOnToggle = elements.menuToggle?.contains(e.target);
      
      if (elements.sidebar.classList.contains('active') && !isClickInsideSidebar && !isClickOnToggle) {
        elements.sidebar.classList.remove('active');
        const icon = elements.menuToggle.querySelector('i');
        icon.className = 'fas fa-bars';
      }
    }
  });
  
  // City card clicks
  elements.cityCards.forEach(card => {
    card.addEventListener('click', () => {
      const city = card.dataset.city;
      setActiveCity(city);
      updateWeather(city);
      
      // Close sidebar on mobile
      if (window.innerWidth <= 992) {
        elements.sidebar.classList.remove('active');
        const icon = elements.menuToggle.querySelector('i');
        icon.className = 'fas fa-bars';
      }
    });
  });
  
  // Search functionality
  elements.searchBtn?.addEventListener('click', handleSearch);
  elements.searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

function handleSearch() {
  const city = elements.searchInput.value.trim();
  if (city) {
    setActiveCity(city);
    updateWeather(city);
    elements.searchInput.value = '';
  } else {
    showNotification('Please enter a city name', 'warning');
  }
}

// ========================================
// DATE & TIME
// ========================================

function updateDateTime() {
  const now = new Date();
  
  // Date
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  elements.currentDate.textContent = now.toLocaleDateString('en-US', dateOptions);
  
  // Time
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedHours = String(hours).padStart(2, '0');
  
  elements.currentClock.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
  
  // Timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  elements.currentTimezone.textContent = timezone;
  
  // Update weather date
  elements.weatherDate.textContent = now.toLocaleDateString('en-US', dateOptions);
}

// ========================================
// MAIN WEATHER UPDATE
// ========================================

async function updateWeather(city) {
  try {
    showLoading();
    
    // Get coordinates
    const geoResponse = await fetch(`${GEO_URL}?q=${city}&limit=1&appid=${API_KEY}`);
    const geoData = await geoResponse.json();
    
    if (!geoData || geoData.length === 0) {
      showNotification(`City "${city}" not found`, 'error');
      return;
    }
    
    const { lat, lon, name, country } = geoData[0];
    currentLocationCoords = { lat, lon };
    
    // Fetch all data in parallel
    const [currentData, forecastData, airQualityData] = await Promise.all([
      fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(r => r.json()),
      fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(r => r.json()),
      fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(r => r.json())
    ]);
    
    // Update all sections
    updateCurrentWeather(currentData, name, country);
    updateForecast(forecastData);
    updateAirQuality(airQualityData);
    updateHourlyChart(forecastData);
    updateWindCompass(currentData);
    updateUVIndex(currentData);
    updateSunTimes(currentData);
    updateWeatherParticles(currentData);
    updateCityCard(city, currentData);
    
    // Initialize map if not already done
    if (!map) {
      initMap(lat, lon);
    } else {
      map.setView([lat, lon], 10);
    }
    
  } catch (error) {
    console.error('Error fetching weather:', error);
    showNotification('Failed to fetch weather data', 'error');
  }
}

// ========================================
// CURRENT WEATHER
// ========================================

function updateCurrentWeather(data, name, country) {
  // Location
  elements.locationName.textContent = `${name}, ${country}`;
  
  // Temperature
  elements.mainTemperature.textContent = Math.round(data.main.temp);
  elements.feelsLike.textContent = Math.round(data.main.feels_like);
  
  // Weather description
  const condition = data.weather[0].main.toLowerCase();
  elements.weatherDescription.textContent = data.weather[0].description;
  
  // Icon
  const iconClass = weatherIcons[condition] || 'fas fa-cloud';
  elements.weatherIcon.className = `${iconClass} weather-icon`;
  
  // Details
  elements.windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  elements.humidity.textContent = `${data.main.humidity}%`;
  elements.pressure.textContent = `${data.main.pressure} hPa`;
  elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  
  // Sidebar quick stats
  elements.sidebarTemp.textContent = `${Math.round(data.main.temp)}°C`;
  elements.sidebarWind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
}

// ========================================
// AIR QUALITY
// ========================================

function updateAirQuality(data) {
  if (!data || !data.list || data.list.length === 0) {
    elements.aqiValue.textContent = '--';
    elements.aqiLabel.textContent = 'No Data';
    return;
  }
  
  const aqi = data.list[0].main.aqi;
  const components = data.list[0].components;
  
  // AQI Labels
  const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  const aqiColors = ['#00e400', '#ffff00', '#ff7e00', '#ff0000', '#8f3f97'];
  
  elements.aqiValue.textContent = aqi;
  elements.aqiLabel.textContent = aqiLabels[aqi - 1] || 'Unknown';
  elements.aqiCircle.style.borderColor = aqiColors[aqi - 1] || '#fff';
  
  // Components
  elements.pm25.textContent = `${components.pm2_5.toFixed(1)} μg/m³`;
  elements.pm10.textContent = `${components.pm10.toFixed(1)} μg/m³`;
  elements.o3.textContent = `${components.o3.toFixed(1)} μg/m³`;
  elements.no2.textContent = `${components.no2.toFixed(1)} μg/m³`;
}

// ========================================
// WIND COMPASS
// ========================================

function updateWindCompass(data) {
  const degree = data.wind.deg || 0;
  const speed = Math.round(data.wind.speed * 3.6);
  
  elements.windArrow.style.transform = `rotate(${degree} 100 100)`;
  elements.windDegree.textContent = `${degree}°`;
  elements.windDirectionText.textContent = getWindDirection(degree);
}

function getWindDirection(degree) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degree / 22.5) % 16;
  return directions[index];
}

// ========================================
// UV INDEX
// ========================================

function updateUVIndex(data) {
  // OpenWeather basic API doesn't include UV, so we'll use a placeholder
  // In production, you'd use the One Call API or UV Index API
  const uvIndex = 5; // Placeholder value
  
  elements.uvValue.textContent = uvIndex;
  
  const uvLevels = [
    { max: 2, status: 'Low', color: '#00e400', rec: 'No protection needed' },
    { max: 5, status: 'Moderate', color: '#ffff00', rec: 'Wear sunscreen' },
    { max: 7, status: 'High', color: '#ff7e00', rec: 'Protection required' },
    { max: 10, status: 'Very High', color: '#ff0000', rec: 'Extra protection needed' },
    { max: 15, status: 'Extreme', color: '#8f3f97', rec: 'Avoid sun exposure' }
  ];
  
  const level = uvLevels.find(l => uvIndex <= l.max) || uvLevels[uvLevels.length - 1];
  
  elements.uvStatus.textContent = level.status;
  elements.uvStatus.style.color = level.color;
  elements.uvRecommendation.textContent = level.rec;
  elements.uvProgress.style.width = `${Math.min((uvIndex / 11) * 100, 100)}%`;
}

// ========================================
// SUNRISE & SUNSET
// ========================================

function updateSunTimes(data) {
  const sunrise = new Date(data.sys.sunrise * 1000);
  const sunset = new Date(data.sys.sunset * 1000);
  
  elements.sunriseTime.textContent = sunrise.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  elements.sunsetTime.textContent = sunset.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Calculate daylight duration
  const daylightMs = (data.sys.sunset - data.sys.sunrise) * 1000;
  const hours = Math.floor(daylightMs / (1000 * 60 * 60));
  const minutes = Math.floor((daylightMs % (1000 * 60 * 60)) / (1000 * 60));
  elements.daylightDuration.textContent = `${hours}h ${minutes}m`;
  
  // Calculate sun position (simplified)
  const now = Date.now() / 1000;
  const progress = ((now - data.sys.sunrise) / (data.sys.sunset - data.sys.sunrise)) * 100;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  elements.sunPosition.style.left = `${clampedProgress}%`;
}

// ========================================
// HOURLY FORECAST CHART
// ========================================

function updateHourlyChart(forecastData) {
  const hourlyData = forecastData.list.slice(0, 8); // Next 24 hours
  
  const labels = hourlyData.map(item => {
    const date = new Date(item.dt * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit' });
  });
  
  const temperatures = hourlyData.map(item => Math.round(item.main.temp));
  const precipitation = hourlyData.map(item => (item.pop * 100).toFixed(0));
  
  const ctx = document.getElementById('hourlyChart');
  
  // Destroy existing chart
  if (hourlyChart) {
    hourlyChart.destroy();
  }
  
  hourlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temperatures,
          borderColor: '#3a86ff',
          backgroundColor: 'rgba(58, 134, 255, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Precipitation (%)',
          data: precipitation,
          borderColor: '#4cc9f0',
          backgroundColor: 'rgba(76, 201, 240, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'white',
            font: { size: 14 }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          type: 'linear',
          position: 'left',
          ticks: { color: '#3a86ff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          ticks: { color: '#4cc9f0' },
          grid: { display: false }
        }
      }
    }
  });
}

// ========================================
// INTERACTIVE MAP
// ========================================

function initMap(lat, lon) {
  map = L.map('weatherMap').setView([lat, lon], 10);
  
  // Base tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  // Add marker
  L.marker([lat, lon]).addTo(map);
  
  // Map layer controls
  document.getElementById('tempLayer')?.addEventListener('click', () => {
    addWeatherLayer('temp_new');
  });
  
  document.getElementById('cloudsLayer')?.addEventListener('click', () => {
    addWeatherLayer('clouds_new');
  });
  
  document.getElementById('precipLayer')?.addEventListener('click', () => {
    addWeatherLayer('precipitation_new');
  });
}

let currentWeatherLayer = null;

function addWeatherLayer(layer) {
  if (currentWeatherLayer) {
    map.removeLayer(currentWeatherLayer);
  }
  
  currentWeatherLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${API_KEY}`,
    { opacity: 0.6 }
  ).addTo(map);
}

// ========================================
// 5-DAY FORECAST
// ========================================

function updateForecast(forecastData) {
  elements.forecastDaysContainer.innerHTML = '';
  
  // Group by day
  const dailyForecast = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() > today.getTime()) {
      const dateStr = date.toDateString();
      if (!dailyForecast[dateStr] || new Date(item.dt * 1000).getHours() === 12) {
        dailyForecast[dateStr] = item;
      }
    }
  });
  
  // Get first 5 days
  const forecastDays = Object.values(dailyForecast).slice(0, 5);
  
  forecastDays.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const temp = Math.round(day.main.temp);
    const condition = day.weather[0].main.toLowerCase();
    const iconClass = weatherIcons[condition] || 'fas fa-cloud';
    const description = day.weather[0].description;
    
    const dayEl = document.createElement('div');
    dayEl.className = 'forecast-day';
    dayEl.innerHTML = `
      <div class="forecast-date">${dayName}, ${monthDay}</div>
      <div class="forecast-icon"><i class="${iconClass}"></i></div>
      <div class="forecast-temp">${temp}°C</div>
      <div class="forecast-description">${description}</div>
    `;
    
    elements.forecastDaysContainer.appendChild(dayEl);
  });
}

// ========================================
// WEATHER PARTICLES ANIMATION
// ========================================

function updateWeatherParticles(data) {
  const condition = data.weather[0].main.toLowerCase();
  elements.weatherParticles.innerHTML = '';
  
  if (condition === 'rain' || condition === 'drizzle') {
    createRainParticles();
  } else if (condition === 'snow') {
    createSnowParticles();
  }
}

function createRainParticles() {
  for (let i = 0; i < 50; i++) {
    const drop = document.createElement('div');
    drop.style.cssText = `
      position: absolute;
      width: 2px;
      height: 20px;
      background: linear-gradient(transparent, rgba(76, 201, 240, 0.8));
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: rainFall ${Math.random() * 1 + 0.5}s linear infinite;
    `;
    elements.weatherParticles.appendChild(drop);
  }
  
  // Add animation
  if (!document.getElementById('rainAnimation')) {
    const style = document.createElement('style');
    style.id = 'rainAnimation';
    style.textContent = `
      @keyframes rainFall {
        to { transform: translateY(100vh); }
      }
    `;
    document.head.appendChild(style);
  }
}

function createSnowParticles() {
  for (let i = 0; i < 30; i++) {
    const flake = document.createElement('div');
    flake.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random()};
      animation: snowFall ${Math.random() * 3 + 2}s linear infinite;
    `;
    elements.weatherParticles.appendChild(flake);
  }
  
  // Add animation
  if (!document.getElementById('snowAnimation')) {
    const style = document.createElement('style');
    style.id = 'snowAnimation';
    style.textContent = `
      @keyframes snowFall {
        to {
          transform: translateY(100vh) rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function setActiveCity(city) {
  elements.cityCards.forEach(card => {
    if (card.dataset.city === city) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

function updateCityCard(city, data) {
  const cityCard = document.querySelector(`.city-card[data-city="${city}"]`);
  if (cityCard) {
    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].main.toLowerCase();
    const iconClass = weatherIcons[condition] || 'fas fa-cloud';
    const description = data.weather[0].description;
    
    cityCard.querySelector('.city-temp').textContent = `${temp}°C`;
    cityCard.querySelector('.city-weather').textContent = description;
    cityCard.querySelector('.city-weather-icon i').className = iconClass;
  }
}

function showLoading() {
  elements.locationName.textContent = 'Loading...';
  elements.mainTemperature.textContent = '--';
  elements.weatherIcon.className = 'fas fa-spinner fa-spin weather-icon';
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ff0000' : '#3a86ff'};
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.5s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ========================================
// INITIALIZE APP
// ========================================

document.addEventListener('DOMContentLoaded', init);

// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const cityCards = document.querySelectorAll('.city-card');
const locationEl = document.querySelector('.location');
const dateEl = document.querySelector('.date');
const weatherIcon = document.querySelector('.weather-icon');
const temperatureEl = document.querySelector('.temperature');
const descriptionEl = document.querySelector('.weather-description');
const windEl = document.querySelector('.wind .value');
const humidityEl = document.querySelector('.humidity .value');
const pressureEl = document.querySelector('.pressure .value');
const uvEl = document.querySelector('.uv .value');
const searchInput = document.querySelector('.search-container input');
const searchBtn = document.querySelector('.search-container button');
const forecastContainer = document.getElementById('forecast-days-container');

// API Configuration

const API_KEY = '22cd422892aa79c6d89fa4f1b38e5766'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'; // For geocoding to get coordinates
const ICON_URL = 'https://openweathermap.org/img/wn/'; // Not directly used for Font Awesome icons, but good to keep if you switch to image icons

// Weather icons mapping (using Font Awesome classes)
const weatherIcons = {
    'clear': 'fas fa-sun',
    'clouds': 'fas fa-cloud',
    'rain': 'fas fa-cloud-rain',
    'thunderstorm': 'fas fa-bolt',
    'drizzle': 'fas fa-cloud-rain',
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

/**
 * Displays a custom message box instead of using alert().
 * @param {string} message The message to display.
 */
function displayMessage(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
            <button class="message-close-btn">OK</button>
        </div>
    `;
    document.body.appendChild(messageBox);

    const closeBtn = messageBox.querySelector('.message-close-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(messageBox);
    });

    // Optional: Auto-hide after a few seconds
    setTimeout(() => {
        if (document.body.contains(messageBox)) {
            document.body.removeChild(messageBox);
        }
    }, 5000);
}


// Initialize with current date
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
}

/**
 * Fetches weather data (current and forecast) for a given city.
 * First, it uses the Geocoding API to get coordinates, then uses those for weather.
 * @param {string} city The name of the city.
 * @returns {Promise<object|null>} An object containing current and forecast data, or null if an error occurs.
 */
async function fetchWeatherData(city) {
    try {
        // 1. Get coordinates for the city using Geocoding API
        const geoResponse = await fetch(`${GEO_URL}?q=${city}&limit=1&appid=${API_KEY}`);
        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            displayMessage(`City "${city}" not found. Please check the spelling.`);
            return null;
        }

        const { lat, lon } = geoData[0]; // Get latitude and longitude

        // 2. Fetch current weather using coordinates
        const currentResponse = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();
        
        // 3. Fetch 5-day / 3-hour forecast using coordinates
        // OpenWeatherMap's 5-day forecast API provides data in 3-hour intervals.
        // We'll filter this data to get daily forecasts later.
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();
        
        return { current: currentData, forecast: forecastData, geo: geoData[0] };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayMessage('Failed to fetch weather data. Please try again later.');
        return null;
    }
}

/**
 * Updates the weather display on the page.
 * @param {string} city The name of the city.
 */
async function updateWeather(city) {
    // Show loading spinners/text
    locationEl.textContent = 'Loading...';
    temperatureEl.textContent = '--';
    descriptionEl.textContent = 'Loading...';
    weatherIcon.className = 'fas fa-spinner fa-spin weather-icon';
    windEl.textContent = '--';
    humidityEl.textContent = '--';
    pressureEl.textContent = '--';
    uvEl.textContent = '--';
    forecastContainer.innerHTML = `
        <div class="forecast-day">
            <div class="forecast-date">Loading...</div>
            <div class="forecast-icon"><i class="fas fa-spinner fa-spin"></i></div>
            <div class="forecast-temp">--°C</div>
            <div class="forecast-description">Loading...</div>
        </div>
        <div class="forecast-day">
            <div class="forecast-date">Loading...</div>
            <div class="forecast-icon"><i class="fas fa-spinner fa-spin"></i></div>
            <div class="forecast-temp">--°C</div>
            <div class="forecast-description">Loading...</div>
        </div>
        <div class="forecast-day">
            <div class="forecast-date">Loading...</div>
            <div class="forecast-icon"><i class="fas fa-spinner fa-spin"></i></div>
            <div class="forecast-temp">--°C</div>
            <div class="forecast-description">Loading...</div>
        </div>
        <div class="forecast-day">
            <div class="forecast-date">Loading...</div>
            <div class="forecast-icon"><i class="fas fa-spinner fa-spin"></i></div>
            <div class="forecast-temp">--°C</div>
            <div class="forecast-description">Loading...</div>
        </div>
        <div class="forecast-day">
            <div class="forecast-date">Loading...</div>
            <div class="forecast-icon"><i class="fas fa-spinner fa-spin"></i></div>
            <div class="forecast-temp">--°C</div>
            <div class="forecast-description">Loading...</div>
        </div>
    `;


    const data = await fetchWeatherData(city);
    
    if (!data || data.current.cod !== 200) {
        // Message already displayed by fetchWeatherData if city not found
        // Reset to default or previous state if fetch failed
        locationEl.textContent = 'City Not Found';
        temperatureEl.textContent = '--';
        descriptionEl.textContent = 'N/A';
        weatherIcon.className = 'fas fa-question-circle weather-icon'; // A generic error icon
        windEl.textContent = '--';
        humidityEl.textContent = '--';
        pressureEl.textContent = '--';
        uvEl.textContent = '--';
        forecastContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">Could not load forecast data.</p>';
        return;
    }
    
    const current = data.current;
    const forecast = data.forecast;
    const geoInfo = data.geo;
    
    // Update current weather
    // Use geoInfo.name for the city name, and geoInfo.country for the country code if available
    const displayLocation = geoInfo.name;
    const displayCountry = geoInfo.country ? `, ${geoInfo.country}` : '';
    locationEl.textContent = `${displayLocation}${displayCountry}`;
    
    temperatureEl.textContent = `${Math.round(current.main.temp)}°C`;
    descriptionEl.textContent = current.weather[0].description;
    
    // Set weather icon based on OpenWeatherMap's main condition
    const condition = current.weather[0].main.toLowerCase();
    const iconClass = weatherIcons[condition] || 'fas fa-cloud'; // Default to cloud if not found
    weatherIcon.className = `${iconClass} weather-icon`;
    
    // Update details
    windEl.textContent = `${Math.round(current.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    humidityEl.textContent = `${current.main.humidity}%`;
    pressureEl.textContent = `${current.main.pressure} hPa`;
    
    // OpenWeatherMap's free API does not directly provide UV Index.
    // You'd need a paid plan or a different API for this.
    // For now, we'll keep it as '--' or implement a placeholder.
    uvEl.textContent = '--'; 
    
    // Update forecast
    updateForecast(forecast);
    
    // Update city cards in sidebar
    updateCityCard(city, Math.round(current.main.temp), current.weather[0].description, iconClass);
}

/**
 * Updates the 5-day forecast display.
 * @param {object} forecastData The forecast data object from OpenWeatherMap.
 */
function updateForecast(forecastData) {
    forecastContainer.innerHTML = ''; // Clear previous forecast

    // Group forecast by day (taking one entry per day, ideally around noon)
    const dailyForecast = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        date.setHours(0, 0, 0, 0); // Normalize forecast item date to start of day

        // Only consider future days, and pick one entry per day (e.g., around 12 PM or the first entry for the day)
        if (date.getTime() > today.getTime()) { // Check if the forecast day is after today
            const dateStr = date.toDateString();
            // If we don't have an entry for this day yet, or if this entry is closer to noon (12-15 UTC)
            if (!dailyForecast[dateStr] || (new Date(item.dt * 1000).getHours() >= 12 && new Date(item.dt * 1000).getHours() <= 15)) {
                dailyForecast[dateStr] = item;
            }
        }
    });
    
    // Get next 5 days
    // Sort by date to ensure correct order
    const forecastDays = Object.values(dailyForecast).sort((a, b) => a.dt - b.dt).slice(0, 5);
    
    if (forecastDays.length === 0) {
        forecastContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">No forecast data available.</p>';
        return;
    }

    // Create forecast elements
    forecastDays.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const temp = Math.round(day.main.temp);
        const condition = day.weather[0].main.toLowerCase();
        const iconClass = weatherIcons[condition] || 'fas fa-cloud'; // Default to cloud if not found
        const description = day.weather[0].description;
        
        const forecastDayEl = document.createElement('div');
        forecastDayEl.className = 'forecast-day';
        forecastDayEl.innerHTML = `
            <div class="forecast-date">${dayName}, ${monthDay}</div>
            <div class="forecast-icon"><i class="${iconClass}"></i></div>
            <div class="forecast-temp">${temp}°C</div>
            <div class="forecast-description">${description}</div>
        `;
        
        forecastContainer.appendChild(forecastDayEl);
    });
}

/**
 * Updates a specific city card in the sidebar.
 * @param {string} city The city name.
 * @param {number} temp The temperature.
 * @param {string} condition The weather condition description.
 * @param {string} iconClass The Font Awesome icon class.
 */
function updateCityCard(city, temp, condition, iconClass) {
    const cityCard = document.querySelector(`.city-card[data-city="${city}"]`);
    if (cityCard) {
        const tempEl = cityCard.querySelector('.city-temp');
        const conditionEl = cityCard.querySelector('.city-weather');
        const iconEl = cityCard.querySelector('.city-weather-icon i');
        
        if (tempEl) tempEl.textContent = `${temp}°C`;
        if (conditionEl) conditionEl.textContent = condition;
        
        if (iconEl) iconEl.className = iconClass; // Use the iconClass determined in updateWeather
    }
}

/**
 * Sets the active city card in the sidebar.
 * @param {string} city The city name to set as active.
 */
function setActiveCity(city) {
    cityCards.forEach(card => {
        if (card.dataset.city === city) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// Event Listeners
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

cityCards.forEach(card => {
    card.addEventListener('click', () => {
        const city = card.dataset.city;
        setActiveCity(city);
        updateWeather(city);
    });
});

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        setActiveCity(city); // Set active even for new cities
        updateWeather(city);
        searchInput.value = ''; // Clear search input after search
    } else {
        displayMessage('Please enter a city name to search.');
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            setActiveCity(city); // Set active even for new cities
            updateWeather(city);
            searchInput.value = ''; // Clear search input after search
        } else {
            displayMessage('Please enter a city name to search.');
        }
    }
});

// Initialize the app
updateDate();
// Set a default city to load weather for on initial page load
// You can change 'Adama' to any city you prefer as the default.
setActiveCity('Adama');
updateWeather('Adama');


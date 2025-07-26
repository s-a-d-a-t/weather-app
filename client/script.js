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

// New elements for date/time display
const currentDateEl = document.getElementById('current-date');
const currentClockEl = document.getElementById('current-clock');
const currentTimezoneEl = document.getElementById('current-timezone');

// API Configuration
const API_KEY = '22cd422892aa79c6d89fa4f1b38e5766';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const ICON_URL = 'https://openweathermap.org/img/wn/';

// Weather icons mapping
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

    // Auto-hide after a few seconds
    setTimeout(() => {
        if (document.body.contains(messageBox)) {
            document.body.removeChild(messageBox);
        }
    }, 5000);
}

// Initialize with current date and time
function updateDateTime() {
    const now = new Date();

    // Format date: Weekday, Month Day, Year
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', dateOptions);

    // Format time: HH:MM:SS AM/PM (12-hour format)
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0'); // Pad with leading zero if single digit

    currentClockEl.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;

    // Update the weather section date as well
    dateEl.textContent = now.toLocaleDateString('en-US', dateOptions);

    // Update timezone info
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    currentTimezoneEl.textContent = timezone;
}

/**
 * Fetches weather data (current and forecast) for a given city.
 */
async function fetchWeatherData(city) {
    try {
        // Get coordinates for the city
        const geoResponse = await fetch(`${GEO_URL}?q=${city}&limit=1&appid=${API_KEY}`);
        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            displayMessage(`City "${city}" not found. Please check the spelling.`);
            return null;
        }

        const { lat, lon } = geoData[0];

        // Fetch current weather
        const currentResponse = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();

        // Fetch forecast
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
    // Show loading states
    locationEl.textContent = 'Loading...';
    temperatureEl.textContent = '--';
    descriptionEl.textContent = 'Loading...';
    weatherIcon.className = 'fas fa-spinner fa-spin weather-icon';
    windEl.textContent = '--';
    humidityEl.textContent = '--';
    pressureEl.textContent = '--';
    uvEl.textContent = '--';

    // Loading state for forecast
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
        locationEl.textContent = 'City Not Found';
        temperatureEl.textContent = '--';
        descriptionEl.textContent = 'N/A';
        weatherIcon.className = 'fas fa-question-circle weather-icon';
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
    const displayLocation = geoInfo.name;
    const displayCountry = geoInfo.country ? `, ${geoInfo.country}` : '';
    locationEl.textContent = `${displayLocation}${displayCountry}`;

    temperatureEl.textContent = `${Math.round(current.main.temp)}`;
    descriptionEl.textContent = current.weather[0].description;

    // Set weather icon
    const condition = current.weather[0].main.toLowerCase();
    const iconClass = weatherIcons[condition] || 'fas fa-cloud';
    weatherIcon.className = `${iconClass} weather-icon`;

    // Update details
    windEl.textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
    humidityEl.textContent = `${current.main.humidity}%`;
    pressureEl.textContent = `${current.main.pressure} hPa`;
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
    forecastContainer.innerHTML = '';

    // Group forecast by day
    const dailyForecast = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        date.setHours(0, 0, 0, 0);

        if (date.getTime() > today.getTime()) {
            const dateStr = date.toDateString();
            if (!dailyForecast[dateStr] || (new Date(item.dt * 1000).getHours() >= 12 && new Date(item.dt * 1000).getHours() <= 15)) {
                dailyForecast[dateStr] = item;
            }
        }
    });

    // Get next 5 days
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
        const iconClass = weatherIcons[condition] || 'fas fa-cloud';
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
 */
function updateCityCard(city, temp, condition, iconClass) {
    const cityCard = document.querySelector(`.city-card[data-city="${city}"]`);
    if (cityCard) {
        const tempEl = cityCard.querySelector('.city-temp');
        const conditionEl = cityCard.querySelector('.city-weather');
        const iconEl = cityCard.querySelector('.city-weather-icon i');

        if (tempEl) tempEl.textContent = `${temp}°C`;
        if (conditionEl) conditionEl.textContent = condition;

        if (iconEl) iconEl.className = iconClass;
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
    const icon = menuToggle.querySelector('i');
    if (sidebar.classList.contains('active')) {
        icon.className = 'fas fa-times';
    } else {
        icon.className = 'fas fa-bars';
    }
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    const isMobile = window.innerWidth <= 992;
    const isClickInsideSidebar = sidebar.contains(e.target);
    const isClickOnToggle = menuToggle.contains(e.target);

    if (isMobile && sidebar.classList.contains('active') &&
        !isClickInsideSidebar && !isClickOnToggle) {
        sidebar.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.className = 'fas fa-bars';
    }
});

cityCards.forEach(card => {
    card.addEventListener('click', () => {
        const city = card.dataset.city;
        setActiveCity(city);
        updateWeather(city);
        // Close sidebar on mobile after selection
        if (window.innerWidth <= 992) {
            sidebar.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.className = 'fas fa-bars';
        }
    });
});

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        setActiveCity(city);
        updateWeather(city);
        searchInput.value = '';
    } else {
        displayMessage('Please enter a city name to search.');
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            setActiveCity(city);
            updateWeather(city);
            searchInput.value = '';
        } else {
            displayMessage('Please enter a city name to search.');
        }
    }
});

// Initialize the app
updateDateTime();
setActiveCity('Adama');
updateWeather('Adama');

// Update the time every second
setInterval(updateDateTime, 1000);

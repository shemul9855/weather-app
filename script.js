
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");

const weatherInfo = document.getElementById("weather-info");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weather-icon");

// Weather code অনুযায়ী condition ও icon
function getWeatherInfo(code) {
    if (code === 0) {
        return { text: "Clear Sky", icon: "☀️" };
    }

    if (code === 1) {
        return { text: "Mainly Clear", icon: "🌤️" };
    }

    if (code === 2) {
        return { text: "Partly Cloudy", icon: "⛅" };
    }

    if (code === 3) {
        return { text: "Overcast", icon: "☁️" };
    }

    if ([45, 48].includes(code)) {
        return { text: "Foggy", icon: "🌫️" };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return { text: "Drizzle", icon: "🌦️" };
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { text: "Rainy", icon: "🌧️" };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { text: "Snowy", icon: "❄️" };
    }

    if ([95, 96, 99].includes(code)) {
        return { text: "Thunderstorm", icon: "⛈️" };
    }

    return { text: "Unknown Weather", icon: "🌡️" };
}

// City name দিয়ে latitude ও longitude খুঁজবে
async function getCityCoordinates(city) {
    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not search for this city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please try another name.");
    }

    // একই নামে একাধিক শহর থাকলে প্রথম ফলাফল
    // নির্বাচন করা হচ্ছে
    return data.results[0];
}

// Coordinates দিয়ে current weather আনবে
async function getWeather(latitude, longitude) {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not load weather data.");
    }

    return await response.json();
}

// Weather information screen-এ দেখাবে
function displayWeather(city, data) {
    const current = data.current;
    const weather = getWeatherInfo(current.weather_code);

    cityName.textContent =
        `${city.name}, ${city.country}`;

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    condition.textContent =
        weather.text;

    weatherIcon.textContent =
        current.is_day ? weather.icon : "🌙";

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    wind.textContent =
        `${current.wind_speed_10m} km/h`;

    message.textContent =
        `Feels like ${Math.round(current.apparent_temperature)}°C`;

    weatherInfo.hidden = false;
}

// Search button ও Enter key
searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Loading weather...";
    weatherInfo.hidden = true;

    const searchButton = searchForm.querySelector("button");
    searchButton.disabled = true;
    searchButton.textContent = "Loading...";

    try {
        const cityData = await getCityCoordinates(city);

        const weatherData = await getWeather(
            cityData.latitude,
            cityData.longitude
        );

        displayWeather(cityData, weatherData);

    } catch (error) {
        message.textContent = error.message;
        weatherInfo.hidden = true;

    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
});
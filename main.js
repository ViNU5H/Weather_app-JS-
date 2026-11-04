const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const locationBtn = document.querySelector(".locationBtn");
const card = document.querySelector(".card");
const apiKey = "fb685be2b00cc4516b9b9ff2cb459275";

const FALLBACK_CITY = "Colombo";

window.addEventListener("DOMContentLoaded", () => {
    loadLiveLocationWeather();
});

function loadLiveLocationWeather() {
    displayLoading("Detecting your location...");

    if (!navigator.geolocation) {
        loadDefaultCity("Geolocation not supported. Showing default city.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const weatherData = await getWeatherDataByCoords(latitude, longitude);
                displayWeatherInfo(weatherData);
            } catch (error) {
                console.error(error);
                loadDefaultCity("Could not fetch local weather. Showing default city.");
            }
        },
        (error) => {
            console.warn("Geolocation denied or failed:", error.message);
            loadDefaultCity(`Location access denied. Showing ${FALLBACK_CITY}.`);
        },
        { timeout: 7000 }
    );
}

async function loadDefaultCity(notice) {
    try {
        const weatherData = await getWeatherData(FALLBACK_CITY);
        displayWeatherInfo(weatherData);
    } catch (err) {
        displayError(notice);
    }
}

weatherForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();

    if (city) {
        displayLoading("Searching city...");
        try {
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
        } catch (error) {
            console.error(error);
            displayError("Could not find city. Please try again.");
        }
    } else {
        displayError("Please enter a city name");
    }
});

if (locationBtn) {
    locationBtn.addEventListener("click", () => {
        cityInput.value = "";
        loadLiveLocationWeather();
    });
}

async function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("City not found");
    return await response.json();
}

async function getWeatherDataByCoords(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Location coordinates failed");
    return await response.json();
}

function displayWeatherInfo(data) {
    const {
        name: city,
        main: { temp, humidity },
        weather: [{ description, id }]
    } = data;

    card.textContent = "";
    card.style.display = "flex";

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${((temp - 273.15) * (9/5) + 32).toFixed(1)}°F`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    descDisplay.textContent = description;
    weatherEmoji.textContent = getWeatherEmoji(id);

    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji");

    card.appendChild(cityDisplay);
    card.appendChild(weatherEmoji);
    card.appendChild(tempDisplay);
    card.appendChild(descDisplay);
    card.appendChild(humidityDisplay);
}

function getWeatherEmoji(weatherId) {
    switch (true) {
        case weatherId >= 200 && weatherId < 300:
            return "⛈";
        case weatherId >= 300 && weatherId < 600:
            return "🌧";
        case weatherId >= 600 && weatherId < 700:
            return "❄";
        case weatherId >= 700 && weatherId < 800:
            return "🌫";
        case weatherId === 800:
            return "☀️";
        case weatherId >= 801 && weatherId < 810:
            return "☁️";
        default:
            return "❓";
    }
}

function displayLoading(message) {
    card.textContent = "";
    card.style.display = "flex";
    const loader = document.createElement("p");
    loader.textContent = message;
    loader.style.color = "#94a3b8";
    loader.style.fontSize = "1.1rem";
    card.appendChild(loader);
}

function displayError(message) {
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");

    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(errorDisplay);
}
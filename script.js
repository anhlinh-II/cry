let searchbar = document.querySelector(".search-bar input");
let city = document.querySelector(".city");
let country = document.querySelector(".country");
let time = document.querySelector(".time");
let temperature = document.querySelector(".value");

let visibility = document.querySelector(".visibility span");
let windspeed = document.querySelector(".windspeed span");
let humidity = document.querySelector(".humidity span");
let rainlevel = document.querySelector(".rainlevel span");
let sunrise = document.querySelector(".sunrise span");
let sunset = document.querySelector(".sunset span");
let weathericon = document.querySelector(".weather-icon img");

let weatherAPIkey = "926b6e82d1c2a20a0c20e9229ebcd631";
let weatherBaseEndpoint = "https://api.openweathermap.org/data/2.5/weather?units=metric&appid=" + weatherAPIkey;
let forecastBaseEndpoint = "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=" + weatherAPIkey;

let weatherIcons = [
    { url: "Image/thunderstorm.png", ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232], },
    { url: "Image/rain.png", ids: [500, 501, 502, 503, 504, 511, 520, 521, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321], },
    { url: "Image/mist.png", ids: [701, 741], },
    { url: "Image/clear.png", ids: [800], },
    { url: "Image/clouds.png", ids: [801, 802, 803, 804], },
    { url: "Image/snow.png", ids: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622], },
];

let getIconURL = (weatherID) => {
    for (let icon of weatherIcons) {
        if (icon.ids.includes(weatherID)) {
            return icon.url;
        }
    }
    return "default.png";
};

let weatherDescription = [
    { ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232], description: "Thunderstorm" },
    { ids: [500, 501, 502, 503, 504, 511, 520, 521, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321], description: "Rain" },
    { ids: [701, 741], description: "Mist" },
    { ids: [800], description: "Clear" },
    { ids: [801, 802, 803, 804], description: "Clouds" },
    { ids: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622], description: "Snow" },
];

let getWeatherByCityName = async (cityName) => {
    let endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=` + weatherAPIkey;

    try {
        let response = await fetch(endpoint);
        if (response.status !== 200) {
            alert("City not found!");
            return;
        }
        let data = await response.json();
        updateCurrentWeather(data);
    } catch (error) {
        console.error("Fetch error: ", error);
    }
};

let updateCurrentWeather = (data) => {
    console.log("data >> ", data)
    weathericon.src = getIconURL(data.weather[0].id);
    city.innerText = data.name;
    country.innerText = data.sys.country;
    temperature.innerText = `${Math.round(data.main.temp)}°C`;
    visibility.innerText = ` ${data.visibility}m`;
    humidity.innerText = `${data.main.humidity}%`;
    windspeed.innerText = `${data.wind.speed} m/s`;
    rainlevel.innerText = data.rain && data.rain["1h"] ? `${data.rain["1h"]}mm` : "No rain";
    sunrise.innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true, });
    sunset.innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true, });

    time.innerText = new Date().toLocaleString("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "numeric",
        minute: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
    });

    let weatherId = data.weather[0].id;
    let description = "Unknown";
    for (let item of weatherDescription) {
        if (item.ids.includes(weatherId)) {
            description = item.description;
            break;
        }
    }
    document.querySelector("#weather-description").innerText = description;
    changeBackground(weatherId);

    document.querySelector(".visibility span").innerText = data.visibility + " m";
    document.querySelector(".windspeed span").innerText = data.wind.speed + " m/s";
    document.querySelector(".humidity span").innerText = data.main.humidity + " %";
    document.querySelector(".rainlevel span").innerText = data.rain && data.rain["1h"] ? `${data.rain["1h"]} mm` : "No rain";
    document.querySelector(".sunrise span").innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true, });
    document.querySelector(".sunset span").innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true, });
};

let getForecastByCityName = async (cityName) => {
    let endpoint = `${forecastBaseEndpoint}&q=${cityName}`;
    try {
        let response = await fetch(endpoint);
        let data = await response.json();
        displayForecast(data.list);
        displayHourlyForecast(data.list);
    } catch (error) {
        console.error("Fetch forecast error:", error)
    }
};

let displayForecast = (forecastList) => {
    let dailyData = {};
    forecastList.forEach((item) => {
        let date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) {
            dailyData[date] = {
                tempSum: item.main.temp, count: 1, weatherID: item.weather[0].id,
            };
        } else {
            dailyData[date].tempSum += item.main.temp;
            dailyData[date].count++;
        }
    });

    let daysToDisplay = Object.keys(dailyData);
    daysToDisplay = daysToDisplay.slice(1, 7);

    daysToDisplay.forEach((day, index) => {
        let dayElement = document.getElementById(`day${index + 1}`);
        if (dailyData[day]) {
            let date = new Date(day);
            date.setHours(date.getHours() + 7);
            let dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            let avgTemp = (dailyData[day].tempSum / dailyData[day].count).toFixed(1);
            let iconUrl = getIconURL(dailyData[day].weatherID);

            dayElement.innerHTML = `
                    <h2>${dayName}</h2>
                    <img src="${iconUrl}" alt="Weather Icon" class="weather-day-icon">
                    <span>${avgTemp}°C</span>`;
        }
    });
};

let displayHourlyForecast = (forecastList) => {
    let hourlyContainer = document.querySelector(".weather-hourly");
    hourlyContainer.innerHTML = "";

    let currentHour = new Date().getHours();
    let displayedHours = new Set();
    let displayedCount = 0;

    forecastList.sort((a, b) => a.dt - b.dt);

    let nowForecast = forecastList.find(forecast => {
        let forecastHour = new Date(forecast.dt * 1000).getHours();
        return forecastHour >= currentHour;
    }) || forecastList[0];

    if (nowForecast) {
        let hourDiv = document.createElement("div");
        hourDiv.classList.add("hour");

        hourDiv.innerHTML = `
            <span>Now</span>
            <img src="${getIconURL(nowForecast.weather[0].id) || "default.png"}" 
                 class="weather-hour-icon" 
                 alt="weather icon">
            <span>${nowForecast.main.temp.toFixed(1)} °C</span>
        `;

        hourlyContainer.appendChild(hourDiv);
        displayedHours.add(currentHour);
        displayedCount++;
    }

    for (let forecast of forecastList) {
        let forecastHour = new Date(forecast.dt * 1000).getHours();
        if (displayedCount < 8 && !displayedHours.has(forecastHour)) {
            displayedHours.add(forecastHour);
            displayedCount++;

            let hourDiv = document.createElement("div");
            hourDiv.classList.add("hour");

            hourDiv.innerHTML = `
            <span>${forecastHour}:00</span>
            <img src="${getIconURL(forecast.weather[0].id) || "default.png"}" 
                 class="weather-hour-icon" 
                 alt="weather icon">
            <span>${forecast.main.temp.toFixed(1)} °C</span>
            `;

            hourlyContainer.appendChild(hourDiv);
        }
    }
};

function getWeather() {
    let cityName = searchbar.value.trim();
    if (cityName) {
        getWeatherByCityName(cityName);
        getForecastByCityName(cityName);
    }
}

searchbar.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

function changeBackground(weatherID) {
    let body = document.body;

    let defaultColor = "linear-gradient(to bottom, #ffd166, #ff914d)";
    if ([800, 801, 802, 803, 804].includes(weatherID)) {
        defaultColor = "linear-gradient(to bottom, #ffd166, #ff914d)";
    } else if ([701, 741, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622].includes(weatherID)) {
        defaultColor = "linear-gradient(to bottom,rgb(187, 225, 243),rgb(53, 165, 225))"
    } else if ([200, 201, 202, 210, 211, 212, 221, 230, 231, 232, 500, 501, 502, 503, 504, 511, 520, 521, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321].includes(weatherID)) {
        defaultColor = "linear-gradient(to bottom,rgb(213, 228, 234),rgb(94, 101, 105))"
    }

    body.style.transition = "background-color 0.5s ease";
    body.style.background = defaultColor;
}

// Default city when start the page
let init = () => {
    getWeatherByCityName("Hanoi");
    getForecastByCityName("Hanoi");
};

init();

console.log("asdasd");

// http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=366d3041b4ecd5e8aadb86bc5b2d67d6

// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}

const apiKey = "366d3041b4ecd5e8aadb86bc5b2d67d6";

window.onload = fetchWeather("Istanbul");

function fetchWeather(cityName = document.querySelector("#cityName").value) {
  fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=366d3041b4ecd5e8aadb86bc5b2d67d6`
  )
    .then((result) => {
      return result.json();
    })
    .then((response) => {
      const lat = response[0].lat;
      const lon = response[0].lon;
      return { lat, lon };
    })
    .then((response) => {
      return fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${response.lat}&lon=${response.lon}&appid=${apiKey}`
      );
    })
    .then((weatherObj) => {
      return weatherObj.json();
    })
    .then((obj) => {
      console.log(obj);
      displayCityName(cityName, obj.sys.country);
      setTemperature(obj.main.temp);
      setDetails(obj);
    })
    .catch((err) => console.log(err));
}

const displayCityName = (cityName, countryName) => {
  document.querySelector(".cityNameHeader p").textContent =
    cityName.toUpperCase() + " / " + countryName;
};

const setTemperature = (temp) => {
  temp = Math.round(temp - 273);
  document.querySelector(".temperature > span").textContent = temp;
};

const toCelcius = (temp) => {
  return Math.round(temp - 273);
};

const setDetails = (obj) => {
  // Humidity
  document.getElementById("humidity").textContent = " " + obj.main.humidity;
  // FeelsLike
  document.getElementById("feels-like").textContent = toCelcius(
    obj.main.feels_like
  );
  // Max Temp
  document.getElementById("max-temp").textContent = toCelcius(
    obj.main.temp_max
  );
  // Min Temp
  document.getElementById("min-temp").textContent = toCelcius(
    obj.main.temp_min
  );
  // Wind Speed meter/sec
  document.getElementById("wind-speed").textContent = obj.wind.speed;
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchWeather();
  }
});

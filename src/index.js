import { format } from "date-fns";

(function () {
  window.onload = fetchWeather("Istanbul");
  function fetchWeather(cityName = document.querySelector("#cityName").value) {
    const apiKey = "366d3041b4ecd5e8aadb86bc5b2d67d6";
    fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=366d3041b4ecd5e8aadb86bc5b2d67d6`
    )
      .then((result) => {
        return result.json();
      })
      .then((response) => {
        const lat = response[0].lat;
        const lon = response[0].lon;
        setTime(lat, lon);
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
        setSideBarDetails(obj);
        setMainPageDetails(obj);
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

  const kelvinToCelcius = (temp) => {
    return Math.round(temp - 273);
  };

  const setSideBarDetails = (obj) => {
    // Humidity
    document.getElementById("humidity").textContent = " " + obj.main.humidity;
    // FeelsLike
    document.getElementById("feels-like").textContent = kelvinToCelcius(
      obj.main.feels_like
    );
    // Max Temp
    document.getElementById("max-temp").textContent = kelvinToCelcius(
      obj.main.temp_max
    );
    // Min Temp
    document.getElementById("min-temp").textContent = kelvinToCelcius(
      obj.main.temp_min
    );
    // Wind Speed meter/sec
    document.getElementById("wind-speed").textContent = obj.wind.speed;
  };

  const setMainPageDetails = (obj, resetInterval) => {
    // set today's date
    const today = format(new Date(), "MMMM dd, yyyy");
    document.querySelector(".date").textContent = today;
    // Set time
    console.log(resetInterval);
    if (resetInterval) {
      setTime(obj.coord.lat, obj.coord.lon, resetInterval);
    }
    // continue later

    // Description
    const description = capitalizeFirstLetter(obj.weather[0].description);
    document.querySelector(".description > p").textContent = description;
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      fetchWeather();
    }
  });

  const celciusToFahrenheit = (c) => {
    return c * (9 / 5) + 32;
  };

  const fahrenheitToCelcius = (f) => {
    return (f - 32) * (5 / 9);
  };

  function setTime(lat, lng) {
    ClearAllIntervals();
    const apiForTimeZone = "QKACMRAC44V3";
    let myTimer = setInterval(function fetchTime() {
      fetch(
        `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiForTimeZone}&format=xml&by=position&lat=${lat}&lng=${lng}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "application/json",
          },
        }
      ).then((response) => {
        response.text().then((data) => {
          const timeObj = parseXml(data);
          const time = timeObj.result.formatted["#text"];
          console.log();
          document.querySelector(".time").textContent = time.substr(10);
        });
      });
    }, 1 * 1000);
  }

  function parseXml(xml, arrayTags) {
    let dom = null;
    if (window.DOMParser)
      dom = new DOMParser().parseFromString(xml, "text/xml");
    else if (window.ActiveXObject) {
      dom = new ActiveXObject("Microsoft.XMLDOM");
      dom.async = false;
      if (!dom.loadXML(xml))
        throw dom.parseError.reason + " " + dom.parseError.srcText;
    } else throw new Error("cannot parse xml string!");

    function parseNode(xmlNode, result) {
      if (xmlNode.nodeName == "#text") {
        let v = xmlNode.nodeValue;
        if (v.trim()) result["#text"] = v;
        return;
      }

      let jsonNode = {},
        existing = result[xmlNode.nodeName];
      if (existing) {
        if (!Array.isArray(existing))
          result[xmlNode.nodeName] = [existing, jsonNode];
        else result[xmlNode.nodeName].push(jsonNode);
      } else {
        if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1)
          result[xmlNode.nodeName] = [jsonNode];
        else result[xmlNode.nodeName] = jsonNode;
      }

      if (xmlNode.attributes)
        for (let attribute of xmlNode.attributes)
          jsonNode[attribute.nodeName] = attribute.nodeValue;

      for (let node of xmlNode.childNodes) parseNode(node, jsonNode);
    }

    let result = {};
    for (let node of dom.childNodes) parseNode(node, result);

    return result;
  }

  function ClearAllIntervals() {
    for (var i = 1; i < 99999; i++) window.clearInterval(i);
  }
})();

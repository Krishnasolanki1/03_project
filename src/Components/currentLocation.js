import React, { useCallback, useEffect, useState } from 'react';
import apiKeys from './apiKeys';
import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "../images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();
    return `${day}, ${date} ${month} ${year}`;
}

const defaults = {
    color: "white",
    size: 112,
    animate: true,
};

const getIconForWeather = (main) => {
    switch (main) {
        case "Haze":
            return "CLEAR_DAY";
        case "Clouds":
            return "CLOUDY";
        case "Rain":
            return "RAIN";
        case "Snow":
            return "SNOW";
        case "Dust":
        case "Tornado":
            return "WIND";
        case "Drizzle":
            return "SLEET";
        case "Fog":
        case "Smoke":
            return "FOG";
        default:
            return "CLEAR_DAY";
    };
};

const Weather = () => {
    const [lat, setLat] = useState(undefined);
    const [lon, setLon] = useState(undefined);
    const [errorMsg, setErrorMsg] = useState(undefined);
    const [temperatureC, setTemperatureC] = useState(undefined);
    const [temperatureF, setTemperatureF] = useState(undefined);
    const [city, setCity] = useState(undefined);
    const [country, setCountry] = useState(undefined);
    const [humidity, setHumidity] = useState(undefined);
    const [main, setMain] = useState(undefined);
    const [icon, setIcon] = useState(undefined);

    const getPosition = useCallback((options) => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }, []);

    const getWeather = useCallback(async (lat, lon) => {
        try {
            const api_call = await fetch(
                `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
            );
            if (!api_call.ok) throw new Error('Network response was not ok');

            const data = await api_call.json();
            setLat(lat);
            setLon(lon);
            setCity(data.name);
            setTemperatureC(Math.round(data.main.temp));
            setTemperatureF(Math.round(data.main.temp * 1.8 + 32));
            setHumidity(data.main.humidity);
            setMain(data.weather[0].main);
            setIcon(getIconForWeather(data.weather[0].main));
        } catch (error) {
            console.error('Error fetching weather data:', error);
            setErrorMsg('Unable to fetch weather data');
        }
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            getPosition()
                .then((position) => {
                    getWeather(position.coords.latitude, position.coords.longitude);
                })
                .catch(() => {
                    getWeather(28.67, 77.22); // Default location
                    alert("You have disabled location service. Allow 'This APP' to access your location. Your current location will be used for calculating real-time weather.");
                });
        } else {
            alert("Geolocation not available");
        }

        const timerID = setInterval(
            () => {
                if (lat && lon) {
                    getWeather(lat, lon);
                }
            },
            600000 // 10 minutes
        );

        return () => clearInterval(timerID);
    }, [lat, lon, getPosition, getWeather]);

    if (errorMsg) {
        return (
            <div className='error'>
                <h2>{errorMsg}</h2>
            </div>
        );
    }

    if (temperatureC !== undefined) {
        return (
            <React.Fragment>
                <div className='city'>
                    <div className='title'>
                        <h2>{city}</h2>
                        <h3>{country}</h3>
                    </div>
                    <div className='mb-icon'>
                        <ReactAnimatedWeather
                            icon={icon}
                            color={defaults.color}
                            size={defaults.size}
                            animate={defaults.animate}
                        />
                        <p>{main}</p>
                    </div>
                    <div className='date-time'>
                        <div className='dmy'>
                            <div className='txt'></div>
                            <div className='current-time'>
                                <Clock format='HH:mm:ss' interval={1000} ticking={true} />
                            </div>
                            <div className='current-date'>{dateBuilder(new Date())}</div>
                        </div>
                        <div className='temperature'>
                            <p>
                                {temperatureC}°<span>C</span>
                            </p>
                        </div>
                    </div>
                </div>
                <Forcast icon={icon} weather={main} />
            </React.Fragment>
        );
    } else {
        return (
            <React.Fragment>
                <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} />
                <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
                    Detecting your location
                </h3>
                <h3 style={{ color: "white", marginTop: "10px" }}>
                    Your current location will be displayed on the App <br /> & used
                    for calculating real-time weather.
                </h3>
            </React.Fragment>
        );
    }
}

export default Weather;

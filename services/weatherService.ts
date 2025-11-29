import { BACKEND_URL } from '../config';
import { WeatherData } from '../types';

export const getWeather = async (location: string): Promise<WeatherData> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/weather?location=${encodeURIComponent(location)}`);

    if (!response.ok) {
      throw new Error('Failed to fetch weather data from backend');
    }

    const data = await response.json();

    return {
      temp: data.current.temp_c,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      location: data.location.name + ', ' + data.location.region,
      icon: data.current.condition.icon.startsWith('//') 
            ? `https:${data.current.condition.icon}` 
            : data.current.condition.icon,
      forecast: data.forecast.forecastday.map((day: any) => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: day.day.avgtemp_c,
        icon: day.day.condition.icon.startsWith('//')
              ? `https:${day.day.condition.icon}`
              : day.day.condition.icon
      }))
    };
  } catch (error) {
    console.error('Weather Service Error:', error);
    return {
      temp: 0,
      condition: "Unavailable",
      humidity: 0,
      windSpeed: 0,
      location: location,
      icon: "",
      forecast: []
    };
  }
};
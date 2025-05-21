import axios from 'axios';
import { WeatherData, weatherDataSchema, WeatherSuggestion } from '@shared/schema';
import { log } from './vite';

// Weather API URL and key from environment variables
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';

if (!WEATHER_API_KEY) {
  log('WARNING: WEATHER_API_KEY environment variable is not set', 'weather-api');
}

// Client for the weather API
const weatherClient = axios.create({
  baseURL: WEATHER_API_URL,
  params: {
    key: WEATHER_API_KEY,
  },
});

// Get current weather data and forecast for a location
export async function getWeatherData(query: string): Promise<WeatherData> {
  try {
    const response = await weatherClient.get('/forecast.json', {
      params: {
        q: query,
        days: 1,
        aqi: 'no',
        alerts: 'no',
      },
    });

    // Validate response with our schema
    const parsedData = weatherDataSchema.parse(response.data);
    return parsedData;
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status;
      const message = error.response.data.error?.message || 'Unknown error occurred';
      
      // Throw a more detailed error
      const err = new Error(`Weather API error (${statusCode}): ${message}`);
      (err as any).status = statusCode;
      throw err;
    }
    
    throw new Error(`Weather API error: ${error.message}`);
  }
}

// Search for city suggestions
export async function searchCities(query: string): Promise<WeatherSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    const response = await weatherClient.get('/search.json', {
      params: {
        q: query,
      },
    });
    
    return response.data.map((city: any) => ({
      id: city.id || Math.floor(Math.random() * 1000000),
      name: city.name,
      region: city.region,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
    }));
  } catch (error: any) {
    log(`City search error: ${error.message}`, 'weather-api');
    return [];
  }
}

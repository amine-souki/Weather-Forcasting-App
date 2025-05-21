import axios from 'axios';
import { WeatherData, weatherDataSchema, WeatherSuggestion } from '@shared/schema';
import { log } from './vite';

// Weather API URL from RapidAPI
const WEATHER_API_URL = 'https://weatherapi-com.p.rapidapi.com';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';

// Logging API key status (not the actual key)
if (!WEATHER_API_KEY) {
  log('WARNING: WEATHER_API_KEY environment variable is not set', 'weather-api');
} else {
  log('WEATHER_API_KEY is set and has length: ' + WEATHER_API_KEY.length, 'weather-api');
  log('Using RapidAPI for weather data', 'weather-api');
}

// Client for the RapidAPI weather service
const weatherClient = axios.create({
  baseURL: WEATHER_API_URL,
  headers: {
    'X-RapidAPI-Key': WEATHER_API_KEY,
    'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
  }
});

// Get current weather data and forecast for a location
export async function getWeatherData(query: string): Promise<WeatherData> {
  try {
    // Add a small delay to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 800));
    
    log(`Fetching weather data for: ${query}`, 'weather-api');
    
    const response = await weatherClient.get('/forecast.json', {
      params: {
        q: query,
        days: 1,
        aqi: 'no',
        alerts: 'no',
      },
    });

    log(`Weather data fetch successful for: ${query}`, 'weather-api');
    
    // Validate response with our schema
    const parsedData = weatherDataSchema.parse(response.data);
    return parsedData;
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status;
      const message = error.response.data.error?.message || 'Unknown error occurred';
      
      log(`Weather API error (${statusCode}): ${message} for query: ${query}`, 'weather-api');
      
      // Throw a more detailed error
      const err = new Error(`Weather API error (${statusCode}): ${message}`);
      (err as any).status = statusCode;
      throw err;
    }
    
    log(`Weather API general error: ${error.message} for query: ${query}`, 'weather-api');
    throw new Error(`Weather API error: ${error.message}`);
  }
}

// Search for city suggestions
export async function searchCities(query: string): Promise<WeatherSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    // Add a small delay to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await weatherClient.get('/search.json', {
      params: {
        q: query,
      },
    });
    
    log(`City search successful for query: ${query}`, 'weather-api');
    
    return response.data.map((city: any) => ({
      id: city.id || Math.floor(Math.random() * 1000000),
      name: city.name,
      region: city.region,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
    }));
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    log(`City search error (${status}): ${message} for query: ${query}`, 'weather-api');
    
    // Return some basic suggestions for common cities when API fails
    if (query.toLowerCase().includes('new york') || query.toLowerCase().includes('ny')) {
      return [{ id: 1, name: 'New York', region: 'New York', country: 'United States', lat: 40.71, lon: -74.01 }];
    } else if (query.toLowerCase().includes('london')) {
      return [{ id: 2, name: 'London', region: 'City of London', country: 'United Kingdom', lat: 51.51, lon: -0.13 }];
    } else if (query.toLowerCase().includes('paris')) {
      return [{ id: 3, name: 'Paris', region: 'Ile-de-France', country: 'France', lat: 48.85, lon: 2.35 }];
    } else if (query.toLowerCase().includes('tokyo')) {
      return [{ id: 4, name: 'Tokyo', region: 'Tokyo', country: 'Japan', lat: 35.69, lon: 139.69 }];
    }
    
    return [];
  }
}

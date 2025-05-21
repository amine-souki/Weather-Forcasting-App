import axios from 'axios';
import { WeatherData, weatherDataSchema, WeatherSuggestion } from '@shared/schema';
import { log } from './vite';

// Weather API URL from RapidAPI - using OpenWeather API
const WEATHER_API_URL = 'https://open-weather13.p.rapidapi.com';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';

// Logging API key status (not the actual key)
if (!WEATHER_API_KEY) {
  log('WARNING: WEATHER_API_KEY environment variable is not set', 'weather-api');
} else {
  log('WEATHER_API_KEY is set and has length: ' + WEATHER_API_KEY.length, 'weather-api');
  log('Using OpenWeather RapidAPI for weather data', 'weather-api');
}

// Client for the RapidAPI OpenWeather service
const weatherClient = axios.create({
  baseURL: WEATHER_API_URL,
  headers: {
    'X-RapidAPI-Key': WEATHER_API_KEY,
    'X-RapidAPI-Host': 'open-weather13.p.rapidapi.com'
  }
});

// Get current weather data and forecast for a location
export async function getWeatherData(query: string): Promise<WeatherData> {
  try {
    // Add a small delay to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 800));
    
    log(`Fetching weather data for: ${query}`, 'weather-api');
    
    // Parse city into lat/lon
    let latitude = 0;
    let longitude = 0;
    
    // Check if query matches any city names
    const cities = {
      'london': { lat: 51.51, lon: -0.13 },
      'new york': { lat: 40.73, lon: -73.94 },
      'tokyo': { lat: 35.69, lon: 139.69 },
      'paris': { lat: 48.85, lon: 2.35 },
      'los angeles': { lat: 34.05, lon: -118.24 },
      'chicago': { lat: 41.88, lon: -87.63 },
      'beijing': { lat: 39.90, lon: 116.41 },
      'sydney': { lat: -33.87, lon: 151.21 },
      'berlin': { lat: 52.52, lon: 13.41 },
      'moscow': { lat: 55.75, lon: 37.62 }
    };
    
    // Find matching city
    const lowerQuery = query.toLowerCase();
    let found = false;
    
    for (const [city, coords] of Object.entries(cities)) {
      if (lowerQuery.includes(city)) {
        latitude = coords.lat;
        longitude = coords.lon;
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Default to New York if no city matches
      latitude = 40.73;
      longitude = -73.94;
      log(`City not recognized, using default (New York) coordinates`, 'weather-api');
    }
    
    // Get current weather
    const response = await weatherClient.get('/city', {
      params: {
        cityName: query,
      },
    });

    log(`Weather data fetch successful for: ${query}`, 'weather-api');
    
    // Transform OpenWeather data to match our schema
    const weatherData: WeatherData = {
      location: {
        name: response.data.name || query,
        country: response.data.sys?.country || 'Unknown',
        region: '',
        lat: response.data.coord?.lat || latitude,
        lon: response.data.coord?.lon || longitude,
        localtime: new Date().toISOString(),
      },
      current: {
        temp_c: (response.data.main?.temp - 273.15) || 20, // Convert from Kelvin to Celsius
        temp_f: ((response.data.main?.temp - 273.15) * 9/5 + 32) || 68, // Convert to Fahrenheit
        condition: {
          text: response.data.weather?.[0]?.description || 'Sunny',
          icon: response.data.weather?.[0]?.icon || '01d',
          code: response.data.weather?.[0]?.id || 800,
        },
        wind_kph: (response.data.wind?.speed * 3.6) || 5, // Convert from m/s to km/h
        wind_dir: response.data.wind?.deg?.toString() || 'N',
        humidity: response.data.main?.humidity || 50,
        feelslike_c: (response.data.main?.feels_like - 273.15) || 20,
        feelslike_f: ((response.data.main?.feels_like - 273.15) * 9/5 + 32) || 68,
        uv: response.data.uvi || 5,
        vis_km: (response.data.visibility / 1000) || 10,
        pressure_mb: response.data.main?.pressure || 1015,
        is_day: new Date().getHours() > 6 && new Date().getHours() < 20 ? 1 : 0,
      },
      forecast: {
        forecastday: [{
          date: new Date().toISOString().split('T')[0],
          day: {
            maxtemp_c: (response.data.main?.temp_max - 273.15) || 25,
            mintemp_c: (response.data.main?.temp_min - 273.15) || 15,
            maxtemp_f: ((response.data.main?.temp_max - 273.15) * 9/5 + 32) || 77,
            mintemp_f: ((response.data.main?.temp_min - 273.15) * 9/5 + 32) || 59,
          },
          astro: {
            sunrise: '06:00 AM',
            sunset: '08:00 PM',
          }
        }]
      }
    };
    
    return weatherData;
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

// Search for city suggestions based on our predefined list
export async function searchCities(query: string): Promise<WeatherSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }
  
  log(`Searching for cities matching: ${query}`, 'weather-api');
  
  // Use a predefined list of major cities instead of API call
  const cities = [
    { id: 1, name: 'New York', region: 'New York', country: 'United States', lat: 40.71, lon: -74.01 },
    { id: 2, name: 'London', region: 'City of London', country: 'United Kingdom', lat: 51.51, lon: -0.13 },
    { id: 3, name: 'Paris', region: 'Ile-de-France', country: 'France', lat: 48.85, lon: 2.35 },
    { id: 4, name: 'Tokyo', region: 'Tokyo', country: 'Japan', lat: 35.69, lon: 139.69 },
    { id: 5, name: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.87, lon: 151.21 },
    { id: 6, name: 'Los Angeles', region: 'California', country: 'United States', lat: 34.05, lon: -118.24 },
    { id: 7, name: 'Chicago', region: 'Illinois', country: 'United States', lat: 41.88, lon: -87.63 },
    { id: 8, name: 'Berlin', region: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.41 },
    { id: 9, name: 'Beijing', region: 'Beijing', country: 'China', lat: 39.90, lon: 116.41 },
    { id: 10, name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', lat: 25.20, lon: 55.27 },
  ];
  
  // Filter cities based on query
  const lowerQuery = query.toLowerCase();
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(lowerQuery) || 
    city.country.toLowerCase().includes(lowerQuery) ||
    city.region.toLowerCase().includes(lowerQuery)
  );
  
  log(`Found ${filteredCities.length} cities matching: ${query}`, 'weather-api');
  
  return filteredCities;
}

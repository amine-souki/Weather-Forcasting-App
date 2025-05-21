import React from 'react';
import { WeatherData } from '@shared/schema';
import WeatherMetric from './WeatherMetric';
import { getWeatherIcon, getLocalTime, getTimeFromStr, formatLastUpdated } from '@/lib/utils/weather';
import { Button } from '@/components/ui/button';

interface WeatherDisplayProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onQuickSearch: (city: string) => void;
}

export default function WeatherDisplay({
  weatherData,
  isLoading,
  error,
  onRetry,
  onQuickSearch
}: WeatherDisplayProps) {
  // Format the local time
  const localTime = weatherData ? getLocalTime(weatherData.location.localtime) : null;
  
  // Quick search cities
  const quickSearchCities = ['New York', 'London', 'Tokyo', 'Sydney'];
  
  return (
    <div id="weatherContent">
      {/* Loading skeleton */}
      {isLoading && (
        <div id="weatherLoading">
          <div className="rounded-xl overflow-hidden bg-white/20 backdrop-blur-md p-0 shadow-lg animate-pulse-slow">
            <div className="h-40 bg-white/30"></div>
            <div className="p-6 space-y-4">
              <div className="h-8 bg-white/30 rounded w-1/2"></div>
              <div className="h-20 bg-white/30 rounded"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-16 bg-white/30 rounded"></div>
                <div className="h-16 bg-white/30 rounded"></div>
                <div className="h-16 bg-white/30 rounded"></div>
                <div className="h-16 bg-white/30 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Weather data display */}
      {!isLoading && weatherData && (
        <div id="weatherData">
          <div className="rounded-xl overflow-hidden bg-white/20 backdrop-blur-md shadow-lg">
            {/* City header with time and date */}
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {weatherData.location.name}, {weatherData.location.country}
                  </h2>
                  <p className="text-white/80">
                    {localTime?.day}, {localTime?.time} • Local time
                  </p>
                </div>
                <div className="weather-data text-right">
                  <p className="text-2xl font-medium text-white">
                    <i className="fas fa-arrows-rotate mr-1 text-sm"></i> 
                    {formatLastUpdated(weatherData.cachedAt || new Date().toISOString())}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Current weather snapshot */}
            <div className="p-6 flex flex-col md:flex-row items-center">
              <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                <div className="text-center md:text-left">
                  <i className={`${getWeatherIcon(weatherData.current.condition.code, weatherData.current.is_day)} text-6xl mb-3 drop-shadow-md`}></i>
                  <h3 className="text-xl font-medium text-white mb-1">
                    {weatherData.current.condition.text}
                  </h3>
                </div>
              </div>
              
              <div className="flex-1 text-center">
                <div className="weather-data">
                  <span className="text-7xl font-bold text-white drop-shadow-md">
                    {Math.round(weatherData.current.temp_c)}°C
                  </span>
                  <div className="text-white/80 mt-2">
                    <span>Feels like {Math.round(weatherData.current.feelslike_c)}°C</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-right">
                <div className="weather-data space-y-2 text-white/90">
                  {weatherData.forecast?.forecastday && (
                    <>
                      <p className="flex items-center justify-center md:justify-end">
                        <i className="fas fa-temperature-arrow-up text-red-400 w-8 text-center"></i>
                        <span>High: {Math.round(weatherData.forecast.forecastday[0].day.maxtemp_c)}°C</span>
                      </p>
                      <p className="flex items-center justify-center md:justify-end">
                        <i className="fas fa-temperature-arrow-down text-blue-400 w-8 text-center"></i>
                        <span>Low: {Math.round(weatherData.forecast.forecastday[0].day.mintemp_c)}°C</span>
                      </p>
                    </>
                  )}
                  <p className="flex items-center justify-center md:justify-end">
                    <i className="fas fa-compress text-purple-300 w-8 text-center"></i>
                    <span>Pressure: {weatherData.current.pressure_mb} hPa</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Weather metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 pt-0">
              <WeatherMetric 
                icon="fas fa-droplet" 
                iconColor="text-blue-400" 
                label="Humidity" 
                value={`${weatherData.current.humidity}%`} 
              />
              
              <WeatherMetric 
                icon="fas fa-wind" 
                iconColor="text-teal-400" 
                label="Wind" 
                value={`${Math.round(weatherData.current.wind_kph)} km/h`} 
              />
              
              <WeatherMetric 
                icon="fas fa-eye" 
                iconColor="text-indigo-400" 
                label="Visibility" 
                value={`${weatherData.current.vis_km} km`} 
              />
              
              <WeatherMetric 
                icon="fas fa-sun" 
                iconColor="text-yellow-400" 
                label="UV Index" 
                value={`${weatherData.current.uv} ${weatherData.current.uv < 3 ? 'Low' : weatherData.current.uv < 6 ? 'Moderate' : weatherData.current.uv < 8 ? 'High' : 'Very High'}`} 
              />
            </div>
            
            {/* Sun times */}
            {weatherData.forecast?.forecastday && (
              <div className="p-6 pt-0">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <h3 className="text-md font-medium text-white/80 mb-3">Sunrise & Sunset</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="mr-3 text-yellow-400">
                        <i className="fas fa-sunrise text-2xl"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-white/60">Sunrise</p>
                        <p className="weather-data text-lg font-medium text-white">
                          {getTimeFromStr(weatherData.forecast.forecastday[0].astro.sunrise)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3 text-orange-400">
                        <i className="fas fa-sunset text-2xl"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-white/60">Sunset</p>
                        <p className="weather-data text-lg font-medium text-white">
                          {getTimeFromStr(weatherData.forecast.forecastday[0].astro.sunset)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Cached data notice */}
            <div className="p-4 bg-white/5 text-center text-white/60 text-sm border-t border-white/10">
              <i className="fas fa-server mr-1"></i>
              <span>{weatherData.cached ? 'Data loaded from cache' : 'Data cached for 5 minutes to reduce API calls'}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* No weather data view */}
      {!isLoading && !weatherData && !error && (
        <div id="noWeatherData" className="rounded-xl overflow-hidden bg-white/20 backdrop-blur-md p-8 shadow-lg text-center">
          <div className="max-w-md mx-auto">
            <i className="fas fa-cloud-sun text-7xl text-white/50 mb-6"></i>
            <h2 className="text-2xl font-bold text-white mb-3">No Weather Data</h2>
            <p className="text-white/80 mb-6">Search for a city above to see current weather conditions and forecasts.</p>
            <div className="grid grid-cols-2 gap-4 text-left">
              {quickSearchCities.map((city) => (
                <button 
                  key={city}
                  className="p-3 bg-white/10 rounded-lg flex items-center hover:bg-white/20 transition"
                  onClick={() => onQuickSearch(city)}
                >
                  <i className="fas fa-location-dot text-primary mr-2"></i>
                  <span className="text-white">{city}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Error view */}
      {!isLoading && error && (
        <div id="weatherError" className="rounded-xl overflow-hidden bg-white/20 backdrop-blur-md p-8 shadow-lg text-center">
          <i className="fas fa-triangle-exclamation text-7xl text-error/70 mb-6"></i>
          <h2 className="text-2xl font-bold text-white mb-3">Weather Data Unavailable</h2>
          <p className="text-white/80 mb-6">
            {error.message || "We couldn't retrieve weather data. Our service might be experiencing issues or you may have reached your API limit."}
          </p>
          <Button
            className="px-6 py-3 bg-white/20 rounded-lg text-white hover:bg-white/30 transition flex items-center mx-auto"
            onClick={onRetry}
          >
            <i className="fas fa-refresh mr-2"></i>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

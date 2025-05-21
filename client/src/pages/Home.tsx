import React from 'react';
import { useToast } from "@/hooks/use-toast";
import SearchBar from "@/components/SearchBar";
import WeatherDisplay from "@/components/WeatherDisplay";
import { useWeather } from "@/hooks/useWeather";

export default function Home() {
  const { 
    weather, 
    isLoading, 
    error, 
    search,
    searchSuggestions,
    isLoadingSuggestions,
    handleSearch,
    handleSelectSuggestion,
    handleQuickSearch,
    retry
  } = useWeather();

  return (
    <div 
      id="app" 
      className="min-h-screen transition-all duration-500"
      data-weather-state={weather?.current ? 
        (weather.current.is_day ? 
          (weather.current.condition.code >= 1000 && weather.current.condition.code <= 1003 ? "sunny" : 
           weather.current.condition.code >= 1006 && weather.current.condition.code <= 1030 ? "cloudy" : 
           weather.current.condition.code >= 1063 && weather.current.condition.code <= 1201 ? "rainy" : 
           weather.current.condition.code >= 1204 && weather.current.condition.code <= 1252 ? "snowy" : "cloudy") : 
          "night") : 
        "sunny"
      }
    >
      {/* Background that changes based on weather conditions */}
      <div className={`fixed inset-0 -z-10 ${
        weather?.current ? 
          (weather.current.is_day ? 
            (weather.current.condition.code >= 1000 && weather.current.condition.code <= 1003 ? "bg-sunny" : 
             weather.current.condition.code >= 1006 && weather.current.condition.code <= 1030 ? "bg-cloudy" : 
             weather.current.condition.code >= 1063 && weather.current.condition.code <= 1201 ? "bg-rainy" : 
             weather.current.condition.code >= 1204 && weather.current.condition.code <= 1252 ? "bg-snowy" : "bg-cloudy") : 
            "bg-night") : 
          "bg-sunny"
      } opacity-80`}></div>
      
      {/* App Container */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md mb-2">
            <i className="fas fa-cloud-sun mr-2"></i>Weather Forecast
          </h1>
          <p className="text-white opacity-90 max-w-xl mx-auto">
            Get real-time weather updates for any city around the world
          </p>
        </header>
        
        {/* Search Bar */}
        <SearchBar 
          search={search}
          onSearch={handleSearch}
          suggestions={searchSuggestions}
          isLoading={isLoadingSuggestions}
          onSelectSuggestion={handleSelectSuggestion}
          error={error}
        />
        
        {/* Weather Display */}
        <WeatherDisplay 
          weatherData={weather}
          isLoading={isLoading}
          error={error}
          onRetry={retry}
          onQuickSearch={handleQuickSearch}
        />
        
        {/* Footer with technical info */}
        <footer className="mt-8 text-center text-white/60 text-sm">
          <p className="mb-2">
            <i className="fas fa-server mr-1"></i>
            Powered by microservices architecture with Redis caching
          </p>
          <p>
            <i className="fas fa-code mr-1"></i>
            Made with React, Express.js, and ❤️
          </p>
        </footer>
      </div>
    </div>
  );
}

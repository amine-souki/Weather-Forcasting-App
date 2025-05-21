import React, { useState, useEffect, useRef } from 'react';
import { WeatherSuggestion } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  search: string;
  onSearch: (query: string) => void;
  onSelectSuggestion: (suggestion: WeatherSuggestion) => void;
  suggestions: WeatherSuggestion[];
  isLoading: boolean;
  error: Error | null;
}

export default function SearchBar({ 
  search, 
  onSearch, 
  onSelectSuggestion,
  suggestions, 
  isLoading,
  error
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(search);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  // Debounced search function
  const debouncedSearch = debounce((value: string) => {
    onSearch(value);
  }, 500);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };
  
  // Handle key press (enter)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSearch(inputValue);
    }
  };
  
  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Show suggestions when input is focused and there's text
  const handleFocus = () => {
    if (inputValue && inputValue.length >= 2) {
      setShowSuggestions(true);
    }
  };
  
  return (
    <div className="relative mb-8 max-w-xl mx-auto">
      <div className="relative search-gradient backdrop-blur-sm rounded-xl p-1 shadow-lg">
        <Input 
          type="text" 
          id="citySearch" 
          placeholder="Search for a city (e.g., London, Paris, Tokyo)"
          className="w-full p-4 pr-12 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
          <i className="fas fa-search"></i>
        </span>
        
        {/* Search suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionRef}
            id="searchSuggestions" 
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-10"
          >
            <ul className="py-2">
              {suggestions.map((suggestion) => (
                <li 
                  key={`${suggestion.id}-${suggestion.name}`}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => {
                    onSelectSuggestion(suggestion);
                    setShowSuggestions(false);
                    setInputValue(`${suggestion.name}, ${suggestion.country}`);
                  }}
                >
                  <i className="fas fa-location-dot text-primary mr-2"></i>
                  <span>{suggestion.name}, {suggestion.region ? `${suggestion.region}, ` : ''}{suggestion.country}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Error message for invalid searches */}
      {error && (
        <div id="searchError" className="mt-2 text-error text-sm px-2">
          <i className="fas fa-circle-exclamation mr-1"></i>
          City not found. Please check the spelling and try again.
        </div>
      )}
    </div>
  );
}

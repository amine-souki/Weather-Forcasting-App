import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { WeatherData, WeatherSuggestion } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';

export function useWeather() {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const { toast } = useToast();

  // Get weather data for the selected location
  const {
    data: weather,
    isLoading,
    error,
    refetch
  } = useQuery<WeatherData>({
    queryKey: [selectedLocation ? `/api/weather?q=${encodeURIComponent(selectedLocation)}` : ''],
    enabled: !!selectedLocation,
    retry: 1
  });

  // Get search suggestions
  const {
    data: searchSuggestions = [],
    isLoading: isLoadingSuggestions
  } = useQuery<WeatherSuggestion[]>({
    queryKey: [search ? `/api/search?q=${encodeURIComponent(search)}` : ''],
    enabled: search.length >= 2,
    refetchOnWindowFocus: false
  });

  // Handle search input
  const handleSearch = (query: string) => {
    setSearch(query);
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: WeatherSuggestion) => {
    const locationQuery = `${suggestion.name},${suggestion.country}`;
    setSelectedLocation(locationQuery);
    setSearch(locationQuery);
  };

  // Handle direct search (Enter key or button click)
  useEffect(() => {
    if (search && search.length >= 2 && !selectedLocation) {
      // This code runs when the component mounts or when dependencies change
      const delayTimer = setTimeout(() => {
        setSelectedLocation(search);
      }, 1000);
      
      return () => clearTimeout(delayTimer);
    }
  }, [search, selectedLocation]);

  // Handle quick search (predefined cities)
  const handleQuickSearch = (city: string) => {
    setSearch(city);
    setSelectedLocation(city);
  };

  // Retry on error
  const retry = () => {
    refetch();
  };

  // Show error toast when API call fails
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching weather data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }, [error, toast]);

  return {
    weather,
    isLoading,
    error,
    search,
    searchSuggestions,
    isLoadingSuggestions,
    handleSearch,
    handleSelectSuggestion,
    handleQuickSearch,
    retry,
  };
}

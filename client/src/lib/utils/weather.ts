/**
 * Utility functions for weather data display
 */

// Map weather condition codes to appropriate icons
export function getWeatherIcon(code: number, isDay: number): string {
  // Day or night status
  const timePrefix = isDay ? 'fas fa-' : 'fas fa-';
  
  // Sunny/Clear
  if (code === 1000) {
    return isDay ? 'fas fa-sun text-yellow-300' : 'fas fa-moon text-slate-200';
  }
  
  // Partly cloudy
  if (code === 1003) {
    return isDay ? 'fas fa-cloud-sun text-yellow-300' : 'fas fa-cloud-moon text-slate-200';
  }
  
  // Cloudy, overcast
  if (code >= 1006 && code <= 1030) {
    return 'fas fa-cloud text-gray-300';
  }
  
  // Fog, mist
  if (code >= 1135 && code <= 1147) {
    return 'fas fa-smog text-gray-400';
  }
  
  // Rain, drizzle, etc.
  if ((code >= 1063 && code <= 1072) || (code >= 1150 && code <= 1201) || (code >= 1240 && code <= 1252)) {
    return 'fas fa-cloud-rain text-blue-400';
  }
  
  // Snow, sleet, etc.
  if ((code >= 1204 && code <= 1237) || (code >= 1255 && code <= 1264)) {
    return 'fas fa-snowflake text-blue-200';
  }
  
  // Thunderstorm
  if (code >= 1273 && code <= 1282) {
    return 'fas fa-bolt-lightning text-yellow-500';
  }
  
  // Default fallback
  return 'fas fa-cloud text-gray-300';
}

// Format date from API to display local time
export function getLocalTime(dateTimeStr: string) {
  const date = new Date(dateTimeStr);
  
  if (isNaN(date.getTime())) {
    // If date is invalid, try parsing the dateTimeStr manually
    const parts = dateTimeStr.split(' ');
    if (parts.length !== 2) return null;
    
    const datePart = parts[0];
    const timePart = parts[1];
    
    // Format day
    const dateObj = new Date(datePart);
    const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    return { day, time: timePart };
  }
  
  // Format the time parts
  const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  const time = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return { day, time };
}

// Convert 12-hour time strings like "08:05 AM" to display format
export function getTimeFromStr(timeStr: string): string {
  if (!timeStr) return '';
  
  // Return as is if already in desired format
  return timeStr;
}

// Format the "last updated" time
export function formatLastUpdated(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    return 'Updated recently';
  }
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'Updated just now';
  } else if (diffMins === 1) {
    return 'Updated 1m ago';
  } else if (diffMins < 60) {
    return `Updated ${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) {
      return 'Updated 1h ago';
    } else {
      return `Updated ${diffHours}h ago`;
    }
  }
}

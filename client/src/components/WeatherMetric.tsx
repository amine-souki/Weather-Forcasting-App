import React from 'react';

interface WeatherMetricProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
}

export default function WeatherMetric({ icon, iconColor, label, value }: WeatherMetricProps) {
  return (
    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="text-white opacity-80">
          <i className={`${icon} text-2xl ${iconColor}`}></i>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-white/60">{label}</p>
          <p className="weather-data text-xl font-medium text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

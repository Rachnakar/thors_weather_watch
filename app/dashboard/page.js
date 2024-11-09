"use client"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun, Wind } from "lucide-react"
import { useState } from "react";

export default function Component() {
  const [query, setQuery] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/weather?query=${query}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
    }
  };

  const getAirQualityText = (index) => {
    switch (index) {
      case 1:
        return "Good";
      case 2:
        return "Moderate";
      case 3:
        return "Unhealthy for Sensitive Groups";
      case 4:
        return "Unhealthy";
      case 5:
        return "Very Unhealthy";
      case 6:
        return "Hazardous";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="relative">
        <Input
          className="w-full h-12 pl-4 pr-10 text-lg rounded-lg"
          placeholder="Search for a city..."
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {weatherData && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>TODAY'S WEATHER</CardTitle>
              <span className="text-sm text-muted-foreground">
                {new Date(weatherData.location.localtime).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                }).toUpperCase()}
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Sun className="h-6 w-6" />
                <span className="text-xl">
                  Clear and beautiful Hi: {Math.round(weatherData.current.temp_c)}°
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-6 w-6" />
                <span className="text-xl">
                  Tonight: Clear Lo: {Math.round(weatherData.current.temp_c - 3)}°
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>CURRENT WEATHER</CardTitle>
              <span className="text-sm text-muted-foreground">
                {new Date(weatherData.current.last_updated).toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }).toUpperCase()}
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <Moon className="h-16 w-16" />
                  <div>
                    <div className="text-6xl font-bold">{Math.round(weatherData.current.temp_c)}°</div>
                    <div className="text-xl">RealFeel® {Math.round(weatherData.current.temp_c)}°</div>
                    <div className="text-xl">{weatherData.current.condition.text}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5" />
                      <span>Wind</span>
                    </div>
                    <span>E {weatherData.current.wind_kph} km/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5" />
                      <span>Wind Gusts</span>
                    </div>
                    <span>{weatherData.current.gust_kph} km/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Air Quality</span>
                    <span className="text-purple-500 font-medium">
                      {getAirQualityText(weatherData.current.air_quality["us-epa-index"])}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

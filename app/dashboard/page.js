"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun, Wind, MapPin, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Component() {
  const [query, setQuery] = useState("")
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchWeatherData = async (lat, lon) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/weather?${lat && lon ? `query=${lat},${lon}` : `query=${encodeURIComponent(query)}`}`)
      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }
      const data = await response.json()
      setWeatherData(data)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getLocationAndFetchWeather = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            fetchWeatherData(latitude, longitude)
          },
          (error) => {
            console.error("Error getting location:", error)
            toast({
              title: "Location Error",
              description: "Unable to get your location. Please search for a city manually.",
              variant: "destructive",
            })
          }
        )
      } else {
        toast({
          title: "Geolocation Unavailable",
          description: "Your browser doesn't support geolocation. Please search for a city manually.",
          variant: "destructive",
        })
      }
    }

    getLocationAndFetchWeather()
  }, [])

  const getAirQualityText = (index) => {
    switch (index) {
      case 1:
        return "Good"
      case 2:
        return "Moderate"
      case 3:
        return "Unhealthy for Sensitive Groups"
      case 4:
        return "Unhealthy"
      case 5:
        return "Very Unhealthy"
      case 6:
        return "Hazardous"
      default:
        return "Unknown"
    }
  }

  const getAirQualityColor = (index) => {
    switch (index) {
      case 1:
        return "text-green-500"
      case 2:
        return "text-yellow-500"
      case 3:
        return "text-orange-500"
      case 4:
        return "text-red-500"
      case 5:
        return "text-purple-500"
      case 6:
        return "text-rose-700"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex gap-2">
        <Input
          className="flex-grow h-12 text-lg bg-sky-50 border-sky-200 focus:border-sky-400 focus:ring-sky-400"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchWeatherData()}
        />
        <Button className="h-12 bg-sky-500 hover:bg-sky-600" onClick={() => fetchWeatherData()} disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          <span className="sr-only">{loading ? "Loading" : "Search"}</span>
        </Button>
      </div>

      {weatherData && (
        <>
          <Card className="bg-gradient-to-br from-sky-100 to-indigo-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sky-800">LOCATION</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-sky-600" />
                <span className="text-xl font-semibold text-sky-900">{weatherData.location.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-sky-700">Region</p>
                  <p className="text-sky-900">{weatherData.location.region}</p>
                </div>
                <div>
                  <p className="text-sm text-sky-700">Country</p>
                  <p className="text-sky-900">{weatherData.location.country}</p>
                </div>
                <div>
                  <p className="text-sm text-sky-700">Coordinates</p>
                  <p className="text-sky-900">{weatherData.location.lat}, {weatherData.location.lon}</p>
                </div>
                <div>
                  <p className="text-sm text-sky-700">Time Zone</p>
                  <p className="text-sky-900">{weatherData.location.tz_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-orange-800">TODAY'S WEATHER</CardTitle>
              <span className="text-sm text-orange-700">
                {new Date(weatherData.location.localtime).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                }).toUpperCase()}
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Sun className="h-6 w-6 text-yellow-500" />
                <span className="text-xl text-orange-900">
                  {weatherData.current.condition.text} Hi: {Math.round(weatherData.current.temp_c)}°
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-6 w-6 text-indigo-400" />
                <span className="text-xl text-orange-900">
                  Tonight: {weatherData.current.condition.text} Lo: {Math.round(weatherData.current.temp_c - 3)}°
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-blue-800">CURRENT WEATHER</CardTitle>
              <span className="text-sm text-blue-700">
                {new Date(weatherData.location.localtime).toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }).toUpperCase()}
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={weatherData.current.condition.icon}
                    alt={weatherData.current.condition.text}
                    className="h-16 w-16"
                  />
                  <div>
                    <div className="text-6xl font-bold text-blue-900">{Math.round(weatherData.current.temp_c)}°</div>
                    <div className="text-xl text-blue-800">RealFeel® {Math.round(weatherData.current.temp_c)}°</div>
                    <div className="text-xl text-blue-700">{weatherData.current.condition.text}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-blue-500" />
                      <span className="text-blue-800">Wind</span>
                    </div>
                    <span className="text-blue-900">E {weatherData.current.wind_kph} km/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-blue-500" />
                      <span className="text-blue-800">Wind Gusts</span>
                    </div>
                    <span className="text-blue-900">{weatherData.current.gust_kph} km/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800">Air Quality</span>
                    <span className={`font-medium ${getAirQualityColor(weatherData.current.air_quality["us-epa-index"])}`}>
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
  )
}
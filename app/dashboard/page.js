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

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex gap-2">
        <Input
          className="flex-grow h-12 text-lg"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchWeatherData()}
        />
        <Button className="h-12" onClick={() => fetchWeatherData()} disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          <span className="sr-only">{loading ? "Loading" : "Search"}</span>
        </Button>
      </div>

      {weatherData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>LOCATION</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5" />
                <span className="text-xl font-semibold">{weatherData.location.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p>{weatherData.location.region}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p>{weatherData.location.country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p>{weatherData.location.lat}, {weatherData.location.lon}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Zone</p>
                  <p>{weatherData.location.tz_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  {weatherData.current.condition.text} Hi: {Math.round(weatherData.current.temp_c)}°
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-6 w-6" />
                <span className="text-xl">
                  Tonight: {weatherData.current.condition.text} Lo: {Math.round(weatherData.current.temp_c - 3)}°
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>CURRENT WEATHER</CardTitle>
              <span className="text-sm text-muted-foreground">
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
  )
}
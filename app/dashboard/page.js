"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun, Wind, MapPin, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCombobox } from "downshift"
import debounce from "lodash.debounce"

export default function Component() {
  const [query, setQuery] = useState("")
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const { toast } = useToast()

  const fetchWeatherData = async (lat, lon, locationName) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/weather?q=${lat && lon ? `${lat},${lon}` : `${encodeURIComponent(locationName || query)}`}`)
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

  const fetchSuggestions = debounce(async (inputValue) => {
    if (inputValue.length < 3) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/v1/search?q=${encodeURIComponent(inputValue)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions")
      }
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }, 300)

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

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    selectedItem,
  } = useCombobox({
    items: suggestions,
    onInputValueChange: ({ inputValue }) => {
      setQuery(inputValue)
      fetchSuggestions(inputValue)
    },
    itemToString: (item) => (item ? `${item.name}, ${item.region}, ${item.country}` : ""),
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        fetchWeatherData(selectedItem.lat, selectedItem.lon, selectedItem.name)
      }
    },
  })


  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="relative">
        <div className="flex gap-2">
          <Input
            {...getInputProps()}
            className="flex-grow h-12 text-lg bg-sky-50 border-sky-200 focus:border-sky-400 focus:ring-sky-400"
            placeholder="Search for a city..."
          />
          <Button
            className="h-12 bg-sky-500 hover:bg-sky-600"
            onClick={() => fetchWeatherData()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            <span className="sr-only">{loading ? "Loading" : "Search"}</span>
          </Button>
        </div>
        <ul
          {...getMenuProps()}
          className={`absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg ${
            isOpen && suggestions.length > 0 ? "" : "hidden"
          }`}
        >
          {isOpen &&
            suggestions.map((item, index) => (
              <li
                key={item.id}
                {...getItemProps({ item, index })}
                className={`px-4 py-2 cursor-pointer ${
                  highlightedIndex === index ? "bg-sky-100" : ""
                } ${selectedItem === item ? "font-bold" : ""}`}
              >
                {`${item.name}, ${item.region}, ${item.country}`}
              </li>
            ))}
        </ul>
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
                  <div className="space-y-2">
                    <h4 className="text-blue-800 font-semibold">Pollutants</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">CO:</span>
                        <span className="text-blue-900">{weatherData.current.air_quality.co.toFixed(2)} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">NO₂:</span>
                        <span className="text-blue-900">{weatherData.current.air_quality.no2.toFixed(2)} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">O₃:</span>
                        <span className="text-blue-900">{weatherData.current.air_quality.o3.toFixed(2)} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">SO₂:</span>
                        <span className="text-blue-900">{weatherData.current.air_quality.so2.toFixed(2)} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">PM2.5:</span>
                        <span className="text-blue-900">{weatherData.current.air_quality.pm2_5.toFixed(2)} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">PM10:</span>
                        <span className="text-blue-900">{weatherData.current.air_quality.pm10.toFixed(2)} μg/m³</span>
                      </div>
                    </div>
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
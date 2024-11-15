"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Search, Loader2, Sun, Cloud, Droplets, Wind, Thermometer } from "lucide-react"
import debounce from "lodash.debounce"
import { useCombobox } from "downshift"

export default function ForecastPage() {
  const [query, setQuery] = useState("")
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const { toast } = useToast()

  const fetchForecastData = async (lat, lon) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/getForecast?q=${lat && lon ? `${lat},${lon}` : `${encodeURIComponent(query)}`}`)
      if (!response.ok) {
        throw new Error("Failed to fetch forecast data")
      }
      const data = await response.json()
      setForecastData(data)
    } catch (error) {
      console.error("Error fetching forecast data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch forecast data. Please try again.",
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
    const getLocationAndFetchForecast = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            fetchForecastData(latitude, longitude)
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

    getLocationAndFetchForecast()
  }, [])

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />
      case 'partly cloudy':
      case 'cloudy':
        return <Cloud className="h-8 w-8 text-gray-500" />
      case 'rain':
      case 'light rain':
      case 'moderate rain':
        return <Droplets className="h-8 w-8 text-blue-500" />
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />
    }
  }

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
        fetchForecastData(selectedItem.lat, selectedItem.lon, selectedItem.name)
      }
    },
  })



  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">Weather Forecast</h1>

      <div className="relative">
        <div className="flex gap-2">
          <Input
            {...getInputProps()}
            className="flex-grow h-12 text-lg bg-sky-50 border-sky-200 focus:border-sky-400 focus:ring-sky-400"
            placeholder="Search for a city..."
          />
          <Button
            className="h-12 bg-sky-500 hover:bg-sky-600"
            onClick={() => fetchForecastData()}
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

      {forecastData && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-100 to-indigo-100">
            <CardHeader>
              <CardTitle className="text-2xl">
                {forecastData.location.name}, {forecastData.location.region}, {forecastData.location.country}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">Local Time: {forecastData.location.localtime}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            {forecastData.forecast.forecastday.map((day) => (
              <Card key={day.date} className="bg-white">
                <CardHeader>
                  <CardTitle className="text-xl">{formatDate(day.date)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getWeatherIcon(day.day.condition.text)}
                    <span className="text-lg font-semibold">{day.day.condition.text}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Thermometer className="h-5 w-5 mr-2 text-red-500" />
                      <span>Max: {day.day.maxtemp_c}°C</span>
                    </div>
                    <div className="flex items-center">
                      <Thermometer className="h-5 w-5 mr-2 text-blue-500" />
                      <span>Min: {day.day.mintemp_c}°C</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-5 w-5 mr-2" />
                      <span>{day.day.maxwind_kph} km/h</span>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="h-5 w-5 mr-2" />
                      <span>{day.day.totalprecip_mm} mm</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>Sunrise: {day.astro.sunrise}</p>
                    <p>Sunset: {day.astro.sunset}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
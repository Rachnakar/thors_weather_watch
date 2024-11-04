"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useState } from "react";

export default function Dashboard() {
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

return (
    <>
    <div className="flex justify-center items-center h-screen">
        <div className="flex w-full max-w-md items-center space-x-2">
            <Input 
                type="text" 
                placeholder="Search..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="button" onClick={handleSearch}>Search</Button>
        </div>
    </div>
        {weatherData && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(weatherData, null, 2)}
        </pre>
        )}
        </>
);
}
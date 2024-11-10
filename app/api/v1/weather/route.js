import WeatherAPI from '../../../../lib/weatherapi';
import { NextResponse } from 'next/server';

// all the endpoints are available in the WeatherAPI class
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const apiKey = process.env.WEATHER_API_KEY;
    const weatherAPI = new WeatherAPI(apiKey);

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        console.log('Fetching weather data for', query);
        const weatherData = await weatherAPI.getCurrentWeather(query);
        console.log('Weather data:', weatherData);
        return NextResponse.json(weatherData, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }
}
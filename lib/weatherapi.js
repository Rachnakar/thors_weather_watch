const axios = require('axios');

const NO_OF_DAYS_FORECAST = 9;

class WeatherAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'http://api.weatherapi.com/v1';
    }

    async getCurrentWeather(query) {
        return this.makeRequest('/current.json', query);
    }

    async getForecast(query) {
        return this.makeRequest('/forecast.json', query);
    }

    async search(query) {
        return this.makeRequest('/search.json', query);
    }

    async getHistory(query) {
        return this.makeRequest('/history.json', query);
    }

    async getAlerts(query) {
        return this.makeRequest('/alerts.json', query);
    }

    async getMarineWeather(query) {
        return this.makeRequest('/marine.json', query);
    }

    async getFutureWeather(query) {
        return this.makeRequest('/future.json', query);
    }

    async getTimeZone(query) {
        return this.makeRequest('/timezone.json', query);
    }

    async getSportsWeather(query) {
        return this.makeRequest('/sports.json', query);
    }

    async getAstronomy(query) {
        return this.makeRequest('/astronomy.json', query);
    }

    async getIPLookup(query) {
        return this.makeRequest('/ip.json', query);
    }

    async makeRequest(endpoint, query) {
        const url = `${this.baseUrl}${endpoint}`;
        const params = {
            key: this.apiKey,
            query: query,
            aqi: 'yes',
            days: NO_OF_DAYS_FORECAST,
        };

        try {
            const response = await axios.get(url, { params });
            return response.data;
        } catch (error) {
            console.error(`Error making request to ${url}:`, error);
            throw error;
        }
    }
}

export default WeatherAPI;
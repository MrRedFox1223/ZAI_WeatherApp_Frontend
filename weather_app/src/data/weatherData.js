// Placeholder weather data for 10 cities with time series
// Each city has multiple data points over time
const cities = [
  "New York", "London", "Tokyo", "Paris", "Sydney",
  "Berlin", "Moscow", "Dubai", "Toronto", "Barcelona"
];

const baseTemperatures = [5, 8, 12, 6, 25, 3, -5, 22, -2, 15];

// Generate time series data for each city (7 days)
export const weatherData = [];
let id = 1;

cities.forEach((city, index) => {
  const baseTemp = baseTemperatures[index];
  // Generate data for 7 consecutive days
  for (let day = 0; day < 7; day++) {
    const date = new Date(2024, 0, 15 + day); // Starting from January 15, 2024
    const dateStr = date.toISOString().split('T')[0];
    // Add some variation to temperature over time (±3°C)
    const variation = Math.sin(day * 0.8) * 3;
    const temperature = Math.round(baseTemp + variation);
    
    weatherData.push({
      id: id++,
      city_name: city,
      date: dateStr,
      temperature: temperature
    });
  }
});

// Flat array export for table
export const flatWeatherData = weatherData;


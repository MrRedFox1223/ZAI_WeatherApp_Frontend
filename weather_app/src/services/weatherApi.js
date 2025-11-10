const API_BASE_URL = 'http://localhost:8000';

/**
 * Pobiera listę danych pogodowych z API
 */
export const fetchWeatherData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/weather`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Aktualizuje pojedynczy obiekt danych pogodowych przez API
 * @param {Object} weatherItem - Obiekt do aktualizacji (zawiera id, city_name, date, temperature)
 */
export const updateWeatherItem = async (weatherItem) => {
  try {
    const response = await fetch(`${API_BASE_URL}/weather`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(weatherItem),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error updating weather item:', error);
    return { success: false, error: error.message };
  }
};


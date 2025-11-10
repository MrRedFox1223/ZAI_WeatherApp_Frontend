const API_BASE_URL = 'http://localhost:8000';

/**
 * Pobiera token JWT z localStorage
 */
const getAuthToken = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.token || null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
};

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
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/weather`, {
      method: 'PUT',
      headers,
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

/**
 * Dodaje nowy obiekt danych pogodowych przez API
 * @param {Object} weatherItem - Obiekt do dodania (zawiera city_name, date, temperature)
 */
export const createWeatherItem = async (weatherItem) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/weather`, {
      method: 'POST',
      headers,
      body: JSON.stringify(weatherItem),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error creating weather item:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Usuwa obiekt danych pogodowych przez API
 * @param {number} id - ID obiektu do usunięcia
 */
export const deleteWeatherItem = async (id) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/weather/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting weather item:', error);
    return { success: false, error: error.message };
  }
};


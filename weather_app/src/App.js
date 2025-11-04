import React, { useState, useEffect } from 'react';
import './App.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import WeatherChart from './components/WeatherChart';
import WeatherTable from './components/WeatherTable';
import LoginDialog from './components/LoginDialog';
import { Button } from 'primereact/button';
import { flatWeatherData } from './data/weatherData';

const AppContent = () => {
  const { isAuthenticated, user, logout, isAdmin, isUser } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [weatherData, setWeatherData] = useState([...flatWeatherData]);

  // Załaduj dane przy starcie (dla wszystkich użytkowników)
  useEffect(() => {
    // TODO: Tutaj będzie fetch z API
    // fetch('/api/weather')
    //   .then(res => res.json())
    //   .then(data => setWeatherData(data));
    setWeatherData([...flatWeatherData]);
  }, []);

  // Obsługa zmiany danych z tabeli
  const handleDataChange = (newData) => {
    setWeatherData(newData);
    // TODO: Tutaj będzie zapis do API (tylko dla admina)
    // if (isAdmin) {
    //   fetch('/api/weather', {
    //     method: 'PUT',
    //     headers: { 
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${user.token}`
    //     },
    //     body: JSON.stringify(newData)
    //   });
    // }
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleLogout = () => {
    logout();
    setShowLogin(false);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Weather Dashboard</h1>
          <div className="user-info">
            {isAdmin ? (
              <>
                <span className="user-name">
                  <i className="pi pi-user mr-2"></i>
                  {user?.username} (Administrator)
                </span>
                <Button
                  label="Wyloguj"
                  icon="pi pi-sign-out"
                  onClick={handleLogout}
                  className="logout-button"
                  severity="secondary"
                />
              </>
            ) : (
              <Button
                label="Zaloguj jako Administrator"
                icon="pi pi-sign-in"
                onClick={handleLoginClick}
                className="login-button"
                severity="secondary"
              />
            )}
          </div>
        </div>
      </header>
      <main className="app-main">
        <section className="chart-section">
          <WeatherChart data={weatherData} />
        </section>
        <section className="table-section">
          <WeatherTable data={weatherData} onDataChange={handleDataChange} />
        </section>
      </main>
      <LoginDialog visible={showLogin} onHide={handleLoginSuccess} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

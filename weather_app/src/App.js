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
import { Toast } from 'primereact/toast';
import { fetchWeatherData, updateWeatherItem, createWeatherItem, deleteWeatherItem } from './services/weatherApi';

const AppContent = () => {
  const { isAuthenticated, user, logout, isAdmin, isUser } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = React.useRef(null);

  // Załaduj dane przy starcie (dla wszystkich użytkowników)
  useEffect(() => {
    loadWeatherData();
  }, []);

  // Funkcja do ładowania danych z API
  const loadWeatherData = async () => {
    setLoading(true);
    const result = await fetchWeatherData();
    
    if (result.success) {
      setWeatherData(result.data);
    } else {
      toast.current?.show({
        severity: 'error',
        summary: 'Błąd',
        detail: `Nie udało się załadować danych: ${result.error}`,
        life: 5000
      });
      // W przypadku błędu, ustaw pustą tablicę
      setWeatherData([]);
    }
    setLoading(false);
  };

  // Obsługa zmiany danych z tabeli
  const handleDataChange = async (updatedItem) => {
    if (!isAdmin) {
      return;
    }

    // Zapisz poprzednią wartość na wypadek błędu
    const previousItem = weatherData.find(item => item.id === updatedItem.id);
    
    // Aktualizuj lokalnie (optimistic update)
    setWeatherData(prevData => 
      prevData.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );

    // Wysyłamy tylko zaktualizowany obiekt do API
    const result = await updateWeatherItem(updatedItem);
    
    if (result.success) {
      toast.current?.show({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Dane zostały zaktualizowane',
        life: 2000
      });
    } else {
      // Cofnij zmiany w przypadku błędu
      if (previousItem) {
        setWeatherData(prevData => 
          prevData.map(item => 
            item.id === updatedItem.id ? previousItem : item
          )
        );
      }
      
      toast.current?.show({
        severity: 'error',
        summary: 'Błąd',
        detail: `Nie udało się zaktualizować danych: ${result.error}. Zmiany zostały cofnięte.`,
        life: 5000
      });
    }
  };

  // Obsługa dodawania nowych danych
  const handleAdd = async (newItem) => {
    if (!isAdmin) {
      return;
    }

    const result = await createWeatherItem(newItem);
    
    if (result.success) {
      // Dodaj nowy element do lokalnego stanu
      setWeatherData(prevData => [...prevData, result.data]);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Nowe dane zostały dodane',
        life: 2000
      });
    } else {
      toast.current?.show({
        severity: 'error',
        summary: 'Błąd',
        detail: `Nie udało się dodać danych: ${result.error}`,
        life: 5000
      });
    }
  };

  // Obsługa usuwania danych
  const handleDelete = async (id) => {
    if (!isAdmin) {
      return;
    }

    // Zapisz element do usunięcia na wypadek błędu
    const itemToDelete = weatherData.find(item => item.id === id);
    
    // Usuń lokalnie (optimistic update)
    setWeatherData(prevData => prevData.filter(item => item.id !== id));

    const result = await deleteWeatherItem(id);
    
    if (result.success) {
      toast.current?.show({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Dane zostały usunięte',
        life: 2000
      });
    } else {
      // Przywróć element w przypadku błędu
      if (itemToDelete) {
        setWeatherData(prevData => [...prevData, itemToDelete].sort((a, b) => a.id - b.id));
      }
      
      toast.current?.show({
        severity: 'error',
        summary: 'Błąd',
        detail: `Nie udało się usunąć danych: ${result.error}. Zmiany zostały cofnięte.`,
        life: 5000
      });
    }
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
      <Toast ref={toast} />
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            <p>Ładowanie danych...</p>
          </div>
        ) : (
          <>
            <section className="chart-section">
              <WeatherChart data={weatherData} />
            </section>
            <section className="table-section">
              <WeatherTable 
                data={weatherData} 
                onDataChange={handleDataChange}
                onAdd={handleAdd}
                onDelete={handleDelete}
              />
            </section>
          </>
        )}
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

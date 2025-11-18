import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import './print.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import WeatherChart from './components/WeatherChart';
import WeatherTable from './components/WeatherTable';
import LoginDialog from './components/LoginDialog';
import ChangePasswordDialog from './components/ChangePasswordDialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import { fetchWeatherData, updateWeatherItem, createWeatherItem, deleteWeatherItem } from './services/weatherApi';

const AppContent = () => {
  const { user, logout, isAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [tempDateRange, setTempDateRange] = useState(null);
  const [highlightedPoint, setHighlightedPoint] = useState(null);
  const toast = React.useRef(null);

  useEffect(() => {
    addLocale('pl', {
      firstDayOfWeek: 1,
      dayNames: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
      dayNamesShort: ['Nie', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'],
      dayNamesMin: ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'So'],
      monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
      monthNamesShort: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'],
      today: 'Dzisiaj',
      clear: 'Wyczyść',
      weekHeader: 'Tydz',
      dateFormat: 'dd.mm.yy'
    });
  }, []);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const formatDateToString = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredWeatherData = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return weatherData;
    }

    const startDate = formatDateToString(dateRange[0]);
    const endDate = formatDateToString(dateRange[1]);

    return weatherData.filter(item => {
      return item.date >= startDate && item.date <= endDate;
    });
  }, [weatherData, dateRange]);

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
      setWeatherData([]);
    }
    setLoading(false);
  };

  const handleDataChange = async (updatedItem) => {
    if (!isAdmin) {
      return;
    }

    const previousItem = weatherData.find(item => item.id === updatedItem.id);
    
    setWeatherData(prevData => 
      prevData.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );

    const result = await updateWeatherItem(updatedItem);
    
    if (result.success) {
      toast.current?.show({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Dane zostały zaktualizowane',
        life: 2000
      });
    } else {
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

  const handleAdd = async (newItem) => {
    if (!isAdmin) {
      return;
    }

    const result = await createWeatherItem(newItem);
    
    if (result.success) {
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

  const handleDelete = async (id) => {
    if (!isAdmin) {
      return;
    }

    const itemToDelete = weatherData.find(item => item.id === id);
    
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

  const handleOpenDateRangeDialog = () => {
    setTempDateRange(dateRange);
    setShowDateRangeDialog(true);
  };

  const handleCloseDateRangeDialog = () => {
    setTempDateRange(null);
    setShowDateRangeDialog(false);
  };

  const validateDateRange = (range) => {
    if (!range || !range[0] || !range[1]) {
      return { valid: false, message: 'Proszę wybrać obie daty' };
    }

    if (range[0] > range[1]) {
      return { valid: false, message: 'Data początkowa nie może być późniejsza niż data końcowa' };
    }

    return { valid: true };
  };

  const handleApplyDateRange = () => {
    const validation = validateDateRange(tempDateRange);
    
    if (!validation.valid) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Uwaga',
        detail: validation.message,
        life: 3000
      });
      return;
    }

    setDateRange(tempDateRange);
    setShowDateRangeDialog(false);
    
    toast.current?.show({
      severity: 'success',
      summary: 'Sukces',
      detail: 'Zakres dat został zastosowany',
      life: 2000
    });
  };

  const handleResetDateRange = () => {
    setDateRange(null);
    toast.current?.show({
      severity: 'info',
      summary: 'Informacja',
      detail: 'Filtr dat został wyczyszczony',
      life: 2000
    });
  };

  const handleHighlightPoint = (item) => {
    setHighlightedPoint(prevHighlighted => {
      if (prevHighlighted && 
          prevHighlighted.id === item.id &&
          prevHighlighted.city_name === item.city_name &&
          prevHighlighted.date === item.date) {
        return null;
      }
      
      return {
        id: item.id,
        city_name: item.city_name,
        date: item.date
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const dateRangeDialogFooter = (
    <div>
      <Button 
        label="Anuluj" 
        icon="pi pi-times" 
        onClick={handleCloseDateRangeDialog}
        className="p-button-text"
      />
      <Button 
        label="Zastosuj" 
        icon="pi pi-check" 
        onClick={handleApplyDateRange}
        autoFocus
      />
    </div>
  );

  return (
    <div className="App">
      <Toast ref={toast} />
      <header className="app-header">
        <div className="header-content">
          <h1>Dane pogodowe</h1>
          <div className="user-info">
            <Button
              label="Drukuj"
              icon="pi pi-print"
              onClick={handlePrint}
              className="print-button"
              severity="secondary"
              outlined
            />
            {isAdmin ? (
              <>
                <span className="user-name">
                  <i className="pi pi-user mr-2"></i>
                  {user?.username} (Administrator)
                </span>
                <Button
                  label="Zmień hasło"
                  icon="pi pi-key"
                  onClick={() => setShowChangePassword(true)}
                  className="change-password-button"
                  severity="secondary"
                  outlined
                />
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
                label="Zaloguj"
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
              <WeatherChart data={filteredWeatherData} highlightedPoint={highlightedPoint} />
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Button
                  label={dateRange ? 'Zmień zakres dat' : 'Wybierz zakres dat'}
                  icon="pi pi-calendar"
                  onClick={handleOpenDateRangeDialog}
                  severity="secondary"
                  outlined
                />
                {dateRange && (
                  <Button
                    label="Resetuj filtr"
                    icon="pi pi-refresh"
                    onClick={handleResetDateRange}
                    severity="secondary"
                    outlined
                  />
                )}
              </div>
              {dateRange && (
                <div style={{ marginTop: '0.5rem', textAlign: 'center', color: '#6c757d', fontSize: '0.9rem' }}>
                  Zakres: {dateRange[0]?.toLocaleDateString('pl-PL')} - {dateRange[1]?.toLocaleDateString('pl-PL')}
                </div>
              )}
            </section>
            <section className="table-section">
              <WeatherTable 
                data={weatherData} 
                onDataChange={handleDataChange}
                onAdd={handleAdd}
                onDelete={handleDelete}
                onHighlightPoint={handleHighlightPoint}
                highlightedPoint={highlightedPoint}
              />
            </section>
          </>
        )}
      </main>
      <LoginDialog visible={showLogin} onHide={handleLoginSuccess} />
      <ChangePasswordDialog
        visible={showChangePassword}
        onHide={() => setShowChangePassword(false)}
      />
      <Dialog
        header="Wybierz zakres dat"
        visible={showDateRangeDialog}
        style={{ width: '30rem' }}
        footer={dateRangeDialogFooter}
        onHide={handleCloseDateRangeDialog}
        modal
      >
        <div style={{ padding: '1rem' }}>
          <label htmlFor="dateRange" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Zakres dat:
          </label>
          <Calendar
            id="dateRange"
            value={tempDateRange}
            onChange={(e) => setTempDateRange(e.value)}
            selectionMode="range"
            locale="pl"
            dateFormat="dd.mm.yy"
            showIcon
            placeholder="Wybierz zakres dat"
            style={{ width: '100%' }}
            showButtonBar
          />
        </div>
      </Dialog>
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

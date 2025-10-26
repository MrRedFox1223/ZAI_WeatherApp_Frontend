import React from 'react';
import './App.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import WeatherChart from './components/WeatherChart';
import WeatherTable from './components/WeatherTable';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Weather Dashboard</h1>
      </header>
      <main className="app-main">
        <section className="chart-section">
          <WeatherChart />
        </section>
        <section className="table-section">
          <WeatherTable />
        </section>
      </main>
    </div>
  );
}

export default App;

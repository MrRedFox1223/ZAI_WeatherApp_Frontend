import React from 'react';
import { Chart } from 'primereact/chart';
import { weatherData } from '../data/weatherData';

const WeatherChart = () => {
  // Prepare data for the line chart
  const chartData = {
    labels: weatherData.map(item => item.city_name),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: weatherData.map(item => item.temperature),
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Temperature by City - January 15, 2024'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Cities'
        }
      }
    }
  };

  return (
    <div className="weather-chart">
      <Chart 
        type="line" 
        data={chartData} 
        options={chartOptions}
        style={{ height: '400px' }}
      />
    </div>
  );
};

export default WeatherChart;

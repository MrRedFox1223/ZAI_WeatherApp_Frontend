import React, { useMemo } from 'react';
import { Chart } from 'primereact/chart';

const WeatherChart = ({ data }) => {
  // Colors for each city line - unique colors for 10 cities
  const cityColors = [
    { border: '#FF6384', background: 'rgba(255, 99, 132, 0.2)' }, // New York - Red/Pink
    { border: '#36A2EB', background: 'rgba(54, 162, 235, 0.2)' }, // London - Blue
    { border: '#FFCE56', background: 'rgba(255, 206, 86, 0.2)' }, // Tokyo - Yellow
    { border: '#4BC0C0', background: 'rgba(75, 192, 192, 0.2)' }, // Paris - Teal/Cyan
    { border: '#9966FF', background: 'rgba(153, 102, 255, 0.2)' }, // Sydney - Purple
    { border: '#FF9F40', background: 'rgba(255, 159, 64, 0.2)' }, // Berlin - Orange
    { border: '#C9CBCF', background: 'rgba(201, 203, 207, 0.2)' }, // Moscow - Gray
    { border: '#50C878', background: 'rgba(80, 200, 120, 0.2)' }, // Dubai - Green
    { border: '#E91E63', background: 'rgba(233, 30, 99, 0.2)' }, // Toronto - Magenta/Pink
    { border: '#00BCD4', background: 'rgba(0, 188, 212, 0.2)' }  // Barcelona - Cyan
  ];

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Get unique dates and cities
    const dates = [...new Set(data.map(item => item.date))].sort();
    const cities = [...new Set(data.map(item => item.city_name))];

    // Group data by city
    const cityDataMap = {};
    cities.forEach(city => {
      cityDataMap[city] = dates.map(date => {
        const dataPoint = data.find(item => item.city_name === city && item.date === date);
        return dataPoint ? dataPoint.temperature : null;
      });
    });

    // Create datasets for each city
    const datasets = cities.map((city, index) => ({
      label: city,
      data: cityDataMap[city],
      borderColor: cityColors[index % cityColors.length].border,
      backgroundColor: cityColors[index % cityColors.length].background,
      tension: 0.4,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6
    }));

    // Format dates for display
    const formattedDates = dates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    });

    return {
      labels: formattedDates,
      datasets: datasets
    };
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Zmiany temperatury w czasie - 10 miast',
        font: {
          size: 16
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Temperatura (°C)',
          font: {
            size: 14
          }
        },
        ticks: {
          callback: function(value) {
            return value + '°C';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Data',
          font: {
            size: 14
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
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


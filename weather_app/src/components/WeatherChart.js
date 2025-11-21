import React, { useMemo, memo } from 'react';
import { Chart } from 'primereact/chart';

const cityColors = [
  { border: '#FF6384', background: 'rgba(255, 99, 132, 0.2)' }, 
  { border: '#36A2EB', background: 'rgba(54, 162, 235, 0.2)' }, 
  { border: '#FFCE56', background: 'rgba(255, 206, 86, 0.2)' }, 
  { border: '#4BC0C0', background: 'rgba(75, 192, 192, 0.2)' }, 
  { border: '#9966FF', background: 'rgba(153, 102, 255, 0.2)' }, 
  { border: '#FF9F40', background: 'rgba(255, 159, 64, 0.2)' }, 
  { border: '#C9CBCF', background: 'rgba(201, 203, 207, 0.2)' }, 
  { border: '#E91E63', background: 'rgba(233, 30, 99, 0.2)' }, 
  { border: '#00BCD4', background: 'rgba(0, 188, 212, 0.2)' } 
];

const WeatherChart = memo(({ data, highlightedPoint }) => {

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }

    const dates = [...new Set(data.map(item => item.date))].sort();
    const cities = [...new Set(data.map(item => item.city_name))];

    const cityDataMap = {};
    cities.forEach(city => {
      cityDataMap[city] = dates.map(date => {
        const dataPoint = data.find(item => item.city_name === city && item.date === date);
        return dataPoint ? dataPoint.temperature : null;
      });
    });

    const datasets = cities.map((city, index) => {
      const cityColor = cityColors[index % cityColors.length];
      const isHighlightedCity = highlightedPoint && highlightedPoint.city_name === city;

      const pointColors = dates.map(date => {
        if (isHighlightedCity && highlightedPoint && date === highlightedPoint.date) {
          return '#FFD700';
        }
        return cityColor.border;
      });
      
      const pointRadii = dates.map(date => {
        if (isHighlightedCity && highlightedPoint && date === highlightedPoint.date) {
          return 10;
        }
        return 4;
      });
      
      const pointBorderWidths = dates.map(date => {
        if (isHighlightedCity && highlightedPoint && date === highlightedPoint.date) {
          return 3;
        }
        return 1;
      });
      
      return {
        label: city,
        data: cityDataMap[city],
        borderColor: cityColor.border,
        backgroundColor: cityColor.background,
        tension: 0.4,
        fill: false,
        spanGaps: true,
        pointRadius: pointRadii,
        pointHoverRadius: 6,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointBorderWidth: pointBorderWidths,
        showLine: true 
      };
    });

    const formattedDates = dates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    });

    return {
      labels: formattedDates,
      datasets: datasets
    };
  }, [data, highlightedPoint]);

  const chartOptions = useMemo(() => ({
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
        text: 'Średnia temperatura dobowa dla różnych miast',
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
  }), []);

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
}, (prevProps, nextProps) => {
  const prevData = prevProps.data || [];
  const nextData = nextProps.data || [];
  const prevHighlighted = prevProps.highlightedPoint;
  const nextHighlighted = nextProps.highlightedPoint;
  
  if (prevHighlighted !== nextHighlighted) {
    if ((!prevHighlighted && !nextHighlighted) || 
        (prevHighlighted && nextHighlighted && 
         prevHighlighted.id === nextHighlighted.id &&
         prevHighlighted.city_name === nextHighlighted.city_name &&
         prevHighlighted.date === nextHighlighted.date)) {
      } else {
      return false;
    }
  }
  
  if (prevData === nextData) {
    return true;
  }
  
  if (prevData.length !== nextData.length) {
    return false;
  }
  
  const prevMap = new Map(prevData.map(item => [item.id, item]));
  const nextMap = new Map(nextData.map(item => [item.id, item]));
  
  for (const [id, prevItem] of prevMap) {
    const nextItem = nextMap.get(id);
    
    if (!nextItem) {
      return false; 
    }
    
    if (prevItem === nextItem) {
      continue;
    }
    
    if (prevItem.date !== nextItem.date ||
        prevItem.city_name !== nextItem.city_name ||
        prevItem.temperature !== nextItem.temperature) {
      return false;
    }
  }
  
  if (prevMap.size !== nextMap.size) {
    return false; 
  }
  
  return true;
});

WeatherChart.displayName = 'WeatherChart';

export default WeatherChart;


import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { weatherData } from '../data/weatherData';

const WeatherTable = () => {
  // Format temperature column to show with degree symbol
  const temperatureTemplate = (rowData) => {
    return `${rowData.temperature}°C`;
  };

  // Format date column
  const dateTemplate = (rowData) => {
    return new Date(rowData.date).toLocaleDateString();
  };

  return (
    <div className="weather-table">
      <DataTable 
        value={weatherData} 
        paginator 
        rows={5} 
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
        className="p-datatable-striped"
      >
        <Column 
          field="id" 
          header="ID" 
          sortable 
          style={{ width: '10%' }}
        />
        <Column 
          field="city_name" 
          header="City Name" 
          sortable 
          style={{ width: '30%' }}
        />
        <Column 
          field="date" 
          header="Date" 
          body={dateTemplate}
          sortable 
          style={{ width: '30%' }}
        />
        <Column 
          field="temperature" 
          header="Temperature" 
          body={temperatureTemplate}
          sortable 
          style={{ width: '30%' }}
        />
      </DataTable>
    </div>
  );
};

export default WeatherTable;

import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAuth } from '../context/AuthContext';
import { addLocale } from 'primereact/api';

const WeatherTable = ({ data: externalData, onDataChange, onAdd, onDelete, onHighlightPoint, highlightedPoint }) => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(externalData || []);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    city_name: '',
    date: '',
    temperature: null
  });
  const toast = React.useRef(null);

  React.useEffect(() => {
    if (externalData) {
      setData(externalData);
    }
  }, [externalData]);

  const validateTemperature = (value) => {
    if (value === null || value === undefined) {
      return { valid: false, message: 'Temperatura jest wymagana' };
    }
    if (value < -100 || value > 100) {
      return { valid: false, message: 'Temperatura musi być w zakresie od -100°C do 100°C' };
    }
    return { valid: true };
  };

  const validateDate = (date) => {
    if (!date) {
      return { valid: false, message: 'Data jest wymagana' };
    }
    const dateObj = new Date(date);
    const minDate = new Date(1900, 0, 1);
    const maxDate = new Date(2100, 11, 31);
    
    if (dateObj < minDate || dateObj > maxDate) {
      return { valid: false, message: 'Data musi być w zakresie od stycznia 1900 do grudnia 2100' };
    }
    return { valid: true };
  };

  const temperatureTemplate = (rowData) => {
    return `${rowData.temperature}°C`;
  };

  const dateTemplate = (rowData) => {
    return new Date(rowData.date).toLocaleDateString('pl-PL');
  };

  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const cityEditor = (options) => {
    return (
      <InputText
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
        className="w-full"
        autoFocus
      />
    );
  };

  const temperatureEditor = (options) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.value)}
        min={-100}
        max={100}
        suffix="°C"
        className="w-full"
        useGrouping={false}
        autoFocus
      />
    );
  };

  const dateEditor = (options) => {
    const dateValue = options.value ? new Date(options.value) : null;
    const minDate = new Date(1900, 0, 1);
    const maxDate = new Date(2100, 11, 31);

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
      dateFormat: 'dd.mm.yy',
      chooseDate: 'Wybierz datę'
    });
    return (
      <Calendar
        locale="pl"
        value={dateValue}
        onChange={(e) => {
          if (e.value) {
            const dateStr = formatDateToString(e.value);
            options.editorCallback(dateStr);
          } else {
            options.editorCallback(null);
          }
        }}
        dateFormat="dd.mm.yy"
        minDate={minDate}
        maxDate={maxDate}
        firstDayOfWeek={1}
        showIcon
        className="w-full"
        autoFocus
        showButtonBar
        todayButtonClassName="p-button-text"
        clearButtonClassName="p-button-text"
      />
    );
  };

  const onRowEditInit = (e) => {
  };

  const onRowEditCancel = (e) => {
  };

  const onRowEditSave = (e) => {
    const { newData, index } = e;
    
    const tempValidation = validateTemperature(newData.temperature);
    if (!tempValidation.valid) {
      toast.current.show({
        severity: 'error',
        summary: 'Błąd walidacji',
        detail: tempValidation.message,
        life: 3000
      });
      e.preventDefault();
      return;
    }

    const dateValidation = validateDate(newData.date);
    if (!dateValidation.valid) {
      toast.current.show({
        severity: 'error',
        summary: 'Błąd walidacji',
        detail: dateValidation.message,
        life: 3000
      });
      e.preventDefault();
      return;
    }

    if (!newData.city_name || newData.city_name.trim() === '') {
      toast.current.show({
        severity: 'error',
        summary: 'Błąd walidacji',
        detail: 'Nazwa miasta jest wymagana',
        life: 3000
      });
      e.preventDefault();
      return;
    }

    const newDataArray = [...data];
    newDataArray[index] = { ...newData };
    setData(newDataArray);

    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const handleAddClick = () => {
    setNewItem({
      city_name: '',
      date: '',
      temperature: null
    });
    setShowAddDialog(true);
  };

  const handleAddSubmit = () => {
    if (!newItem.city_name || newItem.city_name.trim() === '') {
      toast.current.show({
        severity: 'error',
        summary: 'Błąd walidacji',
        detail: 'Nazwa miasta jest wymagana',
        life: 3000
      });
      return;
    }

    if (!newItem.date) {
      toast.current.show({
        severity: 'error',
        summary: 'Błąd walidacji',
        detail: 'Data jest wymagana',
        life: 3000
      });
      return;
    }

    const tempValidation = validateTemperature(newItem.temperature);
    if (!tempValidation.valid) {
      toast.current.show({
        severity: 'error',
        summary: 'Błąd walidacji',
        detail: tempValidation.message,
        life: 3000
      });
      return;
    }

    const dateValidation = validateDate(newItem.date);
    if (!dateValidation.valid) {
      toast.current.show({
        severity: 'error',
        summary: 'Błąd walidacji',
        detail: dateValidation.message,
        life: 3000
      });
      return;
    }

    if (onAdd) {
      onAdd({
        city_name: newItem.city_name.trim(),
        date: newItem.date,
        temperature: newItem.temperature
      });
    }

    setShowAddDialog(false);
  };

  const handleDeleteClick = (rowData) => {
    confirmDialog({
      message: `Czy na pewno chcesz usunąć wpis dla miasta "${rowData.city_name}" z datą ${new Date(rowData.date).toLocaleDateString('pl-PL')}?`,
      header: 'Potwierdzenie usunięcia',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (onDelete) {
          onDelete(rowData.id);
        }
      }
    });
  };

  const highlightActionTemplate = (rowData) => {
    const isHighlighted = highlightedPoint && 
      highlightedPoint.id === rowData.id &&
      highlightedPoint.city_name === rowData.city_name &&
      highlightedPoint.date === rowData.date;
    
    return (
      <Button
        icon={isHighlighted ? "pi pi-eye-slash" : "pi pi-eye"}
        className={`p-button-rounded p-button-text ${isHighlighted ? 'p-button-warning' : 'p-button-info'}`}
        onClick={() => onHighlightPoint && onHighlightPoint(rowData)}
        tooltip={isHighlighted ? "Wyłącz podświetlenie" : "Podświetl na wykresie"}
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  const editActionTemplate = (rowData) => {
    if (!isAdmin) return null;
    
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => handleDeleteClick(rowData)}
        tooltip="Usuń"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  return (
    <div className="weather-table">
      <Toast ref={toast} />
      <ConfirmDialog />
      {isAdmin && (
        <>
          <div className="mb-3 p-3 admin-info" style={{ backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
            <i className="pi pi-info-circle mr-2"></i>
            <strong>Tryb administratora:</strong> Kliknij ikonę ołówka w wierszu, aby rozpocząć edycję. Użyj przycisków ✓ i ✗ aby zapisać lub anulować zmiany.
          </div>
           <div className="mb-3" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
             <Button
               label="Dodaj nowe dane"
               icon="pi pi-plus"
               onClick={handleAddClick}
               className="p-button-success"
             />
           </div>
        </>
      )}
      <DataTable
        value={data}
        editMode="row"
        dataKey="id"
        onRowEditInit={onRowEditInit}
        onRowEditSave={onRowEditSave}
        onRowEditCancel={onRowEditCancel}
        paginator
        rows={10}
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
          header="Nazwa miasta"
          sortable
          style={{ width: '25%' }}
          editor={isAdmin ? cityEditor : undefined}
        />
        <Column
          field="date"
          header="Data"
          body={dateTemplate}
          sortable
          style={{ width: '25%' }}
          editor={isAdmin ? dateEditor : undefined}
        />
        <Column
          field="temperature"
          header="Temperatura"
          body={temperatureTemplate}
          sortable
          style={{ width: '20%' }}
          editor={isAdmin ? temperatureEditor : undefined}
        />
        <Column
          body={highlightActionTemplate}
          header="Akcje"
          style={{ width: '10%', textAlign: 'left' }}
        />
         {isAdmin && (
           <Column
             body={editActionTemplate}
             header="Usuń"
             style={{ width: '10%', textAlign: 'left' }}
           />
         )}
          {isAdmin && (
            <Column
            rowEditor={true} header="Edytuj" headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'left' }}>
              <Button icon="pi pi-check" severity="success" className="p-button-rounded p-button-text" onClick={onRowEditSave} />
              <Button icon="pi pi-times" severity="danger" className="p-button-rounded p-button-text" onClick={onRowEditCancel} />
            </Column>
          )}
      </DataTable>

      <Dialog
        header="Dodaj nowe dane"
        visible={showAddDialog}
        style={{ width: '500px' }}
        onHide={() => setShowAddDialog(false)}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="new-city" className="block mb-2">
              Nazwa miasta *
            </label>
            <InputText
              id="new-city"
              value={newItem.city_name}
              onChange={(e) => setNewItem({ ...newItem, city_name: e.target.value })}
              className="w-full"
              placeholder="Wprowadź nazwę miasta"
            />
          </div>

          <div className="field mt-4">
            <label htmlFor="new-date" className="block mb-2">
              Data *
            </label>
            <Calendar
              id="new-date"
              value={newItem.date ? new Date(newItem.date) : null}
              onChange={(e) => {
                if (e.value) {
                  const dateStr = formatDateToString(e.value);
                  setNewItem({ ...newItem, date: dateStr });
                } else {
                  setNewItem({ ...newItem, date: '' });
                }
              }}
              dateFormat="dd.mm.yy"
              minDate={new Date(1900, 0, 1)}
              maxDate={new Date(2100, 11, 31)}
              firstDayOfWeek={1}
              showIcon
              className="w-full"
              showButtonBar
            />
          </div>

          <div className="field mt-4">
            <label htmlFor="new-temperature" className="block mb-2">
              Temperatura (°C) *
            </label>
            <InputNumber
              id="new-temperature"
              value={newItem.temperature}
              onValueChange={(e) => setNewItem({ ...newItem, temperature: e.value })}
              min={-100}
              max={100}
              suffix="°C"
              className="w-full"
              useGrouping={false}
              placeholder="Wprowadź temperaturę"
            />
          </div>

          <div className="flex justify-content-end gap-2 mt-4">
            <Button
              label="Anuluj"
              icon="pi pi-times"
              onClick={() => setShowAddDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Dodaj"
              icon="pi pi-check"
              onClick={handleAddSubmit}
              className="p-button-success"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default WeatherTable;


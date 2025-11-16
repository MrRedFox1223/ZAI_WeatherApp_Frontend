import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../context/AuthContext';

const ChangePasswordDialog = ({ visible, onHide }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const validateForm = () => {
    if (!currentPassword || !newPassword) {
      setError('Proszę wypełnić wszystkie pola');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Nowe hasło musi mieć co najmniej 6 znaków');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setSuccess('Hasło zostało pomyślnie zmienione');
        setTimeout(() => onHide?.(), 1500);
      } else {
        setError(result.message || 'Nie udało się zmienić hasła');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas zmiany hasła');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChangePassword();
    }
  };

  const handleClose = () => {
    resetForm();
    onHide?.();
  };

  return (
    <Dialog
      header="Zmiana hasła"
      visible={visible}
      style={{ width: '400px' }}
      onHide={handleClose}
      modal
      className="change-password-dialog"
    >
      <div className="login-form">
        <div className="field">
          <label htmlFor="current-password" className="block mb-2">
            Aktualne hasło *
          </label>
          <Password
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
            placeholder="Wprowadź aktualne hasło"
            feedback={false}
            toggleMask
            autoFocus
          />
        </div>

        <div className="field mt-4">
          <label htmlFor="new-password" className="block mb-2">
            Nowe hasło *
          </label>
          <Password
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
            placeholder="Wprowadź nowe hasło"
            feedback={false}
            toggleMask
          />
        </div>

        {error && (
          <Message severity="error" text={error} className="mt-3" />
        )}

        {success && (
          <Message severity="success" text={success} className="mt-3" />
        )}

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Zmień hasło"
            icon="pi pi-key"
            onClick={handleChangePassword}
            loading={loading}
            className="p-button-success w-full"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ChangePasswordDialog;


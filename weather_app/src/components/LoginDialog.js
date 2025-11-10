import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../context/AuthContext';

const LoginDialog = ({ visible, onHide }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Proszę wypełnić wszystkie pola');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        setUsername('');
        setPassword('');
        setError('');
        if (onHide) {
          onHide();
        }
      } else {
        setError(result.message || 'Nieprawidłowe dane logowania');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Dialog
      header="Logowanie"
      visible={visible}
      style={{ width: '400px' }}
      onHide={onHide}
      modal
      className="login-dialog"
    >
      <div className="login-form">
        <div className="field">
          <label htmlFor="username" className="block mb-2">
            Nazwa użytkownika
          </label>
          <InputText
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
            placeholder="Wprowadź nazwę użytkownika"
            autoFocus
          />
        </div>

        <div className="field mt-4">
          <label htmlFor="password" className="block mb-2">
            Hasło
          </label>
          <Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
            placeholder="Wprowadź hasło"
            feedback={false}
            toggleMask
          />
        </div>

        {error && (
          <Message severity="error" text={error} className="mt-3" />
        )}

        <div className="login-hint mt-4 p-3" style={{ backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.9rem' }}>
          <strong>Logowanie:</strong><br />
          Wprowadź dane administratora, aby uzyskać dostęp do edycji danych.
        </div>

        <Button
          label="Zaloguj"
          icon="pi pi-sign-in"
          onClick={handleLogin}
          loading={loading}
          className="w-full mt-4 login-button-submit"
        />
      </div>
    </Dialog>
  );
};

export default LoginDialog;

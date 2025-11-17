import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const getAuthToken = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.token || null;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.detail || errorData.message || `Błąd logowania: ${response.status}`;
        
        if (errorMessage.includes('Invalid username or password')) {
          errorMessage = 'Niepoprawna nazwa użytkownika lub hasło';
        }
        
        return { success: false, message: errorMessage };
      }

      const userData = await response.json();
      
      if (userData.role === 'admin') {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      
      return {
        success: false,
        message: 'Tylko administrator może się zalogować.',
      };
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: `Wystąpił błąd podczas logowania: ${error.message}`,
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Brak autoryzacji. Proszę zalogować się ponownie.',
        };
      }

      const response = await fetch(`${API_BASE_URL}/change_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorCode = errorData.code || errorData.error_code || response.status;
        let errorMessage = errorData.detail || errorData.message || `Błąd zmiany hasła: ${response.status}`;
        
        const errorMessages = {
          401: 'Niepoprawne aktualne hasło.',
          400: 'Nowe hasło nie może być takie samo jak aktualne.',
        };
        
        errorMessage = errorMessages[errorCode] || errorMessage;
        
        return { success: false, message: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error('Wystąpił błąd:', error);
      return {
        success: false,
        message: `Wystąpił błąd podczas zmiany hasła: ${error.message}`,
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;

    try {
      const userData = JSON.parse(savedUser);
      if (userData.role === 'admin') {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      localStorage.removeItem('user');
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    changePassword,
    isAdmin: user?.role === 'admin',
    isUser: !user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

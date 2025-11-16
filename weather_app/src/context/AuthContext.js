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
  // Domyślnie użytkownik nie jest zalogowany (zwykły użytkownik)
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Funkcja logowania - tylko dla administratora
  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Jeśli status nie jest OK, spróbuj pobrać komunikat błędu
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.detail || errorData.message || `Błąd logowania: ${response.status}`;
        
        // Tłumacz angielskie komunikaty błędów na polski
        if (errorMessage.includes('Invalid username or password')) {
          errorMessage = 'Niepoprawna nazwa użytkownika lub hasło';
        }
        
        return {
          success: false,
          message: errorMessage,
        };
      }

      const userData = await response.json();
      
      // Sprawdź czy użytkownik ma rolę admin
      if (userData.role === 'admin') {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return {
          success: false,
          message: 'Tylko administrator może się zalogować.',
        };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: `Wystąpił błąd podczas logowania: ${error.message}`,
      };
    }
  };

  // Funkcja zmiany hasła
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Brak autoryzacji. Proszę zalogować się ponownie.',
        };
      }

      const response = await fetch('http://localhost:8000/change_password', {
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
        let errorMessage = errorData.detail || errorData.message || `Błąd zmiany hasła: ${response.status}`;
        
        // Tłumacz angielskie komunikaty błędów na polski
        if (errorMessage.includes('Invalid password') || errorMessage.includes('Current password is incorrect')) {
          errorMessage = 'Niepoprawne aktualne hasło';
        } else if (errorMessage.includes('New password') && errorMessage.includes('same')) {
          errorMessage = 'Nowe hasło musi być inne niż aktualne';
        }
        
        return {
          success: false,
          message: errorMessage,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error during password change:', error);
      return {
        success: false,
        message: `Wystąpił błąd podczas zmiany hasła: ${error.message}`,
      };
    }
  };

  // Funkcja pomocnicza do pobierania tokenu
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

  // Funkcja wylogowania - powrót do trybu zwykłego użytkownika
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Sprawdzenie czy administrator jest zalogowany przy starcie
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Tylko admin może być zalogowany
        if (userData.role === 'admin') {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('user');
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const value = {
    user,
    isAuthenticated, // true tylko gdy zalogowany jako admin
    login,
    logout,
    changePassword,
    isAdmin: user?.role === 'admin', // true tylko gdy zalogowany jako admin
    isUser: !user // true gdy niezalogowany (zwykły użytkownik)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

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
    // TODO: Zamienić na prawdziwe API call do FastAPI
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password })
    // });
    // const data = await response.json();
    
    // Symulacja logowania - tylko admin
    if (username === 'admin' && password === 'admin') {
      const userData = {
        id: 1,
        username: 'admin',
        role: 'admin',
        token: 'mock-token-admin'
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } else {
      return { success: false, message: 'Nieprawidłowe dane logowania. Tylko administrator może się zalogować.' };
    }
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
    isAdmin: user?.role === 'admin', // true tylko gdy zalogowany jako admin
    isUser: !user // true gdy niezalogowany (zwykły użytkownik)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

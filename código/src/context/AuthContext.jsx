// ── src/context/AuthContext.jsx ──────────────────────────────────────────────
// Contexto global de autenticación.
// Guarda el JWT en localStorage y expone: user, token, login(), logout().

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// ── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_TOKEN = 'dolarito_token';
const STORAGE_USER  = 'dolarito_user';

function readStorage() {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const raw   = localStorage.getItem(STORAGE_USER);
    const user  = raw ? JSON.parse(raw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const { token: storedToken, user: storedUser } = readStorage();

  const [token, setToken] = useState(storedToken);
  const [user,  setUser]  = useState(storedUser);

  const navigate = useNavigate();

  /**
   * Guarda el JWT y los datos del usuario tras un login exitoso.
   * @param {{ token: string, user?: object }} payload
   */
  const login = useCallback(({ token: newToken, user: newUser = null }) => {
    localStorage.setItem(STORAGE_TOKEN, newToken);
    if (newUser) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(newUser));
    }
    setToken(newToken);
    setUser(newUser);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  /**
   * Cierra la sesión: limpia el storage y redirige a /login.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = { token, user, login, logout, isAuthenticated: Boolean(token) };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para consumir el AuthContext.
 * Lanza un error si se usa fuera de AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;

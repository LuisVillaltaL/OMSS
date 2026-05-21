import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restaurar sesión del localStorage al recargar la página
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── login ────────────────────────────────────────────────────
  const login = useCallback(async (correo, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { correo, password });

      // Guardar tokens y usuario en localStorage
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user',         JSON.stringify(data.user));

      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión';
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch { /* ignorar errores al cerrar sesión */ }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto fácilmente
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
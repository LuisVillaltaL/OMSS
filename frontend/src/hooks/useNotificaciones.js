// RUTA: frontend/src/hooks/useNotificaciones.js
import { useState, useEffect, useCallback } from 'react';
import { getNotificaciones, marcarLeida as apiMarcarLeida, marcarTodasLeidas as apiMarcarTodasLeidas } from '../api/notificaciones';

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotificaciones();
      setNotificaciones(data);
      const unread = data.filter(n => !n.leida).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error('Error al cargar notificaciones:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const leerNotificacion = useCallback(async (id) => {
    try {
      await apiMarcarLeida(id);
      setNotificaciones(prev =>
        prev.map(n => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error al marcar leida:', e);
    }
  }, []);

  const leerTodas = useCallback(async () => {
    try {
      await apiMarcarTodasLeidas();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error al marcar todas leidas:', e);
    }
  }, []);

  // Polling cada 30 segundos para mantenerlo activo y dinamico
  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, [cargar]);

  return {
    notificaciones,
    unreadCount,
    loading,
    recargar: cargar,
    leerNotificacion,
    leerTodas
  };
}

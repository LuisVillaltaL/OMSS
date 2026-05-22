// RUTA: frontend/src/hooks/useReportes.js
import { useState, useCallback, useEffect } from 'react';
import { getReportesDashboard } from '../api/reportes';

export function useReportes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rango, setRango] = useState('30d'); // '7d', '30d', '90d', 'custom'
  const [fechas, setFechas] = useState({
    fecha_inicio: '',
    fecha_fin: ''
  });

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const hoy = new Date();

      if (rango === '7d') {
        const hace7d = new Date();
        hace7d.setDate(hoy.getDate() - 7);
        // Ajustar al inicio del dia hace 7 dias y fin de hoy
        hace7d.setHours(0, 0, 0, 0);
        hoy.setHours(23, 59, 59, 999);
        params.fecha_inicio = hace7d.toISOString();
        params.fecha_fin = hoy.toISOString();
      } else if (rango === '30d') {
        const hace30d = new Date();
        hace30d.setDate(hoy.getDate() - 30);
        hace30d.setHours(0, 0, 0, 0);
        hoy.setHours(23, 59, 59, 999);
        params.fecha_inicio = hace30d.toISOString();
        params.fecha_fin = hoy.toISOString();
      } else if (rango === '90d') {
        const hace90d = new Date();
        hace90d.setDate(hoy.getDate() - 90);
        hace90d.setHours(0, 0, 0, 0);
        hoy.setHours(23, 59, 59, 999);
        params.fecha_inicio = hace90d.toISOString();
        params.fecha_fin = hoy.toISOString();
      } else if (rango === 'custom') {
        if (fechas.fecha_inicio) {
          const dInicio = new Date(fechas.fecha_inicio + 'T00:00:00');
          params.fecha_inicio = dInicio.toISOString();
        }
        if (fechas.fecha_fin) {
          const dFin = new Date(fechas.fecha_fin + 'T23:59:59');
          params.fecha_fin = dFin.toISOString();
        }
      }

      const res = await getReportesDashboard(params);
      setData(res);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  }, [rango, fechas]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarRango = useCallback((nuevoRango) => {
    setRango(nuevoRango);
  }, []);

  const cambiarFechasPersonalizadas = useCallback((inicio, fin) => {
    setFechas({ fecha_inicio: inicio, fecha_fin: fin });
    setRango('custom');
  }, []);

  return {
    data,
    loading,
    error,
    rango,
    fechas,
    cambiarRango,
    cambiarFechasPersonalizadas,
    recargar: cargar
  };
}

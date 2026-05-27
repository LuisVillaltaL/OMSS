// RUTA: frontend/src/hooks/useLicencias.js
import { useState, useEffect, useCallback } from 'react';
import { getLicencias } from '../api/licencias';

export function useLicencias() {
  const [licencias, setLicencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLicencias();
      setLicencias(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al conectar con la base de datos de licencias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { licencias, loading, error, recargar: cargar };
}

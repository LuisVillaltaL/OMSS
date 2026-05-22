import { useState, useEffect, useCallback } from 'react';
import { getActivos, getFormulariosActivos } from '../api/activos';

export function useActivos() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActivos();
      setActivos(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al conectar con la CMDB');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { activos, loading, error, recargar: cargar };
}

export function useFormActivos() {
  const [combos, setCombos] = useState({ departamentos: [], empleados: [] });
  useEffect(() => {
    getFormulariosActivos().then(setCombos).catch(() => {});
  }, []);
  return combos;
}
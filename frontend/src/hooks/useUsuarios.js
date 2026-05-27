// RUTA: frontend/src/hooks/useUsuarios.js
import { useState, useCallback, useEffect } from 'react';
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  toggleUsuarioEstado,
  actualizarPermisos
} from '../api/usuarios';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    q: '',
    rol: '',
    departamento_id: '',
    activo: '',
    page: 1,
    limit: 25
  });

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters };
      // Limpiar parametros vacios
      Object.keys(params).forEach(k => {
        if (params[k] === undefined || params[k] === '') {
          delete params[k];
        }
      });
      
      const res = await getUsuarios(params);
      setUsuarios(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar los empleados');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarFiltro = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const cambiarPagina = useCallback(page => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const guardar = useCallback(async (form, id = null) => {
    setError(null);
    try {
      if (id) {
        await actualizarUsuario(id, form);
      } else {
        await crearUsuario(form);
      }
      await cargar();
    } catch (e) {
      const errMsg = e.response?.data?.error || 'Error al guardar el empleado';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, [cargar]);

  const alternarEstado = useCallback(async (id) => {
    setError(null);
    try {
      await toggleUsuarioEstado(id);
      await cargar();
    } catch (e) {
      const errMsg = e.response?.data?.error || 'Error al cambiar estado del empleado';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, [cargar]);

  const cambiarPermisos = useCallback(async (id, modulos_permitidos) => {
    setError(null);
    try {
      await actualizarPermisos(id, modulos_permitidos);
      await cargar();
    } catch (e) {
      const errMsg = e.response?.data?.error || 'Error al actualizar permisos';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, [cargar]);

  return {
    usuarios,
    total,
    loading,
    error,
    filters,
    cambiarFiltro,
    cambiarPagina,
    guardar,
    alternarEstado,
    cambiarPermisos,
    recargar: cargar
  };
}


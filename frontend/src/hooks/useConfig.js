// RUTA: frontend/src/hooks/useConfig.js
import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/config';

export function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDepartamentos();
      setDepartamentos(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar departamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const guardar = async (data, id = null) => {
    setError(null);
    try {
      if (id) {
        await api.actualizarDepartamento(id, data);
      } else {
        await api.crearDepartamento(data);
      }
      await cargar();
      return true;
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar departamento');
      throw e;
    }
  };

  const eliminar = async id => {
    setError(null);
    try {
      const res = await api.eliminarDepartamento(id);
      await cargar();
      return res.mensaje;
    } catch (e) {
      setError(e.response?.data?.error || 'Error al eliminar departamento');
      throw e;
    }
  };

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { departamentos, loading, error, recargar: cargar, guardar, eliminar };
}

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategorias();
      setCategorias(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  const guardar = async (data, id = null) => {
    setError(null);
    try {
      if (id) {
        await api.actualizarCategoria(id, data);
      } else {
        await api.crearCategoria(data);
      }
      await cargar();
      return true;
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar categoria');
      throw e;
    }
  };

  const eliminar = async id => {
    setError(null);
    try {
      const res = await api.eliminarCategoria(id);
      await cargar();
      return res.mensaje;
    } catch (e) {
      setError(e.response?.data?.error || 'Error al eliminar categoria');
      throw e;
    }
  };

  const guardarSub = async (data, id = null) => {
    setError(null);
    try {
      if (id) {
        await api.actualizarSubcategoria(id, data);
      } else {
        await api.crearSubcategoria(data);
      }
      await cargar();
      return true;
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar subcategoria');
      throw e;
    }
  };

  const eliminarSub = async id => {
    setError(null);
    try {
      const res = await api.eliminarSubcategoria(id);
      await cargar();
      return res.mensaje;
    } catch (e) {
      setError(e.response?.data?.error || 'Error al eliminar subcategoria');
      throw e;
    }
  };

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    categorias,
    loading,
    error,
    recargar: cargar,
    guardar,
    eliminar,
    guardarSub,
    eliminarSub
  };
}

export function useSlas() {
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSlas();
      setSlas(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar SLAs');
    } finally {
      setLoading(false);
    }
  }, []);

  const guardar = async (data, id = null) => {
    setError(null);
    try {
      if (id) {
        await api.actualizarSla(id, data);
      } else {
        await api.crearSla(data);
      }
      await cargar();
      return true;
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar SLA');
      throw e;
    }
  };

  const eliminar = async id => {
    setError(null);
    try {
      const res = await api.eliminarSla(id);
      await cargar();
      return res.mensaje;
    } catch (e) {
      setError(e.response?.data?.error || 'Error al eliminar SLA');
      throw e;
    }
  };

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { slas, loading, error, recargar: cargar, guardar, eliminar };
}

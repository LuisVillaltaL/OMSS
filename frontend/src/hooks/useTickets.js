import { useState, useCallback, useEffect } from 'react';
import {
  getTickets, getTicket, actualizarTicket,
  agregarNota, escalarTicket, reabrirTicket, getCatalogo,
} from '../api/tickets';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [filters, setFilters] = useState({
    page: 1, limit: 25,
    estado: '', prioridad: '', asignado_a: '', q: '',
  });

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await getTickets(params);
      setTickets(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [filters]);

  const cambiarFiltro = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const cambiarPagina = useCallback(page => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  return { tickets, total, loading, error, filters, cambiarFiltro, cambiarPagina, recargar: cargar };
}

export function useTicket(id) {
  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTicket(id);
      setTicket(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar el ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizar = useCallback(async (data) => {
    await actualizarTicket(id, data);
    await cargar();
  }, [id, cargar]);

  const nuevaNota = useCallback(async (data) => {
    await agregarNota(id, data);
    await cargar();
  }, [id, cargar]);

  const escalar = useCallback(async (data) => {
    await escalarTicket(id, data);
    await cargar();
  }, [id, cargar]);

  const reabrir = useCallback(async (motivo) => {
    await reabrirTicket(id, motivo);
    await cargar();
  }, [id, cargar]);

  return { ticket, loading, error, recargar: cargar, actualizar, nuevaNota, escalar, reabrir };
}

export function useCatalogo() {
  const [catalogo, setCatalogo] = useState({
    categorias: [], subcategorias: [], tecnicos: [], activos: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCatalogo()
      .then(setCatalogo)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { catalogo, loading };
}
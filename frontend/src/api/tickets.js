import api from './axios';

// ── Listar tickets con filtros y paginación ────────────────────
export const getTickets = (params = {}) =>
  api.get('/tickets', { params }).then(r => r.data);

// ── Obtener un ticket con notas + historial ────────────────────
export const getTicket = id =>
  api.get(`/tickets/${id}`).then(r => r.data);

// ── Crear ticket ───────────────────────────────────────────────
export const crearTicket = data =>
  api.post('/tickets', data).then(r => r.data);

// ── Actualizar ticket (estado, prioridad, asignado, etc.) ──────
export const actualizarTicket = (id, data) =>
  api.patch(`/tickets/${id}`, data).then(r => r.data);

// ── Agregar nota ───────────────────────────────────────────────
export const agregarNota = (id, data) =>
  api.post(`/tickets/${id}/notas`, data).then(r => r.data);

// ── Escalar ticket ─────────────────────────────────────────────
export const escalarTicket = (id, data) =>
  api.post(`/tickets/${id}/escalar`, data).then(r => r.data);

// ── Reabrir ticket ─────────────────────────────────────────────
export const reabrirTicket = (id, motivo) =>
  api.post(`/tickets/${id}/reabrir`, { motivo }).then(r => r.data);

// ── Catálogo (categorías, técnicos, activos) para el formulario
export const getCatalogo = () =>
  api.get('/tickets/catalogo').then(r => r.data);
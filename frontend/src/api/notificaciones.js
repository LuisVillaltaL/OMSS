// RUTA: frontend/src/api/notificaciones.js
import api from './axios';

// Obtener todas las notificaciones del usuario actual
export const getNotificaciones = () =>
  api.get('/notificaciones').then(r => r.data);

// Marcar todas como leidas
export const marcarTodasLeidas = () =>
  api.put('/notificaciones/leer-todas').then(r => r.data);

// Marcar una notificacion especifica como leida
export const marcarLeida = id =>
  api.put(`/notificaciones/${id}/leer`).then(r => r.data);

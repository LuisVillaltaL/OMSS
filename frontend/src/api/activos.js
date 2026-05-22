// RUTA: frontend/src/api/activos.js
import api from './axios';

export const getActivos = (params = {}) =>
  api.get('/activos', { params }).then(r => r.data);

export const crearActivo = data =>
  api.post('/activos', data).then(r => r.data);

export const getFormulariosActivos = () =>
  api.get('/activos/formularios').then(r => r.data);
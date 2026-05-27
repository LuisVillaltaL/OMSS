// RUTA: frontend/src/api/licencias.js
import api from './axios';

export const getLicencias = () =>
  api.get('/licencias').then(r => r.data);

export const crearLicencia = data =>
  api.post('/licencias', data).then(r => r.data);

export const actualizarLicencia = (id, data) =>
  api.put(`/licencias/${id}`, data).then(r => r.data);

export const eliminarLicencia = id =>
  api.delete(`/licencias/${id}`).then(r => r.data);

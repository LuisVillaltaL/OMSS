// RUTA: frontend/src/api/reportes.js
import api from './axios';

// Obtener los datos del dashboard de reportes con filtros opcionales de fecha
export const getReportesDashboard = (params = {}) =>
  api.get('/reportes/dashboard', { params }).then(r => r.data);

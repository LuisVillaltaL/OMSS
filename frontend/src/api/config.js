// RUTA: frontend/src/api/config.js
import api from './axios';

// ── DEPARTAMENTOS ───────────────────────────────────────────────────

export const getDepartamentos = () =>
  api.get('/config/departamentos').then(r => r.data);

export const crearDepartamento = data =>
  api.post('/config/departamentos', data).then(r => r.data);

export const actualizarDepartamento = (id, data) =>
  api.put(`/config/departamentos/${id}`, data).then(r => r.data);

export const eliminarDepartamento = id =>
  api.delete(`/config/departamentos/${id}`).then(r => r.data);

// ── CATEGORIAS Y SUBCATEGORIAS ──────────────────────────────────────

export const getCategorias = () =>
  api.get('/config/categorias').then(r => r.data);

export const crearCategoria = data =>
  api.post('/config/categorias', data).then(r => r.data);

export const actualizarCategoria = (id, data) =>
  api.put(`/config/categorias/${id}`, data).then(r => r.data);

export const eliminarCategoria = id =>
  api.delete(`/config/categorias/${id}`).then(r => r.data);

export const crearSubcategoria = data =>
  api.post('/config/subcategorias', data).then(r => r.data);

export const actualizarSubcategoria = (id, data) =>
  api.put(`/config/subcategorias/${id}`, data).then(r => r.data);

export const eliminarSubcategoria = id =>
  api.delete(`/config/subcategorias/${id}`).then(r => r.data);

// ── SLAs ─────────────────────────────────────────────────────────────

export const getSlas = () =>
  api.get('/config/slas').then(r => r.data);

export const crearSla = data =>
  api.post('/config/slas', data).then(r => r.data);

export const actualizarSla = (id, data) =>
  api.put(`/config/slas/${id}`, data).then(r => r.data);

export const eliminarSla = id =>
  api.delete(`/config/slas/${id}`).then(r => r.data);

// RUTA: frontend/src/api/usuarios.js
import api from './axios';

// Obtener listado de empleados con filtros
export const getUsuarios = (params = {}) =>
  api.get('/usuarios', { params }).then(r => r.data);

// Obtener detalles de un unico usuario
export const getUsuario = (id) =>
  api.get(`/usuarios/${id}`).then(r => r.data);

// Registrar un nuevo empleado
export const crearUsuario = (data) =>
  api.post('/usuarios', data).then(r => r.data);

// Actualizar la informacion de un empleado existente
export const actualizarUsuario = (id, data) =>
  api.put(`/usuarios/${id}`, data).then(r => r.data);

// Alternar el estado activo/inactivo de un empleado
export const toggleUsuarioEstado = (id) =>
  api.put(`/usuarios/${id}/toggle`).then(r => r.data);

// Actualizar los modulos permitidos para un usuario
export const actualizarPermisos = (id, modulos_permitidos) =>
  api.put(`/usuarios/${id}/permisos`, { modulos_permitidos }).then(r => r.data);


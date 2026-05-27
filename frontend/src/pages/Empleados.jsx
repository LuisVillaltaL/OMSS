// RUTA: frontend/src/pages/Empleados.jsx
import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useUsuarios } from '../hooks/useUsuarios';
import { useDepartamentos } from '../hooks/useConfig';

const ACCENT = '#3C50E0';

// ── ICONOS SVG NATIVOS DE TRAZO FINO (strokeWidth = 1.5) ──

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20c-2.202 0-4.264-.627-6.015-1.714v-.003c0-2.232 4.542-4.033 10.111-4.033 1.708 0 3.33.166 4.733.468m1.917-.97a4.093 4.093 0 0 0 3-3.874 4.093 4.093 0 0 0-3-3.875M18 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 20a1 1 0 0 1-1-1v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1a1 1 0 0 1-1 1H3Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

const ROL_ESTILOS = {
  admin: 'bg-red-50 text-red-700 border border-red-100',
  tecnico_l2: 'bg-orange-50 text-orange-700 border border-orange-100',
  tecnico_l1: 'bg-blue-50 text-blue-700 border border-blue-100',
  usuario_final: 'bg-slate-50 text-slate-600 border border-slate-200'
};

const ROL_NOMBRES = {
  admin: 'Administrador',
  tecnico_l2: 'Tecnico Nivel 2',
  tecnico_l1: 'Tecnico Nivel 1',
  usuario_final: 'Usuario Final'
};

export default function EmpleadosPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  // Custom hooks
  const {
    usuarios,
    total,
    loading,
    error,
    filters,
    cambiarFiltro,
    cambiarPagina,
    guardar,
    alternarEstado
  } = useUsuarios();

  const { departamentos } = useDepartamentos();

  // Estados locales de notificacion
  const [notif, setNotif] = useState(null);

  const mostrarNotif = (msg, tipo = 'success') => {
    setNotif({ msg, tipo });
    setTimeout(() => setNotif(null), 5000);
  };

  // Estados de Modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  
  // Formulario de Usuario
  const [usuarioForm, setUsuarioForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    rol: 'usuario_final',
    perfil: '',
    departamento_id: '',
    activo: true
  });

  // Formulario de Restablecimiento de contraseña
  const [passForm, setPassForm] = useState({
    id: '',
    nombreCompleto: '',
    password: '',
    confirmPassword: ''
  });

  // Helper para iniciales y HSL color de avatar
  const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0) : '';
    const a = apellido ? apellido.charAt(0) : '';
    return (n + a).toUpperCase();
  };

  const getAvatarBg = useMemo(() => {
    return (nombre) => {
      if (!nombre) return { backgroundColor: '#CBD5E1', color: '#64748B' };
      let hash = 0;
      for (let i = 0; i < nombre.length; i++) {
        hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
      }
      const h = Math.abs(hash % 360);
      return {
        backgroundColor: `hsl(${h}, 60%, 42%)`,
        color: '#FFF'
      };
    };
  }, []);

  // Metricas rapidas calculadas dinamicamente
  const stats = useMemo(() => {
    const list = usuarios || [];
    return {
      total: total,
      admins: list.filter(u => u.rol === 'admin').length,
      tecnicos: list.filter(u => ['tecnico_l1', 'tecnico_l2'].includes(u.rol)).length,
      finales: list.filter(u => u.rol === 'usuario_final').length
    };
  }, [usuarios, total]);

  // Manejo de Modales
  const abrirFormModal = (u = null) => {
    if (!isAdmin) return;
    if (u) {
      setEditingUsuario(u);
      setUsuarioForm({
        nombre: u.nombre || '',
        apellido: u.apellido || '',
        correo: u.correo || '',
        password: '', // Dejar vacio para no actualizar
        rol: u.rol || 'usuario_final',
        perfil: u.perfil || '',
        departamento_id: u.departamento_id || '',
        activo: u.activo !== false
      });
    } else {
      setEditingUsuario(null);
      setUsuarioForm({
        nombre: '',
        apellido: '',
        correo: '',
        password: '',
        rol: 'usuario_final',
        perfil: '',
        departamento_id: '',
        activo: true
      });
    }
    setShowFormModal(true);
  };

  const abrirPassModal = (u) => {
    if (!isAdmin) return;
    setPassForm({
      id: u.id,
      nombreCompleto: `${u.nombre} ${u.apellido}`,
      password: '',
      confirmPassword: ''
    });
    setShowPassModal(true);
  };

  // Guardar Cambios
  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    if (!usuarioForm.nombre.trim() || !usuarioForm.apellido.trim() || !usuarioForm.correo.trim() || !usuarioForm.rol) {
      return;
    }
    if (!editingUsuario && !usuarioForm.password) {
      mostrarNotif('La contrasena es requerida para nuevos empleados', 'error');
      return;
    }

    try {
      const payload = { ...usuarioForm };
      if (!['tecnico_l1', 'tecnico_l2'].includes(payload.rol)) {
        payload.perfil = null;
      } else if (!payload.perfil) {
        payload.perfil = 'junior';
      }
      if (editingUsuario && !payload.password) {
        delete payload.password; // No enviar contrasena si esta vacia en edicion
      }
      await guardar(payload, editingUsuario?.id);
      mostrarNotif(editingUsuario ? 'Empleado actualizado correctamente' : 'Empleado registrado correctamente');
      setShowFormModal(false);
    } catch (err) {
      mostrarNotif(err.message || 'Error al guardar empleado', 'error');
    }
  };

  // Restablecer contrasena
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passForm.password || passForm.password.length < 4) {
      mostrarNotif('La contrasena debe tener al menos 4 caracteres', 'error');
      return;
    }
    if (passForm.password !== passForm.confirmPassword) {
      mostrarNotif('Las contrasenas no coinciden', 'error');
      return;
    }

    try {
      const targetUser = usuarios.find(u => u.id === passForm.id);
      if (!targetUser) return;

      const payload = {
        nombre: targetUser.nombre,
        apellido: targetUser.apellido,
        correo: targetUser.correo,
        rol: targetUser.rol,
        perfil: targetUser.perfil,
        departamento_id: targetUser.departamento_id,
        activo: targetUser.activo,
        password: passForm.password
      };

      await guardar(payload, passForm.id);
      mostrarNotif('Contrasena restablecida con exito');
      setShowPassModal(false);
    } catch (err) {
      mostrarNotif(err.message || 'Error al actualizar contrasena', 'error');
    }
  };

  // Toggle de Estado Activo
  const handleToggleEstado = async (u) => {
    if (!isAdmin) return;
    if (u.id === user.id) {
      mostrarNotif('No puedes desactivar tu propia cuenta', 'error');
      return;
    }
    if (!window.confirm(`Seguro que deseas ${u.activo ? 'desactivar' : 'activar'} la cuenta de ${u.nombre}?`)) {
      return;
    }
    try {
      await alternarEstado(u.id);
      mostrarNotif(`Empleado ${u.activo ? 'desactivado' : 'activado'} correctamente`);
    } catch (err) {
      mostrarNotif(err.message || 'Error al cambiar estado', 'error');
    }
  };

  const inp = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors';
  const lbl = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <Layout>
      <div className="overflow-y-auto p-6 space-y-6" style={{ height: '100%' }}>
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-800 font-sans">Panel de Empleados y Personal</h1>
            <p className="text-xs text-slate-400 mt-0.5">Administracion del personal, control de analistas de soporte y gestion de roles</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => abrirFormModal()}
              className="text-xs font-bold text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all hover:opacity-90 shadow-sm self-start sm:self-auto"
              style={{ background: ACCENT }}
            >
              <PlusIcon /> Registrar Empleado
            </button>
          )}
        </div>

        {/* Notificaciones */}
        {notif && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium animate-fade-in ${
            notif.tipo === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {notif.tipo === 'error' ? <InfoIcon /> : <CheckIcon />}
            <span>{notif.msg}</span>
          </div>
        )}

        {/* ── METRICAS RAPIDAS DE EMPLEADOS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <span className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <UsersIcon />
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Directorio</p>
              <h3 className="text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <span className="p-3 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
              <UsersIcon />
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usuarios Finales</p>
              <h3 className="text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.finales}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <span className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <UsersIcon />
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Tecnico</p>
              <h3 className="text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.tecnicos}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <span className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <UsersIcon />
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administradores</p>
              <h3 className="text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.admins}</h3>
            </div>
          </div>
        </div>

        {/* ── PANEL DE FILTROS Y BUSQUEDA ── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, correo, cargo..."
              value={filters.q}
              onChange={e => cambiarFiltro('q', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-slate-400"
            />
          </div>

          {/* Selectores */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filtro por Rol */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Rol:</span>
              <select
                value={filters.rol}
                onChange={e => cambiarFiltro('rol', e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="">Todos los Roles</option>
                <option value="admin">Administrador</option>
                <option value="tecnico_l2">Tecnico L2</option>
                <option value="tecnico_l1">Tecnico L1</option>
                <option value="usuario_final">Usuario Final</option>
              </select>
            </div>

            {/* Filtro por Departamento */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Area:</span>
              <select
                value={filters.departamento_id}
                onChange={e => cambiarFiltro('departamento_id', e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-blue-500 max-w-[180px]"
              >
                <option value="">Todos los Deptos</option>
                {departamentos.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Estado Activo */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Estado:</span>
              <select
                value={filters.activo}
                onChange={e => cambiarFiltro('activo', e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="">Todos los Estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── TABLA PRINCIPAL DE EMPLEADOS ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                  <th className="text-left font-semibold px-6 py-4">Empleado / Cargo</th>
                  <th className="text-left font-semibold px-6 py-4">Correo Electronico</th>
                  <th className="text-left font-semibold px-6 py-4">Rol del Sistema</th>
                  <th className="text-left font-semibold px-6 py-4">Departamento</th>
                  <th className="text-center font-semibold px-6 py-4">Estado</th>
                  {isAdmin && <th className="text-right font-semibold px-6 py-4">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {loading && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-16 text-slate-400 animate-pulse font-medium">
                      Consultando directorio de empleados...
                    </td>
                  </tr>
                )}
                {!loading && usuarios.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-16 text-slate-400 font-medium">
                      No se encontraron empleados con los filtros indicados.
                    </td>
                  </tr>
                )}
                {!loading && usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* Empleado y Cargo */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border shadow-sm"
                          style={getAvatarBg(u.nombre)}
                        >
                          {getInitials(u.nombre, u.apellido)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{u.nombre} {u.apellido}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {u.rol === 'admin' 
                              ? 'Administrador de TI' 
                              : u.rol === 'usuario_final' 
                                ? 'Empleado' 
                                : `Técnico ${u.perfil === 'senior' ? 'Senior' : u.perfil === 'semi_senior' ? 'Semi-Senior' : 'Junior'}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Correo */}
                    <td className="px-6 py-3.5 font-medium">{u.correo}</td>

                    {/* Rol */}
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        ROL_ESTILOS[u.rol] || 'bg-slate-50 text-slate-500'
                      }`}>
                        {ROL_NOMBRES[u.rol] || u.rol}
                      </span>
                    </td>

                    {/* Departamento */}
                    <td className="px-6 py-3.5 font-semibold text-slate-500">
                      {u.departamento_nombre || '--'}
                    </td>

                    {/* Estado Activo */}
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleEstado(u)}
                        disabled={!isAdmin || u.id === user.id}
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.activo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100'
                        } transition-colors ${!isAdmin || u.id === user.id ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>

                    {/* Acciones */}
                    {isAdmin && (
                      <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => abrirFormModal(u)}
                          title="Editar empleado"
                          className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors inline-flex"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => abrirPassModal(u)}
                          title="Restablecer contrasena"
                          className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors inline-flex"
                        >
                          <KeyIcon />
                        </button>
                        <button
                          onClick={() => handleToggleEstado(u)}
                          disabled={u.id === user.id}
                          title={u.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                          className={`p-1.5 rounded-lg border transition-colors inline-flex ${
                            u.activo 
                              ? 'border-red-100 bg-red-50 hover:bg-red-100 text-red-600' 
                              : 'border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                          } ${u.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <PowerIcon />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginador Sencillo */}
          {total > filters.limit && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Mostrando {usuarios.length} de {total} empleados
              </span>
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => cambiarPagina(filters.page - 1)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  disabled={filters.page * filters.limit >= total}
                  onClick={() => cambiarPagina(filters.page + 1)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── MODALES COMPONENTES ── */}

        {/* Modal de Registro / Edicion */}
        {showFormModal && isAdmin && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowFormModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-sans">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">
                  {editingUsuario ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
                </h2>
                <button type="button" onClick={() => setShowFormModal(false)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleGuardarUsuario} className="px-6 py-5 space-y-4">
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Nombre <span className="text-red-500">*</span></label>
                    <input
                      value={usuarioForm.nombre}
                      onChange={e => setUsuarioForm(p => ({ ...p, nombre: e.target.value }))}
                      className={inp}
                      placeholder="Ej: Juan"
                      required
                    />
                  </div>
                  <div>
                    <label className={lbl}>Apellido <span className="text-red-500">*</span></label>
                    <input
                      value={usuarioForm.apellido}
                      onChange={e => setUsuarioForm(p => ({ ...p, apellido: e.target.value }))}
                      className={inp}
                      placeholder="Ej: Perez"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Correo Electronico <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={usuarioForm.correo}
                    onChange={e => setUsuarioForm(p => ({ ...p, correo: e.target.value }))}
                    className={inp}
                    placeholder="correo@empresa.com"
                    required
                  />
                </div>

                <div>
                  <label className={lbl}>
                    Contrasena {editingUsuario ? '' : <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={usuarioForm.password}
                    onChange={e => setUsuarioForm(p => ({ ...p, password: e.target.value }))}
                    className={inp}
                    placeholder={editingUsuario ? 'Dejar en blanco para no modificar' : 'Minimo 4 caracteres'}
                    required={!editingUsuario}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Rol de Sistema <span className="text-red-500">*</span></label>
                    <select
                      value={usuarioForm.rol}
                      onChange={e => setUsuarioForm(p => ({ ...p, rol: e.target.value }))}
                      className={inp}
                      required
                    >
                      <option value="usuario_final">Usuario Final (Solicitante)</option>
                      <option value="tecnico_l1">Tecnico Nivel 1</option>
                      <option value="tecnico_l2">Tecnico Nivel 2</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={lbl}>Area / Departamento</label>
                    <select
                      value={usuarioForm.departamento_id}
                      onChange={e => setUsuarioForm(p => ({ ...p, departamento_id: e.target.value }))}
                      className={inp}
                    >
                      <option value="">Selecciona Area</option>
                      {departamentos.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {['tecnico_l1', 'tecnico_l2'].includes(usuarioForm.rol) && (
                  <div>
                    <label className={lbl}>Perfil Técnico <span className="text-red-500">*</span></label>
                    <select
                      value={usuarioForm.perfil}
                      onChange={e => setUsuarioForm(p => ({ ...p, perfil: e.target.value }))}
                      className={inp}
                      required
                    >
                      <option value="">Selecciona Perfil Técnico</option>
                      <option value="junior">Junior</option>
                      <option value="semi_senior">Semi-Senior</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                )}

                {editingUsuario && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="userActivo"
                      checked={usuarioForm.activo}
                      disabled={editingUsuario.id === user.id}
                      onChange={e => setUsuarioForm(p => ({ ...p, activo: e.target.checked }))}
                      className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <label htmlFor="userActivo" className="text-xs font-semibold text-slate-600 select-none">
                      Cuenta habilitada para inicio de sesion
                    </label>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-sm" style={{ background: ACCENT }}>
                    {editingUsuario ? 'Guardar Cambios' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Restablecer Contrasena */}
        {showPassModal && isAdmin && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowPassModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden font-sans">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">Restablecer Credenciales</h2>
                <button type="button" onClick={() => setShowPassModal(false)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="px-6 py-5 space-y-4">
                
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 font-semibold space-y-0.5">
                  <p>Empleado: <span className="text-slate-800 font-bold">{passForm.nombreCompleto}</span></p>
                  <p>Esta accion actualizara la clave de acceso de forma inmediata.</p>
                </div>

                <div>
                  <label className={lbl}>Nueva Contrasena <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={passForm.password}
                    onChange={e => setPassForm(p => ({ ...p, password: e.target.value }))}
                    className={inp}
                    placeholder="Minimo 4 caracteres"
                    required
                  />
                </div>

                <div>
                  <label className={lbl}>Confirmar Contrasena <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={passForm.confirmPassword}
                    onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    className={inp}
                    placeholder="Repita la contrasena exactamente"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowPassModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-sm" style={{ background: ACCENT }}>
                    Actualizar Clave
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useDepartamentos, useCategorias, useSlas } from '../hooks/useConfig';
import { useUsuarios } from '../hooks/useUsuarios';
import { useAuth } from '../context/AuthContext';

const ACCENT = '#3C50E0';

// ── ICONOS SVG NATIVOS DE TRAZO FINO ─────────────────────────────────

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21h10.5V6.75H6.75V21Zm4.5-8.25h.75m-.75 3h.75m-.75 3h.75" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0A2.25 2.25 0 0 0 2.25 15v3.75A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25V15a2.25 2.25 0 0 0-2.25-2.25m-19.5 0h19.5M3.75 5.25h11.25" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
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

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
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

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  );
}

const PRIORIDAD_ESTILOS = {
  critico: 'bg-red-50 text-red-700 border border-red-100',
  alto: 'bg-orange-50 text-orange-700 border border-orange-100',
  medio: 'bg-blue-50 text-blue-700 border border-blue-100',
  bajo: 'bg-slate-50 text-slate-700 border border-slate-200'
};

const DIAS_SEMANA = [
  { valor: 1, label: 'Lunes' },
  { valor: 2, label: 'Martes' },
  { valor: 3, label: 'Miercoles' },
  { valor: 4, label: 'Jueves' },
  { valor: 5, label: 'Viernes' },
  { valor: 6, label: 'Sabado' },
  { valor: 7, label: 'Domingo' }
];

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('deptos');

  // Hooks de datos
  const deptosHook = useDepartamentos();
  const catsHook = useCategorias();
  const slasHook = useSlas();
  const { usuarios, loading: loadingUsuarios, cambiarPermisos } = useUsuarios();

  // Estados locales de permisos
  const [localPermisos, setLocalPermisos] = useState({});
  const [guardandoPermisos, setGuardandoPermisos] = useState({});

  // Estados comunes de notificacion
  const [notif, setNotif] = useState(null);

  const mostrarMensaje = (msg, tipo = 'success') => {
    setNotif({ msg, tipo });
    setTimeout(() => setNotif(null), 5000);
  };

  const getModulosPermitidos = (userId, defaultModulos) => {
    if (localPermisos[userId] !== undefined) {
      return localPermisos[userId];
    }
    return defaultModulos || [];
  };

  const handleToggleModulo = (userId, defaultModulos, modulo) => {
    const current = getModulosPermitidos(userId, defaultModulos);
    const updated = current.includes(modulo)
      ? current.filter(m => m !== modulo)
      : [...current, modulo];
    
    setLocalPermisos(prev => ({
      ...prev,
      [userId]: updated
    }));
  };

  const handleGuardarPermisos = async (u) => {
    const updated = localPermisos[u.id];
    if (!updated) return;
    
    setGuardandoPermisos(prev => ({ ...prev, [u.id]: true }));
    try {
      await cambiarPermisos(u.id, updated);
      mostrarMensaje(`Permisos de ${u.nombre} actualizados con éxito`);
      setLocalPermisos(prev => {
        const copy = { ...prev };
        delete copy[u.id];
        return copy;
      });
    } catch (err) {
      mostrarMensaje(err.message || 'Error al guardar permisos', 'error');
    } finally {
      setGuardandoPermisos(prev => ({ ...prev, [u.id]: false }));
    }
  };

  // ── MODALES ────────────────────────────────────────────────────────

  // Departamento
  const [showDeptoModal, setShowDeptoModal] = useState(false);
  const [editingDepto, setEditingDepto] = useState(null);
  const [deptoForm, setDeptoForm] = useState({ nombre: '', descripcion: '', activo: true });

  const abrirDeptoModal = (depto = null) => {
    if (depto) {
      setEditingDepto(depto);
      setDeptoForm({ nombre: depto.nombre, descripcion: depto.descripcion || '', activo: depto.activo });
    } else {
      setEditingDepto(null);
      setDeptoForm({ nombre: '', descripcion: '', activo: true });
    }
    setShowDeptoModal(true);
  };

  const guardarDepto = async e => {
    e.preventDefault();
    if (!deptoForm.nombre.trim()) return;
    try {
      await deptosHook.guardar(deptoForm, editingDepto?.id);
      mostrarMensaje(editingDepto ? 'Departamento actualizado correctamente' : 'Departamento creado correctamente');
      setShowDeptoModal(false);
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || 'Error al guardar departamento', 'error');
    }
  };

  const eliminarDepto = async id => {
    if (!window.confirm('¿Seguro que deseas eliminar este departamento?')) return;
    try {
      const msg = await deptosHook.eliminar(id);
      mostrarMensaje(msg || 'Departamento eliminado correctamente');
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || 'Error al eliminar departamento', 'error');
    }
  };

  // Categoria
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ nombre: '', descripcion: '', activo: true });

  const abrirCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ nombre: cat.nombre, descripcion: cat.descripcion || '', activo: cat.activo });
    } else {
      setEditingCat(null);
      setCatForm({ nombre: '', descripcion: '', activo: true });
    }
    setShowCatModal(true);
  };

  const guardarCat = async e => {
    e.preventDefault();
    if (!catForm.nombre.trim()) return;
    try {
      await catsHook.guardar(catForm, editingCat?.id);
      mostrarMensaje(editingCat ? 'Categoria actualizada correctamente' : 'Categoria creada correctamente');
      setShowCatModal(false);
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || 'Error al guardar categoria', 'error');
    }
  };

  const eliminarCat = async id => {
    if (!window.confirm('¿Seguro que deseas eliminar esta categoria? Todas las subcategorias se veran afectadas.')) return;
    try {
      const msg = await catsHook.eliminar(id);
      mostrarMensaje(msg || 'Categoria eliminada correctamente');
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || 'Error al eliminar categoria', 'error');
    }
  };

  // Subcategoria
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [targetCatId, setTargetCatId] = useState('');
  const [subForm, setSubForm] = useState({ nombre: '', descripcion: '', activo: true });

  const abrirSubModal = (catId, sub = null) => {
    setTargetCatId(catId);
    if (sub) {
      setEditingSub(sub);
      setSubForm({ nombre: sub.nombre, descripcion: sub.descripcion || '', activo: sub.activo });
    } else {
      setEditingSub(null);
      setSubForm({ nombre: '', descripcion: '', activo: true });
    }
    setShowSubModal(true);
  };

  const guardarSub = async e => {
    e.preventDefault();
    if (!subForm.nombre.trim()) return;
    try {
      await catsHook.guardarSub({ ...subForm, categoria_id: targetCatId }, editingSub?.id);
      mostrarMensaje(editingSub ? 'Subcategoria actualizada correctamente' : 'Subcategoria creada correctamente');
      setShowSubModal(false);
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || 'Error al guardar subcategoria', 'error');
    }
  };

  const eliminarSub = async id => {
    if (!window.confirm('¿Seguro que deseas eliminar esta subcategoria?')) return;
    try {
      const msg = await catsHook.eliminarSub(id);
      mostrarMensaje(msg || 'Subcategoria eliminada correctamente');
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || 'Error al eliminar subcategoria', 'error');
    }
  };

  // SLA
  const [showSlaModal, setShowSlaModal] = useState(false);
  const [editingSla, setEditingSla] = useState(null);
  const [slaForm, setSlaForm] = useState({
    nombre: '',
    categoria_id: '',
    prioridad: 'medio',
    tiempo_respuesta_min: 60,
    tiempo_resolucion_min: 1440,
    horario_laboral: true,
    hora_inicio: '08:00',
    hora_fin: '18:00',
    dias_laborales: [1, 2, 3, 4, 5],
    activo: true
  });

  const abrirSlaModal = (sla = null) => {
    if (sla) {
      setEditingSla(sla);
      setSlaForm({
        nombre: sla.nombre,
        categoria_id: sla.categoria_id || '',
        prioridad: sla.prioridad,
        tiempo_respuesta_min: sla.tiempo_respuesta_min,
        tiempo_resolucion_min: sla.tiempo_resolucion_min,
        horario_laboral: sla.horario_laboral,
        hora_inicio: sla.hora_inicio.substring(0, 5),
        hora_fin: sla.hora_fin.substring(0, 5),
        dias_laborales: sla.dias_laborales,
        activo: sla.activo
      });
    } else {
      setEditingSla(null);
      setSlaForm({
        nombre: '',
        categoria_id: '',
        prioridad: 'medio',
        tiempo_respuesta_min: 60,
        tiempo_resolucion_min: 1440,
        horario_laboral: true,
        hora_inicio: '08:00',
        hora_fin: '18:00',
        dias_laborales: [1, 2, 3, 4, 5],
        activo: true
      });
    }
    setShowSlaModal(true);
  };

  const handleSlaDayToggle = day => {
    setSlaForm(prev => {
      const arr = prev.dias_laborales.includes(day)
        ? prev.dias_laborales.filter(d => d !== day)
        : [...prev.dias_laborales, day];
      return { ...prev, dias_laborales: arr.sort() };
    });
  };

  const guardarSla = async e => {
    e.preventDefault();
    if (!slaForm.nombre.trim()) return;
    try {
      const payload = {
        ...slaForm,
        tiempo_respuesta_min: parseInt(slaForm.tiempo_respuesta_min),
        tiempo_resolucion_min: parseInt(slaForm.tiempo_resolucion_min)
      };
      await slasHook.guardar(payload, editingSla?.id);
      mostrarMensaje(editingSla ? 'SLA actualizado correctamente' : 'SLA creado correctamente');
      setShowSlaModal(false);
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || 'Error al guardar SLA', 'error');
    }
  };

  const eliminarSla = async id => {
    if (!window.confirm('¿Seguro que deseas eliminar este SLA?')) return;
    try {
      const msg = await slasHook.eliminar(id);
      mostrarMensaje(msg || 'SLA eliminado correctamente');
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || 'Error al eliminar SLA', 'error');
    }
  };

  // Estado de expansion en el arbol visual de categorias
  const [expandedCats, setExpandedCats] = useState({});

  const toggleCatExpand = id => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const inp = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors';
  const lbl = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <Layout>
      <div className="overflow-y-auto p-6 space-y-6" style={{ height: '100%' }}>
        
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-800 font-sans">Panel de Configuracion Global</h1>
            <p className="text-xs text-slate-400 mt-0.5">Ajustes generales · Departamentos, Matriz de Servicio y SLAs</p>
          </div>
        </div>

        {/* Notificaciones */}
        {notif && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium animate-fade-in ${
            notif.tipo === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {notif.tipo === 'error' ? <InfoIcon /> : <CheckCircleIcon />}
            <span>{notif.msg}</span>
          </div>
        )}

        {/* Pestañas de Navegacion (Tabs) */}
        <div className="flex border-b border-slate-200/80 space-x-1">
          {(() => {
            const tabsList = [
              { id: 'deptos', label: 'Areas y Departamentos', icon: <BuildingIcon /> },
              { id: 'categorias', label: 'Matriz de Categorias e Incidencias', icon: <FolderIcon /> },
              { id: 'slas', label: 'Tiempos de Acuerdos de Servicio (SLA)', icon: <ShieldIcon /> }
            ];
            if (user?.rol === 'admin') {
              tabsList.push({ id: 'permisos', label: 'Roles y Permisos de Módulos', icon: <KeyIcon /> });
            }
            return tabsList.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition-all outline-none"
                  style={{
                    borderColor: active ? ACCENT : 'transparent',
                    color: active ? '#1C2434' : '#64748B'
                  }}
                >
                  <span style={{ color: active ? ACCENT : '#8A99AD' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            });
          })()}
        </div>

        {/* ── TAB 1: DEPARTAMENTOS ──────────────────────────────────────── */}
        {activeTab === 'deptos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Registra y administra las dependencias funcionales de la organizacion.</p>
              <button
                onClick={() => abrirDeptoModal()}
                className="text-xs font-bold text-white px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all hover:opacity-90 shadow-sm"
                style={{ background: ACCENT }}
              >
                <PlusIcon /> Registrar Departamento
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Nombre</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Descripcion</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Estado</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Fecha de Creacion</th>
                      <th className="text-right font-semibold text-slate-400 px-4 py-3.5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deptosHook.loading && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400 animate-pulse font-medium">
                          Cargando informacion de departamentos desde el servidor...
                        </td>
                      </tr>
                    )}
                    {!deptosHook.loading && deptosHook.departamentos.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                          No hay departamentos registrados.
                        </td>
                      </tr>
                    )}
                    {!deptosHook.loading && deptosHook.departamentos.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-700">{d.nombre}</td>
                        <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">{d.descripcion || '--'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            d.activo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {d.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">
                          {new Date(d.creado_en).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => abrirDeptoModal(d)}
                            title="Editar departamento"
                            className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors inline-flex"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => eliminarDepto(d.id)}
                            title="Eliminar departamento"
                            className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex"
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MATRIZ DE CATEGORIAS ───────────────────────────────── */}
        {activeTab === 'categorias' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Define la estructura del arbol de incidentes del catalogo de servicios de soporte.</p>
              <button
                onClick={() => abrirCatModal()}
                className="text-xs font-bold text-white px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all hover:opacity-90 shadow-sm"
                style={{ background: ACCENT }}
              >
                <PlusIcon /> Registrar Categoria
              </button>
            </div>

            {catsHook.loading && (
              <div className="text-center py-12 text-slate-400 animate-pulse font-medium">
                Cargando matriz de servicios...
              </div>
            )}

            {!catsHook.loading && catsHook.categorias.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 font-medium">
                No hay categorias ni subcategorias en el arbol.
              </div>
            )}

            {!catsHook.loading && catsHook.categorias.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catsHook.categorias.map(cat => {
                  const expanded = expandedCats[cat.id];
                  return (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 flex flex-col justify-between">
                      <div>
                        {/* Cabecera Categoria */}
                        <div className="flex items-start justify-between">
                          <button
                            onClick={() => toggleCatExpand(cat.id)}
                            className="flex items-center gap-2 text-left font-bold text-slate-800 text-sm focus:outline-none"
                          >
                            <span className="text-slate-400">
                              {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                            </span>
                            <div>
                              <span>{cat.nombre}</span>
                              <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                cat.activo
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                {cat.activo ? 'Activa' : 'Inactiva'}
                              </span>
                            </div>
                          </button>
                          <div className="space-x-1 flex">
                            <button
                              onClick={() => abrirSubModal(cat.id)}
                              title="Registrar subcategoria"
                              className="p-1 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors inline-flex"
                            >
                              <PlusIcon />
                            </button>
                            <button
                              onClick={() => abrirCatModal(cat)}
                              title="Editar categoria"
                              className="p-1 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors inline-flex"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => eliminarCat(cat.id)}
                              title="Eliminar categoria"
                              className="p-1 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>

                        {/* Descripcion */}
                        <p className="text-xs text-slate-400 ml-6 mt-1 font-medium">
                          {cat.descripcion || 'Sin descripcion.'}
                        </p>
                      </div>

                      {/* Subcategorias anidadas (Expandido) */}
                      {expanded && (
                        <div className="mt-2 ml-6 pl-3 border-l-2 border-slate-100 space-y-2">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Subcategorias</p>
                          {cat.subcategorias.length === 0 && (
                            <p className="text-xs text-slate-300 italic">No hay subcategorias registradas.</p>
                          )}
                          {cat.subcategorias.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all">
                              <div>
                                <p className="text-xs font-semibold text-slate-700">{sub.nombre}</p>
                                {sub.descripcion && <p className="text-[10px] text-slate-400">{sub.descripcion}</p>}
                                <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[8px] font-bold mt-1 ${
                                  sub.activo
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-red-50 text-red-600'
                                }`}>
                                  {sub.activo ? 'Activa' : 'Inactiva'}
                                </span>
                              </div>
                              <div className="space-x-1 flex">
                                <button
                                  onClick={() => abrirSubModal(cat.id, sub)}
                                  title="Editar subcategoria"
                                  className="p-1 rounded bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors inline-flex border border-slate-200"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  onClick={() => eliminarSub(sub.id)}
                                  title="Eliminar subcategoria"
                                  className="p-1 rounded bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors inline-flex border border-slate-200"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: SLAs ────────────────────────────────────────────────── */}
        {activeTab === 'slas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Controla los limites maximos de respuesta (MTTA) y resolucion (MTTR) de incidentes segun criticidad.</p>
              <button
                onClick={() => abrirSlaModal()}
                className="text-xs font-bold text-white px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all hover:opacity-90 shadow-sm"
                style={{ background: ACCENT }}
              >
                <PlusIcon /> Registrar SLA Rule
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Nombre Acuerdo</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Categoria Relacionada</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Prioridad</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Min. Respuesta (MTTA)</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Min. Resolucion (MTTR)</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Horario Laboral</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Estado</th>
                      <th className="text-right font-semibold text-slate-400 px-4 py-3.5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slasHook.loading && (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 animate-pulse font-medium">
                          Obteniendo politicas de acuerdos de servicio activos...
                        </td>
                      </tr>
                    )}
                    {!slasHook.loading && slasHook.slas.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                          No hay politicas de SLA configuradas.
                        </td>
                      </tr>
                    )}
                    {!slasHook.loading && slasHook.slas.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-700">{s.nombre}</td>
                        <td className="px-4 py-3.5 text-slate-500 font-medium">{s.categoria_nombre || 'Todas las Categorias'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            PRIORIDAD_ESTILOS[s.prioridad]
                          }`}>
                            {s.prioridad}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">{s.tiempo_respuesta_min} min</td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">{s.tiempo_resolucion_min} min</td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {s.horario_laboral ? (
                            <span className="text-slate-600 font-medium">
                              Si ({s.hora_inicio.substring(0,5)} - {s.hora_fin.substring(0,5)})
                            </span>
                          ) : (
                            <span className="text-slate-400">24/7 Corrido</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.activo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {s.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => abrirSlaModal(s)}
                            title="Editar acuerdo de SLA"
                            className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors inline-flex"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => eliminarSla(s.id)}
                            title="Eliminar acuerdo de SLA"
                            className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex"
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: ROLES Y PERMISOS DE MÓDULOS ────────────────────────── */}
        {activeTab === 'permisos' && user?.rol === 'admin' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Administra los accesos dinamicos de los usuarios a los diferentes modulos del sistema.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Usuario / Empleado</th>
                      <th className="text-left font-semibold text-slate-400 px-4 py-3.5">Rol de Sistema</th>
                      <th className="text-center font-semibold text-slate-400 px-4 py-3.5">Tickets</th>
                      <th className="text-center font-semibold text-slate-400 px-4 py-3.5">Activos TI</th>
                      <th className="text-center font-semibold text-slate-400 px-4 py-3.5">Empleados</th>
                      <th className="text-center font-semibold text-slate-400 px-4 py-3.5">Compras</th>
                      <th className="text-center font-semibold text-slate-400 px-4 py-3.5">Ventas</th>
                      <th className="text-right font-semibold text-slate-400 px-4 py-3.5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingUsuarios && (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 animate-pulse font-medium">
                          Cargando usuarios y permisos...
                        </td>
                      </tr>
                    )}
                    {!loadingUsuarios && usuarios.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                          No hay usuarios registrados en el sistema.
                        </td>
                      </tr>
                    )}
                    {!loadingUsuarios && usuarios.map(u => {
                      const modulos = getModulosPermitidos(u.id, u.modulos_permitidos);
                      const hasChanges = localPermisos[u.id] !== undefined;
                      const guardando = guardandoPermisos[u.id] || false;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="font-bold text-slate-700">{u.nombre} {u.apellido}</p>
                              <p className="text-[10px] text-slate-400">{u.correo}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              u.rol === 'admin' 
                                ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                : u.rol.startsWith('tecnico') 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                  : 'bg-slate-50 text-slate-700 border border-slate-200'
                            }`}>
                              {u.rol}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={modulos.includes('tickets')}
                              onChange={() => handleToggleModulo(u.id, u.modulos_permitidos, 'tickets')}
                              disabled={guardando}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={modulos.includes('activos')}
                              onChange={() => handleToggleModulo(u.id, u.modulos_permitidos, 'activos')}
                              disabled={guardando}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={modulos.includes('empleados')}
                              onChange={() => handleToggleModulo(u.id, u.modulos_permitidos, 'empleados')}
                              disabled={guardando}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={modulos.includes('compras')}
                              onChange={() => handleToggleModulo(u.id, u.modulos_permitidos, 'compras')}
                              disabled={guardando}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={modulos.includes('ventas')}
                              onChange={() => handleToggleModulo(u.id, u.modulos_permitidos, 'ventas')}
                              disabled={guardando}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleGuardarPermisos(u)}
                              disabled={!hasChanges || guardando}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm ${
                                hasChanges && !guardando
                                  ? 'bg-[#3C50E0] text-white hover:opacity-90 cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                              }`}
                            >
                              {guardando ? 'Guardando...' : 'Guardar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── MODALES COMPONENTES ────────────────────────────────────────── */}

        {/* Modal Departamento */}
        {showDeptoModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowDeptoModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-sans">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">
                  {editingDepto ? 'Editar Departamento' : 'Nuevo Departamento'}
                </h2>
                <button type="button" onClick={() => setShowDeptoModal(false)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <CloseIcon />
                </button>
              </div>
              <form onSubmit={guardarDepto} className="px-6 py-5 space-y-4">
                <div>
                  <label className={lbl}>Nombre del Departamento <span className="text-red-500">*</span></label>
                  <input
                    value={deptoForm.nombre}
                    onChange={e => setDeptoForm(p => ({ ...p, nombre: e.target.value }))}
                    className={inp}
                    placeholder="Ej: Infraestructura y Redes"
                    required
                  />
                </div>
                <div>
                  <label className={lbl}>Descripcion</label>
                  <textarea
                    value={deptoForm.descripcion}
                    onChange={e => setDeptoForm(p => ({ ...p, descripcion: e.target.value }))}
                    className={inp + ' resize-none h-20'}
                    placeholder="Detalles sobre las responsabilidades del area..."
                  />
                </div>
                {editingDepto && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="deptoActivo"
                      checked={deptoForm.activo}
                      onChange={e => setDeptoForm(p => ({ ...p, activo: e.target.checked }))}
                      className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <label htmlFor="deptoActivo" className="text-xs font-semibold text-slate-600 select-none">
                      Habilitado e integrado en el sistema
                    </label>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowDeptoModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: ACCENT }}>
                    {editingDepto ? 'Guardar Cambios' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Categoria */}
        {showCatModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowCatModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-sans">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">
                  {editingCat ? 'Editar Categoria' : 'Nueva Categoria'}
                </h2>
                <button type="button" onClick={() => setShowCatModal(false)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <CloseIcon />
                </button>
              </div>
              <form onSubmit={guardarCat} className="px-6 py-5 space-y-4">
                <div>
                  <label className={lbl}>Nombre de la Categoria <span className="text-red-500">*</span></label>
                  <input
                    value={catForm.nombre}
                    onChange={e => setCatForm(p => ({ ...p, nombre: e.target.value }))}
                    className={inp}
                    placeholder="Ej: Conectividad y Redes"
                    required
                  />
                </div>
                <div>
                  <label className={lbl}>Descripcion</label>
                  <textarea
                    value={catForm.descripcion}
                    onChange={e => setCatForm(p => ({ ...p, descripcion: e.target.value }))}
                    className={inp + ' resize-none h-20'}
                    placeholder="Detalles sobre las incidencias clasificadas aqui..."
                  />
                </div>
                {editingCat && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="catActiva"
                      checked={catForm.activo}
                      onChange={e => setCatForm(p => ({ ...p, activo: e.target.checked }))}
                      className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <label htmlFor="catActiva" className="text-xs font-semibold text-slate-600 select-none">
                      Habilitar en el formulario de incidentes
                    </label>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: ACCENT }}>
                    {editingCat ? 'Guardar Cambios' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Subcategoria */}
        {showSubModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowSubModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-sans">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">
                  {editingSub ? 'Editar Subcategoria' : 'Nueva Subcategoria'}
                </h2>
                <button type="button" onClick={() => setShowSubModal(false)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <CloseIcon />
                </button>
              </div>
              <form onSubmit={guardarSub} className="px-6 py-5 space-y-4">
                <div>
                  <label className={lbl}>Nombre de la Subcategoria <span className="text-red-500">*</span></label>
                  <input
                    value={subForm.nombre}
                    onChange={e => setSubForm(p => ({ ...p, nombre: e.target.value }))}
                    className={inp}
                    placeholder="Ej: Accesos VPN fallidos"
                    required
                  />
                </div>
                <div>
                  <label className={lbl}>Descripcion</label>
                  <textarea
                    value={subForm.descripcion}
                    onChange={e => setSubForm(p => ({ ...p, descripcion: e.target.value }))}
                    className={inp + ' resize-none h-20'}
                    placeholder="Detalles sobre las incidencias clasificadas aqui..."
                  />
                </div>
                {editingSub && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="subActiva"
                      checked={subForm.activo}
                      onChange={e => setSubForm(p => ({ ...p, activo: e.target.checked }))}
                      className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <label htmlFor="subActiva" className="text-xs font-semibold text-slate-600 select-none">
                      Habilitar en el formulario de incidentes
                    </label>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowSubModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: ACCENT }}>
                    {editingSub ? 'Guardar Cambios' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal SLA */}
        {showSlaModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowSlaModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl font-sans">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">
                  {editingSla ? 'Editar Politica de SLA' : 'Nueva Politica de SLA'}
                </h2>
                <button type="button" onClick={() => setShowSlaModal(false)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <CloseIcon />
                </button>
              </div>
              <form onSubmit={guardarSla} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Nombre descriptivo <span className="text-red-500">*</span></label>
                    <input
                      value={slaForm.nombre}
                      onChange={e => setSlaForm(p => ({ ...p, nombre: e.target.value }))}
                      className={inp}
                      placeholder="Ej: SLA Critico - Hardware"
                      required
                    />
                  </div>
                  <div>
                    <label className={lbl}>Prioridad / Criticidad <span className="text-red-500">*</span></label>
                    <select
                      value={slaForm.prioridad}
                      onChange={e => setSlaForm(p => ({ ...p, prioridad: e.target.value }))}
                      className={inp}
                    >
                      <option value="critico">Critico</option>
                      <option value="alto">Alto</option>
                      <option value="medio">Medio</option>
                      <option value="bajo">Bajo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Categoria Asociada</label>
                    <select
                      value={slaForm.categoria_id}
                      onChange={e => setSlaForm(p => ({ ...p, categoria_id: e.target.value }))}
                      className={inp}
                    >
                      <option value="">-- Todas las Categorias (Global) --</option>
                      {catsHook.categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="slaActivo"
                      checked={slaForm.activo}
                      onChange={e => setSlaForm(p => ({ ...p, activo: e.target.checked }))}
                      className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <label htmlFor="slaActivo" className="text-xs font-semibold text-slate-600 select-none">
                      Habilitar regla de SLA
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>MTTA - Tiempo Limite de Respuesta (minutos) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={slaForm.tiempo_respuesta_min}
                      onChange={e => setSlaForm(p => ({ ...p, tiempo_respuesta_min: e.target.value }))}
                      className={inp}
                      required
                    />
                  </div>
                  <div>
                    <label className={lbl}>MTTR - Tiempo Limite de Resolucion (minutos) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={slaForm.tiempo_resolucion_min}
                      onChange={e => setSlaForm(p => ({ ...p, tiempo_resolucion_min: e.target.value }))}
                      className={inp}
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="horarioLab"
                      checked={slaForm.horario_laboral}
                      onChange={e => setSlaForm(p => ({ ...p, horario_laboral: e.target.checked }))}
                      className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <label htmlFor="horarioLab" className="text-xs font-bold text-slate-700 select-none">
                      Aplicar solo dentro del Calendario y Horario Laboral
                    </label>
                  </div>

                  {slaForm.horario_laboral && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Hora de Inicio de Operaciones</label>
                          <input
                            type="time"
                            value={slaForm.hora_inicio}
                            onChange={e => setSlaForm(p => ({ ...p, hora_inicio: e.target.value }))}
                            className={inp}
                            required
                          />
                        </div>
                        <div>
                          <label className={lbl}>Hora de Cierre de Operaciones</label>
                          <input
                            type="time"
                            value={slaForm.hora_fin}
                            onChange={e => setSlaForm(p => ({ ...p, hora_fin: e.target.value }))}
                            className={inp}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className={lbl}>Dias Laborables de Soporte</label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {DIAS_SEMANA.map(d => {
                            const selected = slaForm.dias_laborales.includes(d.valor);
                            return (
                              <button
                                type="button"
                                key={d.valor}
                                onClick={() => handleSlaDayToggle(d.valor)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                  selected
                                    ? 'bg-[#3C50E0] text-white border-[#3C50E0]'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {d.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowSlaModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: ACCENT }}>
                    {editingSla ? 'Guardar Cambios' : 'Registrar SLA'}
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

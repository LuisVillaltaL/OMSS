// RUTA: frontend/src/pages/Activos.jsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useActivos, useFormActivos } from '../hooks/useActivos';
import { crearActivo } from '../api/activos';

const ACCENT = '#3C50E0';

function HardwareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v3.75a3 3 0 0 1-3 3m-13.5 0h13.5m-13.5 0v3.75m13.5-3.75v3.75m-13.5 0a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-3.75m-16.5 0v3.75m3-3.75v3.75m9-3.75v3.75m3-3.75v3.75" />
    </svg>
  );
}

// ── ICONOS SVG NATIVOS DE TRAZO FINO (strokeWidth = 1.5) ──
function TagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 0 0 1.592 0l4.318-4.318a1.125 1.125 0 0 0 0-1.592L9.568 3.659A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.992l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    </svg>
  );
}

function BrandModelIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 0 0 1.592 0l4.318-4.318a1.125 1.125 0 0 0 0-1.592L9.568 3.659A2.25 2.25 0 0 0 9.568 3Z" />
    </svg>
  );
}

function SerialNumberIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
    </svg>
  );
}

function DeptIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18v3H3V3Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function AlertWarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
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

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
    </svg>
  );
}

// ── MODAL NUEVO ACTIVO TI (REDISEÑO PREMIUM) ───────────────────────────
function NuevoActivoModal({ onClose, onCreado }) {
  const { departamentos, empleados } = useFormActivos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    codigo: '', 
    nombre: '', 
    tipo: 'laptop', 
    marca: '', 
    modelo: '',
    numero_serie: '', 
    estado: 'operativo', 
    ubicacion: '',
    departamento_id: '', 
    asignado_a: '', 
    notas: ''
  });

  const handle = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.codigo.trim() || !form.nombre.trim() || !form.tipo) {
      setError('Código, Nombre y Tipo de activo son campos estrictamente obligatorios');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await crearActivo({
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        estado: form.estado,
        marca: form.marca.trim() || undefined,
        modelo: form.modelo.trim() || undefined,
        numero_serie: form.numero_serie.trim() || undefined,
        ubicacion: form.ubicacion.trim() || undefined,
        departamento_id: form.departamento_id || undefined,
        asignado_a: form.asignado_a || undefined,
        notas: form.notas.trim() || undefined
      });
      onCreado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el activo en la CMDB. Verifica las rutas del Backend.');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full bg-slate-50/40 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm';
  const lbl = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';
  const sectionTitle = 'text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1.5';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl font-sans border border-slate-100 animate-scale-up">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/20">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Registrar Activo de TI (CMDB)</h2>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Ingresa las especificaciones del nuevo dispositivo de hardware o software</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-150 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-red-700 font-medium animate-shake">
              <AlertWarningIcon />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Identificación y Clasificación */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-blue-50 text-blue-600"><DeviceIcon /></span>
              Identificación y Clasificación
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Código Único (Asset Tag) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <TagIcon />
                  </span>
                  <input name="codigo" value={form.codigo} onChange={handle} className={inp} placeholder="Ej: LPT-0034, SRV-01" required />
                </div>
              </div>
              
              <div>
                <label className={lbl}>Nombre del Activo <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <DeviceIcon />
                  </span>
                  <input name="nombre" value={form.nombre} onChange={handle} className={inp} placeholder="Ej: Laptop Luis Villalta" required />
                </div>
              </div>
            </div>

            <div>
              <label className={lbl}>Tipo de Activo <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <CogIcon />
                </span>
                <select name="tipo" value={form.tipo} onChange={handle} className={inp + ' cursor-pointer'}>
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="servidor">Servidor</option>
                  <option value="impresora">Impresora</option>
                  <option value="switch">Switch de Red</option>
                  <option value="router">Router</option>
                  <option value="ups">UPS / Respaldo</option>
                  <option value="monitor">Monitor</option>
                  <option value="telefono_ip">Teléfono IP</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Especificaciones del Fabricante */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-orange-50 text-orange-600"><BrandModelIcon /></span>
              Especificaciones de Hardware
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Marca</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <BrandModelIcon />
                  </span>
                  <input name="marca" value={form.marca} onChange={handle} className={inp} placeholder="Dell, HP" />
                </div>
              </div>
              
              <div>
                <label className={lbl}>Modelo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <BrandModelIcon />
                  </span>
                  <input name="modelo" value={form.modelo} onChange={handle} className={inp} placeholder="Latitude 5430" />
                </div>
              </div>
              
              <div>
                <label className={lbl}>Número de Serie</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <SerialNumberIcon />
                  </span>
                  <input name="numero_serie" value={form.numero_serie} onChange={handle} className={inp} placeholder="S/N de fábrica" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Custodia y Responsabilidad */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600"><UserIcon /></span>
              Custodia y Responsabilidad
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Departamento Asignado</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <DeptIcon />
                  </span>
                  <select name="departamento_id" value={form.departamento_id} onChange={handle} className={inp + ' cursor-pointer'}>
                    <option value="">— Ninguno / En Stock —</option>
                    {departamentos && departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className={lbl}>Custodio / Responsable</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <UserIcon />
                  </span>
                  <select name="asignado_a" value={form.asignado_a} onChange={handle} className={inp + ' cursor-pointer'}>
                    <option value="">— Sin asignar —</option>
                    {empleados && empleados.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} ({e.correo ? e.correo.split('@')[0] : 'Sin correo'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Estado y Ubicación Física */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600"><MapPinIcon /></span>
              Ubicación y Operatividad
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Estado de Operación <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <ClipboardIcon />
                  </span>
                  <select name="estado" value={form.estado} onChange={handle} className={inp + ' cursor-pointer'}>
                    <option value="operativo">Operativo</option>
                    <option value="mantenimiento">En Mantenimiento</option>
                    <option value="dado_de_baja">Dado de Baja</option>
                    <option value="extraviado">Extraviado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Ubicación Física</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <MapPinIcon />
                  </span>
                  <input name="ubicacion" value={form.ubicacion} onChange={handle} className={inp} placeholder="Edificio Central, Piso 2, Oficina TI" />
                </div>
              </div>
            </div>

            <div>
              <label className={lbl}>Notas de Configuración y Auditoría</label>
              <textarea name="notas" value={form.notas} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm resize-none h-16" placeholder="Detalles de licencias, especificaciones adicionales..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60 hover:opacity-90 shadow-md flex items-center justify-center gap-1.5" style={{ background: ACCENT }}>
              {loading ? 'Registrando...' : (
                <>
                  <PlusIcon /> Guardar en Inventario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── COMPONENTE DE LA PÁGINA PRINCIPAL ────────────────────────────────
export default function ActivosPage() {
  const { activos, loading, error, recargar } = useActivos();
  const [showModal, setShowModal] = useState(false);

  const ESTADO_ESTILOS = {
    operativo: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    mantenimiento: 'bg-amber-50 text-amber-700 border border-amber-100',
    dado_de_baja: 'bg-slate-100 text-slate-600 border border-slate-200',
    extraviado: 'bg-red-50 text-red-700 border border-red-100',
  };

  const ESTADO_LABELS = {
    operativo: 'Operativo',
    mantenimiento: 'Mantenimiento',
    dado_de_baja: 'Dado de Baja',
    extraviado: 'Extraviado'
  };

  return (
    <Layout>
      <div className="overflow-y-auto p-6 space-y-5" style={{ height: '100%' }}>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-800">Control de Activos TI (CMDB)</h1>
            <p className="text-xs text-slate-400 mt-0.5">Gestión de configuración · Infraestructura, Hardware y Licencias</p>
          </div>
          <div className="flex gap-2">
            <button onClick={recargar} className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm">
              <SyncIcon /> Sincronizar
            </button>
            <button onClick={() => setShowModal(true)} className="text-xs font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 shadow-sm flex items-center gap-1.5" style={{ background: ACCENT }}>
              <PlusIcon /> Registrar Activo
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas Dinámicas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Inventario Total', value: activos ? activos.length : 0, desc: 'Activos en base de datos' },
            { title: 'Sistemas Disponibles', value: activos ? activos.filter(a => a.estado === 'operativo').length : 0, desc: 'En producción operativa' },
            { title: 'Incidentes Activos', value: activos ? activos.reduce((acc, curr) => acc + parseInt(curr.total_tickets || 0), 0) : 0, desc: 'Tickets vinculados' },
          ].map((card, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.desc}</p>
              </div>
              <div className="text-slate-300 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <HardwareIcon />
              </div>
            </div>
          ))}
        </div>

        {/* Tabla CMDB */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Código', 'Nombre del Activo', 'Componente/Tipo', 'Marca / Modelo', 'Estado', 'Departamento', 'Custodio / Asignado', 'Tickets'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400 animate-pulse font-medium">Consultando registros seguros desde la base de datos...</td></tr>
                )}
                {!loading && (!activos || activos.length === 0) && (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400 font-medium">No hay ningún dispositivo registrado en el inventario.</td></tr>
                )}
                {activos && activos.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{a.codigo}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{a.nombre}</td>
                    <td className="px-4 py-3.5 text-slate-400 capitalize">{a.tipo}</td>
                    <td className="px-4 py-3.5 text-slate-500">{a.marca} {a.modelo ? `— ${a.modelo}` : ''}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${ESTADO_ESTILOS[a.estado]}`}>
                        {ESTADO_LABELS[a.estado] || a.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{a.departamento || 'Global'}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {a.asignado_a_nombre ? (
                        <div>
                          <p>{a.asignado_a_nombre}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{a.asignado_a_correo}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold ${parseInt(a.total_tickets) > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                        {a.total_tickets || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Renderizado Condicional del Formulario */}
      {showModal && (
        <NuevoActivoModal 
          onClose={() => setShowModal(false)} 
          onCreado={() => recargar()} 
        />
      )}
    </Layout>
  );
}
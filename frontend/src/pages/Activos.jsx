// RUTA: frontend/src/pages/Activos.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useActivos, useFormActivos } from '../hooks/useActivos';
import { useLicencias } from '../hooks/useLicencias';
import { crearActivo, actualizarActivo } from '../api/activos';
import { crearLicencia, actualizarLicencia, eliminarLicencia } from '../api/licencias';

const ACCENT = '#3C50E0';

// ── AUXILIAR: Formateador de Fechas sin desfase de zona horaria ──
function formatFecha(dateStr) {
  if (!dateStr) return '—';
  try {
    const clean = dateStr.split('T')[0];
    const [year, month, day] = clean.split('-');
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}

// ── AUXILIAR: Formateador de Moneda ──
function formatMoneda(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return '—';
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(valor);
}

// ── ICONOS SVG NATIVOS DE TRAZO FINO (strokeWidth = 1.5) ──
function HardwareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v3.75a3 3 0 0 1-3 3m-13.5 0h13.5m-13.5 0v3.75m13.5-3.75v3.75m-13.5 0a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-3.75m-16.5 0v3.75m3-3.75v3.75m9-3.75v3.75m3-3.75v3.75" />
    </svg>
  );
}

function SoftwareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  );
}

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

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L3 21.825l1.13-3.897a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
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


// ── MODAL REGISTRO / EDICIÓN ACTIVO TI ─────────────────────────────────
function ActivoFormModal({ onClose, onGuardado, activo = null }) {
  const { departamentos, empleados } = useFormActivos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    codigo: activo?.codigo || '', 
    nombre: activo?.nombre || '', 
    tipo: activo?.tipo || 'laptop', 
    marca: activo?.marca || '', 
    modelo: activo?.modelo || '',
    numero_serie: activo?.numero_serie || '', 
    estado: activo?.estado || 'operativo', 
    fecha_compra: activo?.fecha_compra ? activo.fecha_compra.split('T')[0] : '',
    fecha_garantia: activo?.fecha_garantia ? activo.fecha_garantia.split('T')[0] : '',
    costo_adq: activo?.costo_adq || '',
    ubicacion: activo?.ubicacion || '',
    departamento_id: activo?.departamento_id || '', 
    asignado_a: activo?.asignado_a || '', 
    notas: activo?.notas || ''
  });

  const handle = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.codigo.trim() || !form.nombre.trim() || !form.tipo) {
      setError('Código, Nombre y Tipo de activo son obligatorios');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        estado: form.estado,
        marca: form.marca.trim() || undefined,
        modelo: form.modelo.trim() || undefined,
        numero_serie: form.numero_serie.trim() || undefined,
        fecha_compra: form.fecha_compra || undefined,
        fecha_garantia: form.fecha_garantia || undefined,
        costo_adq: form.costo_adq ? parseFloat(form.costo_adq) : undefined,
        ubicacion: form.ubicacion.trim() || undefined,
        departamento_id: form.departamento_id || undefined,
        asignado_a: form.asignado_a || undefined,
        notas: form.notas.trim() || undefined
      };

      if (activo?.id) {
        await actualizarActivo(activo.id, payload);
      } else {
        await crearActivo(payload);
      }
      onGuardado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el activo en la base de datos.');
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
            <h2 className="text-sm font-bold text-slate-800">{activo ? 'Editar Activo de TI (CMDB)' : 'Registrar Activo de TI (CMDB)'}</h2>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Ingresa las especificaciones del nuevo dispositivo de hardware o infraestructura</p>
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

          {/* 3. Fechas, Finanzas y Garantía (NUEVA SECCIÓN DE CICLO DE VIDA) */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600"><CalendarIcon /></span>
              Ciclo de Vida y Finanzas
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Fecha de Compra</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <CalendarIcon />
                  </span>
                  <input type="date" name="fecha_compra" value={form.fecha_compra} onChange={handle} className={inp} />
                </div>
              </div>

              <div>
                <label className={lbl}>Vence Garantía</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <CalendarIcon />
                  </span>
                  <input type="date" name="fecha_garantia" value={form.fecha_garantia} onChange={handle} className={inp} />
                </div>
              </div>

              <div>
                <label className={lbl}>Costo Adq. (Q)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <DollarIcon />
                  </span>
                  <input type="number" name="costo_adq" value={form.costo_adq} onChange={handle} className={inp} placeholder="0.00" step="0.01" min="0" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Custodia y Responsabilidad */}
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

          {/* 5. Estado y Ubicación Física */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-purple-50 text-purple-600"><MapPinIcon /></span>
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
              <textarea name="notas" value={form.notas} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm resize-none h-16" placeholder="Detalles de configuración de hardware, IP estática, periféricos incluidos..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60 hover:opacity-90 shadow-md flex items-center justify-center gap-1.5" style={{ background: ACCENT }}>
              {loading ? 'Guardando...' : (
                <>
                  <PlusIcon /> {activo ? 'Actualizar Activo' : 'Guardar en Inventario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ── MODAL REGISTRO / EDICIÓN LICENCIA SOFTWARE ─────────────────────────
function LicenciaFormModal({ onClose, onGuardado, licencia = null }) {
  const { departamentos, empleados } = useFormActivos();
  const { activos } = useActivos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    codigo: licencia?.codigo || '',
    nombre: licencia?.nombre || '',
    clave: licencia?.clave || '',
    tipo: licencia?.tipo || 'Suscripción',
    fecha_compra: licencia?.fecha_compra ? licencia.fecha_compra.split('T')[0] : '',
    fecha_expiracion: licencia?.fecha_expiracion ? licencia.fecha_expiracion.split('T')[0] : '',
    costo: licencia?.costo || '',
    cantidad_total: licencia?.cantidad_total || 1,
    cantidad_usada: licencia?.cantidad_usada || 0,
    proveedor: licencia?.proveedor || '',
    departamento_id: licencia?.departamento_id || '',
    asignado_a: licencia?.asignado_a || '',
    activo_id: licencia?.activo_id || '',
    notas: licencia?.notas || ''
  });

  const handle = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.codigo.trim() || !form.nombre.trim() || !form.cantidad_total) {
      setError('Código, Nombre de Software y Cantidad Total son campos requeridos');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        clave: form.clave.trim() || undefined,
        tipo: form.tipo,
        fecha_compra: form.fecha_compra || undefined,
        fecha_expiracion: form.fecha_expiracion || undefined,
        costo: form.costo ? parseFloat(form.costo) : undefined,
        cantidad_total: parseInt(form.cantidad_total),
        cantidad_usada: parseInt(form.cantidad_usada),
        proveedor: form.proveedor.trim() || undefined,
        departamento_id: form.departamento_id || undefined,
        asignado_a: form.asignado_a || undefined,
        activo_id: form.activo_id || undefined,
        notas: form.notas.trim() || undefined
      };

      if (licencia?.id) {
        await actualizarLicencia(licencia.id, payload);
      } else {
        await crearLicencia(payload);
      }
      onGuardado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la licencia en la base de datos.');
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
            <h2 className="text-sm font-bold text-slate-800">{licencia ? 'Editar Licencia de Software' : 'Registrar Licencia de Software'}</h2>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Ingresa las especificaciones de la licencia, claves y asignaciones vigentes</p>
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

          {/* 1. Datos Básicos del Software */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-blue-50 text-blue-600"><SoftwareIcon /></span>
              Especificaciones de Software
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Código de Control <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <TagIcon />
                  </span>
                  <input name="codigo" value={form.codigo} onChange={handle} className={inp} placeholder="Ej: LIC-001, O365-MKT" required />
                </div>
              </div>
              
              <div>
                <label className={lbl}>Nombre del Software <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <SoftwareIcon />
                  </span>
                  <input name="nombre" value={form.nombre} onChange={handle} className={inp} placeholder="Ej: Microsoft Office 365 Business" required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Clave de Licencia / Serial</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <KeyIcon />
                  </span>
                  <input name="clave" value={form.clave} onChange={handle} className={inp} placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" />
                </div>
              </div>
              
              <div>
                <label className={lbl}>Tipo de Contrato / Licencia</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <ClipboardIcon />
                  </span>
                  <select name="tipo" value={form.tipo} onChange={handle} className={inp + ' cursor-pointer'}>
                    <option value="Suscripción">Suscripción Mensual/Anual</option>
                    <option value="Perpetua">Perpetua (Un pago)</option>
                    <option value="Libre/OEM">Libre / OEM Preinstalado</option>
                    <option value="Prueba">De Evaluación / Demo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Capacidad, Finanzas y Fechas */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600"><CalendarIcon /></span>
              Capacidades, Vigencia y Finanzas
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Cantidad Total <span className="text-red-500">*</span></label>
                <input type="number" name="cantidad_total" value={form.cantidad_total} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" min="1" required />
              </div>

              <div>
                <label className={lbl}>Cantidad Usada</label>
                <input type="number" name="cantidad_usada" value={form.cantidad_usada} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" min="0" />
              </div>

              <div>
                <label className={lbl}>Costo Licencia (Q)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <DollarIcon />
                  </span>
                  <input type="number" name="costo" value={form.costo} onChange={handle} className={inp} placeholder="0.00" step="0.01" min="0" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Fecha de Compra</label>
                <input type="date" name="fecha_compra" value={form.fecha_compra} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
              </div>

              <div>
                <label className={lbl}>Fecha Expiración</label>
                <input type="date" name="fecha_expiracion" value={form.fecha_expiracion} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
              </div>

              <div>
                <label className={lbl}>Proveedor / Partner</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <UserIcon />
                  </span>
                  <input name="proveedor" value={form.proveedor} onChange={handle} className={inp} placeholder="Microsoft, Adobe..." />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Asignación y Relación */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600"><UserIcon /></span>
              Asignación y Custodia
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Departamento</label>
                <select name="departamento_id" value={form.departamento_id} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm cursor-pointer">
                  <option value="">— Global / TI —</option>
                  {departamentos && departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              
              <div>
                <label className={lbl}>Custodio / Persona</label>
                <select name="asignado_a" value={form.asignado_a} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm cursor-pointer">
                  <option value="">— Sin asignar —</option>
                  {empleados && empleados.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={lbl}>Equipo Asignado</label>
                <select name="activo_id" value={form.activo_id} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm cursor-pointer">
                  <option value="">— Ninguno / Virtual —</option>
                  {activos && activos.map(a => (
                    <option key={a.id} value={a.id}>{a.codigo} - {a.nombre.slice(0, 15)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={lbl}>Notas y Términos de Licencia</label>
              <textarea name="notas" value={form.notas} onChange={handle} className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm resize-none h-16" placeholder="Detalles de renovación automática, portal de administración, descargas..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60 hover:opacity-90 shadow-md flex items-center justify-center gap-1.5" style={{ background: ACCENT }}>
              {loading ? 'Guardando...' : (
                <>
                  <PlusIcon /> {licencia ? 'Actualizar Licencia' : 'Guardar Licencia'}
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
  const { activos, loading: loadingActivos, error: errorActivos, recargar: recargarActivos } = useActivos();
  const { licencias, loading: loadingLicencias, error: errorLicencias, recargar: recargarLicencias } = useLicencias();

  // Control de sub-menú (tabs internos sincronizados con la URL)
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'software' ? 'software' : 'hardware';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Controladores de Modales
  const [showActivoModal, setShowActivoModal] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState(null);

  const [showLicenciaModal, setShowLicenciaModal] = useState(false);
  const [selectedLicencia, setSelectedLicencia] = useState(null);

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

  // ── LOGICA DE ESTIMACIÓN DE RENOVACIÓN DE HARDWARE (Ciclo sugerido 3 años = 1095 días) ──
  const getRenovacionTag = (fechaCompra) => {
    if (!fechaCompra) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1"></span>
          Sin fecha
        </span>
      );
    }
    const compra = new Date(fechaCompra);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - compra);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const anios = diffDays / 365.25;

    if (anios < 2.0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Vigente ({anios.toFixed(1)}a)
        </span>
      );
    } else if (anios < 3.0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Próximo ({anios.toFixed(1)}a)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
          Renovar ({anios.toFixed(1)}a)
        </span>
      );
    }
  };

  // ── LOGICA DE ESTADO DE GARANTIA DE HARDWARE ──
  const getGarantiaTag = (fechaGarantia) => {
    if (!fechaGarantia) {
      return <span className="text-slate-350 text-[11px] font-medium">—</span>;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaGarantia);
    vencimiento.setHours(0, 0, 0, 0);

    if (vencimiento >= hoy) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded font-bold bg-green-50 text-green-700 border border-green-150 text-[10px]">
          <span className="w-1.2 h-1.2 rounded-full bg-green-500 mr-1"></span>
          Cubierto
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded font-bold bg-red-50 text-red-650 border border-red-150 text-[10px]">
          <span className="w-1.2 h-1.2 rounded-full bg-red-500 mr-1"></span>
          Expirada
        </span>
      );
    }
  };

  // ── LOGICA DE VENCIMIENTO DE LICENCIAS DE SOFTWARE (30 días de holgura) ──
  const getExpiracionLicenciaTag = (fechaExp) => {
    if (!fechaExp) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
          Perpetua
        </span>
      );
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const expiracion = new Date(fechaExp);
    expiracion.setHours(0, 0, 0, 0);

    const diffTime = expiracion - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
          Vencida ({Math.abs(diffDays)}d)
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Próxima ({diffDays}d)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Activa ({diffDays}d)
        </span>
      );
    }
  };

  const handleSincronizar = () => {
    if (activeTab === 'hardware') recargarActivos();
    else recargarLicencias();
  };

  const handleEliminarLicencia = async (id, codigo) => {
    if (window.confirm(`¿Estás completamente seguro que deseas dar de baja y eliminar la licencia ${codigo}?`)) {
      try {
        await eliminarLicencia(id);
        recargarLicencias();
      } catch (err) {
        alert('Error al intentar eliminar la licencia seleccionada.');
      }
    }
  };

  return (
    <Layout>
      <div className="overflow-y-auto p-6 space-y-5" style={{ height: '100%' }}>
        
        {/* Encabezado General Sincronizado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-800">
              {activeTab === 'hardware' ? 'Control de Activos TI (CMDB)' : 'Control de Licencias de Software'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'hardware' 
                ? 'Gestión de configuración · Ciclos de vida, especificaciones y renovación de hardware' 
                : 'Gestión de configuración · Contratos, claves de producto y asignaciones de software'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSincronizar} className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm">
              <SyncIcon /> Sincronizar
            </button>
            {activeTab === 'hardware' ? (
              <button onClick={() => { setSelectedActivo(null); setShowActivoModal(true); }} className="text-xs font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 shadow-sm flex items-center gap-1.5" style={{ background: ACCENT }}>
                <PlusIcon /> Registrar Activo
              </button>
            ) : (
              <button onClick={() => { setSelectedLicencia(null); setShowLicenciaModal(true); }} className="text-xs font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 shadow-sm flex items-center gap-1.5" style={{ background: ACCENT }}>
                <PlusIcon /> Registrar Licencia
              </button>
            )}
          </div>
        </div>

        {/* ── SECCIÓN 1: VISTA DE EQUIPOS (HARDWARE) ── */}
        {activeTab === 'hardware' && (
          <>
            {/* Tarjetas de Métricas de Hardware */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in">
              {[
                { title: 'Inventario Total', value: activos ? activos.length : 0, desc: 'Equipos físicos registrados', icon: <HardwareIcon /> },
                { title: 'Sistemas Activos', value: activos ? activos.filter(a => a.estado === 'operativo').length : 0, desc: 'En producción operativa', icon: <HardwareIcon /> },
                { title: 'Renovación Sugerida', value: activos ? activos.filter(a => {
                  if (!a.fecha_compra) return false;
                  return (Math.abs(new Date() - new Date(a.fecha_compra)) / (1000 * 60 * 60 * 24) / 365.25) >= 3.0;
                }).length : 0, desc: 'Ciclo útil > 3 años', icon: <AlertWarningIcon /> },
                { title: 'Costo Total Adq.', value: formatMoneda(activos ? activos.reduce((acc, curr) => acc + parseFloat(curr.costo_adq || 0), 0) : 0), desc: 'Inversión en hardware', icon: <DollarIcon /> },
              ].map((card, idx) => (
                <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{card.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{card.desc}</p>
                  </div>
                  <div className="text-slate-400 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla de Dispositivos (Hardware) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Código', 'Nombre del Activo', 'Componente/Tipo', 'Marca / Modelo', 'Estado', 'Fecha Compra', 'Ciclo Vida', 'Garantía', 'Ubicación', 'Custodio', 'Costo'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingActivos && (
                      <tr><td colSpan={11} className="text-center py-12 text-slate-400 animate-pulse font-medium">Consultando inventario de hardware de forma segura en la base de datos...</td></tr>
                    )}
                    {!loadingActivos && (!activos || activos.length === 0) && (
                      <tr><td colSpan={11} className="text-center py-12 text-slate-400 font-medium">No hay ningún dispositivo de hardware registrado en el inventario.</td></tr>
                    )}
                    {activos && activos.map(a => (
                      <tr 
                        key={a.id} 
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => { setSelectedActivo(a); setShowActivoModal(true); }}
                        title="Haz click para editar las especificaciones de este activo"
                      >
                        <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{a.codigo}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">{a.nombre}</td>
                        <td className="px-4 py-3.5 text-slate-400 capitalize">{a.tipo}</td>
                        <td className="px-4 py-3.5 text-slate-500">{a.marca} {a.modelo ? `— ${a.modelo}` : ''}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${ESTADO_ESTILOS[a.estado]}`}>
                            {ESTADO_LABELS[a.estado] || a.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-medium">{formatFecha(a.fecha_compra)}</td>
                        <td className="px-4 py-3.5 font-medium">{getRenovacionTag(a.fecha_compra)}</td>
                        <td className="px-4 py-3.5 font-medium">{getGarantiaTag(a.fecha_garantia)}</td>
                        <td className="px-4 py-3.5 text-slate-500">{a.ubicacion || 'En Stock'}</td>
                        <td className="px-4 py-3.5 text-slate-650 font-semibold">
                          {a.asignado_a_nombre ? (
                            <div>
                              <p>{a.asignado_a_nombre}</p>
                              <p className="text-[10px] text-slate-450 font-normal">{a.asignado_a_correo}</p>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-normal">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-700">{formatMoneda(a.costo_adq)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── SECCIÓN 2: VISTA DE CONTROL DE LICENCIAS (SOFTWARE) ── */}
        {activeTab === 'software' && (
          <>
            {/* Tarjetas de Métricas de Licencias */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in">
              {[
                { title: 'Contratos Software', value: licencias ? licencias.length : 0, desc: 'Licencias de software en catálogo', icon: <SoftwareIcon /> },
                { title: 'Licencias Asignadas', value: licencias ? licencias.reduce((acc, curr) => acc + (curr.cantidad_usada || 0), 0) : 0, desc: 'Instalaciones activas', icon: <UserIcon /> },
                { title: 'Expiración Inminente', value: licencias ? licencias.filter(l => {
                  if (!l.fecha_expiracion) return false;
                  const diff = new Date(l.fecha_expiracion) - new Date();
                  return Math.ceil(diff / (1000 * 60 * 60 * 24)) <= 30;
                }).length : 0, desc: 'Expira en los próximos 30 días', icon: <AlertWarningIcon /> },
                { title: 'Inversión en Software', value: formatMoneda(licencias ? licencias.reduce((acc, curr) => acc + parseFloat(curr.costo || 0), 0) : 0), desc: 'Costo total de licenciamiento', icon: <DollarIcon /> },
              ].map((card, idx) => (
                <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{card.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{card.desc}</p>
                  </div>
                  <div className="text-slate-400 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla de Licencias (Software) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Código', 'Nombre del Software / Licencia', 'Contrato / Tipo', 'Clave / Serial', 'Capacidad (Instaladas / Total)', 'Fecha Compra', 'Expiración', 'Proveedor', 'Destino / Custodia', 'Hardware Vinculado', 'Costo', 'Acciones'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingLicencias && (
                      <tr><td colSpan={12} className="text-center py-12 text-slate-400 animate-pulse font-medium">Consultando catálogo de licencias en la base de datos...</td></tr>
                    )}
                    {!loadingLicencias && (!licencias || licencias.length === 0) && (
                      <tr><td colSpan={12} className="text-center py-12 text-slate-400 font-medium">No hay ninguna licencia registrada en el inventario de software.</td></tr>
                    )}
                    {licencias && licencias.map(l => (
                      <tr 
                        key={l.id} 
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono font-bold text-purple-600">{l.codigo}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">{l.nombre}</td>
                        <td className="px-4 py-3.5 text-slate-500 font-medium">{l.tipo || 'Suscripción'}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-400 font-medium select-all" title="Clave de producto corporativo">{l.clave || '— OEM —'}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              l.cantidad_usada >= l.cantidad_total ? 'bg-red-50 text-red-650' : 'bg-blue-50 text-blue-650'
                            }`}>
                              {l.cantidad_usada} / {l.cantidad_total}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">({((l.cantidad_usada / l.cantidad_total) * 100).toFixed(0)}%)</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">{formatFecha(l.fecha_compra)}</td>
                        <td className="px-4 py-3.5 font-medium">{getExpiracionLicenciaTag(l.fecha_expiracion)}</td>
                        <td className="px-4 py-3.5 text-slate-500 font-medium">{l.proveedor || 'Directo'}</td>
                        <td className="px-4 py-3.5 text-slate-650 font-semibold">
                          {l.asignado_a_nombre ? (
                            <div>
                              <p>{l.asignado_a_nombre}</p>
                              <p className="text-[10px] text-slate-450 font-normal">{l.departamento_nombre || 'Asignación Fija'}</p>
                            </div>
                          ) : l.departamento_nombre ? (
                            <span className="text-slate-600 font-medium">{l.departamento_nombre} (Depto)</span>
                          ) : (
                            <span className="text-slate-300 font-normal">Global</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-600">
                          {l.activo_codigo ? (
                            <span className="font-mono text-blue-650 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100/50" title={l.activo_nombre}>
                              🖥️ {l.activo_codigo}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-700">{formatMoneda(l.costo)}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setSelectedLicencia(l); setShowLicenciaModal(true); }}
                              className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                              title="Editar contrato"
                            >
                              <EditIcon />
                            </button>
                            <button 
                              onClick={() => handleEliminarLicencia(l.id, l.codigo)}
                              className="w-7 h-7 bg-red-50 text-red-650 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                              title="Dar de baja y eliminar"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── MODALES DE HARDWARE (REGISTRO/EDICIÓN) ── */}
      {showActivoModal && (
        <ActivoFormModal 
          onClose={() => { setShowActivoModal(false); setSelectedActivo(null); }} 
          onGuardado={() => recargarActivos()} 
          activo={selectedActivo}
        />
      )}

      {/* ── MODALES DE LICENCIAS (REGISTRO/EDICIÓN) ── */}
      {showLicenciaModal && (
        <LicenciaFormModal 
          onClose={() => { setShowLicenciaModal(false); setSelectedLicencia(null); }} 
          onGuardado={() => recargarLicencias()} 
          licencia={selectedLicencia}
        />
      )}

    </Layout>
  );
}
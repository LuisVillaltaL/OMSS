import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { PriorityBadge, StatusBadge, SlaBar } from '../components/ui/Badges';
import { useTickets, useTicket, useCatalogo } from '../hooks/useTickets';
import { crearTicket } from '../api/tickets';
import { useAuth } from '../context/AuthContext';

const ACCENT = '#3C50E0';

// ── ICONOS SVG NATIVOS DE TRAZO FINO (strokeWidth = 1.5/2) ──
function TicketIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.6-3.36 1.814-1.813a1.5 1.5 0 0 0-1.06-2.557H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 16.5v-3.75" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

function ChannelIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
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

function DeviceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13l-3.93.985a.75.75 0 0 1-.902-.902l.985-3.93a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
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

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function AlertWarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-600 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-GT', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

function tiempoRelativo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

// ── Modal nuevo ticket (REDISEÑO PREMIUM) ─────────────────────────
function NuevoTicketModal({ onClose, onCreado }) {
  const { user } = useAuth();
  const { catalogo } = useCatalogo();
  const [form, setForm] = useState({
    titulo: '', descripcion: '', prioridad: 'medio',
    canal: 'portal_web', categoria_id: '', subcategoria_id: '',
    reportado_por: user?.id || '', asignado_a: '', activo_id: '', imagen: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subcat = catalogo.subcategorias.filter(s => s.categoria_id === form.categoria_id);

  const handle = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen no puede pesar más de 10 MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(p => ({ ...p, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.categoria_id || !form.reportado_por) {
      setError('Título, categoría y usuario afectado son campos obligatorios');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await crearTicket({
        ...form,
        subcategoria_id: form.subcategoria_id || undefined,
        asignado_a: form.asignado_a || undefined,
        activo_id: form.activo_id || undefined,
      });
      onCreado(r);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el ticket de soporte');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full bg-slate-50/40 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm';
  const lbl = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';
  const sectionTitle = 'text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1.5';

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl font-sans border border-slate-100 animate-scale-up">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/20">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Nuevo Ticket de Incidente</h2>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Registra un nuevo incidente o solicitud de servicio</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
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

          {/* 1. Información del Incidente */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-blue-50 text-blue-600"><TicketIcon /></span>
              Información del Incidente
            </h3>

            <div>
              <label className={lbl}>Título del Incidente <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <PencilIcon />
                </span>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handle}
                  className={inp}
                  placeholder="Ej: No se puede acceder a la base de datos de producción..."
                  required
                />
              </div>
            </div>

            <div>
              <label className={lbl}>Descripción Detallada</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handle}
                className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm resize-none h-20"
                placeholder="Pasos para reproducir, impacto operativo, mensajes de error..."
              />
            </div>

            <div>
              <label className={lbl}>Adjuntar Imagen de Evidencia</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="evidence-image-upload"
                />
                <label
                  htmlFor="evidence-image-upload"
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  {form.imagen ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                </label>
                {form.imagen && (
                  <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center p-1 gap-2 max-w-[250px]">
                    <img
                      src={form.imagen}
                      alt="Vista previa"
                      className="w-8 h-8 object-cover rounded-lg"
                    />
                    <span className="text-[10px] text-slate-500 truncate flex-1 font-semibold">Evidencia seleccionada</span>
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, imagen: null }))}
                      className="text-red-500 hover:text-red-700 font-bold text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Categorización y Prioridad */}
          <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className={sectionTitle}>
              <span className="p-1 rounded-lg bg-orange-50 text-orange-600"><FolderIcon /></span>
              Categorización y Prioridad
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Categoría <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <FolderIcon />
                  </span>
                  <select
                    name="categoria_id"
                    value={form.categoria_id}
                    onChange={handle}
                    className={inp + ' cursor-pointer'}
                    required
                  >
                    <option value="">- Seleccionar categoría -</option>
                    {catalogo.categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Subcategoría</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <FolderIcon />
                  </span>
                  <select
                    name="subcategoria_id"
                    value={form.subcategoria_id}
                    onChange={handle}
                    className={inp + ' cursor-pointer'}
                  >
                    <option value="">- Seleccionar subcategoría -</option>
                    {subcat.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={user?.rol === 'usuario_final' ? 'col-span-1 sm:col-span-2' : ''}>
                <label className={lbl}>Prioridad (Impacto y Urgencia) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <BoltIcon />
                  </span>
                  <select
                    name="prioridad"
                    value={form.prioridad}
                    onChange={handle}
                    className={inp + ' cursor-pointer'}
                    required
                  >
                    <option value="critico">Crítico (Bloqueo Total)</option>
                    <option value="alto">Alto (Interrupción Parcial)</option>
                    <option value="medio">Medio (Operación Lenta)</option>
                    <option value="bajo">Bajo (Consulta/General)</option>
                  </select>
                </div>
              </div>

              {user?.rol !== 'usuario_final' && (
                <div>
                  <label className={lbl}>Canal de Entrada</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <ChannelIcon />
                    </span>
                    <select
                      name="canal"
                      value={form.canal}
                      onChange={handle}
                      className={inp + ' cursor-pointer'}
                    >
                      <option value="portal_web">Portal Web</option>
                      <option value="correo">Correo Electrónico</option>
                      <option value="telefono">Teléfono de Soporte</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Soporte y Recursos Relacionados */}
          {user?.rol !== 'usuario_final' && (
            <div className="border border-slate-100 bg-slate-50/10 rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className={sectionTitle}>
                <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600"><UserIcon /></span>
                Soporte y Recursos Relacionados
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Asignar a (Técnico)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <UserIcon />
                    </span>
                    <select
                      name="asignado_a"
                      value={form.asignado_a}
                      onChange={handle}
                      className={inp + ' cursor-pointer'}
                    >
                      <option value="">- Auto-asignar según SLA -</option>
                      {catalogo.tecnicos.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nombre} ({t.perfil || 'Soporte General'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={lbl}>Activo Relacionado (CMDB)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <DeviceIcon />
                    </span>
                    <select
                      name="activo_id"
                      value={form.activo_id}
                      onChange={handle}
                      className={inp + ' cursor-pointer'}
                    >
                      <option value="">- Ninguno -</option>
                      {catalogo.activos.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.codigo} - {a.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60 hover:opacity-90 shadow-md flex items-center justify-center gap-1.5"
              style={{ background: ACCENT }}
            >
              {loading ? 'Creando...' : (
                <>
                  <PlusIcon /> Crear Ticket de Incidente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Panel lateral de detalle ───────────────────────────────────
function DetailPanel({ ticketId, onClose }) {
  const { user } = useAuth();
  const { ticket, loading, actualizar, nuevaNota } = useTicket(ticketId);
  const { catalogo } = useCatalogo();
  const [nota, setNota] = useState('');
  const [savingN, setSavingN] = useState(false);
  const [tab, setTab] = useState('detalle');

  if (loading && !ticket) {
    return (
      <div className="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex items-center justify-center">
        <p className="text-xs text-slate-400 animate-pulse">Cargando...</p>
      </div>
    );
  }
  if (!ticket) return null;

  const enviarNota = async () => {
    if (!nota.trim()) return;
    setSavingN(true);
    try {
      await nuevaNota({ contenido: nota, es_interna: false });
      setNota('');
    } finally {
      setSavingN(false);
    }
  };

  const ESTADOS = ['abierto', 'en_progreso', 'escalado', 'resuelto', 'cerrado'];
  const TABS = ['detalle', 'notas', 'historial'];

  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-white border-l border-slate-200 overflow-hidden">

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-1 flex-shrink-0 items-center">
        {TABS.map(t => (
          <button
            key={t} onClick={() => setTab(t)}
            className="px-3 py-2.5 text-xs font-semibold capitalize transition-colors border-b-2 mr-1"
            style={{
              color: tab === t ? ACCENT : '#94A3B8',
              borderColor: tab === t ? ACCENT : 'transparent',
            }}
          >
            {t}
          </button>
        ))}
        <button
          onClick={onClose}
          className="ml-auto w-8 h-8 my-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-xs transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <p className="font-mono text-xs font-bold mb-1" style={{ color: ACCENT }}>
          {ticket.codigo}
        </p>
        <p className="text-xs font-bold text-slate-800 leading-snug">{ticket.titulo}</p>
        <p className="text-xs text-slate-400 mt-1">{tiempoRelativo(ticket.creado_en)}</p>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── TAB DETALLE ─── */}
        {tab === 'detalle' && (
          <div className="px-4 py-3 space-y-4">

            {/* SLA */}
            {ticket.sla_estado && (
              <div className={`rounded-xl p-3.5 border text-xs shadow-sm flex items-center justify-between transition-all ${
                ticket.sla_estado === 'vencido' ? 'bg-red-50/50 border-red-200/60 text-red-800' :
                ticket.sla_estado === 'en_riesgo' ? 'bg-amber-50/50 border-amber-200/60 text-amber-800' :
                ticket.sla_estado === 'pausado' ? 'bg-slate-50/60 border-slate-200/60 text-slate-700' :
                'bg-emerald-50/50 border-emerald-200/60 text-emerald-800'
              }`}>
                <div>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="relative flex h-2 w-2">
                      {ticket.sla_estado !== 'pausado' && (
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          ticket.sla_estado === 'vencido' ? 'bg-red-400' :
                          ticket.sla_estado === 'en_riesgo' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        ticket.sla_estado === 'vencido' ? 'bg-red-500' :
                        ticket.sla_estado === 'en_riesgo' ? 'bg-amber-500' :
                        ticket.sla_estado === 'pausado' ? 'bg-slate-400' : 'bg-emerald-500'
                      }`}></span>
                    </span>
                    <span className="uppercase tracking-wider text-[10px]">
                      {ticket.sla_estado === 'vencido' ? 'SLA Vencido' :
                       ticket.sla_estado === 'en_riesgo' ? 'SLA En riesgo' :
                       ticket.sla_estado === 'pausado' ? 'SLA Pausado' : 'SLA En tiempo'}
                    </span>
                  </div>
                  {ticket.sla_vence_en && (
                    <p className="text-[11px] text-slate-500 font-medium">Vence: {formatFecha(ticket.sla_vence_en)}</p>
                  )}
                </div>
                <div className={`p-1.5 rounded-lg border ${
                  ticket.sla_estado === 'vencido' ? 'bg-red-100/40 border-red-200/40 text-red-600' :
                  ticket.sla_estado === 'en_riesgo' ? 'bg-amber-100/40 border-amber-200/40 text-amber-600' :
                  ticket.sla_estado === 'pausado' ? 'bg-slate-100/60 border-slate-200/60 text-slate-500' :
                  'bg-emerald-100/40 border-emerald-200/40 text-emerald-600'
                }`}>
                  {ticket.sla_estado === 'pausado' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* Campos */}
            {[
              ['Prioridad', <PriorityBadge priority={ticket.prioridad} />],
              ['Estado', <StatusBadge status={ticket.estado} />],
              ['Asignado a', ['admin', 'tecnico_l1', 'tecnico_l2'].includes(user?.rol) ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <select
                    value={ticket.asignado_a || ''}
                    onChange={e => actualizar({ asignado_a: e.target.value || null })}
                    className="text-xs bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer flex-1"
                  >
                    <option value="">- Sin asignar -</option>
                    {catalogo?.tecnicos?.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                  {ticket.asignado_a !== user?.id && (
                    <button
                      onClick={() => actualizar({ asignado_a: user?.id })}
                      className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shadow-sm"
                    >
                      Asignarme
                    </button>
                  )}
                </div>
              ) : (
                ticket.asignado_a_nombre || '—'
              )],
              ['Reportado por', ticket.reportado_por_nombre || '—'],
              ['Categoría', ticket.categoria || '—'],
              ['Activo', ticket.activo_codigo
                ? `${ticket.activo_codigo} — ${ticket.activo_nombre}`
                : '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  {label}
                </p>
                {typeof val === 'string'
                  ? <p className="text-xs text-slate-700">{val}</p>
                  : val}
              </div>
            ))}

            {ticket.descripcion && (
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  Descripción
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">{ticket.descripcion}</p>
              </div>
            )}

            {/* Adjuntos (Imágenes) */}
            {ticket.adjuntos && ticket.adjuntos.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Imágenes / Adjuntos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ticket.adjuntos.map(adj => {
                    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    const imageUrl = `${BASE_URL}/${adj.ruta}`;
                    return (
                      <a
                        key={adj.id}
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-slate-200 rounded-lg overflow-hidden block hover:border-blue-400 transition-colors bg-slate-50"
                      >
                        {adj.mime_type && adj.mime_type.startsWith('image/') ? (
                          <img
                            src={imageUrl}
                            alt={adj.nombre}
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center text-slate-400">
                            <span className="text-[10px] font-semibold">Archivo</span>
                          </div>
                        )}
                        <p className="text-[9px] text-slate-500 p-1 truncate text-center font-medium">{adj.nombre}</p>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cambiar estado */}
            {user?.rol !== 'usuario_final' && (
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Cambiar estado
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ESTADOS.filter(e => e !== ticket.estado).map(e => (
                    <button
                      key={e}
                      onClick={() => actualizar({ estado: e })}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors capitalize"
                    >
                      {e.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB NOTAS ─── */}
        {tab === 'notas' && (
          <div className="flex flex-col" style={{ height: '100%' }}>
            <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
              {(!ticket.notas || ticket.notas.length === 0) && (
                <p className="text-xs text-slate-400 text-center py-6">Sin notas aún</p>
              )}
              {ticket.notas && ticket.notas.map(n => (
                <div
                  key={n.id}
                  className={`rounded-lg p-3 text-xs ${n.es_interna ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">{n.autor_nombre}</span>
                    {n.es_interna && (
                      <span className="text-amber-600 font-semibold text-xs">Interna</span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{n.contenido}</p>
                  <p className="text-slate-400 mt-1">{tiempoRelativo(n.creado_en)}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 resize-none h-16"
                placeholder="Agregar nota..."
              />
              <button
                onClick={enviarNota}
                disabled={savingN || !nota.trim()}
                className="mt-2 w-full py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: ACCENT }}
              >
                {savingN ? 'Enviando...' : 'Agregar nota'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB HISTORIAL ─── */}
        {tab === 'historial' && (
          <div className="px-4 py-3 space-y-2">
            {(!ticket.historial || ticket.historial.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-6">Sin historial</p>
            )}
            {ticket.historial && ticket.historial.map((h, i) => (
              <div key={h.id} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <div
                    className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                    style={{
                      background: h.accion === 'crear' ? '#10B981' :
                        h.accion === 'escalar' ? '#EF4444' : ACCENT
                    }}
                  />
                  {i < ticket.historial.length - 1 && (
                    <div className="w-px flex-1 bg-slate-200 mt-1" style={{ minHeight: '16px' }} />
                  )}
                </div>
                <div className="pb-2 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 capitalize">
                    {h.accion} {h.campo ? `— ${h.campo}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">{h.usuario_nombre}</p>
                  {h.valor_nuevo && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">→ {h.valor_nuevo}</p>
                  )}
                  <p className="text-xs text-slate-400">{tiempoRelativo(h.creado_en)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones footer */}
      {user?.rol !== 'usuario_final' ? (
        <div className="px-3 py-3 border-t border-slate-100 flex gap-2 flex-shrink-0">
          <button
            onClick={() => actualizar({ estado: 'escalado' })}
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Escalar
          </button>
          <button
            onClick={() => actualizar({
              estado: ['resuelto', 'cerrado'].includes(ticket.estado) ? 'abierto' : 'resuelto'
            })}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: ACCENT }}
          >
            {['resuelto', 'cerrado'].includes(ticket.estado) ? 'Reabrir' : 'Resolver'}
          </button>
        </div>
      ) : (
        ['resuelto', 'cerrado'].includes(ticket.estado) && (
          <div className="px-3 py-3 border-t border-slate-100 flex gap-2 flex-shrink-0">
            <button
              onClick={() => actualizar({ estado: 'abierto' })}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 bg-amber-600 hover:bg-amber-700"
            >
              Reabrir Ticket
            </button>
            {ticket.estado === 'resuelto' && (
              <button
                onClick={() => actualizar({ estado: 'cerrado' })}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 bg-emerald-600 hover:bg-emerald-700"
              >
                Cerrar Ticket
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}

// ── PÁGINA PRINCIPAL ───────────────────────────────────────────
export default function TicketsPage() {
  const { user } = useAuth();
  const {
    tickets, total, loading, error,
    filters, cambiarFiltro, cambiarPagina, recargar,
  } = useTickets();

  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q');

  useEffect(() => {
    if (qParam !== null) {
      cambiarFiltro('q', qParam);
    }
  }, [qParam, cambiarFiltro]);

  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const ESTADOS = ['', 'abierto', 'en_progreso', 'escalado', 'resuelto', 'cerrado'];
  const PRIORIDADES = ['', 'critico', 'alto', 'medio', 'bajo'];
  const STATUS_LBL = {
    '': 'Todos', abierto: 'Abierto', en_progreso: 'En progreso',
    escalado: 'Escalado', resuelto: 'Resuelto', cerrado: 'Cerrado',
  };
  const PRIO_LBL = { '': 'Todas', critico: 'Crítico', alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };

  return (
    <Layout>
      <div className="flex" style={{ height: '100%' }}>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Breadcrumb + acciones */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-slate-800">Gestión de Tickets</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inicio &rarr; <span style={{ color: ACCENT }}>Tickets</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={recargar}
                  className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <SyncIcon /> Actualizar
                </button>
                {['admin', 'tecnico_l1', 'tecnico_l2', 'usuario_final'].includes(user?.rol) && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-xs font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                    style={{ background: ACCENT }}
                  >
                    <PlusIcon /> Nuevo Ticket
                  </button>
                )}
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap gap-3 items-center shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Estado:</span>
              {ESTADOS.map(e => (
                <button
                  key={e}
                  onClick={() => cambiarFiltro('estado', e)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all border"
                  style={
                    filters.estado === e
                      ? { background: '#EEF2FF', color: ACCENT, borderColor: ACCENT }
                      : { background: 'transparent', color: '#64748B', borderColor: 'transparent' }
                  }
                >
                  {STATUS_LBL[e]}
                </button>
              ))}

              <div className="w-px h-5 bg-slate-200" />

              <span className="text-xs text-slate-500 font-semibold">Prioridad:</span>
              <select
                value={filters.prioridad}
                onChange={e => cambiarFiltro('prioridad', e.target.value)}
                className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {PRIORIDADES.map(p => (
                  <option key={p} value={p}>{PRIO_LBL[p]}</option>
                ))}
              </select>

              <div className="w-px h-5 bg-slate-200" />

              <input
                value={filters.q}
                onChange={e => cambiarFiltro('q', e.target.value)}
                placeholder="Buscar ID o título..."
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 w-48"
              />

              <span className="ml-auto text-xs text-slate-400">{total} tickets</span>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-150 rounded-xl p-4 flex items-center gap-2.5 text-xs text-red-700 font-medium animate-shake">
                <AlertWarningIcon />
                <span>{error}</span>
              </div>
            )}

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['ID', 'Título / Categoría', 'Prioridad', 'Estado', 'Asignado a', 'SLA', 'Creado'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading && tickets.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400 text-xs animate-pulse">
                          Cargando tickets desde el servidor...
                        </td>
                      </tr>
                    )}
                    {!loading && tickets.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <div className="flex justify-center mb-3 text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{ width: '48px', height: '48px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z" />
                            </svg>
                          </div>
                          <p className="text-xs font-medium text-slate-500">No hay incidentes registrados con los filtros aplicados</p>
                          <button
                            onClick={() => setShowModal(true)}
                            className="mt-3 text-xs font-semibold hover:underline flex items-center gap-1.5 mx-auto transition-all hover:opacity-80"
                            style={{ color: ACCENT }}
                          >
                            <PlusIcon /> Crear el primer ticket
                          </button>
                        </td>
                      </tr>
                    )}
                    {tickets.map(t => (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                        className="border-b border-slate-50 cursor-pointer transition-colors"
                        style={{
                          background: selectedId === t.id ? '#EEF2FF' : undefined,
                        }}
                        onMouseEnter={e => {
                          if (selectedId !== t.id) e.currentTarget.style.background = '#F8FAFF';
                        }}
                        onMouseLeave={e => {
                          if (selectedId !== t.id) e.currentTarget.style.background = '';
                        }}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-xs" style={{ color: ACCENT }}>
                            {t.codigo}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-slate-700 max-w-xs truncate">{t.titulo}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{t.categoria}</p>
                        </td>
                        <td className="px-3 py-3"><PriorityBadge priority={t.prioridad} /></td>
                        <td className="px-3 py-3"><StatusBadge status={t.estado} /></td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-slate-500">{t.asignado_a_nombre || '—'}</span>
                        </td>
                        <td className="px-3 py-3">
                          <SlaBar sla_estado={t.sla_estado} sla_vence_en={t.sla_vence_en} />
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {tiempoRelativo(t.creado_en)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {total > filters.limit && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium">
                    Página {filters.page} de {Math.ceil(total / filters.limit)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => cambiarPagina(filters.page - 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-all flex items-center gap-1"
                    >
                      <ChevronLeftIcon /> Anterior
                    </button>
                    <button
                      disabled={filters.page >= Math.ceil(total / filters.limit)}
                      onClick={() => cambiarPagina(filters.page + 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-all flex items-center gap-1"
                    >
                      Siguiente <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PANEL DETALLE ── */}
        {selectedId && (
          <DetailPanel
            ticketId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* ── MODAL NUEVO TICKET ── */}
      {showModal && (
        <NuevoTicketModal
          onClose={() => setShowModal(false)}
          onCreado={() => recargar()}
        />
      )}
    </Layout>
  );
}
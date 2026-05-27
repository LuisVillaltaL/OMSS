import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EditorTextoEnriquecido from '../components/EditorTextoEnriquecido';
import BadgeAdjunto, { CloseIcon } from '../components/ui/BadgeAdjunto';
import Layout from '../components/Layout';
import { PriorityBadge, StatusBadge, SlaBar } from '../components/ui/Badges';
import { useTickets, useTicket, useCatalogo } from '../hooks/useTickets';
import { crearTicket } from '../api/tickets';
import { useAuth } from '../context/AuthContext';

const ACCENT = '#3C50E0';

// ── ICONOS SVG NATIVOS DE TRAZO FINO ──
function TicketIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z" />
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

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function getRoleBadge(rol) {
  if (rol === 'admin') return <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-500">Admin</span>;
  if (rol === 'tecnico_l1' || rol === 'tecnico_l2') return <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-500">Soporte</span>;
  return <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-500">Cliente</span>;
}

function getInitialsColor(rol) {
  return 'bg-slate-100 text-slate-600';
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

// ── MODAL NUEVO TICKET ──
function NuevoTicketModal({ onClose, onCreado }) {
  const { user } = useAuth();
  const { catalogo } = useCatalogo();
  const [form, setForm] = useState({
    titulo: '', descripcion: '', prioridad: 'medio',
    canal: 'portal_web', categoria_id: '', subcategoria_id: '',
    reportado_por: user?.id || '', asignado_a: '', activo_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const subcat = catalogo?.subcategorias?.filter(s => s.categoria_id === form.categoria_id) || [];

  const handle = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleCrearTicket = async (datos) => {
    if (!form.titulo.trim() || !form.categoria_id || !form.reportado_por) {
      setError('Título y Categoría son campos obligatorios');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await crearTicket({
        ...form,
        descripcion: datos.texto,
        subcategoria_id: form.subcategoria_id || undefined,
        asignado_a: datos.asignarA || form.asignado_a || undefined,
        activo_id: form.activo_id || undefined,
        archivos: datos.archivos.map(f => ({ nombre: f.nombre || f.name, base64: f.base64 }))
      });
      onCreado(r);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el ticket de soporte');
    } finally {
      setLoading(false);
    }
  };

  const lbl = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl font-sans border border-slate-100 animate-scale-up">

        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
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

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-red-700 font-medium">
              <AlertWarningIcon />
              <span>{error}</span>
            </div>
          )}

          {/* Campo de Título */}
          <div className="w-full">
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handle}
              placeholder="Título del incidente..."
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white px-4 py-3 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
              autoComplete="off"
              required
            />
          </div>

          {/* Editor de Texto */}
          <div className="w-full">
            <EditorTextoEnriquecido
              modo="crear"
              placeholder="Describe el problema detalladamente (pasos para reproducir, impacto operativo, capturas)..."
              textoBotonPrincipal="Crear Ticket de Incidente"
              mostrarPestanas={false}
              loading={loading}
              onAccionPrincipal={handleCrearTicket}
            />
          </div>

          {/* Formulario de Metadatos */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Categoría <span className="text-red-500">*</span></label>
                <select name="categoria_id" value={form.categoria_id} onChange={handle} className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-colors" required>
                  <option value="">- Seleccionar -</option>
                  {catalogo?.categorias?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Subcategoría</label>
                <select name="subcategoria_id" value={form.subcategoria_id} onChange={handle} className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-colors">
                  <option value="">- Seleccionar -</option>
                  {subcat.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Prioridad <span className="text-red-500">*</span></label>
                <select name="prioridad" value={form.prioridad} onChange={handle} className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-colors" required>
                  <option value="critico">Crítico — Bloqueo</option>
                  <option value="alto">Alto — Interrupción</option>
                  <option value="medio">Medio — Lento</option>
                  <option value="bajo">Bajo — Consulta</option>
                </select>
              </div>

              {user?.rol !== 'usuario_final' && (
                <>
                  <div>
                    <label className={lbl}>Asignar A</label>
                    <select name="asignado_a" value={form.asignado_a} onChange={handle} className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-colors">
                      <option value="">- SLA automático -</option>
                      {catalogo?.tecnicos?.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Activo CMDB</label>
                    <select name="activo_id" value={form.activo_id} onChange={handle} className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-colors">
                      <option value="">- Ninguno -</option>
                      {catalogo?.activos?.map(a => <option key={a.id} value={a.id}>{a.codigo}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer del Modal */}
          <div className="flex justify-end items-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 font-bold text-xs px-4 py-2 active:scale-95 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PANEL LATERAL DE DETALLE ──
function DetailPanel({ ticketId, onClose }) {
  const { user } = useAuth();
  const { ticket, loading, actualizar, nuevaNota } = useTicket(ticketId);
  const { catalogo } = useCatalogo();
  const [savingN, setSavingN] = useState(false);
  const [asignarA, setAsignarA] = useState('');

  useEffect(() => {
    if (ticket) {
      setAsignarA(ticket.asignado_a || '');
    }
  }, [ticket]);

  if (loading && !ticket) {
    return (
      <div className="w-[400px] flex-shrink-0 bg-white border-l border-slate-200 flex items-center justify-center">
        <p className="text-xs text-slate-400 animate-pulse">Cargando...</p>
      </div>
    );
  }
  if (!ticket) return null;

  const handleEnviarRespuesta = async (datos) => {
    const isAssigning = user?.rol !== 'usuario_final' && asignarA !== (ticket.asignado_a || '');

    setSavingN(true);
    try {
      const file = datos.archivos?.[0];
      const hasNote = datos.texto || file;

      if (hasNote) {
        const data = {
          contenido: datos.texto || (file ? `Se adjuntó el archivo: ${file.nombre || file.name}` : ''),
          es_interna: datos.esInterna,
          archivo: file ? file.base64 : undefined,
          archivoNombre: file ? (file.nombre || file.name) : undefined
        };
        await nuevaNota(data);
      }

      if (isAssigning) {
        await actualizar({ asignado_a: asignarA || null });
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error al enviar la respuesta');
    } finally {
      setSavingN(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-slate-50/50 min-h-0 w-full font-sans h-full overflow-hidden">

      <div className="flex items-center justify-between mb-4 flex-shrink-0 animate-fade-in">
        <div>
          <h1 className="text-base font-bold text-slate-800">Detalle de Incidente</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Inicio &rarr; <span className="hover:text-slate-600 transition-colors cursor-pointer font-semibold" onClick={onClose}>Tickets</span> &rarr; <span className="font-semibold" style={{ color: ACCENT }}>{ticket.codigo}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-5 min-h-0 overflow-y-auto md:overflow-hidden w-full">

        {/* COLUMNA IZQUIERDA: Mensajes e Historial */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center border border-slate-200 shadow-sm"
                  title="Volver a la lista"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <h2 className="text-sm font-bold text-slate-800 truncate">
                  Ticket {ticket.codigo} — {ticket.titulo}
                </h2>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold pl-8">
                Creado: {formatFecha(ticket.creado_en)} • Hace {tiempoRelativo(ticket.creado_en)}
              </p>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50/10 min-h-0 flex flex-col">
            {ticket.descripcion && (
              <div className="animate-fade-in w-full">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2 pb-2.5 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold uppercase flex-shrink-0 ${getInitialsColor(ticket.reportado_por_rol)}`}>
                        {ticket.reportado_por_nombre ? ticket.reportado_por_nombre.substring(0, 2).toUpperCase() : 'US'}
                      </div>
                      <span className="font-bold text-xs text-slate-700">{ticket.reportado_por_nombre}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{ticket.reportado_por_correo}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{formatFecha(ticket.creado_en)} • Hace {tiempoRelativo(ticket.creado_en)}</span>
                  </div>
                  <div className="ql-snow"><div className="ql-editor !p-0 text-slate-650 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: ticket.descripcion }} /></div>

                  {ticket.adjuntos && ticket.adjuntos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                      {ticket.adjuntos
                        .filter(adj => !ticket.notas || !ticket.notas.some(n => adj.subido_por === n.autor_id && Math.abs(new Date(adj.creado_en) - new Date(n.creado_en)) < 15000))
                        .map(adj => {
                          const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                          const filename = adj.ruta.replace('uploads/', '');
                          const fileUrl = `${BASE_URL}/api/tickets/adjuntos/${filename}/download`;
                          return (
                            <BadgeAdjunto key={adj.id} nombre={adj.nombre} url={fileUrl} />
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {ticket.notas && ticket.notas.map(n => {
              const initials = n.autor_nombre ? n.autor_nombre.substring(0, 2).toUpperCase() : 'US';
              return (
                <div key={n.id} className="animate-fade-in w-full">
                  <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                    n.es_interna
                      ? 'bg-orange-50/80 border-orange-200 border-l-[3px] border-l-orange-500 text-slate-800'
                      : 'bg-white border-slate-100 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2 pb-2.5 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold uppercase flex-shrink-0 ${getInitialsColor(n.autor_rol)}`}>
                          {initials}
                        </div>
                        <span className="font-bold text-slate-700 text-xs">{n.autor_nombre}</span>
                        {getRoleBadge(n.autor_rol)}
                        {n.es_interna && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider bg-orange-100 text-orange-700">
                            <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 13.5h13.5c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H5.25c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
                            </svg>
                            Interna
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{formatFecha(n.creado_en)} • Hace {tiempoRelativo(n.creado_en)}</span>
                    </div>
                    <div className="ql-snow"><div className="ql-editor !p-0 text-slate-650 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: n.contenido }} /></div>

                    {ticket.adjuntos && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-50">
                        {ticket.adjuntos
                          .filter(adj => adj.subido_por === n.autor_id && Math.abs(new Date(adj.creado_en) - new Date(n.creado_en)) < 15000)
                          .map(adj => {
                            const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                            const filename = adj.ruta.replace('uploads/', '');
                            const fileUrl = `${BASE_URL}/api/tickets/adjuntos/${filename}/download`;
                            return (
                              <BadgeAdjunto key={adj.id} nombre={adj.nombre} url={fileUrl} />
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CAJA DE RESPUESTA */}
          <div className="flex-shrink-0 w-full transition-all duration-200">
            <EditorTextoEnriquecido
              modo="responder"
              placeholder="Escribe tu respuesta aquí..."
              textoBotonPrincipal="Responder Ticket"
              mostrarPestanas={user?.rol !== 'usuario_final'}
              loading={savingN}
              onAccionPrincipal={handleEnviarRespuesta}
              elementosBarraExtra={
                user?.rol !== 'usuario_final' && (
                  <div className="flex items-center gap-2 ml-auto pl-2 border-l border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Asignar a:</span>
                    <select
                      value={asignarA}
                      onChange={(e) => setAsignarA(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">- Sin asignar -</option>
                      {catalogo?.tecnicos?.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre} ({t.perfil || 'Soporte'})</option>
                      ))}
                    </select>
                  </div>
                )
              }
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: Ficha de Metadatos */}
        <div className="w-full md:w-[280px] flex-shrink-0 space-y-4 md:overflow-y-auto h-full pb-10">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-2.5 border-b border-slate-100">
              Detalles del ticket
            </h3>

            <div className="space-y-3.5">
              {[
                ['Cliente', ticket.reportado_por_nombre || '—'],
                ['Correo electrónico', ticket.reportado_por_correo || '—'],
                ['ID del ticket', <span className="font-mono font-bold" style={{ color: ACCENT }}>{ticket.codigo}</span>],
                ['Categoría', ticket.categoria || '—'],
                ['Creado', formatFecha(ticket.creado_en)],
                ['Estado', <StatusBadge status={ticket.estado} />],
                ['Prioridad', <PriorityBadge priority={ticket.prioridad} />],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center text-xs gap-3">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{label}</span>
                  <span className="text-slate-700 font-semibold text-right truncate max-w-[150px]">{val}</span>
                </div>
              ))}
            </div>

            {ticket.sla_estado && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">SLA</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                    ticket.sla_estado === 'vencido' ? 'bg-red-50 text-red-600 border border-red-150' :
                    ticket.sla_estado === 'en_riesgo' ? 'bg-amber-50 text-amber-600 border border-amber-150' :
                    ticket.sla_estado === 'pausado' ? 'bg-slate-50 text-slate-500 border border-slate-150' :
                    'bg-emerald-50 text-emerald-600 border border-emerald-150'
                  }`}>
                    {ticket.sla_estado === 'pausado' ? 'Pausado' : ticket.sla_estado === 'vencido' ? 'Vencido' : 'En tiempo'}
                  </span>
                </div>
                {ticket.sla_vence_en && (
                  <p className="text-[9px] text-slate-400 font-semibold">Vence: {formatFecha(ticket.sla_vence_en)}</p>
                )}
              </div>
            )}
          </div>

          {user?.rol !== 'usuario_final' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <h4 className="text-[9px] font-bold text-slate-455 uppercase tracking-widest mb-1">
                Acciones Técnicas
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => actualizar({ estado: 'escalado' })}
                  className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-650 transition-colors shadow-sm"
                >
                  Escalar
                </button>
                <button
                  onClick={() => actualizar({
                    estado: ['resuelto', 'cerrado'].includes(ticket.estado) ? 'abierto' : 'resuelto'
                  })}
                  className="flex-1 py-2 rounded-xl text-[10px] font-bold text-white hover:opacity-90 transition-opacity shadow-sm"
                  style={{ background: ACCENT }}
                >
                  {['resuelto', 'cerrado'].includes(ticket.estado) ? 'Reabrir' : 'Resolver'}
                </button>
              </div>
              {ticket.estado !== 'cerrado' && (
                <button
                  onClick={() => actualizar({ estado: 'cerrado' })}
                  className="w-full py-2 rounded-xl text-[10px] font-bold text-white transition-opacity hover:opacity-90 bg-emerald-600 hover:bg-emerald-700 mt-4"
                >
                  Cerrar Ticket
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──
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
      <div className="flex w-full" style={{ height: '100%' }}>
        {selectedId ? (
          <DetailPanel
            ticketId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

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

              {error && (
                <div className="bg-red-50 border border-red-150 rounded-xl p-4 flex items-center gap-2.5 text-xs text-red-700 font-medium">
                  <AlertWarningIcon />
                  <span>{error}</span>
                </div>
              )}

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
                              <TicketIcon />
                            </div>
                            <p className="text-xs font-medium text-slate-500">No hay incidentes registrados con los filtros aplicados</p>
                            <button
                              onClick={() => setShowModal(true)}
                              className="mt-3 text-xs font-semibold hover:underline flex items-center gap-1.5 mx-auto"
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
                          className="border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50/80"
                          style={{
                            background: selectedId === t.id ? '#EEF2FF' : undefined,
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
        )}
      </div>

      {showModal && (
        <NuevoTicketModal
          onClose={() => setShowModal(false)}
          onCreado={() => recargar()}
        />
      )}
    </Layout>
  );
}
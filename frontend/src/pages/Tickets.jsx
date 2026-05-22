import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { PriorityBadge, StatusBadge, SlaBar } from '../components/ui/Badges';
import { useTickets, useTicket, useCatalogo } from '../hooks/useTickets';
import { crearTicket } from '../api/tickets';
import { useAuth } from '../context/AuthContext';

const ACCENT = '#3C50E0';

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

// ── Modal nuevo ticket ─────────────────────────────────────────
function NuevoTicketModal({ onClose, onCreado }) {
  const { user } = useAuth();
  const { catalogo } = useCatalogo();
  const [form, setForm] = useState({
    titulo: '', descripcion: '', prioridad: 'medio',
    canal: 'portal_web', categoria_id: '', subcategoria_id: '',
    reportado_por: user?.id || '', asignado_a: '', activo_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subcat = catalogo.subcategorias.filter(s => s.categoria_id === form.categoria_id);

  const handle = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.categoria_id || !form.reportado_por) {
      setError('Título, categoría y usuario afectado son obligatorios');
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
      setError(err.response?.data?.error || 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors';
  const lbl = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Nuevo Ticket de Incidente</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className={lbl}>Título <span className="text-red-500">*</span></label>
            <input name="titulo" value={form.titulo} onChange={handle}
              className={inp} placeholder="Describe brevemente el problema..." />
          </div>

          <div>
            <label className={lbl}>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle}
              className={inp + ' resize-none h-20'}
              placeholder="Pasos para reproducir, impacto, mensajes de error..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Categoría <span className="text-red-500">*</span></label>
              <select name="categoria_id" value={form.categoria_id} onChange={handle} className={inp}>
                <option value="">— Seleccionar —</option>
                {catalogo.categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Subcategoría</label>
              <select name="subcategoria_id" value={form.subcategoria_id} onChange={handle} className={inp}>
                <option value="">— Seleccionar —</option>
                {subcat.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Prioridad <span className="text-red-500">*</span></label>
              <select name="prioridad" value={form.prioridad} onChange={handle} className={inp}>
                <option value="critico">Crítico</option>
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Canal</label>
              <select name="canal" value={form.canal} onChange={handle} className={inp}>
                <option value="portal_web">Portal web</option>
                <option value="correo">Correo</option>
                <option value="telefono">Teléfono</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Asignar a</label>
              <select name="asignado_a" value={form.asignado_a} onChange={handle} className={inp}>
                <option value="">— Auto-asignar —</option>
                {catalogo.tecnicos.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({t.perfil || 'admin'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Activo relacionado</label>
              <select name="activo_id" value={form.activo_id} onChange={handle} className={inp}>
                <option value="">— Ninguno —</option>
                {catalogo.activos.map(a => (
                  <option key={a.id} value={a.id}>{a.codigo} — {a.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60 hover:opacity-90"
              style={{ background: ACCENT }}
            >
              {loading ? 'Creando...' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Panel lateral de detalle ───────────────────────────────────
function DetailPanel({ ticketId, onClose }) {
  const { ticket, loading, actualizar, nuevaNota } = useTicket(ticketId);
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
          className="ml-auto w-7 h-7 my-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-xs"
        >
          ✕
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
              <div className={`rounded-lg p-3 border text-xs ${ticket.sla_estado === 'vencido' ? 'bg-red-50 border-red-200' :
                ticket.sla_estado === 'en_riesgo' ? 'bg-amber-50 border-amber-200' :
                  ticket.sla_estado === 'pausado' ? 'bg-slate-50 border-slate-200' :
                    'bg-emerald-50 border-emerald-200'
                }`}>
                <p className="font-bold mb-1">
                  {ticket.sla_estado === 'vencido' ? '🔴 SLA Vencido' :
                    ticket.sla_estado === 'en_riesgo' ? '🟡 En riesgo' :
                      ticket.sla_estado === 'pausado' ? '⏸ Pausado' :
                        '🟢 En tiempo'}
                </p>
                {ticket.sla_vence_en && (
                  <p className="text-slate-500">Vence: {formatFecha(ticket.sla_vence_en)}</p>
                )}
              </div>
            )}

            {/* Campos */}
            {[
              ['Prioridad', <PriorityBadge priority={ticket.prioridad} />],
              ['Estado', <StatusBadge status={ticket.estado} />],
              ['Asignado a', ticket.asignado_a_nombre || '—'],
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

            {/* Cambiar estado */}
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
                  Inicio → <span style={{ color: ACCENT }}>Tickets</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={recargar}
                  className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  ↻ Actualizar
                </button>
                {['admin', 'tecnico_l1', 'tecnico_l2'].includes(user?.rol) && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-xs font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
                    style={{ background: ACCENT }}
                  >
                    + Nuevo Ticket
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
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">
                ⚠ {error}
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
                            className="mt-3 text-xs font-semibold hover:underline"
                            style={{ color: ACCENT }}
                          >
                            + Crear el primer ticket
                          </button> {/* ◄── Removido el ')}' que estaba aquí colapsando la estructura */}
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
                  <span className="text-xs text-slate-400">
                    Página {filters.page} de {Math.ceil(total / filters.limit)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => cambiarPagina(filters.page - 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      ← Anterior
                    </button>
                    <button
                      disabled={filters.page >= Math.ceil(total / filters.limit)}
                      onClick={() => cambiarPagina(filters.page + 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      Siguiente →
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
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

// ── MODAL NUEVO ACTIVO TI (CORREGIDO) ─────────────────────────────────
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
      // Enviamos el payload limpio al backend
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

  const inp = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors';
  const lbl = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Registrar Activo de TI (CMDB)</h2>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-sm">✕</button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">⚠ {error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Código Único (Asset Tag) <span className="text-red-500">*</span></label>
              <input name="codigo" value={form.codigo} onChange={handle} className={inp} placeholder="Ej: LPT-0034, SRV-01" />
            </div>
            <div>
              <label className={lbl}>Nombre del Componente <span className="text-red-500">*</span></label>
              <input name="nombre" value={form.nombre} onChange={handle} className={inp} placeholder="Ej: Laptop Luis Villalta" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Tipo de Activo <span className="text-red-500">*</span></label>
              <select name="tipo" value={form.tipo} onChange={handle} className={inp}>
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
            <div>
              <label className={lbl}>Estado de Operación <span className="text-red-500">*</span></label>
              <select name="estado" value={form.estado} onChange={handle} className={inp}>
                <option value="operativo">Operativo</option>
                <option value="mantenimiento">En Mantenimiento</option>
                <option value="dado_de_baja">Dado de Baja</option>
                <option value="extraviado">Extraviado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl}>Marca</label>
              <input name="marca" value={form.marca} onChange={handle} className={inp} placeholder="Ej: Dell, HP" />
            </div>
            <div>
              <label className={lbl}>Modelo</label>
              <input name="modelo" value={form.modelo} onChange={handle} className={inp} placeholder="Ej: Latitude 5430" />
            </div>
            <div>
              <label className={lbl}>Número de Serie</label>
              <input name="numero_serie" value={form.numero_serie} onChange={handle} className={inp} placeholder="S/N de fábrica" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Área / Departamento Asignado</label>
              <select name="departamento_id" value={form.departamento_id} onChange={handle} className={inp}>
                <option value="">— Ninguno / Stock —</option>
                {departamentos && departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Custodio / Empleado Responsable</label>
              <select name="asignado_a" value={form.asignado_a} onChange={handle} className={inp}>
                <option value="">— Sin asignar —</option>
                {empleados && empleados.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} ({e.correo ? e.correo.split('@')[0] : 'Sin correo'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={lbl}>Ubicación Física (Piso / Sala / Rack)</label>
            <input name="ubicacion" value={form.ubicacion} onChange={handle} className={inp} placeholder="Ej: Edificio Central, Piso 2, Oficina TI" />
          </div>

          <div>
            <label className={lbl}>Notas de Auditoría o Configuración</label>
            {/* 🛠️ CORREGIDO: Se cambió 'name="notes"' por 'name="notas"' */}
            <textarea name="notas" value={form.notas} onChange={handle} className={inp + ' resize-none h-16'} placeholder="Detalles de licencias, especificaciones adicionales..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60 hover:opacity-90" style={{ background: ACCENT }}>
              {loading ? 'Registrando...' : 'Guardar en Inventario'}
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
            <button onClick={recargar} className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">↻ Sincronizar</button>
            <button onClick={() => setShowModal(true)} className="text-xs font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 shadow-sm" style={{ background: ACCENT }}>
              + Registrar Activo
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
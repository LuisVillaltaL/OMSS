// RUTA: frontend/src/pages/Reportes.jsx
import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useReportes } from '../hooks/useReportes';

const ACCENT = '#3C50E0';

// ── ICONOS SVG NATIVOS DE TRAZO FINO (strokeWidth = 1.5) ──

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5a1.75 1.75 0 0 1-1.75 1.75H4.75A1.75 1.75 0 0 1 3 17.25V6.75Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function SlaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  );
}

function EscalationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

const PRIORIDAD_COLORES = {
  critico: '#EF4444',
  alto: '#F97316',
  medio: '#3B82F6',
  bajo: '#64748B'
};

const PRIORIDAD_BG = {
  critico: 'bg-red-50 text-red-700 border-red-100',
  alto: 'bg-orange-50 text-orange-700 border-orange-100',
  medio: 'bg-blue-50 text-blue-700 border-blue-100',
  bajo: 'bg-slate-50 text-slate-600 border-slate-200'
};

export default function ReportesPage() {
  const {
    data,
    loading,
    error,
    rango,
    fechas,
    cambiarRango,
    cambiarFechasPersonalizadas
  } = useReportes();

  const [hoveredData, setHoveredData] = useState(null);

  // Rangos de fecha personalizados en local
  const [inpInicio, setInpInicio] = useState('');
  const [inpFin, setInpFin] = useState('');

  // Helper para iniciales y HSL color de avatar
  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0] ? parts[0].charAt(0) : '';
    const last = parts[1] ? parts[1].charAt(0) : '';
    return (first + last).toUpperCase();
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

  const aplicarFiltroPersonalizado = (e) => {
    e.preventDefault();
    if (inpInicio && inpFin) {
      cambiarFechasPersonalizadas(inpInicio, inpFin);
    }
  };

  // 1. Calculo y formateo de Donut Chart (Prioridades)
  const donutChartSegments = useMemo(() => {
    if (!data?.distribucion_prioridad || data.distribucion_prioridad.length === 0) return [];
    
    const total = data.distribucion_prioridad.reduce((acc, curr) => acc + parseInt(curr.cantidad), 0);
    if (total === 0) return [];

    let currentOffset = 0;
    const r = 40;
    const c = 2 * Math.PI * r; // ~251.32

    return data.distribucion_prioridad.map((p) => {
      const cantidad = parseInt(p.cantidad);
      const porcentaje = Math.round((cantidad / total) * 100);
      const length = (porcentaje / 100) * c;
      const offset = currentOffset;
      currentOffset += length;
      
      return {
        prioridad: p.prioridad,
        cantidad,
        porcentaje,
        length,
        offset,
        color: PRIORIDAD_COLORES[p.prioridad] || '#CBD5E1',
        strokeDasharray: `${length} ${c - length}`
      };
    });
  }, [data?.distribucion_prioridad]);

  // 2. Calculo de coordenadas para el grafico de Linea de Volumetria
  const lineChartPoints = useMemo(() => {
    if (!data?.volumetria_temporal || data.volumetria_temporal.length === 0) return null;

    const list = data.volumetria_temporal;
    const maxVal = Math.max(
      ...list.map(d => Math.max(parseInt(d.cantidad || 0), parseInt(d.resueltos || 0))),
      1 // Evitar division por cero
    );

    const w = 600;
    const h = 220;
    const paddingX = 40;
    const paddingY = 30;

    const pointsCreados = [];
    const pointsResueltos = [];

    const graphWidth = w - 2 * paddingX;
    const graphHeight = h - 2 * paddingY;

    list.forEach((item, i) => {
      const x = paddingX + (list.length > 1 ? (i / (list.length - 1)) * graphWidth : graphWidth / 2);
      const yCreados = h - paddingY - (parseInt(item.cantidad || 0) / maxVal) * graphHeight;
      const yResueltos = h - paddingY - (parseInt(item.resueltos || 0) / maxVal) * graphHeight;

      pointsCreados.push({ x, y: yCreados, item, val: parseInt(item.cantidad || 0) });
      pointsResueltos.push({ x, y: yResueltos, item, val: parseInt(item.resueltos || 0) });
    });

    // Construir paths
    const pathCreados = pointsCreados.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const pathResueltos = pointsResueltos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Area paths
    const areaCreados = pointsCreados.length > 0 
      ? `${pathCreados} L ${pointsCreados[pointsCreados.length - 1].x} ${h - paddingY} L ${pointsCreados[0].x} ${h - paddingY} Z`
      : '';
    const areaResueltos = pointsResueltos.length > 0
      ? `${pathResueltos} L ${pointsResueltos[pointsResueltos.length - 1].x} ${h - paddingY} L ${pointsResueltos[0].x} ${h - paddingY} Z`
      : '';

    return {
      w,
      h,
      paddingX,
      paddingY,
      maxVal,
      pointsCreados,
      pointsResueltos,
      pathCreados,
      pathResueltos,
      areaCreados,
      areaResueltos
    };
  }, [data?.volumetria_temporal]);

  // 3. Calculo de categorias max
  const maxCategoriaCantidad = useMemo(() => {
    if (!data?.incidentes_categoria || data.incidentes_categoria.length === 0) return 1;
    return Math.max(...data.incidentes_categoria.map(c => parseInt(c.cantidad)), 1);
  }, [data?.incidentes_categoria]);

  // Helper para renderizar delta de KPIs de manera premium
  const renderKPIChange = (kpiData, unit = '%', isLowerBetter = false) => {
    if (!kpiData) return null;
    const cambio = kpiData.cambio_porcentaje;
    if (cambio === undefined || isNaN(cambio)) return null;

    let isPositive = cambio > 0;
    if (isLowerBetter) {
      isPositive = cambio < 0; // Para MTTR/MTTA, una disminucion es positiva
    }

    const badgeColor = isPositive 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
      : cambio === 0 
        ? 'bg-slate-50 text-slate-500 border-slate-200' 
        : 'bg-rose-50 text-rose-700 border-rose-100';

    const icon = cambio > 0 
      ? <ChevronUpIcon /> 
      : cambio < 0 
        ? <ChevronDownIcon /> 
        : null;

    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
        {icon}
        {Math.abs(cambio)}{unit} vs anterior
      </span>
    );
  };

  return (
    <Layout>
      <div className="overflow-y-auto p-6 space-y-6" style={{ height: '100%' }}>
        
        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-800 font-sans">Dashboard Analítico de Servicio</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">Métricas en tiempo real, cumplimiento de SLAs y productividad de TI</p>
          </div>

          {/* Selector de Rango de Fechas Integrado */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { id: '7d', label: '7d' },
                { id: '30d', label: '30d' },
                { id: '90d', label: '90d' },
                { id: 'custom', label: 'Personalizado' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => cambiarRango(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all outline-none ${
                    rango === opt.id 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {rango === 'custom' && (
              <form onSubmit={aplicarFiltroPersonalizado} className="flex items-center gap-2 animate-fade-in">
                <input
                  type="date"
                  value={inpInicio}
                  onChange={e => setInpInicio(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase">a</span>
                <input
                  type="date"
                  value={inpFin}
                  onChange={e => setInpFin(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-slate-800 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all hover:bg-slate-700 shadow-sm"
                >
                  Filtrar
                </button>
              </form>
            )}

            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold px-2 border-l border-slate-200">
              <CalendarIcon />
              <span className="text-slate-600 font-mono text-[10px]">
                {data?.periodo ? `${new Date(data.periodo.inicio).toLocaleDateString()} - ${new Date(data.periodo.fin).toLocaleDateString()}` : '--/--/--'}
              </span>
            </div>
          </div>
        </div>

        {/* Notificacion de error */}
        {error && (
          <div className="p-4 rounded-xl border bg-red-50 text-red-700 border-red-100 flex items-center gap-3 text-xs font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── SECCION 1: KPI GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Incidentes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Incidentes</span>
            </div>
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800 font-mono">{data?.kpis?.total?.actual ?? 0}</span>
                  <span className="text-xs font-semibold text-slate-400">creados</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderKPIChange(data?.kpis?.total, '%')}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Incidentes Activos */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incidentes Activos</span>
            </div>
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800 font-mono">{data?.kpis?.activos?.actual ?? 0}</span>
                  <span className="text-xs font-semibold text-slate-400 font-sans">activos</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderKPIChange(data?.kpis?.activos, '%')}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: SLA Cumplimiento */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumplimiento de SLA</span>
            </div>
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800 font-mono">{data?.kpis?.sla_cumplimiento?.actual ?? 100}%</span>
                  <span className="text-xs font-semibold text-slate-400">a tiempo</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderKPIChange(data?.kpis?.sla_cumplimiento, '%')}
                </div>
              </div>
            )}
          </div>

          {/* Card 4: MTTR */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolucion (MTTR)</span>
            </div>
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800 font-mono">{data?.kpis?.mttr?.actual ?? 0}h</span>
                  <span className="text-xs font-semibold text-slate-400">promedio</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderKPIChange(data?.kpis?.mttr, '%', true)}
                </div>
              </div>
            )}
          </div>

          {/* Card 5: MTTA */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asignacion (MTTA)</span>
            </div>
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800 font-mono">{data?.kpis?.mtta?.actual ?? 0}m</span>
                  <span className="text-xs font-semibold text-slate-400 font-sans">minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderKPIChange(data?.kpis?.mtta, '%', true)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SECCION 2: GRAFICOS INTERACTIVOS (SVG) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Grafico de Linea/Volumetria Temporal */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tendencia Temporal de Incidentes</h3>
                <p className="text-[10px] text-slate-400 font-medium">Volumen diario de tickets abiertos vs resueltos</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                  <span className="text-[10px] font-semibold text-slate-500">Creados</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
                  <span className="text-[10px] font-semibold text-slate-500">Resueltos</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-[220px] bg-slate-50 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold">
                Procesando datos volumetricos temporales...
              </div>
            ) : !lineChartPoints ? (
              <div className="h-[220px] bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
                No hay incidentes registrados en el periodo seleccionado
              </div>
            ) : (
              <div className="relative">
                <svg viewBox={`0 0 ${lineChartPoints.w} ${lineChartPoints.h}`} className="w-full h-auto overflow-visible select-none">
                  <defs>
                    <linearGradient id="gradCreados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="gradResueltos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines horizontales */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = lineChartPoints.paddingY + ratio * (lineChartPoints.h - 2 * lineChartPoints.paddingY);
                    const val = Math.round(lineChartPoints.maxVal * (1 - ratio));
                    return (
                      <g key={idx} className="opacity-40">
                        <line 
                          x1={lineChartPoints.paddingX} 
                          y1={y} 
                          x2={lineChartPoints.w - lineChartPoints.paddingX} 
                          y2={y} 
                          stroke="#E2E8F0" 
                          strokeWidth="1" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={lineChartPoints.paddingX - 10} 
                          y={y + 3} 
                          textAnchor="end" 
                          className="fill-slate-400 font-semibold font-mono text-[9px]"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Area Fills */}
                  {lineChartPoints.areaCreados && (
                    <path d={lineChartPoints.areaCreados} fill="url(#gradCreados)" />
                  )}
                  {lineChartPoints.areaResueltos && (
                    <path d={lineChartPoints.areaResueltos} fill="url(#gradResueltos)" />
                  )}

                  {/* Lines */}
                  {lineChartPoints.pathCreados && (
                    <path 
                      d={lineChartPoints.pathCreados} 
                      fill="none" 
                      stroke={ACCENT} 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}
                  {lineChartPoints.pathResueltos && (
                    <path 
                      d={lineChartPoints.pathResueltos} 
                      fill="none" 
                      stroke="#10B981" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}

                  {/* Interactividad (Puntos invisibles de hover y Tooltips) */}
                  {lineChartPoints.pointsCreados.map((p, i) => {
                    const resItem = lineChartPoints.pointsResueltos[i];
                    return (
                      <g 
                        key={i} 
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredData({ index: i, creado: p, resuelto: resItem })}
                        onMouseLeave={() => setHoveredData(null)}
                      >
                        {/* Circulos visibles en hover o siempre */}
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r={hoveredData?.index === i ? "5" : "3"} 
                          fill={ACCENT} 
                          stroke="#FFF" 
                          strokeWidth="1.5" 
                        />
                        <circle 
                          cx={resItem.x} 
                          cy={resItem.y} 
                          r={hoveredData?.index === i ? "5" : "3"} 
                          fill="#10B981" 
                          stroke="#FFF" 
                          strokeWidth="1.5" 
                        />
                        {/* Area de activacion de hover mas grande */}
                        <rect
                          x={p.x - 10}
                          y={lineChartPoints.paddingY}
                          width="20"
                          height={lineChartPoints.h - 2 * lineChartPoints.paddingY}
                          fill="transparent"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip Overlay Flotante React */}
                {hoveredData && (
                  <div 
                    className="absolute bg-slate-800 text-white rounded-xl p-3 text-[10px] space-y-1 shadow-xl border border-slate-700 pointer-events-none animate-fade-in z-20"
                    style={{
                      left: `${(hoveredData.creado.x / lineChartPoints.w) * 100}%`,
                      top: '10px',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <p className="font-bold border-b border-slate-700 pb-1 text-slate-300">
                      {new Date(hoveredData.creado.item.fecha + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="font-semibold">Creados: <span className="font-mono text-blue-300 font-bold">{hoveredData.creado.val}</span></p>
                    <p className="font-semibold">Resueltos: <span className="font-mono text-emerald-300 font-bold">{hoveredData.resuelto.val}</span></p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grafico Donut de Prioridad */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tickets por Prioridad</h3>
              <p className="text-[10px] text-slate-400 font-medium">Volumetria segmentada por nivel de criticidad (SLA Rules)</p>
            </div>

            {loading ? (
              <div className="h-[140px] flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">
                Procesando prioridades...
              </div>
            ) : donutChartSegments.length === 0 ? (
              <div className="h-[140px] border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                Sin datos de criticidad en el periodo
              </div>
            ) : (
              <div className="flex items-center justify-center gap-6">
                {/* SVG Donut */}
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {donutChartSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="10"
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={-seg.offset}
                        className="transition-all duration-300 hover:stroke-[12px] cursor-pointer"
                      />
                    ))}
                  </svg>
                  {/* Etiqueta Central */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total</span>
                    <span className="text-base font-extrabold text-slate-800 font-mono">
                      {data?.kpis?.total?.actual ?? 0}
                    </span>
                  </div>
                </div>

                {/* Leyendas */}
                <div className="flex-1 space-y-2">
                  {donutChartSegments.map((seg, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="capitalize font-semibold text-slate-600">{seg.prioridad}</span>
                      </div>
                      <span className="font-bold text-slate-700 font-mono">{seg.porcentaje}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categorias Mas Afectadas (Barras Horizontales) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Categorias de Incidentes Recurrentes</h3>
              <p className="text-[10px] text-slate-400 font-medium">Top de categorias con mayor volumetria (Matriz de Incidencias)</p>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !data?.incidentes_categoria || data.incidentes_categoria.length === 0 ? (
              <div className="h-[150px] border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                No hay incidencias clasificadas por categoria
              </div>
            ) : (
              <div className="space-y-3">
                {data.incidentes_categoria.slice(0, 5).map((cat, idx) => {
                  const pct = Math.round((parseInt(cat.cantidad) / maxCategoriaCantidad) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>{cat.categoria}</span>
                        <span className="font-bold text-slate-800 font-mono">{cat.cantidad} tickets</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${pct}%`, 
                            backgroundColor: ACCENT 
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ultimos Escalamientos Recientes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Escalamientos Recientes</h3>
                <p className="text-[10px] text-slate-400 font-medium">Incidentes derivados a soporte avanzado L2 / Admin</p>
              </div>
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <EscalationIcon />
              </span>
            </div>

            {loading ? (
              <div className="space-y-3 py-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !data?.escalamientos_recientes || data.escalamientos_recientes.length === 0 ? (
              <div className="h-[150px] border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium text-center px-4">
                No se registran escalamientos activos en este periodo
              </div>
            ) : (
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {data.escalamientos_recientes.map((esc) => (
                  <div key={esc.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">{esc.ticket_codigo}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{new Date(esc.creado_en).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-slate-600 truncate">{esc.ticket_titulo}</p>
                    <p className="text-slate-400 italic font-medium truncate">Motivo: {esc.motivo}</p>
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-1 mt-1 text-[9px] text-slate-500 font-semibold">
                      <span>De: {esc.escalado_por}</span>
                      <span>Para: {esc.asignado_ahora}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SECCION 3: PRODUCTIVIDAD DE TECNICOS ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Productividad del Equipo Tecnico</h3>
            <p className="text-[10px] text-slate-400 font-medium">Resoluciones y tickets activos por analista asignado (SLA Compliance)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                  <th className="text-left font-semibold px-4 py-3">Técnico Asignado</th>
                  <th className="text-center font-semibold px-4 py-3">Tickets Resueltos</th>
                  <th className="text-center font-semibold px-4 py-3">Tickets Activos</th>
                  <th className="text-center font-semibold px-4 py-3">SLA Excedido</th>
                  <th className="text-right font-semibold px-4 py-3">Tasa Resolucion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 animate-pulse font-semibold">
                      Obteniendo matriz de productividad del personal...
                    </td>
                  </tr>
                )}
                {!loading && (!data?.rendimiento_tecnicos || data.rendimiento_tecnicos.length === 0) && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                      No hay registros de productividad para tecnicos asignados.
                    </td>
                  </tr>
                )}
                {!loading && data?.rendimiento_tecnicos?.map((tec) => {
                  const resueltos = parseInt(tec.resueltos || 0);
                  const activos = parseInt(tec.activos || 0);
                  const total = resueltos + activos;
                  const rate = total > 0 ? Math.round((resueltos / total) * 100) : 0;
                  
                  return (
                    <tr key={tec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border shadow-sm flex-shrink-0"
                            style={getAvatarBg(tec.nombre)}
                          >
                            {getInitials(tec.nombre)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700">{tec.nombre}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              {tec.perfil === 'senior' ? 'Técnico Senior' : tec.perfil === 'semi_senior' ? 'Técnico Semi-Senior' : 'Técnico Junior'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600 font-mono">{resueltos}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600 font-mono">{activos}</td>
                      <td className="px-4 py-3 text-center font-bold text-rose-600 font-mono">{tec.vencidos_sla || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-slate-800 font-mono">{rate}%</span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}

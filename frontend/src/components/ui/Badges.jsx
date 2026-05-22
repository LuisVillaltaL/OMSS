import React from 'react';

export function PriorityBadge({ priority }) {
  const styles = {
    critico: 'bg-red-50 text-red-600 border border-red-100',
    alto:    'bg-orange-50 text-orange-600 border border-orange-100',
    medio:   'bg-blue-50 text-blue-600 border border-blue-100',
    bajo:    'bg-slate-50 text-slate-600 border border-slate-200',
  };
  const labels = { critico: 'Crítico', alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority] || 'bg-gray-50 text-gray-600'}`}>
      {labels[priority] || priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    abierto:     'bg-red-50 text-red-600 border border-red-100',
    en_progreso: 'bg-amber-50 text-amber-700 border border-amber-100',
    escalado:    'bg-purple-50 text-purple-700 border border-purple-100',
    resuelto:    'bg-blue-50 text-blue-700 border border-blue-100',
    cerrado:     'bg-emerald-50 text-emerald-700 border border-emerald-100',
  };
  const labels = {
    abierto: 'Abierto', en_progreso: 'En progreso',
    escalado: 'Escalado', resuelto: 'Resuelto', cerrado: 'Cerrado',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}

export function SlaBar({ sla_estado }) {
  if (!sla_estado) return <span className="text-xs text-slate-400">—</span>;
  const config = {
    en_tiempo: { color: '#10B981', label: 'En tiempo' },
    en_riesgo: { color: '#F59E0B', label: 'En riesgo' },
    vencido:   { color: '#EF4444', label: 'Vencido' },
    pausado:   { color: '#64748B', label: 'Pausado' },
  };
  const c = config[sla_estado] || { color: '#94A3B8', label: sla_estado };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: c.color }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, display: 'inline-block' }} />
      {c.label}
    </span>
  );
}
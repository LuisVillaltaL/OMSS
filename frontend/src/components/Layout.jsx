// RUTA: frontend/src/components/Layout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── COMPONENTES DE ÍCONOS MINIMALISTAS (ESTILO TAILADMIN) ───
function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}

function TicketsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z" />
    </svg>
  );
}

function ActivosIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
  );
}

function EmpleadosIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0-2.625.372 9.337 9.337 0 0 0-4.121-1.952 4.125 4.125 0 0 0-3.233 3.53.75.75 0 0 0 .75.822h11.23a.75.75 0 0 0 .75-.822c-.179-1.802-1.285-3.34-2.761-3.95M16.5 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 19.25a9 9 0 0 0-1.503-4.146M21.75 16.5a3.75 3.75 0 0 0-5.855-3.132M13.5 14.25a8.974 8.974 0 0 0-3.375-.656c-.906 0-1.78.134-2.607.382M2.25 16.5a3.75 3.75 0 0 0 5.855 3.132M4.5 15.25A8.972 8.972 0 0 1 6 11.104" />
    </svg>
  );
}

function ReportesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 3 18.375v-5.25ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-9.75ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/tickets', label: 'Tickets', icon: <TicketsIcon /> },
  { path: '/activos', label: 'Activos TI', icon: <ActivosIcon /> },
  { path: '/empleados', label: 'Empleados', icon: <EmpleadosIcon /> },
  { path: '/reportes', label: 'Reportes', icon: <ReportesIcon /> },
];


export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: '100vh', background: '#F1F5F9', fontFamily: "'Segoe UI',system-ui,sans-serif" }}
    >
      {/* ── SIDEBAR ── */}
      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-300"
        style={{ width: open ? '220px' : '64px', background: '#1C2434', overflow: 'hidden' }}
      >
        {/* Logo y Marca de la empresa, nuestra empresa*/}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          {/* Icono de Rayo Vectorial Blanco */}
          <div className="flex items-center justify-center bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-900/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="text-white"
              style={{ width: '20px', height: '20px' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
              />
            </svg>
          </div>

          {/* Texto del Sistema */}
          {open && (
            <div className="flex flex-col select-none animate-fade-in">
              <span className="text-sm font-bold text-white tracking-wider">
                S.L.A. System
              </span>
              <span className="text-[10px] font-medium text-blue-400 uppercase tracking-widest -mt-0.5">
                Support Suite
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {open && (
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-2 mb-2">
              Principal
            </p>
          )}
          {NAV.map(({ path, label, icon }) => {
            const active =
              location.pathname === path ||
              (path !== '/dashboard' && location.pathname.startsWith(path));
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={!open ? label : undefined}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: active ? '#3C50E0' : 'transparent',
                  color: active ? '#fff' : '#94A3B8',
                  boxShadow: active ? '0 4px 12px rgba(60,80,224,.3)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) { e.currentTarget.style.background = '#313D4A'; e.currentTarget.style.color = '#fff'; }
                }}
                onMouseLeave={e => {
                  if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }
                }}
              >
                <span className="flex-shrink-0" style={{ color: active ? '#fff' : '#8A99AD' }}>{icon}</span>
                {open && <span className="flex-1 text-left">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        {open && (
          <div
            className="px-3 py-3 border-t flex items-center gap-2"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: '#3C50E0' }}
            >
              {user?.nombre?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.nombre}</p>
              <p className="text-slate-500 text-xs truncate">{user?.rol}</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── HEADER (ESTILO TAILADMIN MINIMALISTA) ── */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">

          <div className="flex items-center gap-4 flex-1">
            {/* Botón Hamburguesa Línea Fina */}
            <button
              onClick={() => setOpen(v => !v)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Barra de Búsqueda Minimalista */}
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-1.5 flex-1 max-w-xs transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-sm">
              <span className="text-slate-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                </svg>
              </span>
              <input
                className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none flex-1 font-medium"
                placeholder="Buscar tickets o incidentes..."
              />
            </div>
          </div>

          {/* Menú de Acciones Derecha */}
          <div className="flex items-center gap-3">

            {/* Campana de Notificaciones Lineal */}
            <button className="relative p-2 rounded-xl text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {/* Punto indicador de alerta */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>

            {/* Separador vertical */}
            <div className="w-px h-6 bg-slate-200/80 mx-1" />

            {/* Perfil del Usuario Autenticado */}
            <div className="flex items-center gap-2.5">
              {open && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-700 leading-none truncate max-w-[100px]">{user?.nombre?.split(' ')[0]}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5 capitalize">{user?.rol?.replace('_', ' ')}</p>
                </div>
              )}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-transform active:scale-95 cursor-pointer"
                style={{ background: '#3C50E0' }}
              >
                {user?.nombre?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>

          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
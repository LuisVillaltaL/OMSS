// RUTA: frontend/src/components/Layout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotificaciones } from '../hooks/useNotificaciones';

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

function ConfigIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function ComprasIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function VentasIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleExpand = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const { notificaciones, unreadCount, leerNotificacion, leerTodas } = useNotificaciones();

  // Sincronizar el input si cambia el parametro q en la URL
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  // Manejar cierre de dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/tickets?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  // Generar dinámicamente el listado de navegación
  const menuItems = [];
  if (user?.rol !== 'usuario_final') {
    menuItems.push({ path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> });
  }

  const permitidos = user?.modulos_permitidos || [];

  if (permitidos.includes('tickets') || user?.rol === 'usuario_final') {
    const isFinal = user?.rol === 'usuario_final';
    menuItems.push({
      path: isFinal ? '/mis-tickets' : '/tickets',
      label: isFinal ? 'Mis Tickets' : 'Tickets',
      icon: <TicketsIcon />
    });
  }

  if (permitidos.includes('activos')) {
    menuItems.push({
      label: 'Activos TI',
      icon: <ActivosIcon />,
      key: 'activos',
      children: [
        { path: '/activos?tab=hardware', label: 'Equipos (Hardware)' },
        { path: '/activos?tab=software', label: 'Licencias (Software)' }
      ]
    });
  }

  if (permitidos.includes('empleados')) {
    menuItems.push({ path: '/empleados', label: 'Empleados', icon: <EmpleadosIcon /> });
  }
  if (permitidos.includes('compras')) {
    menuItems.push({ path: '/compras', label: 'Compras', icon: <ComprasIcon /> });
  }
  if (permitidos.includes('ventas')) {
    menuItems.push({ path: '/ventas', label: 'Ventas', icon: <VentasIcon /> });
  }

  if (user?.rol === 'admin') {
    menuItems.push({ path: '/configuracion', label: 'Configuracion', icon: <ConfigIcon /> });
  }


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
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {open && (
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-2 mb-2">
              Principal
            </p>
          )}
          {menuItems.map((item) => {
            if (item.children) {
              const isChildActive = item.children.some(child => 
                location.pathname + location.search === child.path ||
                (child.path.includes('?') && location.pathname === child.path.split('?')[0] && (location.search === '?' + child.path.split('?')[1] || (child.path.endsWith('tab=hardware') && !location.search)))
              );
              const isExpanded = expandedMenus[item.key] !== undefined ? expandedMenus[item.key] : isChildActive;

              return (
                <div key={item.key} className="space-y-1">
                  {/* Botón Principal del Grupo */}
                  <button
                    onClick={() => {
                      if (!open) setOpen(true);
                      toggleExpand(item.key);
                    }}
                    title={!open ? item.label : undefined}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      color: isChildActive ? '#fff' : '#94A3B8',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#313D4A';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = isChildActive ? '#fff' : '#94A3B8';
                    }}
                  >
                    <span className="flex-shrink-0" style={{ color: isChildActive ? '#fff' : '#8A99AD' }}>{item.icon}</span>
                    {open && <span className="flex-1 text-left">{item.label}</span>}
                    {open && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className={`w-3 h-3 transition-transform duration-200 text-slate-500 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    )}
                  </button>

                  {/* Elementos Hijos Desplegables */}
                  {open && isExpanded && (
                    <div className="pl-9 pr-2 space-y-1 animate-fade-in">
                      {item.children.map(child => {
                        const active =
                          location.pathname + location.search === child.path ||
                          (child.path.includes('?') && location.pathname === child.path.split('?')[0] && (location.search === '?' + child.path.split('?')[1] || (child.path.endsWith('tab=hardware') && !location.search)));
                        
                        return (
                          <button
                            key={child.path}
                            onClick={() => navigate(child.path)}
                            className="w-full flex items-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-colors text-left"
                            style={{
                              color: active ? '#fff' : '#8A99AD',
                              background: active ? '#3C50E0' : 'transparent',
                              boxShadow: active ? '0 2px 8px rgba(60,80,224,.2)' : 'none',
                            }}
                            onMouseEnter={e => {
                              if (!active) { e.currentTarget.style.color = '#fff'; }
                            }}
                            onMouseLeave={e => {
                              if (!active) { e.currentTarget.style.color = '#8A99AD'; }
                            }}
                          >
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Renderizado Normal de un Elemento sin Hijos
            const active =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={!open ? item.label : undefined}
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
                <span className="flex-shrink-0" style={{ color: active ? '#fff' : '#8A99AD' }}>{item.icon}</span>
                {open && <span className="flex-1 text-left">{item.label}</span>}
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
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-1.5 flex-1 max-w-xs transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-sm">
              <button type="submit" className="text-slate-400 flex-shrink-0 hover:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                </svg>
              </button>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none flex-1 font-medium"
                placeholder="Buscar tickets o incidentes..."
              />
            </form>
          </div>

          {/* Menú de Acciones Derecha */}
          <div className="flex items-center gap-3">

            {/* Campana de Notificaciones con Dropdown */}
            <div className="relative flex" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(prev => !prev);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-xl text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-11 w-80 bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-xs font-bold text-slate-800">Notificaciones ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={leerTodas}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Marcar todas leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notificaciones.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-slate-400">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notificaciones.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.leida) leerNotificacion(n.id);
                            if (n.ticket_id) {
                              navigate('/tickets');
                            }
                            setShowNotifications(false);
                          }}
                          className={`px-4 py-3 cursor-pointer transition-colors text-left flex gap-2.5 hover:bg-slate-50 ${!n.leida ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            n.tipo?.startsWith('ticket') ? 'bg-blue-100 text-blue-600' :
                            n.tipo?.startsWith('sla') ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {n.tipo?.startsWith('ticket') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 leading-snug truncate">
                              {n.titulo}
                            </p>
                            {n.mensaje && (
                              <p className="text-[10px] text-slate-500 leading-normal mt-0.5 line-clamp-2">
                                {n.mensaje}
                              </p>
                            )}
                            <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
                              {new Date(n.creado_en).toLocaleDateString('es-GT', {
                                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {!n.leida && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Separador vertical */}
            <div className="w-px h-6 bg-slate-200/80 mx-1" />

            {/* Perfil del Usuario Autenticado con Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <div
                onClick={() => {
                  setShowUserMenu(prev => !prev);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 cursor-pointer select-none active:opacity-85"
              >
                {open && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-700 leading-none truncate max-w-[100px]">
                      {user?.nombre?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5 capitalize">
                      {user?.rol?.replace('_', ' ')}
                    </p>
                  </div>
                )}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-transform active:scale-95"
                  style={{ background: '#3C50E0' }}
                >
                  {user?.nombre?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>

              {showUserMenu && (
                <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate text-left">
                      {user?.nombre} {user?.apellido || ''}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5 text-left">
                      {user?.correo || 'correo@itsm.com'}
                    </span>
                    <span className="inline-block self-start mt-1.5 px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-full uppercase tracking-wider">
                      {user?.rol?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        alert(`Detalles del perfil:\n\nUsuario: ${user?.nombre}\nRol: ${user?.rol}\nID: ${user?.id}`);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }} className="text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      Mi Perfil
                    </button>

                    {user?.rol === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/configuracion');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors text-left"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }} className="text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        </svg>
                        Configuración
                      </button>
                    )}

                    <div className="h-px bg-slate-100 my-1 mx-2" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }} className="text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
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
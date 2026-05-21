import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';


// ── Componente de ruta protegida ──────────────────────────────
function PrivateRoute({ children, roles = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// ── Placeholder Dashboard (hasta que construyamos el módulo) ───
function DashboardPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', maxWidth: '480px', width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }}>

        {/* Éxito */}
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#059669" style={{ width: '26px', height: '26px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1C2434', marginBottom: '8px' }}>
          Login exitoso
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>
          Conectado correctamente al backend y a PostgreSQL
        </p>

        {/* Info del usuario */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            Usuario autenticado
          </p>
          {[
            ['Nombre',  user?.nombre],
            ['Correo',  user?.correo],
            ['Rol',     user?.rol],
            ['Perfil',  user?.perfil || '—'],
          ].map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', marginBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>{key}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1C2434' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* JWT en localStorage */}
        <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#3730A3', marginBottom: '6px' }}>
            JWT almacenado en localStorage
          </p>
          <p style={{ fontSize: '10px', color: '#4338CA', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {localStorage.getItem('accessToken')?.slice(0, 60)}...
          </p>
        </div>

        <button
          onClick={logout}
          style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1C2434', color: '#fff', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ── 401 Unauthorized ──────────────────────────────────────────
function Unauthorized() {
  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center', background:'#F1F5F9' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:'48px', margin:0 }}>🔒</p>
        <h2 style={{ color:'#1C2434', marginTop:'8px' }}>Sin permisos</h2>
        <p style={{ color:'#64748B', fontSize:'14px' }}>Tu rol no tiene acceso a esta sección</p>
        <a href="/dashboard" style={{ color:'#3C50E0', fontSize:'13px', fontWeight:'600' }}>
          ← Ir al inicio
        </a>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta raíz → login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Pública */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protegidas */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPlaceholder />
            </PrivateRoute>
          } />

          {/* Tickets — solo técnicos y admin */}
          <Route path="/tickets" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2']}>
              <DashboardPlaceholder />
            </PrivateRoute>
          } />

          {/* Mis tickets — usuario final */}
          <Route path="/mis-tickets" element={
            <PrivateRoute roles={['usuario_final']}>
              <DashboardPlaceholder />
            </PrivateRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login   from './pages/Login';
import Tickets from './pages/Tickets';
import Activos from './pages/Activos'; // ◄── Importación de la CMDB que creamos

function PrivateRoute({ children, roles = [] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.rol)) return <Navigate to="/unauthorized" replace />;
  return children;
}

// ── EL COMPONENTE INTERMEDIO RÚSTICO Y DE ALTO CONTRASTE ──
function DashboardPlaceholder() {
  const { user, logout } = useAuth();
  
  // Estilo común para mantener los botones rústicos y cuadradotes
  const btnStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#3C50E0',
    color: '#fff',
    fontWeight: '700',
    fontSize: '12px',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.1s'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', maxWidth: '500px', width: '100%', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: '48px', margin: '0 0 16px' }}>⚙️</p>
        <h2 style={{ color: '#1C2434', margin: '0 0 4px', fontSize: '20px', fontFamily: 'sans-serif' }}>Control Center — S.L.A. System</h2>
        <p style={{ color: '#64748B', fontSize: '13px', margin: '0 0 24px' }}>Usuario: {user?.nombre} | Rol: {user?.rol}</p>
        
        {/* Cuadrícula de accesos con íconos bien tradicionales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <a href="/tickets" style={btnStyle}>
            <span style={{ fontSize: '20px' }}>🎫</span>
            Ir a Tickets
          </a>
          <a href="/activos" style={btnStyle}>
            <span style={{ fontSize: '20px' }}>💻</span>
            Activos TI
          </a>
          <button onClick={() => alert('Módulo de empleados en desarrollo...')} style={btnStyle}>
            <span style={{ fontSize: '20px' }}>👥</span>
            Empleados
          </button>
          <button onClick={() => alert('Módulo de reportes en desarrollo...')} style={btnStyle}>
            <span style={{ fontSize: '20px' }}>📊</span>
            Reportes
          </button>
        </div>

        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
          <button onClick={logout} style={{ padding: '10px 24px', borderRadius: '8px', background: '#1C2434', color: '#fff', fontWeight: '700', fontSize: '12px', border: 'none', cursor: 'pointer', width: '100%' }}>
            ❌ Cerrar sesión del sistema
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"      element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<div style={{textAlign:'center',padding:'60px'}}>Sin permisos 🔒</div>} />
          
          {/* El despachador de entrada */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPlaceholder /></PrivateRoute>} />
          
          {/* Módulo de Tickets Premium */}
          <Route path="/tickets" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2']}>
              <Tickets />
            </PrivateRoute>
          } />

          {/* Módulo de Activos Premium (Conectado para evitar el cierre de sesión) */}
          <Route path="/activos" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2']}>
              <Activos />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
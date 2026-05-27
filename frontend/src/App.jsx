// RUTA: frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login   from './pages/Login';
import Tickets from './pages/Tickets';
import Activos from './pages/Activos';
import Configuracion from './pages/Configuracion';
import Reportes from './pages/Reportes';
import Empleados from './pages/Empleados';
import Layout from './components/Layout';

function PrivateRoute({ children, roles = [], modulo }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.rol)) return <Navigate to="/unauthorized" replace />;
  if (modulo && (!user.modulos_permitidos || !user.modulos_permitidos.includes(modulo))) {
    // El rol usuario_final siempre tiene permitido el módulo de tickets
    if (!(user.rol === 'usuario_final' && modulo === 'tickets')) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  return children;
}

function ModuloProximamente({ titulo }) {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm m-6 text-center font-sans space-y-3">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">{titulo}</h2>
        <p className="text-xs text-slate-400">Este módulo se encuentra en fase de desarrollo integrado. Próximamente disponible.</p>
      </div>
    </Layout>
  );
}

function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans text-center px-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Acceso Restringido</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          No tiene los privilegios o permisos necesarios para visualizar este módulo. Por favor, solicite acceso al administrador del sistema.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
          style={{ backgroundColor: '#3C50E0' }}
        >
          Volver al Dashboard
        </button>
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
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* El despachador de entrada: Ahora es el Dashboard Premium de Analíticas */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2']}>
              <Reportes />
            </PrivateRoute>
          } />
          
          {/* Módulo de Tickets Premium */}
          <Route path="/tickets" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2','usuario_final']} modulo="tickets">
              <Tickets />
            </PrivateRoute>
          } />

          {/* Módulo de Tickets para el Usuario Final */}
          <Route path="/mis-tickets" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2','usuario_final']} modulo="tickets">
              <Tickets />
            </PrivateRoute>
          } />

          {/* Módulo de Activos Premium */}
          <Route path="/activos" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2']} modulo="activos">
              <Activos />
            </PrivateRoute>
          } />

          {/* Módulo de Configuración Global */}
          <Route path="/configuracion" element={
            <PrivateRoute roles={['admin']}>
              <Configuracion />
            </PrivateRoute>
          } />

          {/* Módulo de Reportes y Métricas (redirigido a /dashboard) */}
          <Route path="/reportes" element={<Navigate to="/dashboard" replace />} />

          {/* Módulo de Empleados */}
          <Route path="/empleados" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2']} modulo="empleados">
              <Empleados />
            </PrivateRoute>
          } />

          {/* Módulo de Compras */}
          <Route path="/compras" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2']} modulo="compras">
              <ModuloProximamente titulo="Módulo de Compras" />
            </PrivateRoute>
          } />

          {/* Módulo de Ventas */}
          <Route path="/ventas" element={
            <PrivateRoute roles={['admin','tecnico_l1','tecnico_l2']} modulo="ventas">
              <ModuloProximamente titulo="Módulo de Ventas" />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
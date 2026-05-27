import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ícono de ojo (mostrar/ocultar contraseña)
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth();

  const [form, setForm] = useState({ correo: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.correo) errs.correo = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.correo)) errs.correo = 'Correo inválido';
    if (!form.password) errs.password = 'La contraseña es requerida';
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    return errs;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (error) setError(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    const result = await login(form.correo, form.password);
    if (result.ok) {
      const destinos = {
        admin: '/dashboard',
        tecnico_l1: '/dashboard',
        tecnico_l2: '/dashboard',
        usuario_final: '/mis-tickets',
      };
      navigate(destinos[result.user.rol] || '/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>

      {/* ── Panel izquierdo — branding (oculto en móvil) ─────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: '#1C2434' }}>
        {/* Logo de escritorio con dimensiones fijas */}
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3C50E0' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={2} stroke="white" style={{ width: '24px', height: '24px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>

        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Gestiona incidentes<br />de TI con eficiencia
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Plataforma ITSM basada en ITIL 4 para registro, seguimiento y resolución
            de incidentes tecnológicos con control de SLAs en tiempo real.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { val: '94.2%', label: 'SLA compliance' },
              { val: '2.4h', label: 'MTTR promedio' },
              { val: '318', label: 'Activos TI' },
            ].map(({ val, label }) => (
              <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-white text-2xl font-bold">{val}</p>
                <p className="text-slate-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">
          ManageEngine MSP Central v1.0
        </p>
      </div>

      {/* ── Panel derecho — formulario ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Logo en móvil con dimensiones fijas corregidas */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3C50E0' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={2} stroke="white" style={{ width: '20px', height: '20px' }}> {/* ◄── Añadido style fijo para móvil */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="font-bold text-xl" style={{ color: '#1C2434' }}>IncidentIQ</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold" style={{ color: '#1C2434' }}>
                Iniciar sesión
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  strokeWidth={2} stroke="#DC2626" className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1C2434' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="admin@itsm.gt"
                  autoComplete="email"
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
                    ${fieldErrors.correo
                      ? 'border-red-400 bg-red-50 focus:border-red-500'
                      : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'}`}
                  style={{ color: '#1C2434' }}
                />
                {fieldErrors.correo && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.correo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1C2434' }}>
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all
                      ${fieldErrors.password
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'}`}
                    style={{ color: '#1C2434' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={{ background: '#3C50E0' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Ingresando...
                  </span>
                ) : 'Iniciar sesión'}
              </button>
            </form>

            {/*<div className="mt-6 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                🧪 Credenciales de prueba
              </p>
              <div className="space-y-1">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">Correo:</span> admin@itsm.gt
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">Contraseña:</span> Admin1234!
                </p>*
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold hover:underline"
                style={{ color: '#3C50E0' }}
                onClick={() => {
                  setForm({ correo: 'admin@itsm.gt', password: 'Admin1234!' });
                  setFieldErrors({});
                  setError(null);
                }}
              >
                → Autocompletar
              </button>
            </div>*/}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            ITSM — Sistema de Gestión de Incidentes de TI · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { empleadosService } from '../services/empleados.service';
import {
  Settings,
  Bell,
  User,
  Moon,
  Sun,
  Globe,
  Mail,
  Smartphone,
  Shield,
  Key,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function ConfiguracionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isRRHH } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [error, setError] = useState('');

  // Datos del usuario actual
  const [empleado, setEmpleado] = useState<any>(null);

  // Perfil
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  // Cambiar contraseña
  const [showCambiarPassword, setShowCambiarPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false);

  // Notificaciones (localStorage)
  const [notificacionesEmail, setNotificacionesEmail] = useState(true);
  const [notificacionesPush, setNotificacionesPush] = useState(true);
  const [notificacionesOrden, setNotificacionesOrden] = useState(true);
  const [notificacionesEvaluacion, setNotificacionesEvaluacion] = useState(true);
  const [notificacionesKpiRojo, setNotificacionesKpiRojo] = useState(true);
  const [resumenSemanal, setResumenSemanal] = useState(false);

  // Preferencias (localStorage)
  const [idioma, setIdioma] = useState('es');
  const [tema, setTema] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    cargarDatos();
    cargarPreferencias();
  }, [user]);

  const cargarDatos = async () => {
    console.log('🔍 USER COMPLETO:', user);
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('📡 Buscando empleado con ID:', user.id);
      const data = await empleadosService.getById(user.id);
      setEmpleado(data);
      setNombre(data.nombre);
      setApellido(data.apellido);
      setEmail(data.email);
      setTelefono(data.telefono || '');
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarPreferencias = () => {
    // Cargar desde localStorage
    const prefs = localStorage.getItem('user_preferences');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      setNotificacionesEmail(parsed.notificacionesEmail ?? true);
      setNotificacionesPush(parsed.notificacionesPush ?? true);
      setNotificacionesOrden(parsed.notificacionesOrden ?? true);
      setNotificacionesEvaluacion(parsed.notificacionesEvaluacion ?? true);
      setNotificacionesKpiRojo(parsed.notificacionesKpiRojo ?? true);
      setResumenSemanal(parsed.resumenSemanal ?? false);
      setIdioma(parsed.idioma ?? 'es');
      setTema(parsed.tema ?? 'light');
    }
  };

  const handleGuardarPerfil = async () => {
    if (!user?.id) return;

    setError('');
    setGuardando(true);

    try {
      await empleadosService.update(user.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
      });

      // Guardar preferencias en localStorage
      const preferencias = {
        notificacionesEmail,
        notificacionesPush,
        notificacionesOrden,
        notificacionesEvaluacion,
        notificacionesKpiRojo,
        resumenSemanal,
        idioma,
        tema,
      };
      localStorage.setItem('user_preferences', JSON.stringify(preferencias));

      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3000);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      setError(error.response?.data?.message || 'Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarPassword = async () => {
    if (!user?.id) return;

    setError('');

    // Validaciones
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      setError('Todos los campos de contraseña son requeridos');
      return;
    }

    if (passwordNueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordNueva !== passwordConfirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setGuardando(true);

    try {
      await empleadosService.update(user.id, {
        password: passwordNueva,
      });

      alert('Contraseña actualizada exitosamente');
      setShowCambiarPassword(false);
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      setError(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Configuración Personal
          </h1>
          <p className="text-gray-600 mt-1">Personaliza tu experiencia en el sistema</p>
        </div>

        {/* Mensaje de éxito */}
        {guardadoExitoso && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-900 font-medium">Configuración guardada exitosamente</p>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-900 font-medium">{error}</p>
          </div>
        )}

        {/* Info de permisos */}
        {(isAdmin || isRRHH) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-900">
                <strong>Permisos elevados:</strong> Tienes acceso a funciones administrativas del sistema
              </p>
            </div>
          </div>
        )}

        {/* Perfil */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Perfil</h2>
              <p className="text-sm text-gray-600">Información de tu cuenta</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  disabled={true}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                <input
                  type="text"
                  disabled={true}
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                disabled={true}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Info adicional */}
            {empleado && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Área:</p>
                    <p className="font-medium text-gray-900">{empleado.area?.nombre || 'Sin área'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Puesto:</p>
                    <p className="font-medium text-gray-900">{empleado.puesto?.nombre || 'Sin puesto'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rol:</p>
                    <p className="font-medium text-gray-900 capitalize">{empleado.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">DNI:</p>
                    <p className="font-medium text-gray-900">{empleado.dni || 'No registrado'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notificaciones</h2>
              <p className="text-sm text-gray-600">Gestiona cómo quieres recibir alertas</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Canales */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Canales de Notificación</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">Recibir notificaciones por correo</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificacionesEmail}
                    onChange={/*(e) => setNotificacionesEmail(e.target.checked)*/ () => { }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Notificaciones Push</p>
                      <p className="text-sm text-gray-600">Alertas en el navegador</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificacionesPush}
                    onChange={/*(e) => setNotificacionesPush(e.target.checked)*/ () => { }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Tipos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tipos de Notificaciones</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Órdenes de trabajo</p>
                    <p className="text-sm text-gray-600">Nuevas asignaciones y actualizaciones</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificacionesOrden}
                    onChange={/*(e) => setNotificacionesOrden(e.target.checked)*/ () => { }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Evaluaciones</p>
                    <p className="text-sm text-gray-600">Cuando se genera una nueva evaluación</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificacionesEvaluacion}
                    onChange={/*(e) => setNotificacionesEvaluacion(e.target.checked)*/ () => { }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:bg-blue-500 "
                  />
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">KPIs críticos</p>
                    <p className="text-sm text-gray-600">Alerta cuando un KPI está en rojo</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificacionesKpiRojo}
                    onChange={/*(e) => setNotificacionesKpiRojo(e.target.checked)*/ () => { }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Resumen semanal</p>
                    <p className="text-sm text-gray-600">Reporte de desempeño cada semana</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={resumenSemanal}
                    onChange={/*(e) => setResumenSemanal(e.target.checked)*/ () => { }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preferencias */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Preferencias</h2>
              <p className="text-sm text-gray-600">Personaliza la interfaz del sistema</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Idioma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Idioma
              </label>
              <select
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="es">Español</option>
                <option value="en">English (Próximamente)</option>
              </select>
            </div>

            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTema('light')}
                  className={`p-4 border-2 rounded-lg transition-all ${tema === 'light' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Sun className={`w-6 h-6 mx-auto mb-2 ${tema === 'light' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="font-medium text-gray-900">Claro</p>
                </button>

                <button
                  onClick={() => setTema('dark')}
                  disabled
                  className="p-4 border-2 rounded-lg transition-all border-gray-200 opacity-50 cursor-not-allowed"
                >
                  <Moon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium text-gray-900">Oscuro</p>
                  <p className="text-xs text-gray-500 mt-1">Próximamente</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-50 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Seguridad</h2>
              <p className="text-sm text-gray-600">Gestiona la seguridad de tu cuenta</p>
            </div>
          </div>

          <div className="space-y-3">
            {!showCambiarPassword ? (
              <button
                onClick={() => setShowCambiarPassword(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Cambiar contraseña</p>
                    <p className="text-sm text-gray-600">Actualiza tu contraseña periódicamente</p>
                  </div>
                </div>
                <span className="text-blue-600 text-sm font-medium">Cambiar →</span>
              </button>
            ) : (
              <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Cambiar Contraseña</h3>
                  <button
                    onClick={() => {
                      setShowCambiarPassword(false);
                      setPasswordActual('');
                      setPasswordNueva('');
                      setPasswordConfirmar('');
                      setError('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPasswordActual ? 'text' : 'password'}
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordActual(!showPasswordActual)}
                    className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordActual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPasswordNueva ? 'text' : 'password'}
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                    className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordNueva ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPasswordConfirmar ? 'text' : 'password'}
                    value={passwordConfirmar}
                    onChange={(e) => setPasswordConfirmar(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmar(!showPasswordConfirmar)}
                    className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordConfirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  onClick={handleCambiarPassword}
                  disabled={guardando}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {guardando ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-700">Autenticación de dos factores</p>
                  <p className="text-sm text-gray-500">Agrega una capa extra de seguridad</p>
                </div>
                <span className="ml-auto text-gray-400 text-sm">Próximamente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardarPerfil}
            disabled={guardando}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
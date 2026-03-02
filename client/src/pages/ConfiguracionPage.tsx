import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { usePermissions } from '../hooks/usePermissions';
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
} from 'lucide-react';

export default function ConfiguracionPage() {
  const { isAdmin, isRRHH } = usePermissions();
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Preferencias de usuario
  const [notificacionesEmail, setNotificacionesEmail] = useState(true);
  const [notificacionesPush, setNotificacionesPush] = useState(true);
  const [notificacionesOrden, setNotificacionesOrden] = useState(true);
  const [notificacionesEvaluacion, setNotificacionesEvaluacion] = useState(true);
  const [notificacionesKpiRojo, setNotificacionesKpiRojo] = useState(true);
  const [resumenSemanal, setResumenSemanal] = useState(false);

  const [idioma, setIdioma] = useState('es');
  const [tema, setTema] = useState<'light' | 'dark'>('light');

  const handleGuardar = async () => {
    setGuardando(true);

    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));

    setGuardando(false);
    setGuardadoExitoso(true);

    setTimeout(() => setGuardadoExitoso(false), 3000);
  };

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

        {/* Info de permisos - Solo visible para admin/RRHH */}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                placeholder="+504 1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
                    onChange={(e) => setNotificacionesEmail(e.target.checked)}
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
                    onChange={(e) => setNotificacionesPush(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Tipos de notificaciones */}
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
                    onChange={(e) => setNotificacionesOrden(e.target.checked)}
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
                    onChange={(e) => setNotificacionesEvaluacion(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setNotificacionesKpiRojo(e.target.checked)}
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
                    onChange={(e) => setResumenSemanal(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preferencias de la aplicación */}
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
                <option value="en">English</option>
              </select>
            </div>

            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTema('light')}
                  className={`p-4 border-2 rounded-lg transition-all ${tema === 'light'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Sun className={`w-6 h-6 mx-auto mb-2 ${tema === 'light' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="font-medium text-gray-900">Claro</p>
                </button>

                <button
                  onClick={() => setTema('dark')}
                  className={`p-4 border-2 rounded-lg transition-all ${tema === 'dark'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Moon className={`w-6 h-6 mx-auto mb-2 ${tema === 'dark' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="font-medium text-gray-900">Oscuro</p>
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
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Cambiar contraseña</p>
                  <p className="text-sm text-gray-600">Actualiza tu contraseña periódicamente</p>
                </div>
              </div>
              <span className="text-blue-600 text-sm font-medium">Cambiar →</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Autenticación de dos factores</p>
                  <p className="text-sm text-gray-600">Agrega una capa extra de seguridad</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">Próximamente</span>
            </button>
          </div>
        </div>

        {/* Botón guardar */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
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
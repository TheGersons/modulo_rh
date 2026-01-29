import { useState } from 'react';
import Layout from '../components/layout/Layout';
import {
  Settings,
  Building,
  Target,
  Users,
  Bell,
  Lock,
  Calendar,
  Save,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('areas');

  const tabs = [
    { id: 'areas', label: 'Áreas', icon: Building },
    { id: 'kpis', label: 'KPIs', icon: Target },
    { id: 'periodos', label: 'Periodos', icon: Calendar },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'seguridad', label: 'Seguridad', icon: Lock },
  ];

  // Datos de ejemplo
  const [areas, setAreas] = useState([
    { id: '1', nombre: 'Gerencia', jefe: 'Carlos Méndez', empleados: 2, activa: true },
    { id: '2', nombre: 'Administrativa', jefe: 'Ana García', empleados: 2, activa: true },
    { id: '3', nombre: 'Técnica', jefe: 'Luis Torres', empleados: 2, activa: true },
  ]);

  const [kpis, setKpis] = useState([
    { id: '1', nombre: 'Cumplimiento de Objetivos', area: 'Gerencia', meta: 90, activo: true },
    { id: '2', nombre: 'Satisfacción de Stakeholders', area: 'Gerencia', meta: 85, activo: true },
    { id: '3', nombre: 'Tiempo de Reclutamiento', area: 'Administrativa', meta: 30, activo: true },
  ]);

  const renderAreas = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Áreas</h2>
          <p className="text-gray-600 mt-1">Configura las áreas organizacionales</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nueva Área
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Área</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Jefe</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Empleados</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Estado</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {areas.map((area) => (
              <tr key={area.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{area.nombre}</td>
                <td className="px-6 py-4 text-gray-600">{area.jefe}</td>
                <td className="px-6 py-4 text-center text-gray-900">{area.empleados}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    area.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {area.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderKPIs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catálogo de KPIs</h2>
          <p className="text-gray-600 mt-1">Define los KPIs por área</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo KPI
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">KPI</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Área</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Meta</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Estado</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {kpis.map((kpi) => (
              <tr key={kpi.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{kpi.nombre}</td>
                <td className="px-6 py-4 text-gray-600">{kpi.area}</td>
                <td className="px-6 py-4 text-center font-bold text-blue-600">{kpi.meta}%</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    kpi.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {kpi.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPeriodos = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración de Periodos</h2>
        <p className="text-gray-600 mt-1">Define los periodos de evaluación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Año Actual</h3>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-semibold">
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tipos de Periodo</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-2" />
              <span className="font-semibold text-gray-900">Mensual</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-2" />
              <span className="font-semibold text-gray-900">Trimestral</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-2" />
              <span className="font-semibold text-gray-900">Semestral</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-2" />
              <span className="font-semibold text-gray-900">Anual</span>
            </label>
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
        <Save className="w-5 h-5" />
        Guardar Configuración
      </button>
    </div>
  );

  const renderNotificaciones = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notificaciones</h2>
        <p className="text-gray-600 mt-1">Configura las alertas del sistema</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <label className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer">
          <input type="checkbox" defaultChecked className="w-5 h-5 mt-1 rounded border-2" />
          <div>
            <p className="font-semibold text-gray-900">Nueva evaluación recibida</p>
            <p className="text-sm text-gray-600">Notificar al empleado cuando recibe una evaluación</p>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer">
          <input type="checkbox" defaultChecked className="w-5 h-5 mt-1 rounded border-2" />
          <div>
            <p className="font-semibold text-gray-900">Validación pendiente</p>
            <p className="text-sm text-gray-600">Recordatorio de evaluaciones sin validar</p>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer">
          <input type="checkbox" defaultChecked className="w-5 h-5 mt-1 rounded border-2" />
          <div>
            <p className="font-semibold text-gray-900">KPIs críticos</p>
            <p className="text-sm text-gray-600">Alertar cuando un KPI entra en estado rojo</p>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer">
          <input type="checkbox" className="w-5 h-5 mt-1 rounded border-2" />
          <div>
            <p className="font-semibold text-gray-900">Resumen semanal</p>
            <p className="text-sm text-gray-600">Enviar resumen de KPIs cada semana</p>
          </div>
        </label>
      </div>

      <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
        <Save className="w-5 h-5" />
        Guardar Preferencias
      </button>
    </div>
  );

  const renderPlaceholder = (title: string) => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">Esta sección está en desarrollo</p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200 text-center">
        <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <p className="text-blue-900 font-semibold">Próximamente</p>
        <p className="text-blue-700 text-sm mt-2">Esta funcionalidad estará disponible pronto</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'areas':
        return renderAreas();
      case 'kpis':
        return renderKPIs();
      case 'periodos':
        return renderPeriodos();
      case 'notificaciones':
        return renderNotificaciones();
      case 'usuarios':
        return renderPlaceholder('Gestión de Usuarios');
      case 'seguridad':
        return renderPlaceholder('Configuración de Seguridad');
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Configuración
          </h1>
          <p className="text-gray-600 mt-1">
            Configura el sistema de gestión de KPIs
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
}
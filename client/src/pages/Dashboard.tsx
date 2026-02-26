import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  ArrowRight,
  Activity,
  TrendingDown,
  Zap,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';

interface DashboardStats {
  empleados: { total: number };
  areas: { total: number };
  kpis: { total: number };
  ordenes: {
    total: number;
    activas: number;
    completadas: number;
    vencidas: number;
    porcentajeCompletadas: number;
  };
  alertas: { activas: number };
  evaluaciones: { recientes: number };
}

interface AreaRanking {
  nombre: string;
  promedio: number;
  tendencia: 'up' | 'down' | 'stable';
}

interface ActividadReciente {
  tipo: 'orden_completada' | 'evaluacion' | 'alerta' | 'kpi';
  titulo: string;
  descripcion: string;
  timestamp: string;
  icono: any;
  color: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    empleados: { total: 0 },
    areas: { total: 0 },
    kpis: { total: 0 },
    ordenes: {
      total: 0,
      activas: 0,
      completadas: 0,
      vencidas: 0,
      porcentajeCompletadas: 0,
    },
    alertas: { activas: 0 },
    evaluaciones: { recientes: 0 },
  });

  const [areasRanking, setAreasRanking] = useState<AreaRanking[]>([]);
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      // TODO: Llamar al endpoint real
      // const response = await estadisticasService.getDashboard();

      // Datos simulados
      setTimeout(() => {
        setStats({
          empleados: { total: 98 },
          areas: { total: 6 },
          kpis: { total: 24 },
          ordenes: {
            total: 156,
            activas: 45,
            completadas: 98,
            vencidas: 13,
            porcentajeCompletadas: 62.82,
          },
          alertas: { activas: 8 },
          evaluaciones: { recientes: 12 },
        });

        setAreasRanking([
          { nombre: 'Técnica', promedio: 92.5, tendencia: 'up' },
          { nombre: 'Comercial', promedio: 88.3, tendencia: 'up' },
          { nombre: 'Proyectos', promedio: 85.7, tendencia: 'stable' },
          { nombre: 'Administrativa', promedio: 83.2, tendencia: 'down' },
          { nombre: 'RRHH', promedio: 81.9, tendencia: 'stable' },
          { nombre: 'Gerencia', promedio: 79.4, tendencia: 'up' },
        ]);

        setActividadReciente([
          {
            tipo: 'orden_completada',
            titulo: 'Orden completada',
            descripcion: 'Juan Pérez completó "Análisis de Presupuesto Q1"',
            timestamp: 'Hace 5 minutos',
            icono: CheckCircle,
            color: 'green',
          },
          {
            tipo: 'alerta',
            titulo: 'Nueva alerta',
            descripcion: '3 órdenes próximas a vencer en Área Técnica',
            timestamp: 'Hace 15 minutos',
            icono: AlertTriangle,
            color: 'yellow',
          },
          {
            tipo: 'evaluacion',
            titulo: 'Evaluación generada',
            descripcion: 'Evaluación trimestral de 12 empleados',
            timestamp: 'Hace 1 hora',
            icono: Award,
            color: 'blue',
          },
          {
            tipo: 'kpi',
            titulo: 'KPI crítico',
            descripcion: 'KPI "Disciplina Presupuestaria" en rojo',
            timestamp: 'Hace 2 horas',
            icono: Target,
            color: 'red',
          },
        ]);

        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      setLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600' },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  ¡Bienvenido de vuelta, {user?.nombre || user?.email?.split('@')[0]}!
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  {new Date().toLocaleDateString('es-HN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm text-blue-100">Sistema 100% Operativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-300" />
                    <span className="text-sm text-blue-100">{stats.ordenes.activas} Tareas Activas</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <Award className="w-24 h-24 text-blue-300/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access - Temporal */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-900">Accesos Rápidos</h2>
            <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full font-semibold">
              NAVEGACIÓN TEMPORAL
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/ordenes')}
              className="group p-4 bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all"
            >
              <Briefcase className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-gray-900">Órdenes de Trabajo</p>
              <p className="text-xs text-gray-500 mt-1">{stats.ordenes.activas} activas</p>
            </button>

            <button
              onClick={() => navigate('/kpis')}
              className="group p-4 bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all"
            >
              <Target className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-gray-900">KPIs</p>
              <p className="text-xs text-gray-500 mt-1">{stats.kpis.total} configurados</p>
            </button>

            <button
              onClick={() => navigate('/empleados')}
              className="group p-4 bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all"
            >
              <Users className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-gray-900">Empleados</p>
              <p className="text-xs text-gray-500 mt-1">{stats.empleados.total} registrados</p>
            </button>

            <button
              onClick={() => navigate('/kpis/mis-evaluaciones')}
              className="group p-4 bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all"
            >
              <FileText className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-gray-900">Evaluaciones</p>
              <p className="text-xs text-gray-500 mt-1">{stats.evaluaciones.recientes} recientes</p>
            </button>
          </div>
        </div>

        {/* Stats Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Empleados */}
          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate('/empleados')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Empleados Activos</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.empleados.total}</p>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+2 este mes</span>
            </div>
          </div>

          {/* Áreas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Áreas Operativas</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.areas.total}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Activity className="w-3 h-3" />
              <span>100% activas</span>
            </div>
          </div>

          {/* KPIs */}
          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate('/kpis')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-gray-600 mb-1">KPIs Configurados</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.kpis.total}</p>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Zap className="w-3 h-3" />
              <span>Sistema automático</span>
            </div>
          </div>

          {/* Alertas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Alertas Activas</p>
            <p className="text-3xl font-bold text-red-600 mb-2">{stats.alertas.activas}</p>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Requieren atención</span>
            </div>
          </div>
        </div>

        {/* Órdenes de Trabajo - Panel Principal */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600" />
              Estado de Órdenes de Trabajo
            </h2>
            <button
              onClick={() => navigate('/ordenes')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Órdenes Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-sm font-semibold text-gray-600">Total</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.ordenes.total}</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-blue-700">Activas</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.ordenes.activas}</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-green-700">Completadas</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.ordenes.completadas}</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm font-semibold text-red-700">Vencidas</p>
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.ordenes.vencidas}</p>
            </div>
          </div>

          {/* Progreso Global */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <p className="font-semibold text-gray-900">Tasa de Cumplimiento Global</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.ordenes.porcentajeCompletadas.toFixed(1)}%
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${stats.ordenes.porcentajeCompletadas}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {stats.ordenes.completadas} de {stats.ordenes.total} órdenes completadas exitosamente
            </p>
          </div>
        </div>

        {/* Grid Inferior: Rankings y Actividad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking de Áreas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Ranking de Áreas
              </h2>
              <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                Por Desempeño
              </span>
            </div>

            <div className="space-y-3">
              {areasRanking.map((area, index) => (
                <div
                  key={area.nombre}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-white ${index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                        : index === 1
                          ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                          : index === 2
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500'
                            : 'bg-gradient-to-br from-blue-400 to-blue-500'
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{area.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {area.tendencia === 'up' && (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        )}
                        {area.tendencia === 'down' && (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span className="text-xs text-gray-500">
                          {area.tendencia === 'up' && 'Mejorando'}
                          {area.tendencia === 'down' && 'En descenso'}
                          {area.tendencia === 'stable' && 'Estable'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{area.promedio}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Actividad Reciente
              </h2>
            </div>

            <div className="space-y-3">
              {actividadReciente.map((actividad, index) => {
                const colors = getColorClasses(actividad.color);
                const Icon = actividad.icono;

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className={`p-3 ${colors.bg} rounded-lg`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{actividad.titulo}</p>
                      <p className="text-sm text-gray-600 mb-2">{actividad.descripcion}</p>
                      <p className="text-xs text-gray-500">{actividad.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
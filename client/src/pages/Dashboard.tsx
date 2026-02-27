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
  Zap,
  FileText,
  Building,
  FolderOpen,
  TrendingDown,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { estadisticasService } from '../services/estadisticas.service';

interface DashboardStats {
  empleados: { total: number };
  areas: { total: number; principales: number; subAreas: number };
  kpis: { total: number };
  puestos: { total: number };
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
  empleados: number;
  kpisRojos: number;
  subAreasCount: number;
}

interface TendenciaData {
  mes: string;
  completadas: number;
  vencidas: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    empleados: { total: 0 },
    areas: { total: 0, principales: 0, subAreas: 0 },
    kpis: { total: 0 },
    puestos: { total: 0 },
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
  const [tendencias, setTendencias] = useState<TendenciaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await estadisticasService.getDashboard();
      setStats(data);

      // Cargar tendencias (últimos 6 meses)
      const tendenciasData = await estadisticasService.getTendencias();
      setTendencias(tendenciasData);

      const rankings = await estadisticasService.getRankingAreas();
      setAreasRanking(rankings);
    } catch (error: any) {
      console.error('Error al cargar dashboard:', error);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Error al cargar el dashboard</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={cargarDashboard}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
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
                    <span className="text-sm text-blue-100">Sistema Operativo</span>
                  </div>
                  {stats.ordenes.activas > 0 && (
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-300" />
                      <span className="text-sm text-blue-100">{stats.ordenes.activas} Tareas Activas</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
                <Award className="w-24 h-24 text-blue-300/30" />
              </div>
            </div>
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
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Activity className="w-3 h-3" />
              <span>En el sistema</span>
            </div>
          </div>

          {/* Áreas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Estructura Organizacional</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.areas.total}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-purple-600">
                <Building className="w-3 h-3" />
                {stats.areas.principales} principales
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <FolderOpen className="w-3 h-3" />
                {stats.areas.subAreas} sub-áreas
              </span>
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
            {stats.alertas.activas > 0 ? (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Requieren atención</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span>Sin alertas</span>
              </div>
            )}
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

          {stats.ordenes.total === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No hay órdenes de trabajo aún</p>
              <button
                onClick={() => navigate('/ordenes/crear')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Crear la primera orden →
              </button>
            </div>
          ) : (
            <>
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
                    style={{ width: `${Math.min(100, stats.ordenes.porcentajeCompletadas)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {stats.ordenes.completadas} de {stats.ordenes.total} órdenes completadas exitosamente
                </p>
              </div>
            </>
          )}
        </div>

        {/* ========================= */}
        {/* Grid Inferior: Tendencias y Ranking */}
        {/* ========================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencias de los últimos 6 meses */}
          {tendencias.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Tendencias (Últimos 6 Meses)
                </h2>
              </div>

              <div className="space-y-3">
                {tendencias.map((mes, idx) => {
                  const total = mes.completadas + mes.vencidas;
                  const porcentajeCompletadas =
                    total > 0 ? (mes.completadas / total) * 100 : 0;

                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {mes.mes}
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            {mes.completadas}
                          </span>
                          <span className="flex items-center gap-1 text-red-600">
                            <TrendingDown className="w-3 h-3" />
                            {mes.vencidas}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${porcentajeCompletadas}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ranking de Áreas por Desempeño */}
          {areasRanking.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Ranking de Áreas por Desempeño
                </h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Año {new Date().getFullYear()}
                </span>
              </div>

              <div className="space-y-3">
                {areasRanking.slice(0, 5).map((area, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${idx === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
                          : idx === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                            : idx === 2
                              ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {idx === 0
                        ? '🥇'
                        : idx === 1
                          ? '🥈'
                          : idx === 2
                            ? '🥉'
                            : `#${idx + 1}`}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 text-lg">
                          {area.nombre}
                        </p>
                        {area.subAreasCount > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                            +{area.subAreasCount} sub-áreas
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {area.empleados} empleados
                        </span>
                        {area.kpisRojos > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            {area.kpisRojos} KPIs rojos
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-3xl font-bold text-blue-600">
                            {area.promedio}%
                          </p>
                          <p className="text-xs text-gray-500">Promedio</p>
                        </div>
                        {idx < 3 && (
                          <Trophy
                            className={`w-6 h-6 ${idx === 0
                                ? 'text-yellow-500'
                                : idx === 1
                                  ? 'text-gray-400'
                                  : 'text-orange-500'
                              }`}
                          />
                        )}
                      </div>

                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className={`h-2 rounded-full transition-all ${area.promedio >= 90
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : area.promedio >= 70
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                          style={{
                            width: `${Math.min(100, area.promedio)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {areasRanking.length > 5 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Mostrando top 5 de {areasRanking.length} áreas
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================= */}
        {/* Resumen del Sistema (Full Width) */}
        {/* ========================= */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Resumen del Sistema
            </h2>
          </div>

          <div className="space-y-4">
            {/* Puestos */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Puestos Registrados
                  </p>
                  <p className="text-xs text-gray-600">
                    Roles en la organización
                  </p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.puestos?.total || 0}
              </p>
            </div>

            {/* Evaluaciones Recientes */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Evaluaciones Recientes
                  </p>
                  <p className="text-xs text-gray-600">Último mes</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.evaluaciones.recientes}
              </p>
            </div>

            {/* Accesos rápidos */}
            <button
              onClick={() => navigate('/kpis/mis-evaluaciones')}
              className="w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-600" />
                  <p className="font-medium text-gray-900">
                    Mis Evaluaciones
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => navigate('/ordenes')}
              className="w-full p-4 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-lg hover:border-green-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-gray-900">
                    Mis Órdenes de Trabajo
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
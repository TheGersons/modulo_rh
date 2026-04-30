import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Calendar,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { evaluacionesService } from '../services/evaluaciones.service';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { fmtNum } from '../utils/format';

interface Evaluacion {
  id: string;
  periodo: string;
  anio: number;
  promedioGeneral: number;
  kpisRojos: number;
  porcentajeRojos: number;
  status: string;
  calculadaAutomaticamente: boolean;
  fechaCalculo?: string;
  fechaCierre?: string;
  createdAt: string;
  detalles: Array<{
    id: string;
    estado: string;
    resultadoPorcentaje: number;
    kpi: {
      key: string;
      indicador: string;
      tipoCriticidad: string;
    };
  }>;
}

export default function MisEvaluacionesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('todos');
  const [filtroAnio, setFiltroAnio] = useState<number | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const evaluacionesPorPagina = 6;

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroPeriodo, filtroAnio, filtroStatus]);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const data = await evaluacionesService.getAll({
        empleadoId: user?.id,
      });
      setEvaluaciones(data);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodoLabel = (periodo: string) => {
    const labels: Record<string, string> = {
      enero: 'Enero',
      febrero: 'Febrero',
      marzo: 'Marzo',
      abril: 'Abril',
      mayo: 'Mayo',
      junio: 'Junio',
      julio: 'Julio',
      agosto: 'Agosto',
      septiembre: 'Septiembre',
      octubre: 'Octubre',
      noviembre: 'Noviembre',
      diciembre: 'Diciembre',
      trimestre_1: 'Trimestre 1',
      trimestre_2: 'Trimestre 2',
      trimestre_3: 'Trimestre 3',
      trimestre_4: 'Trimestre 4',
      semestre_1: 'Semestre 1',
      semestre_2: 'Semestre 2',
      anual: 'Anual',
    };
    return labels[periodo] || periodo;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      borrador: { color: 'bg-gray-100 text-gray-700', icon: Calendar, label: 'Borrador' },
      calculada: { color: 'bg-blue-100 text-blue-700', icon: Target, label: 'Calculada' },
      cerrada: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Cerrada' },
    };

    const badge = badges[status] || badges.borrador;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getPromedioColor = (promedio: number) => {
    if (promedio >= 90) return 'text-green-600';
    if (promedio >= 70) return 'text-blue-600';
    if (promedio >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPromedioBg = (promedio: number) => {
    if (promedio >= 90) return 'bg-green-50 border-green-200';
    if (promedio >= 70) return 'bg-blue-50 border-blue-200';
    if (promedio >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Filtrado
  const evaluacionesFiltradas = evaluaciones.filter((ev) => {
    const matchPeriodo = filtroPeriodo === 'todos' || ev.periodo === filtroPeriodo;
    const matchAnio = filtroAnio === 'todos' || ev.anio === filtroAnio;
    const matchStatus = filtroStatus === 'todos' || ev.status === filtroStatus;

    return matchPeriodo && matchAnio && matchStatus;
  });

  // Paginación
  const totalPaginas = Math.ceil(evaluacionesFiltradas.length / evaluacionesPorPagina);
  const indexInicio = (paginaActual - 1) * evaluacionesPorPagina;
  const indexFin = indexInicio + evaluacionesPorPagina;
  const evaluacionesPaginadas = evaluacionesFiltradas.slice(indexInicio, indexFin);

  // Stats
  const stats = {
    total: evaluaciones.length,
    cerradas: evaluaciones.filter((e) => e.status === 'cerrada').length,
    promedioGlobal:
      evaluaciones.length > 0
        ? evaluaciones.reduce((sum, e) => sum + e.promedioGeneral, 0) / evaluaciones.length
        : 0,
    kpisRojosTotal: evaluaciones.reduce((sum, e) => sum + e.kpisRojos, 0),
  };

  const aniosDisponibles = Array.from(new Set(evaluaciones.map((e) => e.anio))).sort((a, b) => b - a);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando evaluaciones...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Evaluaciones</h1>
          <p className="text-gray-600 mt-1">Historial de evaluaciones automáticas de desempeño</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Evaluaciones</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cerradas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.cerradas}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio Global</p>
                <p className={`text-2xl font-bold mt-1 ${getPromedioColor(stats.promedioGlobal)}`}>
                  {fmtNum(stats.promedioGlobal)}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">KPIs Rojos</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.kpisRojosTotal}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Periodo */}
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los periodos</option>
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>

            {/* Año */}
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los años</option>
              {aniosDisponibles.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="calculada">Calculada</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
        </div>

        {/* Lista de Evaluaciones */}
        {evaluacionesPaginadas.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay evaluaciones</h3>
            <p className="text-gray-600">
              {evaluaciones.length === 0
                ? 'Aún no tienes evaluaciones generadas'
                : 'No hay evaluaciones que coincidan con los filtros'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evaluacionesPaginadas.map((evaluacion) => (
              <div
                key={evaluacion.id}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 hover:shadow-lg transition-all cursor-pointer ${getPromedioBg(
                  evaluacion.promedioGeneral
                )}`}
                onClick={() => navigate(`/kpis/mis-evaluaciones/${evaluacion.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {getPeriodoLabel(evaluacion.periodo)} {evaluacion.anio}
                      </h3>
                      {getStatusBadge(evaluacion.status)}
                    </div>
                    {evaluacion.calculadaAutomaticamente && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Evaluación automática
                      </p>
                    )}
                  </div>

                  <div className={`text-center p-3 rounded-lg ${getPromedioBg(evaluacion.promedioGeneral)}`}>
                    <p className={`text-3xl font-bold ${getPromedioColor(evaluacion.promedioGeneral)}`}>
                      {fmtNum(evaluacion.promedioGeneral)}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Promedio</p>
                  </div>
                </div>

                {/* KPIs Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">KPIs</p>
                    <p className="text-xl font-bold text-gray-900">{evaluacion.detalles.length}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600">Verdes</p>
                    <p className="text-xl font-bold text-green-700">
                      {evaluacion.detalles.filter((d) => d.estado === 'verde').length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600">Rojos</p>
                    <p className="text-xl font-bold text-red-700">{evaluacion.kpisRojos}</p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {evaluacion.fechaCalculo
                      ? `Calculada: ${formatFecha(evaluacion.fechaCalculo)}`
                      : `Creada: ${formatFecha(evaluacion.createdAt)}`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/kpis/mis-evaluaciones/${evaluacion.id}`);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Eye className="w-3 h-3" />
                    Ver detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
              <button
                key={numero}
                onClick={() => setPaginaActual(numero)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${paginaActual === numero ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {numero}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
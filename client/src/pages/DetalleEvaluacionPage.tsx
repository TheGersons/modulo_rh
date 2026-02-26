import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Target,
  AlertCircle,
  CheckCircle,
  User,
  FileText,
} from 'lucide-react';
import { evaluacionesService } from '../services/evaluaciones.service';
import Layout from '../components/layout/Layout';

interface Evaluacion {
  id: string;
  empleadoId: string;
  evaluadorId: string;
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
  empleado: {
    nombre: string;
    apellido: string;
    puesto?: string;
    area?: {
      nombre: string;
    };
  };
  evaluador?: {
    nombre: string;
    apellido: string;
  };
  detalles: Array<{
    id: string;
    resultadoNumerico: number;
    resultadoPorcentaje: number;
    brechaVsMeta?: number;
    estado: string;
    formulaUtilizada?: string;
    meta?: number;
    umbralAmarillo?: number;
    kpi: {
      key: string;
      indicador: string;
      descripcion?: string;
      tipoCriticidad: string;
      tipoCalculo: string;
      unidad?: string;
    };
  }>;
}

export default function DetalleEvaluacionPage() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  useEffect(() => {
    cargarEvaluacion();
  }, [evaluacionId]);

  const cargarEvaluacion = async () => {
    try {
      setLoading(true);
      const data = await evaluacionesService.getById(evaluacionId!);
      setEvaluacion(data);
    } catch (error) {
      console.error('Error al cargar evaluación:', error);
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

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { color: string; bg: string; icon: any }> = {
      verde: { color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
      amarillo: { color: 'text-yellow-700', bg: 'bg-yellow-100', icon: AlertCircle },
      rojo: { color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
    };

    const badge = badges[estado] || badges.rojo;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };
  /* 
    const getPromedioColor = (promedio: number) => {
      if (promedio >= 90) return 'text-green-600';
      if (promedio >= 70) return 'text-blue-600';
      if (promedio >= 50) return 'text-yellow-600';
      return 'text-red-600';
    };
   */
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando evaluación...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!evaluacion) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluación no encontrada</h3>
          <button onClick={() => navigate('/kpis/mis-evaluaciones')} className="text-blue-600 hover:underline">
            Volver a mis evaluaciones
          </button>
        </div>
      </Layout>
    );
  }

  const detallesFiltrados =
    filtroEstado === 'todos'
      ? evaluacion.detalles
      : evaluacion.detalles.filter((d) => d.estado === filtroEstado);

  const stats = {
    verdes: evaluacion.detalles.filter((d) => d.estado === 'verde').length,
    amarillos: evaluacion.detalles.filter((d) => d.estado === 'amarillo').length,
    rojos: evaluacion.detalles.filter((d) => d.estado === 'rojo').length,
  };

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/kpis/mis-evaluaciones')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Evaluación {getPeriodoLabel(evaluacion.periodo)} {evaluacion.anio}
            </h1>
            <p className="text-gray-600 mt-1">Detalle completo de tu evaluación automática</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Empleado Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Empleado</p>
                  <p className="text-xl font-bold">
                    {evaluacion.empleado.nombre} {evaluacion.empleado.apellido}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {evaluacion.empleado.puesto && (
                  <p className="text-blue-100">
                    <strong>Puesto:</strong> {evaluacion.empleado.puesto}
                  </p>
                )}
                {evaluacion.empleado.area && (
                  <p className="text-blue-100">
                    <strong>Área:</strong> {evaluacion.empleado.area.nombre}
                  </p>
                )}
                <p className="text-blue-100">
                  <strong>Periodo:</strong> {getPeriodoLabel(evaluacion.periodo)} {evaluacion.anio}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-blue-100 text-sm mb-2">Promedio General</p>
                <p className="text-6xl font-bold mb-2">{Math.round(evaluacion.promedioGeneral)}%</p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {stats.verdes} Verdes
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {stats.amarillos} Amarillos
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {stats.rojos} Rojos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total KPIs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{evaluacion.detalles.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verdes</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.verdes}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amarillos</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.amarillos}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rojos</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.rojos}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-700">Filtrar por estado:</p>
            <div className="flex gap-2">
              {[
                { value: 'todos', label: 'Todos' },
                { value: 'verde', label: 'Verdes' },
                { value: 'amarillo', label: 'Amarillos' },
                { value: 'rojo', label: 'Rojos' },
              ].map((filtro) => (
                <button
                  key={filtro.value}
                  onClick={() => setFiltroEstado(filtro.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroEstado === filtro.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detalles de KPIs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            KPIs Evaluados ({detallesFiltrados.length})
          </h2>

          {detallesFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
              <p className="text-gray-600">No hay KPIs en este estado</p>
            </div>
          ) : (
            detallesFiltrados.map((detalle) => (
              <div
                key={detalle.id}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 hover:shadow-md transition-shadow ${detalle.estado === 'verde'
                  ? 'border-green-200'
                  : detalle.estado === 'amarillo'
                    ? 'border-yellow-200'
                    : 'border-red-200'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{detalle.kpi.key}</h3>
                      {getEstadoBadge(detalle.estado)}
                      {detalle.kpi.tipoCriticidad === 'critico' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Crítico
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 font-medium mb-2">{detalle.kpi.indicador}</p>
                    {detalle.kpi.descripcion && (
                      <p className="text-sm text-gray-600">{detalle.kpi.descripcion}</p>
                    )}
                  </div>

                  <div
                    className={`text-center p-4 rounded-lg ${detalle.estado === 'verde'
                      ? 'bg-green-50'
                      : detalle.estado === 'amarillo'
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                      }`}
                  >
                    <p
                      className={`text-3xl font-bold ${detalle.estado === 'verde'
                        ? 'text-green-600'
                        : detalle.estado === 'amarillo'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                        }`}
                    >
                      {Math.round(detalle.resultadoPorcentaje)}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Resultado</p>
                  </div>
                </div>

                {/* Detalles adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  {detalle.meta && (
                    <div>
                      <p className="text-xs text-gray-500">Meta</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {detalle.meta}
                        {detalle.kpi.unidad}
                      </p>
                    </div>
                  )}
                  {detalle.brechaVsMeta !== null && detalle.brechaVsMeta !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500">Brecha vs Meta</p>
                      <p
                        className={`text-sm font-semibold ${detalle.brechaVsMeta >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                      >
                        {detalle.brechaVsMeta > 0 ? '+' : ''}
                        {detalle.brechaVsMeta.toFixed(1)}
                        {detalle.kpi.unidad}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Tipo de Cálculo</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {detalle.kpi.tipoCalculo.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-2">Información de la Evaluación</p>
              <div className="space-y-1 text-sm text-blue-700">
                <p>
                  <strong>Tipo:</strong>{' '}
                  {evaluacion.calculadaAutomaticamente
                    ? 'Evaluación Automática'
                    : 'Evaluación Manual'}
                </p>
                {evaluacion.fechaCalculo && (
                  <p>
                    <strong>Fecha de Cálculo:</strong> {formatFecha(evaluacion.fechaCalculo)}
                  </p>
                )}
                {evaluacion.fechaCierre && (
                  <p>
                    <strong>Fecha de Cierre:</strong> {formatFecha(evaluacion.fechaCierre)}
                  </p>
                )}
                <p>
                  <strong>Estado:</strong>{' '}
                  {evaluacion.status === 'cerrada' ? 'Cerrada (No modificable)' : 'Calculada'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Eye, CheckCircle, Clock, AlertCircle, XCircle, Award, Target } from 'lucide-react';
import { evaluacionesService } from '../services/evaluaciones.service';

interface EvaluacionResumen {
  id: string;
  periodo: string;
  tipoPeriodo: string;
  anio: number;
  evaluador: {
    nombre: string;
    apellido: string;
  };
  promedioGeneral: number;
  kpisRojos: number;
  porcentajeRojos: number;
  status: 'enviada' | 'validada' | 'en_revision';
  fechaEnvio: string;
  fechaValidacion?: string;
}

export default function MisEvaluacionesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionResumen[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  const cargarEvaluaciones = async () => {
    try {
      // TODO: Llamar al backend
      /* const evaluacionesSimuladas: EvaluacionResumen[] = [
        {
          id: '1',
          periodo: 'Q1',
          tipoPeriodo: 'trimestral',
          anio: 2026,
          evaluador: { nombre: 'Carlos', apellido: 'Méndez' },
          promedioGeneral: 96.7,
          kpisRojos: 0,
          porcentajeRojos: 0,
          status: 'enviada',
          fechaEnvio: '2026-03-15T10:30:00',
        } 

          
      ];
    */
      const evaluaciones = await evaluacionesService.getByEmpleado(user!.id);

      //formateamos las evaluaciones y creamos un array  de evaluaciones
      const evaluacionesFormateadas = evaluaciones.map((evalua: any) => ({
        id: evalua.id,
        periodo: evalua.periodo,
        tipoPeriodo: evalua.tipoPeriodo,
        anio: evalua.anio,
        evaluador: {
          nombre: evalua.evaluador.nombre,
          apellido: evalua.evaluador.apellido,
        },
        promedioGeneral: evalua.promedioGeneral,
        kpisRojos: evalua.kpisRojos,
        porcentajeRojos: evalua.porcentajeRojos,
        status: evalua.status,
        fechaEnvio: evalua.fechaEnvio,
        fechaValidacion: evalua.fechaValidacion,
      }));


      setEvaluaciones(evaluacionesFormateadas);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const evaluacionesFiltradas = evaluaciones.filter(ev => {
    if (filtroStatus === 'todas') return true;
    return ev.status === filtroStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      enviada: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock,
        label: 'Requiere Validación',
      },
      validada: {
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Validada',
      },
      en_revision: {
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: AlertCircle,
        label: 'En Revisión',
      },
    };

    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 75) return 'from-blue-500 to-blue-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 75) return 'Muy Bueno';
    if (score >= 60) return 'Bueno';
    if (score >= 50) return 'Regular';
    return 'Deficiente';
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const promedioTotal = evaluaciones.length > 0
    ? (evaluaciones.reduce((acc, ev) => acc + ev.promedioGeneral, 0) / evaluaciones.length).toFixed(1)
    : '0.0';

  const totalKpisRojos = evaluaciones.reduce((acc, ev) => acc + ev.kpisRojos, 0);

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Evaluaciones</h1>
          <p className="text-gray-600 mt-1">
            Consulta y valida tus evaluaciones de desempeño
          </p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Promedio General */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Promedio General</h3>
            <p className="text-4xl font-bold text-gray-900">{promedioTotal}%</p>
            <p className="text-xs text-gray-500 mt-2">De {evaluaciones.length} evaluaciones</p>
          </div>

          {/* Validadas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Validadas</h3>
            <p className="text-4xl font-bold text-gray-900">
              {evaluaciones.filter(e => e.status === 'validada').length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Evaluaciones aceptadas</p>
          </div>

          {/* Pendientes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Pendientes</h3>
            <p className="text-4xl font-bold text-gray-900">
              {evaluaciones.filter(e => e.status === 'enviada').length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Requieren validación</p>
          </div>

          {/* KPIs Críticos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">KPIs Rojos</h3>
            <p className="text-4xl font-bold text-red-600">{totalKpisRojos}</p>
            <p className="text-xs text-gray-500 mt-2">En todas las evaluaciones</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Filtrar por estado:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'todas', label: 'Todas', count: evaluaciones.length },
                { value: 'enviada', label: 'Pendientes', count: evaluaciones.filter(e => e.status === 'enviada').length },
                { value: 'validada', label: 'Validadas', count: evaluaciones.filter(e => e.status === 'validada').length },
                { value: 'en_revision', label: 'En Revisión', count: evaluaciones.filter(e => e.status === 'en_revision').length },
              ].map((filtro) => (
                <button
                  key={filtro.value}
                  onClick={() => setFiltroStatus(filtro.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                    filtroStatus === filtro.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filtro.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    filtroStatus === filtro.value
                      ? 'bg-blue-700'
                      : 'bg-gray-200'
                  }`}>
                    {filtro.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de evaluaciones */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando evaluaciones...</p>
            </div>
          ) : evaluacionesFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron evaluaciones</p>
            </div>
          ) : (
            evaluacionesFiltradas.map((evaluacion) => (
              <div
                key={evaluacion.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Info principal */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {evaluacion.periodo} {evaluacion.anio}
                      </h3>
                      {getStatusBadge(evaluacion.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Evaluado por</p>
                        <p className="font-semibold text-gray-900">
                          {evaluacion.evaluador.nombre} {evaluacion.evaluador.apellido}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Fecha de envío</p>
                        <p className="font-semibold text-gray-900">
                          {formatFecha(evaluacion.fechaEnvio)}
                        </p>
                      </div>

                      {evaluacion.fechaValidacion && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Fecha de validación</p>
                          <p className="font-semibold text-gray-900">
                            {formatFecha(evaluacion.fechaValidacion)}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-600 mb-1">KPIs Rojos</p>
                        <p className="font-semibold text-red-600">
                          {evaluacion.kpisRojos} ({evaluacion.porcentajeRojos.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calificación y acción */}
                  <div className="flex items-center gap-6">
                    {/* Score Card */}
                    <div className={`bg-gradient-to-br ${getScoreGradient(evaluacion.promedioGeneral)} text-white rounded-2xl p-6 text-center min-w-[140px]`}>
                      <Award className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-4xl font-bold mb-1">{evaluacion.promedioGeneral}%</p>
                      <p className="text-sm font-semibold opacity-90">{getScoreLabel(evaluacion.promedioGeneral)}</p>
                    </div>

                    {/* Botón */}
                    <button
                      onClick={() => navigate(`/kpis/mis-evaluaciones/${evaluacion.id}`)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors whitespace-nowrap"
                    >
                      <Eye className="w-5 h-5" />
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
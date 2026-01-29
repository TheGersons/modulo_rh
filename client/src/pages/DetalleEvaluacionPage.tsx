import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ArrowLeft, CheckCircle, AlertCircle, Send, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import type { EvaluacionDetalle, KPI } from '../types/kpi';

interface EvaluacionCompleta {
  id: string;
  periodo: string;
  anio: number;
  evaluador: {
    nombre: string;
    apellido: string;
    puesto: string;
  };
  promedioGeneral: number;
  kpisRojos: number;
  porcentajeRojos: number;
  status: 'enviada' | 'validada' | 'en_revision';
  fechaEnvio: string;
  comentarioGeneral?: string;
  detalles: (EvaluacionDetalle & { kpi: KPI })[];
  validacion?: {
    status: string;
    motivoRevision?: string;
    respuestaJefe?: string;
  };
}

export default function DetalleEvaluacionPage() {
  const { evaluacionId } = useParams();
  const navigate = useNavigate();
  const [evaluacion, setEvaluacion] = useState<EvaluacionCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showValidacionModal, setShowValidacionModal] = useState(false);
  const [accion, setAccion] = useState<'aceptar' | 'revisar'>('aceptar');
  const [motivoRevision, setMotivoRevision] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarEvaluacion();
  }, [evaluacionId]);

  const cargarEvaluacion = async () => {
    try {
      // TODO: Llamar al backend
      const evaluacionSimulada: EvaluacionCompleta = {
        id: evaluacionId || '1',
        periodo: 'Q1',
        anio: 2026,
        evaluador: {
          nombre: 'Carlos',
          apellido: 'Méndez',
          puesto: 'Jefe de Gerencia',
        },
        promedioGeneral: 96.67,
        kpisRojos: 0,
        porcentajeRojos: 0,
        status: 'enviada',
        fechaEnvio: '2026-03-15T10:30:00',
        comentarioGeneral: 'Excelente desempeño general. Se destaca por su compromiso y proactividad en el cumplimiento de objetivos estratégicos.',
        detalles: [
          {
            id: '1',
            kpiId: '1',
            kpi: {
              id: '1',
              key: 'GER-001',
              area: 'Gerencia',
              areaId: '1',
              indicador: 'Cumplimiento de Objetivos Estratégicos',
              descripcion: 'Porcentaje de objetivos estratégicos cumplidos en el periodo',
              formula: '(Objetivos cumplidos / Total objetivos) * 100',
              meta: 90,
              tolerancia: -5,
              umbralAmarillo: 85,
              periodicidad: 'trimestral',
              sentido: 'Mayor es mejor',
              unidad: '%',
              activo: true,
              orden: 1
            },
            resultadoNumerico: 95,
            meta: 90,
            tolerancia: -5,
            umbralAmarillo: 85,
            sentido: 'Mayor es mejor',
            resultadoPorcentaje: 100,
            brechaVsMeta: 5,
            estado: 'verde',
            comentarios: 'Superó la meta establecida. Excelente gestión de objetivos estratégicos.',
          },
          {
            id: '2',
            kpiId: '2',
            kpi: {
              id: '2',
              key: 'GER-002',
              area: 'Gerencia',
              areaId: '1',
              indicador: 'Satisfacción de Stakeholders',
              descripcion: 'Nivel de satisfacción de partes interesadas',
              formula: 'Promedio de encuestas de satisfacción',
              meta: 85,
              tolerancia: -5,
              umbralAmarillo: 80,
              periodicidad: 'trimestral',
              sentido: 'Mayor es mejor',
              unidad: '%',
              activo: true,
              orden: 2
            },
            resultadoNumerico: 88,
            meta: 85,
            tolerancia: -5,
            umbralAmarillo: 80,
            sentido: 'Mayor es mejor',
            resultadoPorcentaje: 100,
            brechaVsMeta: 3,
            estado: 'verde',
            comentarios: 'Buen nivel de satisfacción de stakeholders.',
          },
          {
            id: '3',
            kpiId: '3',
            kpi: {
              id: '3',
              key: 'GER-003',
              area: 'Gerencia',
              areaId: '1',
              indicador: 'ROI de Proyectos',
              descripcion: 'Retorno de inversión de proyectos ejecutados',
              formula: '((Beneficio - Inversión) / Inversión) * 100',
              meta: 20,
              tolerancia: -5,
              umbralAmarillo: 15,
              periodicidad: 'trimestral',
              sentido: 'Mayor es mejor',
              unidad: '%',
              activo: true,
              orden: 3
            },
            resultadoNumerico: 18,
            meta: 20,
            tolerancia: -5,
            umbralAmarillo: 15,
            sentido: 'Mayor es mejor',
            resultadoPorcentaje: 90,
            brechaVsMeta: -2,
            estado: 'amarillo',
            comentarios: 'ROI dentro de tolerancia. Se recomienda optimizar rentabilidad de proyectos.',
          },
        ],
      };
      setEvaluacion(evaluacionSimulada);
    } catch (error) {
      console.error('Error al cargar evaluación:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'verde':
        return 'from-green-500 to-green-600';
      case 'amarillo':
        return 'from-yellow-500 to-yellow-600';
      case 'rojo':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'verde':
        return <TrendingUp className="w-6 h-6" />;
      case 'amarillo':
        return <Minus className="w-6 h-6" />;
      case 'rojo':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'verde':
        return 'Cumple Meta';
      case 'amarillo':
        return 'En Tolerancia';
      case 'rojo':
        return 'Por Debajo';
      default:
        return 'Sin Evaluar';
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'verde':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'amarillo':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rojo':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleValidar = async () => {
    setEnviando(true);
    try {
      const payload = {
        evaluacionId,
        status: accion === 'aceptar' ? 'aceptada' : 'revision_solicitada',
        motivoRevision: accion === 'revisar' ? motivoRevision : undefined,
      };

      console.log('Validando evaluación:', payload);
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(accion === 'aceptar' ? 'Evaluación aceptada exitosamente' : 'Solicitud de revisión enviada');
      navigate('/kpis/mis-evaluaciones');
    } catch (error) {
      console.error('Error al validar:', error);
      alert('Error al procesar la validación');
    } finally {
      setEnviando(false);
    }
  };

  if (loading || !evaluacion) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/kpis/mis-evaluaciones')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a mis evaluaciones
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Evaluación {evaluacion.periodo} {evaluacion.anio}
                </h1>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Evaluado por:</span>
                    <p className="font-semibold text-gray-900">
                      {evaluacion.evaluador.nombre} {evaluacion.evaluador.apellido}
                    </p>
                    <p className="text-sm text-gray-600">{evaluacion.evaluador.puesto}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fecha de envío:</span>
                    <p className="font-semibold text-gray-900">
                      {new Date(evaluacion.fechaEnvio).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-8 bg-gradient-to-br ${getEstadoColor('verde')} text-white`}>
                <p className="text-sm mb-2 opacity-90">Calificación General</p>
                <p className="text-6xl font-bold mb-2">{evaluacion.promedioGeneral.toFixed(1)}%</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-lg font-semibold">Excelente Desempeño</span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total KPIs</p>
                <p className="text-2xl font-bold text-gray-900">{evaluacion.detalles.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">KPIs en Rojo</p>
                <p className="text-2xl font-bold text-red-600">{evaluacion.kpisRojos}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">% Rojos</p>
                <p className="text-2xl font-bold text-gray-900">{evaluacion.porcentajeRojos.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles por KPI */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Evaluación por KPI</h2>

          {evaluacion.detalles.map((detalle, index) => (
            <div key={detalle.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              {/* Header del KPI */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                      {detalle.kpi.key}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {index + 1}. {detalle.kpi.indicador}
                    </h3>
                  </div>
                  {detalle.kpi.descripcion && (
                    <p className="text-sm text-gray-600 mb-2">{detalle.kpi.descripcion}</p>
                  )}
                </div>

                {/* Badge de estado */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold ${getEstadoBadgeColor(detalle.estado)}`}>
                  {getEstadoIcon(detalle.estado)}
                  {getEstadoLabel(detalle.estado)}
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Meta</p>
                  <p className="text-xl font-bold text-gray-900">
                    {detalle.meta}{detalle.kpi.unidad}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Resultado</p>
                  <p className="text-xl font-bold text-blue-600">
                    {detalle.resultadoNumerico}{detalle.kpi.unidad}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Resultado %</p>
                  <p className={`text-xl font-bold ${
                    detalle.estado === 'verde' ? 'text-green-600' :
                    detalle.estado === 'amarillo' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {detalle.resultadoPorcentaje.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Brecha vs Meta</p>
                  <p className={`text-xl font-bold ${
                    detalle.brechaVsMeta >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {detalle.brechaVsMeta > 0 ? '+' : ''}{detalle.brechaVsMeta}{detalle.kpi.unidad}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Umbral Amarillo</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {detalle.umbralAmarillo}{detalle.kpi.unidad}
                  </p>
                </div>
              </div>

              {/* Barra de progreso visual */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progreso</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {detalle.resultadoPorcentaje.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getEstadoColor(detalle.estado)} transition-all duration-500`}
                    style={{ width: `${Math.min(detalle.resultadoPorcentaje, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Comentarios del evaluador */}
              {detalle.comentarios && (
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-2">Comentarios del evaluador:</p>
                      <p className="text-blue-800 leading-relaxed">{detalle.comentarios}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comentario general */}
        {evaluacion.comentarioGeneral && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-600" />
              Comentario General
            </h3>
            <p className="text-gray-800 leading-relaxed text-lg">{evaluacion.comentarioGeneral}</p>
          </div>
        )}

        {/* Acciones de validación */}
        {evaluacion.status === 'enviada' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              ¿Estás de acuerdo con esta evaluación?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setAccion('aceptar');
                  setShowValidacionModal(true);
                }}
                className="flex items-center justify-center gap-3 px-8 py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
              >
                <CheckCircle className="w-7 h-7" />
                Aceptar Evaluación
              </button>

              <button
                onClick={() => {
                  setAccion('revisar');
                  setShowValidacionModal(true);
                }}
                className="flex items-center justify-center gap-3 px-8 py-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
              >
                <AlertCircle className="w-7 h-7" />
                Solicitar Revisión
              </button>
            </div>
          </div>
        )}

        {/* Modal de validación */}
        {showValidacionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {accion === 'aceptar' ? 'Aceptar Evaluación' : 'Solicitar Revisión'}
              </h3>

              {accion === 'aceptar' ? (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Al aceptar esta evaluación, confirmas que estás de acuerdo con las calificaciones, metas, resultados y comentarios proporcionados por tu evaluador.
                </p>
              ) : (
                <div className="mb-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Por favor, indica el motivo por el cual solicitas una revisión de esta evaluación:
                  </p>
                  <textarea
                    value={motivoRevision}
                    onChange={(e) => setMotivoRevision(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                    placeholder="Describe tu motivo de revisión..."
                    required
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowValidacionModal(false);
                    setMotivoRevision('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleValidar}
                  disabled={enviando || (accion === 'revisar' && !motivoRevision.trim())}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {enviando ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
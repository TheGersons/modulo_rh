import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ArrowLeft, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus, Info, X } from 'lucide-react';
import type { EvaluacionDetalle, KPI } from '../types/kpi';
import { evaluacionesService } from '../services/evaluaciones.service';
import { validacionesService } from '../services/validaciones.service';
import { Upload, FileText } from 'lucide-react';
import { empleadosService } from '../services/empleados.service';

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
  const [evaluado, setEvaluado] = useState<{ id: string; nombre: string; apellido: string; puesto: string; area: string } | null>(null);
  const [showValidacionModal, setShowValidacionModal] = useState(false);
  const [accion, setAccion] = useState<'aceptar' | 'revisar'>('aceptar');
  const [motivoRevision, _setMotivoRevision] = useState('');
  const [enviando, setEnviando] = useState(false);
  // Estados para el dialog de revisión
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [revisionMotivo, setRevisionMotivo] = useState('');
  const [kpisApelados, setKpisApelados] = useState<Array<{
    kpiId: string;
    kpiNombre: string;
    motivo: string;
  }>>([]);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<Array<{
    nombre: string;
    url: string;
  }>>([]);

  // Corta a 2 decimales y asegura que siga siendo un número
  const formatearNumero = (valor: number | null | undefined): number => {
    if (valor === null || valor === undefined) return 0;
    return Number(valor.toFixed(2));
  };

  useEffect(() => {
    //usaremos el Id de la evaluacion que esta en el params para obtener el Id del empleado evaluado
    const fetchEvaluado = async () => {
      if (evaluacionId) {
        const evalData = await evaluacionesService.getById(evaluacionId);
        const empData = await empleadosService.getById(evalData.empleadoId);
        setEvaluado({
          id: empData.id || null,
          nombre: empData.nombre || '',
          apellido: empData.apellido || '',
          puesto: empData.puesto || '',
          area: empData.area.nombre || '',
        });
      }
    };
    fetchEvaluado();
  }, [evaluacionId]);

  const handleSolicitarRevision = async () => {
    try {
      // Validar que todos los KPIs seleccionados tengan justificación
      const hayMotivosVacios = kpisApelados.some(k => k.motivo.trim().length < 20);
      if (hayMotivosVacios) {
        alert('Todos los KPIs seleccionados deben tener una justificación de al menos 20 caracteres');
        return;
      }
      // Preparar URLs de archivos
      const archivosUrls = archivosAdjuntos.map(a => a.url);

      // Enviar solicitud de revisión
      await validacionesService.create({
        evaluacionId: evaluacion!.id,
        empleadoId: evaluado!.id,
        status: 'revision_solicitada',
        motivoRevision: revisionMotivo || undefined,
        detallesRevision: kpisApelados,
        archivosAdjuntos: archivosUrls.length > 0 ? archivosUrls : undefined,
      });

      // Cerrar dialog
      setShowRevisionDialog(false);
      setRevisionMotivo('');
      setKpisApelados([]);
      setArchivosAdjuntos([]);

      // Recargar evaluación
      const updatedEvaluacion = await evaluacionesService.getById(evaluacion!.id);
      setEvaluacion(updatedEvaluacion);

      // Mostrar confirmación
      alert('Solicitud de revisión enviada exitosamente');
    } catch (error) {
      console.error('Error al solicitar revisión:', error);
      alert('Error al enviar la solicitud de revisión');
    }
  };

  useEffect(() => {
    cargarEvaluacion();
  }, [evaluacionId]);

  const cargarEvaluacion = async () => {
    try {
      setLoading(true);
      // Asumimos que 'data' es la respuesta JSON cruda que mostraste
      const data = await evaluacionesService.getById(evaluacionId!);

      // 1. Transformamos los detalles primero (El paso clave)
      // Mapeamos el array de la API al formato (EvaluacionDetalle & { kpi: KPI })
      const detallesFormateados = data.detalles.map((d: any) => ({
        // --- Campos de EvaluacionDetalle ---
        id: d.id,
        kpiId: d.kpiId,
        resultadoNumerico: formatearNumero(d.resultadoNumerico),
        meta: d.meta,
        tolerancia: d.tolerancia,
        umbralAmarillo: d.umbralAmarillo,
        sentido: d.sentido,
        resultadoPorcentaje: formatearNumero(d.resultadoPorcentaje),
        brechaVsMeta: formatearNumero(d.brechaVsMeta),
        // Casteamos el string a los tipos literales definidos
        estado: d.estado as 'verde' | 'amarillo' | 'rojo',
        comentarios: d.comentarios,

        // --- Campo KPI anidado ---
        kpi: {
          id: d.kpi.id,
          key: d.kpi.key,
          area: d.kpi.area,
          areaId: d.kpi.areaId,
          // IMPORTANTE: Manejo de nulos.
          // La API manda 'null', pero si tu interfaz dice 'string | undefined',
          // usa '|| undefined' o '|| ""' según prefieras.
          puesto: d.kpi.puesto || undefined,
          indicador: d.kpi.indicador,
          descripcion: d.kpi.descripcion || undefined,
          formula: d.kpi.formula || undefined,
          meta: d.kpi.meta,
          tolerancia: d.kpi.tolerancia,
          umbralAmarillo: d.kpi.umbralAmarillo,
          periodicidad: d.kpi.periodicidad,
          sentido: d.kpi.sentido,
          unidad: d.kpi.unidad || undefined,
          activo: d.kpi.activo,
          orden: d.kpi.orden
        }
      }));

      // 2. Llenamos el objeto principal
      const evaluacionFinal: EvaluacionCompleta = {
        id: data.id,
        periodo: data.periodo,
        anio: data.anio,
        evaluador: {
          nombre: data.evaluador.nombre,
          apellido: data.evaluador.apellido,
          // Aquí también: la API trae null, tu interfaz pide string.
          // Le ponemos un string vacío o un valor por defecto.
          puesto: data.evaluador.puesto || 'Sin puesto asignado'
        },
        promedioGeneral: formatearNumero(data.promedioGeneral),
        kpisRojos: data.kpisRojos,
        porcentajeRojos: data.porcentajeRojos,
        // Aseguramos a TypeScript que el string es uno de los permitidos
        status: data.status as 'enviada' | 'validada' | 'en_revision',
        fechaEnvio: data.fechaEnvio,
        comentarioGeneral: data.comentarioGeneral,

        // Asignamos el array que procesamos arriba
        detalles: detallesFormateados,

        validacion: data.validacion // Si es null, pasa como null/undefined
      };

      setEvaluacion(evaluacionFinal);

    } catch (error) {
      console.error('Error al cargar evaluación:', error);
      // alert('Error al cargar la evaluación'); // Opcional
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
                  <p className={`text-xl font-bold ${detalle.estado === 'verde' ? 'text-green-600' :
                      detalle.estado === 'amarillo' ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                    {detalle.resultadoPorcentaje.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Brecha vs Meta</p>
                  <p className={`text-xl font-bold ${detalle.brechaVsMeta >= 0 ? 'text-green-600' : 'text-red-600'
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
              {/* Botón ACEPTAR (Abre el modal simple antiguo) */}
              <button
                onClick={() => {
                  setAccion('aceptar');
                  setShowValidacionModal(true); // Abre el modal pequeño solo para confirmar
                }}
                className="flex items-center justify-center gap-3 px-8 py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
              >
                <CheckCircle className="w-7 h-7" />
                Aceptar Evaluación
              </button>

              {/* Botón REVISAR (Abre tu NUEVO diálogo complejo) */}
              <button
                onClick={() => {
                  // Aquí inicializamos y abrimos el NUEVO diálogo
                  setKpisApelados([]); // Limpiamos selección previa
                  setRevisionMotivo(''); // Limpiamos motivo
                  setArchivosAdjuntos([]); // Limpiamos archivos
                  setShowRevisionDialog(true); // <--- Abrimos el nuevo código
                }}
                className="flex items-center justify-center gap-3 px-8 py-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
              >
                <AlertCircle className="w-7 h-7" />
                Solicitar Revisión
              </button>
            </div>
          </div>
        )}

        {/* Modal Simple (Solo para ACEPTAR) */}
        {showValidacionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Aceptar Evaluación
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Al aceptar esta evaluación, confirmas que estás de acuerdo con las calificaciones, metas, resultados y comentarios proporcionados por tu evaluador. Esta acción es definitiva.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowValidacionModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleValidar} // Esta función debe llamar al API para aceptar
                  disabled={enviando}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {enviando ? (
                    <>Procesando...</>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirmar Aceptación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog Solicitar Revisión */}
        {showRevisionDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Solicitar Revisión</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Selecciona los KPIs que deseas apelar y proporciona una justificación para cada uno
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowRevisionDialog(false);
                      setRevisionMotivo('');
                      setKpisApelados([]);
                      setArchivosAdjuntos([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Lista de KPIs con checkboxes */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">KPIs a Apelar:</h4>

                  {evaluacion?.detalles.map((detalle: any) => {
                    const isSelected = kpisApelados.some(k => k.kpiId === detalle.kpi.id);
                    const kpiData = kpisApelados.find(k => k.kpiId === detalle.kpi.id);

                    return (
                      <div
                        key={detalle.id}
                        className={`border rounded-lg p-4 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                      >
                        {/* Checkbox y nombre del KPI */}
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="checkbox"
                            id={`kpi-${detalle.kpi.id}`}
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setKpisApelados([
                                  ...kpisApelados,
                                  {
                                    kpiId: detalle.kpi.id,
                                    kpiNombre: detalle.kpi.indicador,
                                    motivo: '',
                                  },
                                ]);
                              } else {
                                setKpisApelados(kpisApelados.filter(k => k.kpiId !== detalle.kpi.id));
                              }
                            }}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <label htmlFor={`kpi-${detalle.kpi.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{detalle.kpi.indicador}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Resultado: <span className="font-semibold">{detalle.resultadoNumerico}</span> |
                                  Meta: <span className="font-semibold">{detalle.meta}</span> |
                                  Estado: <span className={`font-semibold ${detalle.estado === 'verde' ? 'text-green-600' :
                                      detalle.estado === 'amarillo' ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                    {detalle.estado.toUpperCase()}
                                  </span>
                                </p>
                              </div>
                              {detalle.estado === 'rojo' && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                  KPI Crítico
                                </span>
                              )}
                            </div>
                          </label>
                        </div>

                        {/* Campo de texto para justificación (solo si está seleccionado) */}
                        {isSelected && (
                          <div className="ml-7 mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Justificación para este KPI: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={kpiData?.motivo || ''}
                              onChange={(e) => {
                                setKpisApelados(
                                  kpisApelados.map(k =>
                                    k.kpiId === detalle.kpi.id
                                      ? { ...k, motivo: e.target.value }
                                      : k
                                  )
                                );
                              }}
                              placeholder="Explica por qué consideras que este KPI debe ser revisado..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none"
                              required
                            />
                            {kpiData && kpiData.motivo.length < 20 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Mínimo 20 caracteres (actual: {kpiData.motivo.length})
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Motivo general (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario General (Opcional)
                  </label>
                  <textarea
                    value={revisionMotivo}
                    onChange={(e) => setRevisionMotivo(e.target.value)}
                    placeholder="Agrega un comentario general sobre tu solicitud de revisión..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-none"
                  />
                </div>

                {/* Adjuntar archivos (simulado) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjuntar Archivos (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        // Simulación: guardar nombres de archivos
                        const nuevosArchivos = files.map(f => ({
                          nombre: f.name,
                          url: `https://storage.cloud.com/simulado/${f.name}`, // URL simulada
                        }));
                        setArchivosAdjuntos([...archivosAdjuntos, ...nuevosArchivos]);
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="text-blue-600 font-medium">Haz clic para subir</span> o arrastra archivos aquí
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
                    </label>
                  </div>

                  {/* Lista de archivos adjuntos */}
                  {archivosAdjuntos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {archivosAdjuntos.map((archivo, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{archivo.nombre}</span>
                          </div>
                          <button
                            onClick={() => {
                              setArchivosAdjuntos(archivosAdjuntos.filter((_, i) => i !== index));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {kpisApelados.length > 0 ? (
                      <span className="font-medium text-blue-600">
                        {kpisApelados.length} KPI{kpisApelados.length !== 1 ? 's' : ''} seleccionado{kpisApelados.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-gray-500">Selecciona al menos un KPI</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRevisionDialog(false);
                        setRevisionMotivo('');
                        setKpisApelados([]);
                        setArchivosAdjuntos([]);
                      }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSolicitarRevision}
                      disabled={
                        kpisApelados.length === 0 ||
                        kpisApelados.some(k => k.motivo.length < 20)
                      }
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${kpisApelados.length === 0 || kpisApelados.some(k => k.motivo.length < 20)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      Enviar Solicitud
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );

}


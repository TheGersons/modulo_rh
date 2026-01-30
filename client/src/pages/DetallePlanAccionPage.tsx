import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  Calendar,
  Clock,
  User,
  Target,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Send,
  Download,
} from 'lucide-react';
import { planesAccionService } from '../services/planes-accion.service';

interface PlanAccion {
  id: string;
  status: string;
  descripcionProblema: string | null;
  accionesCorrectivas: string | null;
  recursosNecesarios: string | null;
  metasEspecificas: string | null;
  diasPlazo: number;
  fechaLimite: string | null;
  fechaCreacion: string;
  fechaEnvio: string | null;
  fechaRevision: string | null;
  fechaAprobacion: string | null;
  fechaCompletado: string | null;
  motivoRechazo: string | null;
  archivosAdjuntos: string | null;
  evaluacion: {
    id: string;
    periodo: string;
    anio: number;
    promedioGeneral: number;
  };
  empleado: {
    id: string;
    nombre: string;
    apellido: string;
    puesto: string;
    area: {
      nombre: string;
    };
  };
  kpi: {
    id: string;
    key: string;
    indicador: string;
    meta: number;
    unidad: string;
  };
}

export default function DetallePlanAccionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanAccion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAprobarDialog, setShowAprobarDialog] = useState(false);
  const [showRechazarDialog, setShowRechazarDialog] = useState(false);
  const [diasPlazo, setDiasPlazo] = useState(15);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  // Usuario simulado - reemplazar con contexto real
  const user = {
    id: 'user-id',
    role: 'empleado', // o 'jefe'
  };

  useEffect(() => {
    cargarPlan();
  }, [id]);

  const cargarPlan = async () => {
    try {
      setLoading(true);
      const data = await planesAccionService.getById(id!);
      setPlan(data);
      setDiasPlazo(data.diasPlazo);
    } catch (error) {
      console.error('Error al cargar plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviar = async () => {
    if (!plan) return;

    if (!plan.descripcionProblema || !plan.accionesCorrectivas || !plan.metasEspecificas) {
      alert('El plan debe estar completo antes de enviarlo');
      return;
    }

    if (window.confirm('¿Estás seguro de enviar este plan para revisión?')) {
      try {
        await planesAccionService.enviar(plan.id);
        alert('Plan enviado exitosamente para revisión');
        cargarPlan();
      } catch (error) {
        console.error('Error al enviar plan:', error);
        alert('Error al enviar el plan');
      }
    }
  };

  const handleAprobar = async () => {
    if (!plan) return;

    try {
      await planesAccionService.aprobar(plan.id, diasPlazo);
      alert(`Plan aprobado con un plazo de ${diasPlazo} días`);
      setShowAprobarDialog(false);
      cargarPlan();
    } catch (error) {
      console.error('Error al aprobar plan:', error);
      alert('Error al aprobar el plan');
    }
  };

  const handleRechazar = async () => {
    if (!plan) return;

    if (!motivoRechazo.trim()) {
      alert('Debes proporcionar un motivo de rechazo');
      return;
    }

    try {
      await planesAccionService.rechazar(plan.id, motivoRechazo);
      alert('Plan rechazado. El empleado deberá rehacerlo.');
      setShowRechazarDialog(false);
      setMotivoRechazo('');
      cargarPlan();
    } catch (error) {
      console.error('Error al rechazar plan:', error);
      alert('Error al rechazar el plan');
    }
  };

  const handleCompletar = async () => {
    if (!plan) return;

    if (window.confirm('¿Confirmas que este plan de acción se ha completado exitosamente?')) {
      try {
        await planesAccionService.completar(plan.id);
        alert('Plan marcado como completado');
        cargarPlan();
      } catch (error) {
        console.error('Error al completar plan:', error);
        alert('Error al completar el plan');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      borrador: { color: 'bg-gray-100 text-gray-700', icon: FileText, label: 'Borrador' },
      enviado: { color: 'bg-blue-100 text-blue-700', icon: Send, label: 'Enviado' },
      rechazado: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rechazado' },
      aprobado: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Aprobado' },
      en_progreso: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'En Progreso' },
      completado: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Completado' },
    };

    const badge = badges[status] || badges.borrador;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDiasRestantes = () => {
    if (!plan?.fechaLimite) return null;
    const dias = Math.ceil((new Date(plan.fechaLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando plan de acción...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan no encontrado</h3>
        <button onClick={() => navigate('/kpis/planes-accion')} className="text-blue-600 hover:underline">
          Volver a la lista
        </button>
      </div>
    );
  }

  const diasRestantes = getDiasRestantes();
  const vencido = diasRestantes !== null && diasRestantes < 0;
  const urgente = diasRestantes !== null && diasRestantes <= 3 && diasRestantes >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/kpis/planes-accion')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plan de Acción</h1>
            <p className="text-gray-600 mt-1">{plan.kpi.indicador}</p>
          </div>
        </div>

        {getStatusBadge(plan.status)}
      </div>

      {/* Alertas */}
      {plan.status === 'rechazado' && plan.motivoRechazo && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Plan Rechazado</p>
              <p className="text-sm text-red-700">{plan.motivoRechazo}</p>
              <p className="text-sm text-red-600 mt-2">Debes completar y reenviar el plan.</p>
            </div>
          </div>
        </div>
      )}

      {plan.status === 'en_progreso' && vencido && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">¡Plan Vencido!</p>
              <p className="text-sm text-red-700">
                Este plan venció hace {Math.abs(diasRestantes!)} días. Contacta a tu jefe.
              </p>
            </div>
          </div>
        </div>
      )}

      {plan.status === 'en_progreso' && urgente && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 mb-1">¡Urgente!</p>
              <p className="text-sm text-yellow-700">Solo quedan {diasRestantes} días para completar este plan.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del KPI */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Información del KPI
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Clave del KPI</p>
                <p className="font-semibold text-gray-900">{plan.kpi.key}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Indicador</p>
                <p className="font-semibold text-gray-900">{plan.kpi.indicador}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Meta</p>
                <p className="font-semibold text-gray-900">
                  {plan.kpi.meta} {plan.kpi.unidad}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Evaluación</p>
                <p className="font-semibold text-gray-900">
                  {plan.evaluacion.periodo} {plan.evaluacion.anio}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido del Plan */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Contenido del Plan
            </h2>

            <div className="space-y-6">
              {/* Descripción del Problema */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Problema
                </label>
                {plan.descripcionProblema ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-900">{plan.descripcionProblema}</div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-400 italic">No completado</div>
                )}
              </div>

              {/* Acciones Correctivas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Acciones Correctivas</label>
                {plan.accionesCorrectivas ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-900">{plan.accionesCorrectivas}</div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-400 italic">No completado</div>
                )}
              </div>

              {/* Recursos Necesarios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recursos Necesarios</label>
                {plan.recursosNecesarios ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-900">{plan.recursosNecesarios}</div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-400 italic">Opcional - No completado</div>
                )}
              </div>

              {/* Metas Específicas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metas Específicas</label>
                {plan.metasEspecificas ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-900">{plan.metasEspecificas}</div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-400 italic">No completado</div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>

            <div className="flex flex-wrap gap-3">
              {/* Empleado - Editar borrador */}
              {plan.status === 'borrador' && user.role === 'empleado' && (
                <>
                  <button
                    onClick={() => navigate(`/kpis/planes-accion/${plan.id}/editar`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Plan
                  </button>
                  <button
                    onClick={handleEnviar}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Enviar para Revisión
                  </button>
                </>
              )}

              {/* Jefe - Aprobar/Rechazar */}
              {plan.status === 'enviado' && user.role === 'jefe' && (
                <>
                  <button
                    onClick={() => setShowAprobarDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar Plan
                  </button>
                  <button
                    onClick={() => setShowRechazarDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar Plan
                  </button>
                </>
              )}

              {/* Jefe - Marcar como completado */}
              {plan.status === 'en_progreso' && user.role === 'jefe' && (
                <button
                  onClick={handleCompletar}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar como Completado
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Timeline
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Fecha de Creación</p>
                <p className="font-medium text-gray-900">{formatDate(plan.fechaCreacion)}</p>
              </div>

              {plan.fechaEnvio && (
                <div>
                  <p className="text-sm text-gray-600">Fecha de Envío</p>
                  <p className="font-medium text-gray-900">{formatDate(plan.fechaEnvio)}</p>
                </div>
              )}

              {plan.fechaRevision && (
                <div>
                  <p className="text-sm text-gray-600">Fecha de Revisión</p>
                  <p className="font-medium text-gray-900">{formatDate(plan.fechaRevision)}</p>
                </div>
              )}

              {plan.fechaAprobacion && (
                <div>
                  <p className="text-sm text-gray-600">Fecha de Aprobación</p>
                  <p className="font-medium text-gray-900">{formatDate(plan.fechaAprobacion)}</p>
                </div>
              )}

              {plan.fechaLimite && (
                <div>
                  <p className="text-sm text-gray-600">Fecha Límite</p>
                  <p
                    className={`font-medium ${
                      vencido ? 'text-red-600' : urgente ? 'text-yellow-600' : 'text-gray-900'
                    }`}
                  >
                    {formatDate(plan.fechaLimite)}
                  </p>
                  {diasRestantes !== null && (
                    <p className="text-xs text-gray-500 mt-1">
                      {vencido
                        ? `Vencido hace ${Math.abs(diasRestantes)} días`
                        : `${diasRestantes} días restantes`}
                    </p>
                  )}
                </div>
              )}

              {plan.fechaCompletado && (
                <div>
                  <p className="text-sm text-gray-600">Fecha de Completado</p>
                  <p className="font-medium text-green-600">{formatDate(plan.fechaCompletado)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Empleado */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Empleado
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium text-gray-900">
                  {plan.empleado.nombre} {plan.empleado.apellido}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Puesto</p>
                <p className="font-medium text-gray-900">{plan.empleado.puesto}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Área</p>
                <p className="font-medium text-gray-900">{plan.empleado.area.nombre}</p>
              </div>
            </div>
          </div>

          {/* Plazo */}
          {(plan.status === 'aprobado' || plan.status === 'en_progreso') && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Plazo
              </h2>

              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{plan.diasPlazo}</p>
                <p className="text-sm text-gray-600 mt-1">días de plazo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Aprobar */}
      {showAprobarDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Aprobar Plan de Acción</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de plazo para completar
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={diasPlazo}
                onChange={(e) => setDiasPlazo(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recomendado: 15 días</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAprobarDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAprobar}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Rechazar */}
      {showRechazarDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rechazar Plan de Acción</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Explica por qué el plan no es adecuado y qué debe mejorar el empleado..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px] resize-none"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRechazarDialog(false);
                  setMotivoRechazo('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={!motivoRechazo.trim()}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  motivoRechazo.trim()
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
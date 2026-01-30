import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  Plus,
  Eye,
  Send,
  FileText,
} from 'lucide-react';
import { planesAccionService } from '../services/planes-accion.service';

interface PlanAccion {
  id: string;
  status: string;
  diasPlazo: number;
  fechaLimite: string | null;
  fechaCreacion: string;
  fechaEnvio: string | null;
  motivoRechazo: string | null;
  evaluacion: {
    periodo: string;
    anio: number;
  };
  empleado: {
    nombre: string;
    apellido: string;
  };
  kpi: {
    key: string;
    indicador: string;
  };
}

interface Stats {
  total: number;
  borradores: number;
  enviados: number;
  aprobados: number;
  enProgreso: number;
  completados: number;
  rechazados: number;
}

export default function PlanesAccionPage() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<PlanAccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    borradores: 0,
    enviados: 0,
    aprobados: 0,
    enProgreso: 0,
    completados: 0,
    rechazados: 0,
  });

  // Usuario simulado - reemplazar con contexto real
  const user = {
    id: 'user-id',
    role: 'empleado', // o 'jefe'
  };

  useEffect(() => {
    cargarPlanes();
  }, [filtroStatus]);

  const cargarPlanes = async () => {
    try {
      setLoading(true);
      const filters: any = { empleadoId: user.id };
      if (filtroStatus !== 'todos') {
        filters.status = filtroStatus;
      }

      const data = await planesAccionService.getAll(filters);
      setPlanes(data);

      // Calcular stats
      const statsCalculadas = {
        total: data.length,
        borradores: data.filter((p: PlanAccion) => p.status === 'borrador').length,
        enviados: data.filter((p: PlanAccion) => p.status === 'enviado').length,
        aprobados: data.filter((p: PlanAccion) => p.status === 'aprobado').length,
        enProgreso: data.filter((p: PlanAccion) => p.status === 'en_progreso').length,
        completados: data.filter((p: PlanAccion) => p.status === 'completado').length,
        rechazados: data.filter((p: PlanAccion) => p.status === 'rechazado').length,
      };
      setStats(statsCalculadas);
    } catch (error) {
      console.error('Error al cargar planes:', error);
    } finally {
      setLoading(false);
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getDiasRestantes = (fechaLimite: string | null) => {
    if (!fechaLimite) return null;
    const dias = Math.ceil((new Date(fechaLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  const getDiasDesdeCreacion = (fechaCreacion: string) => {
    const dias = Math.floor((new Date().getTime() - new Date(fechaCreacion).getTime()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando planes de acción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planes de Acción</h1>
          <p className="text-gray-600 mt-1">Gestiona tus planes de mejora para KPIs críticos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Borradores</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.borradores}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.enProgreso}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completados}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'todos', label: 'Todos' },
              { value: 'borrador', label: 'Borradores' },
              { value: 'enviado', label: 'Enviados' },
              { value: 'rechazado', label: 'Rechazados' },
              { value: 'en_progreso', label: 'En Progreso' },
              { value: 'completado', label: 'Completados' },
            ].map((filtro) => (
              <button
                key={filtro.value}
                onClick={() => setFiltroStatus(filtro.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroStatus === filtro.value
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

      {/* Lista de Planes */}
      {planes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay planes de acción</h3>
          <p className="text-gray-600">
            {filtroStatus === 'todos'
              ? 'Cuando tengas KPIs en rojo, se crearán planes de acción automáticamente'
              : `No hay planes en estado "${filtroStatus}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {planes.map((plan) => {
            const diasRestantes = getDiasRestantes(plan.fechaLimite);
            const diasDesdeCreacion = getDiasDesdeCreacion(plan.fechaCreacion);
            const vencido = diasRestantes !== null && diasRestantes < 0;
            const urgente = diasRestantes !== null && diasRestantes <= 3 && diasRestantes >= 0;

            return (
              <div
                key={plan.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{plan.kpi.indicador}</h3>
                          {getStatusBadge(plan.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          KPI: {plan.kpi.key} | Evaluación: {plan.evaluacion.periodo} {plan.evaluacion.anio}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Fecha de creación */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Creado hace {diasDesdeCreacion} día{diasDesdeCreacion !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Plazo */}
                      {plan.fechaLimite && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span
                            className={
                              vencido
                                ? 'text-red-600 font-medium'
                                : urgente
                                ? 'text-yellow-600 font-medium'
                                : 'text-gray-600'
                            }
                          >
                            {vencido
                              ? `Vencido hace ${Math.abs(diasRestantes!)} días`
                              : urgente
                              ? `¡Faltan ${diasRestantes} días!`
                              : `${diasRestantes} días restantes`}
                          </span>
                        </div>
                      )}

                      {/* Días de plazo */}
                      {plan.status !== 'borrador' && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Plazo: {plan.diasPlazo} días</span>
                        </div>
                      )}
                    </div>

                    {/* Alerta de borrador no enviado */}
                    {plan.status === 'borrador' && diasDesdeCreacion >= 3 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            ¡Atención! Este plan debe ser enviado dentro de 3 días de su creación
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Motivo de rechazo */}
                    {plan.motivoRechazo && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-red-700 mb-1">Motivo del rechazo:</p>
                        <p className="text-sm text-red-600">{plan.motivoRechazo}</p>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/kpis/planes-accion/${plan.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    {plan.status === 'borrador' && (
                      <button
                        onClick={() => navigate(`/kpis/planes-accion/${plan.id}/editar`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Completar Plan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    User,
    Calendar,
    Edit,
    Plus,
    Eye,
    ThumbsUp,
    ThumbsDown,
} from 'lucide-react';
import { ordenesTrabajoService } from '../services/ordenes-trabajo.service';
import Layout from '../components/layout/Layout';
import { usePermissions } from '../hooks/usePermissions';

interface SolicitudTarea {
    id: string;
    ordenTrabajoId: string;
    empleadoId: string;
    descripcion: string;
    justificacion: string;
    status: string;
    motivoRechazo?: string;
    fechaSolicitud: string;
    fechaRespuesta?: string;
    empleado: {
        nombre: string;
        apellido: string;
    };
    ordenTrabajo: {
        titulo: string;
        kpi: {
            indicador: string;
        };
    };
}

interface SolicitudEdicion {
    id: string;
    ordenTrabajoId: string;
    solicitanteId: string;
    campoAEditar: string;
    valorActual: string;
    valorNuevo: string;
    justificacion: string;
    status: string;
    motivoRechazo?: string;
    fechaSolicitud: string;
    fechaRespuesta?: string;
    solicitante: {
        nombre: string;
        apellido: string;
    };
    ordenTrabajo: {
        titulo: string;
        kpi: {
            indicador: string;
        };
    };
}

export default function SolicitudesPage() {
    const navigate = useNavigate();
    const { can } = usePermissions();
    const [tipoVista, setTipoVista] = useState<'tareas' | 'ediciones'>('tareas');
    const [filtroStatus, setFiltroStatus] = useState<string>('pendiente');

    const [solicitudesTarea, setSolicitudesTarea] = useState<SolicitudTarea[]>([]);
    const [solicitudesEdicion, setSolicitudesEdicion] = useState<SolicitudEdicion[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<any>(null);
    const [accion, setAccion] = useState<'aprobar' | 'rechazar'>('aprobar');
    const [motivoRechazo, setMotivoRechazo] = useState('');

    useEffect(() => {
        cargarSolicitudes();
    }, [tipoVista, filtroStatus]);

    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            const filters = { status: filtroStatus === 'todas' ? undefined : filtroStatus };

            if (tipoVista === 'tareas') {
                const data = await ordenesTrabajoService.getSolicitudesTarea(filters);
                setSolicitudesTarea(data);
            } else {
                const data = await ordenesTrabajoService.getSolicitudesEdicion(filters);
                setSolicitudesEdicion(data);
            }
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResponder = async () => {
        if (!solicitudSeleccionada) return;

        if (accion === 'rechazar' && !motivoRechazo.trim()) {
            alert('Debes proporcionar un motivo de rechazo');
            return;
        }

        try {
            const status = accion === 'aprobar' ? 'aprobada' : 'rechazada';

            if (tipoVista === 'tareas') {
                await ordenesTrabajoService.responderSolicitudTarea(
                    solicitudSeleccionada.id,
                    status,
                    motivoRechazo
                );
            } else {
                await ordenesTrabajoService.responderSolicitudEdicion(
                    solicitudSeleccionada.id,
                    status,
                    motivoRechazo
                );
            }

            alert(`Solicitud ${status} exitosamente`);
            setShowModal(false);
            setSolicitudSeleccionada(null);
            setMotivoRechazo('');
            cargarSolicitudes();
        } catch (error) {
            console.error('Error al responder solicitud:', error);
            alert('Error al procesar la solicitud');
        }
    };

    const abrirModal = (solicitud: any, accionSeleccionada: 'aprobar' | 'rechazar') => {
        setSolicitudSeleccionada(solicitud);
        setAccion(accionSeleccionada);
        setShowModal(true);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: any; label: string }> = {
            pendiente: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pendiente' },
            aprobada: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Aprobada' },
            rechazada: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rechazada' },
        };

        const badge = badges[status] || badges.pendiente;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCampoLabel = (campo: string) => {
        const labels: Record<string, string> = {
            fechaLimite: 'Fecha Límite',
            descripcion: 'Descripción',
            cantidadTareas: 'Cantidad de Tareas',
        };
        return labels[campo] || campo;
    };

    const stats = {
        tareasPendientes: solicitudesTarea.filter(s => s.status === 'pendiente').length,
        tareasAprobadas: solicitudesTarea.filter(s => s.status === 'aprobada').length,
        tareasRechazadas: solicitudesTarea.filter(s => s.status === 'rechazada').length,
        edicionesPendientes: solicitudesEdicion.filter(s => s.status === 'pendiente').length,
        edicionesAprobadas: solicitudesEdicion.filter(s => s.status === 'aprobada').length,
        edicionesRechazadas: solicitudesEdicion.filter(s => s.status === 'rechazada').length,
    };

    const solicitudesMostrar = tipoVista === 'tareas' ? solicitudesTarea : solicitudesEdicion;
    const puedeAprobar = can('aprobar_solicitud');

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
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
                    <h1 className="text-3xl font-bold text-gray-900">Solicitudes Pendientes</h1>
                    <p className="text-gray-600 mt-1">
                        Gestiona las solicitudes de tareas adicionales y ediciones
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pendientes</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">
                                    {tipoVista === 'tareas' ? stats.tareasPendientes : stats.edicionesPendientes}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Aprobadas</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {tipoVista === 'tareas' ? stats.tareasAprobadas : stats.edicionesAprobadas}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rechazadas</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">
                                    {tipoVista === 'tareas' ? stats.tareasRechazadas : stats.edicionesRechazadas}
                                </p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs y Filtros */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTipoVista('tareas')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${tipoVista === 'tareas'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Plus className="w-4 h-4" />
                                Tareas Adicionales
                                {stats.tareasPendientes > 0 && (
                                    <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                                        {stats.tareasPendientes}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setTipoVista('ediciones')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${tipoVista === 'ediciones'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Edit className="w-4 h-4" />
                                Ediciones
                                {stats.edicionesPendientes > 0 && (
                                    <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                                        {stats.edicionesPendientes}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Filtros */}
                        <div className="flex gap-2">
                            {['pendiente', 'aprobada', 'rechazada', 'todas'].map((filtro) => (
                                <button
                                    key={filtro}
                                    onClick={() => setFiltroStatus(filtro)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filtroStatus === filtro
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lista de Solicitudes */}
                {solicitudesMostrar.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay solicitudes</h3>
                        <p className="text-gray-600">
                            No hay {tipoVista === 'tareas' ? 'tareas adicionales' : 'ediciones'} en estado "{filtroStatus}"
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tipoVista === 'tareas' ? (
                            // Solicitudes de Tarea
                            solicitudesTarea.map((solicitud) => (
                                <div
                                    key={solicitud.id}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <Plus className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">Nueva Tarea Solicitada</h3>
                                                    {getStatusBadge(solicitud.status)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {solicitud.empleado.nombre} {solicitud.empleado.apellido}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatFecha(solicitud.fechaSolicitud)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    <strong>Orden:</strong> {solicitud.ordenTrabajo.titulo}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>KPI:</strong> {solicitud.ordenTrabajo.kpi.indicador}
                                                </p>
                                            </div>
                                        </div>

                                        {solicitud.status === 'pendiente' && puedeAprobar && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => abrirModal(solicitud, 'aprobar')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => abrirModal(solicitud, 'rechazar')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <ThumbsDown className="w-4 h-4" />
                                                    Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Descripción de la tarea:</p>
                                        <p className="text-sm text-gray-900">{solicitud.descripcion}</p>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm font-semibold text-blue-900 mb-2">Justificación:</p>
                                        <p className="text-sm text-blue-700">{solicitud.justificacion}</p>
                                    </div>

                                    {solicitud.motivoRechazo && (
                                        <div className="mt-3 bg-red-50 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-red-900 mb-2">Motivo de Rechazo:</p>
                                            <p className="text-sm text-red-700">{solicitud.motivoRechazo}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => navigate(`/ordenes/${solicitud.ordenTrabajoId}`)}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver Orden Completa
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Solicitudes de Edición
                            solicitudesEdicion.map((solicitud) => (
                                <div
                                    key={solicitud.id}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-purple-50 rounded-lg">
                                                <Edit className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Edición de {getCampoLabel(solicitud.campoAEditar)}
                                                    </h3>
                                                    {getStatusBadge(solicitud.status)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {solicitud.solicitante.nombre} {solicitud.solicitante.apellido}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatFecha(solicitud.fechaSolicitud)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    <strong>Orden:</strong> {solicitud.ordenTrabajo.titulo}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>KPI:</strong> {solicitud.ordenTrabajo.kpi.indicador}
                                                </p>
                                            </div>
                                        </div>

                                        {solicitud.status === 'pendiente' && puedeAprobar && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => abrirModal(solicitud, 'aprobar')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => abrirModal(solicitud, 'rechazar')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <ThumbsDown className="w-4 h-4" />
                                                    Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div className="bg-red-50 rounded-lg p-4">
                                            <p className="text-xs font-semibold text-red-700 mb-2">Valor Actual:</p>
                                            <p className="text-sm text-red-900 font-medium">{solicitud.valorActual}</p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-xs font-semibold text-green-700 mb-2">Valor Nuevo:</p>
                                            <p className="text-sm text-green-900 font-medium">{solicitud.valorNuevo}</p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm font-semibold text-blue-900 mb-2">Justificación:</p>
                                        <p className="text-sm text-blue-700">{solicitud.justificacion}</p>
                                    </div>

                                    {solicitud.motivoRechazo && (
                                        <div className="mt-3 bg-red-50 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-red-900 mb-2">Motivo de Rechazo:</p>
                                            <p className="text-sm text-red-700">{solicitud.motivoRechazo}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => navigate(`/ordenes/${solicitud.ordenTrabajoId}`)}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver Orden Completa
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Modal de Confirmación */}
                {showModal && solicitudSeleccionada && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                {accion === 'aprobar' ? (
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-gray-900">
                                    {accion === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
                                </h3>
                            </div>

                            <p className="text-gray-600 mb-4">
                                {accion === 'aprobar'
                                    ? '¿Estás seguro de que deseas aprobar esta solicitud?'
                                    : 'Proporciona un motivo para el rechazo:'}
                            </p>

                            {accion === 'rechazar' && (
                                <textarea
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    placeholder="Explica por qué rechazas esta solicitud..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px] resize-none mb-4"
                                />
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSolicitudSeleccionada(null);
                                        setMotivoRechazo('');
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleResponder}
                                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${accion === 'aprobar'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                        }`}
                                >
                                    {accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
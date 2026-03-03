import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    Clock,
    User,
    CheckCircle,
    AlertTriangle,
    FileText,
    ThumbsUp,
    ThumbsDown,
    Image,
    Film,
    File,
    Download,
    Eye,
} from 'lucide-react';
import { ordenesTrabajoService, type OrdenTrabajo } from '../services/ordenes-trabajo.service';
import { usePermissions } from '../hooks/usePermissions';
import Layout from '../components/layout/Layout';

const TIPO_ICON: Record<string, any> = {
    imagen: Image,
    video: Film,
    pdf: FileText,
    documento: File,
};

export default function DetalleOrdenPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isJefe, isAdmin } = usePermissions();

    const [orden, setOrden] = useState<OrdenTrabajo | null>(null);
    const [loading, setLoading] = useState(true);

    // Revisar evidencia
    const [evidenciaRevisando, setEvidenciaRevisando] = useState<string | null>(null);
    const [showRevisarModal, setShowRevisarModal] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');

    useEffect(() => { cargarOrden(); }, [id]);

    const cargarOrden = async () => {
        try {
            setLoading(true);
            const data = await ordenesTrabajoService.getById(id!);
            setOrden(data);
        } catch (error) {
            console.error('Error al cargar orden:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRevisarEvidencia = async (evidenciaId: string, status: 'aprobada' | 'rechazada') => {
        try {
            if (status === 'rechazada' && !motivoRechazo.trim()) {
                alert('Debes proporcionar un motivo de rechazo');
                return;
            }
            await ordenesTrabajoService.revisarEvidencia(evidenciaId, status, motivoRechazo);
            setShowRevisarModal(false);
            setMotivoRechazo('');
            setEvidenciaRevisando(null);
            await cargarOrden();
        } catch (error) {
            alert('Error al revisar evidencia');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: any; label: string }> = {
            pendiente: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Pendiente' },
            en_proceso: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'En Proceso' },
            completada: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completada' },
            vencida: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Vencida' },
            aprobada: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Aprobada' },
            rechazada: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Rechazada' },
        };
        const badge = badges[status] ?? badges.pendiente;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${badge.color}`}>
                <Icon className="w-4 h-4" />
                {badge.label}
            </span>
        );
    };

    const formatFecha = (fecha: string) =>
        new Date(fecha).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' });

    const getDiasRestantes = () => {
        if (!orden) return null;
        return Math.ceil((new Date(orden.fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                        <p className="mt-4 text-gray-600">Cargando orden...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!orden) {
        return (
            <Layout>
                <div className="p-8 text-center">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Orden no encontrada</h3>
                    <button onClick={() => navigate('/ordenes')} className="text-blue-600 hover:underline text-sm">
                        Volver a la lista
                    </button>
                </div>
            </Layout>
        );
    }

    const diasRestantes = getDiasRestantes();
    const ordenCerrada = ['completada', 'aprobada', 'vencida'].includes(orden.status);
    const vencida = diasRestantes !== null && diasRestantes < 0 && !ordenCerrada;
    const urgente = diasRestantes !== null && diasRestantes <= 3 && diasRestantes >= 0 && !ordenCerrada;
    const puedeRevisar = isJefe || isAdmin;

    return (
        <Layout>
            <div className="p-8 space-y-6 max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/ordenes')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{orden.titulo}</h1>
                            <p className="text-gray-600 mt-1 text-sm">{orden.kpi.indicador}</p>
                        </div>
                    </div>
                    {getStatusBadge(orden.status)}
                </div>

                {/* Alertas — solo si la orden sigue abierta */}
                {vencida && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-900">¡Orden Vencida!</p>
                            <p className="text-sm text-red-700">Esta orden venció hace {Math.abs(diasRestantes!)} días sin completarse</p>
                        </div>
                    </div>
                )}
                {urgente && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-yellow-900">¡Urgente!</p>
                            <p className="text-sm text-yellow-700">Solo quedan {diasRestantes} días para que el empleado complete esta orden</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Columna principal */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Información General */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                Información General
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Descripción</p>
                                    <p className="text-gray-900">{orden.descripcion}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">KPI</p>
                                        <p className="font-semibold text-gray-900">{orden.kpi.key}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tipo</p>
                                        <p className="font-semibold text-gray-900">
                                            {orden.tipoOrden === 'kpi_sistema' ? 'KPI del Sistema' : 'Orden Solicitada'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progreso */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Progreso</h2>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">{orden.tareasCompletadas} de {orden.cantidadTareas} tareas completadas</span>
                                <span className="font-semibold text-gray-900">{Math.round(orden.progreso)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${orden.progreso === 100 ? 'bg-green-600' : orden.progreso >= 50 ? 'bg-blue-600' : 'bg-yellow-600'}`}
                                    style={{ width: `${orden.progreso}%` }}
                                />
                            </div>
                        </div>

                        {/* Tareas y Evidencias */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-5">Tareas y Evidencias</h2>

                            <div className="space-y-4">
                                {(!orden.tareas || orden.tareas.length === 0) && (
                                    <div className="text-center py-10 text-gray-400">
                                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">Esta orden no tiene tareas asignadas</p>
                                    </div>
                                )}

                                {orden.tareas?.map((tarea) => (
                                    <div key={tarea.id} className="border border-gray-200 rounded-xl overflow-hidden">

                                        {/* Header tarea */}
                                        <div className="flex items-start p-4 bg-gray-50">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${tarea.completada ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                    {tarea.completada ? '✓' : tarea.orden}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{tarea.descripcion}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {tarea.completada
                                                            ? <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completada</span>
                                                            : <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>
                                                        }
                                                        {tarea.fueraDeTiempo && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">Fuera de tiempo</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Evidencias */}
                                        {tarea.evidencias && tarea.evidencias.length > 0 && (
                                            <div className="p-4 border-t border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                    Evidencias ({tarea.evidencias.length})
                                                </p>
                                                <div className={`space-y-2 ${tarea.evidencias.length > 3 ? 'max-h-64 overflow-y-auto pr-1' : ''}`}>
                                                    {tarea.evidencias.map((evidencia) => {
                                                        const TipoIcon = TIPO_ICON[evidencia.tipo] ?? File;
                                                        const statusColor =
                                                            evidencia.status === 'aprobada' ? 'bg-green-50 border-green-200' :
                                                                evidencia.status === 'rechazada' ? 'bg-red-50 border-red-200' :
                                                                    'bg-orange-50 border-orange-200';
                                                        return (
                                                            <div key={evidencia.id} className={`rounded-lg border p-3 ${statusColor}`}>
                                                                <div className="flex items-start justify-between gap-3">

                                                                    {/* Info archivo */}
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <TipoIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-medium text-gray-900 truncate">{evidencia.nombre}</p>
                                                                            <p className="text-xs text-gray-400">
                                                                                Intento #{evidencia.intento} · {formatFecha(evidencia.fechaSubida)}
                                                                                {evidencia.esFueraDeTiempo && <span className="text-red-500"> · Fuera de tiempo</span>}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Acciones */}
                                                                    <div className="flex items-center gap-1 flex-shrink-0">

                                                                        {/* Badge status */}
                                                                        {evidencia.status === 'aprobada' && (
                                                                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full mr-1">Aprobada</span>
                                                                        )}
                                                                        {evidencia.status === 'rechazada' && (
                                                                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full mr-1">Rechazada</span>
                                                                        )}
                                                                        {evidencia.status === 'pendiente_revision' && (
                                                                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full mr-1">En revisión</span>
                                                                        )}

                                                                        {/* Ver */}
                                                                        <a
                                                                            href={evidencia.archivoUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="p-1.5 text-gray-400 hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
                                                                            title="Ver archivo"
                                                                        >
                                                                            <Eye className="w-3.5 h-3.5" />
                                                                        </a>

                                                                        {/* Descargar */}
                                                                        <a
                                                                            href={evidencia.archivoUrl}
                                                                            download={evidencia.nombre}
                                                                            className="p-1.5 text-gray-400 hover:bg-white hover:text-gray-700 rounded-lg transition-colors"
                                                                            title="Descargar"
                                                                        >
                                                                            <Download className="w-3.5 h-3.5" />
                                                                        </a>

                                                                        {/* Aprobar / Rechazar */}
                                                                        {evidencia.status === 'pendiente_revision' && puedeRevisar && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => handleRevisarEvidencia(evidencia.id, 'aprobada')}
                                                                                    className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                                                    title="Aprobar"
                                                                                >
                                                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => { setEvidenciaRevisando(evidencia.id); setShowRevisarModal(true); }}
                                                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                                    title="Rechazar"
                                                                                >
                                                                                    <ThumbsDown className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Motivo rechazo */}
                                                                {evidencia.motivoRechazo && (
                                                                    <div className="mt-2 text-xs text-red-600 pl-6">
                                                                        <span className="font-medium">Motivo: </span>{evidencia.motivoRechazo}
                                                                    </div>
                                                                )}

                                                                {/* Apelación (solo lectura para el jefe) */}
                                                                {evidencia.apelacion && (
                                                                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200 ml-6">
                                                                        <p className="text-xs font-semibold text-yellow-900">Apelación del empleado:</p>
                                                                        <p className="text-xs text-yellow-700">{evidencia.apelacion}</p>
                                                                        {evidencia.respuestaApelacion && (
                                                                            <div className="mt-1 pt-1 border-t border-yellow-200">
                                                                                <p className="text-xs font-semibold text-yellow-900">Tu respuesta:</p>
                                                                                <p className="text-xs text-yellow-700">{evidencia.respuestaApelacion}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {(!tarea.evidencias || tarea.evidencias.length === 0) && (
                                            <div className="p-4 border-t border-gray-100 text-center">
                                                <p className="text-xs text-gray-400">El empleado aún no ha subido evidencias</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Columna lateral */}
                    <div className="space-y-6">

                        {/* Timeline */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Timeline
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Fecha de Inicio</p>
                                    <p className="font-medium text-gray-900">{formatFecha(orden.fechaInicio)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Fecha Límite</p>
                                    <p className={`font-medium ${vencida ? 'text-red-600' : urgente ? 'text-yellow-600' : 'text-gray-900'}`}>
                                        {formatFecha(orden.fechaLimite)}
                                    </p>
                                    {diasRestantes !== null && !ordenCerrada && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {diasRestantes < 0 ? `Vencida hace ${Math.abs(diasRestantes)} días` : `${diasRestantes} días restantes`}
                                        </p>
                                    )}
                                </div>
                                {orden.fechaCompletada && (
                                    <div>
                                        <p className="text-sm text-gray-500">Fecha de Completado</p>
                                        <p className="font-medium text-green-600">{formatFecha(orden.fechaCompletada)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Participantes */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Participantes
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Empleado</p>
                                    <p className="font-medium text-gray-900">{orden.empleado.nombre} {orden.empleado.apellido}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Creador</p>
                                    <p className="font-medium text-gray-900">{orden.creador.nombre} {orden.creador.apellido}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Rechazar evidencia */}
            {showRevisarModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Rechazar Evidencia</h3>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Motivo del rechazo <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={motivoRechazo}
                            onChange={(e) => setMotivoRechazo(e.target.value)}
                            placeholder="Explica por qué rechazas esta evidencia..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 min-h-[100px] resize-none"
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowRevisarModal(false); setMotivoRechazo(''); setEvidenciaRevisando(null); }}
                                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleRevisarEvidencia(evidenciaRevisando!, 'rechazada')}
                                disabled={!motivoRechazo.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
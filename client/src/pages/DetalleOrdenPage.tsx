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
    Upload,
    FileText,
    ThumbsUp,
    ThumbsDown,
    Plus,
} from 'lucide-react';
import { ordenesTrabajoService, type OrdenTrabajo, } from '../services/ordenes-trabajo.service';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

export default function DetalleOrdenPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isJefe, isAdmin } = usePermissions();
    const [orden, setOrden] = useState<OrdenTrabajo | null>(null);
    const [loading, setLoading] = useState(true);
    const [tareaSeleccionada, setTareaSeleccionada] = useState<string | null>(null);

    // Modals
    const [showSubirEvidencia, setShowSubirEvidencia] = useState(false);
    const [showRevisarModal, setShowRevisarModal] = useState(false);
    const [showApelarModal, setShowApelarModal] = useState(false);
    const [showSolicitarTarea, setShowSolicitarTarea] = useState(false);

    // Form states
    const [archivoUrl, setArchivoUrl] = useState('');
    const [tipoArchivo, setTipoArchivo] = useState('pdf');
    const [nombreArchivo, setNombreArchivo] = useState('');
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [apelacion, setApelacion] = useState('');
    const [nuevaTareaDesc, setNuevaTareaDesc] = useState('');
    const [justificacion, setJustificacion] = useState('');

    useEffect(() => {
        cargarOrden();
    }, [id]);

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

    const handleSubirEvidencia = async () => {
        if (!tareaSeleccionada || !archivoUrl || !nombreArchivo) {
            alert('Completa todos los campos');
            return;
        }

        try {
            await ordenesTrabajoService.subirEvidencia({
                tareaId: tareaSeleccionada,
                archivoUrl,
                tipo: tipoArchivo,
                nombre: nombreArchivo,
            });

            alert('Evidencia subida exitosamente');
            setShowSubirEvidencia(false);
            setArchivoUrl('');
            setNombreArchivo('');
            cargarOrden();
        } catch (error) {
            console.error('Error al subir evidencia:', error);
            alert('Error al subir evidencia');
        }
    };

    const handleRevisarEvidencia = async (evidenciaId: string, status: 'aprobada' | 'rechazada') => {
        try {
            if (status === 'rechazada' && !motivoRechazo) {
                alert('Debes proporcionar un motivo de rechazo');
                return;
            }

            await ordenesTrabajoService.revisarEvidencia(evidenciaId, status, motivoRechazo);
            alert(`Evidencia ${status === 'aprobada' ? 'aprobada' : 'rechazada'} exitosamente`);
            setShowRevisarModal(false);
            setMotivoRechazo('');
            cargarOrden();
        } catch (error) {
            console.error('Error al revisar evidencia:', error);
            alert('Error al revisar evidencia');
        }
    };

    const handleApelar = async (evidenciaId: string) => {
        if (!apelacion) {
            alert('Escribe tu apelación');
            return;
        }

        try {
            await ordenesTrabajoService.apelarEvidencia(evidenciaId, apelacion);
            alert('Apelación enviada');
            setShowApelarModal(false);
            setApelacion('');
            cargarOrden();
        } catch (error) {
            console.error('Error al apelar:', error);
            alert('Error al enviar apelación');
        }
    };

    const handleSolicitarTarea = async () => {
        if (!nuevaTareaDesc || !justificacion) {
            alert('Completa todos los campos');
            return;
        }

        try {
            await ordenesTrabajoService.solicitarTarea({
                ordenTrabajoId: id!,
                descripcion: nuevaTareaDesc,
                justificacion,
            });

            alert('Solicitud enviada al jefe');
            setShowSolicitarTarea(false);
            setNuevaTareaDesc('');
            setJustificacion('');
            cargarOrden();
        } catch (error) {
            console.error('Error al solicitar tarea:', error);
            alert('Error al enviar solicitud');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: any; label: string }> = {
            pendiente: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Pendiente' },
            en_proceso: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'En Proceso' },
            completada: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completada' },
            vencida: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Vencida' },
            aprobada: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Aprobada' },
        };

        const badge = badges[status] || badges.pendiente;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${badge.color}`}>
                <Icon className="w-4 h-4" />
                {badge.label}
            </span>
        );
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getDiasRestantes = () => {
        if (!orden) return null;
        const dias = Math.ceil((new Date(orden.fechaLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return dias;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando orden...</p>
                </div>
            </div>
        );
    }

    if (!orden) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Orden no encontrada</h3>
                <button onClick={() => navigate('/ordenes')} className="text-blue-600 hover:underline">
                    Volver a la lista
                </button>
            </div>
        );
    }

    const diasRestantes = getDiasRestantes();
    const vencida = diasRestantes !== null && diasRestantes < 0;
    const urgente = diasRestantes !== null && diasRestantes <= 3 && diasRestantes >= 0;
    const esEmpleado = user?.id === orden.empleadoId;
    const puedeRevisar = isJefe || isAdmin;

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/ordenes')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{orden.titulo}</h1>
                        <p className="text-gray-600 mt-1">{orden.kpi.indicador}</p>
                    </div>
                </div>

                {getStatusBadge(orden.status)}
            </div>

            {/* Alertas */}
            {vencida && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-900 mb-1">¡Orden Vencida!</p>
                            <p className="text-sm text-red-700">
                                Esta orden venció hace {Math.abs(diasRestantes!)} días
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {urgente && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-yellow-900 mb-1">¡Urgente!</p>
                            <p className="text-sm text-yellow-700">Solo quedan {diasRestantes} días para completar esta orden</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Información General */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            Información General
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Descripción</p>
                                <p className="text-gray-900">{orden.descripcion}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">KPI</p>
                                    <p className="font-semibold text-gray-900">{orden.kpi.key}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tipo</p>
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
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">
                                    {orden.tareasCompletadas} de {orden.cantidadTareas} tareas completadas
                                </span>
                                <span className="font-semibold text-gray-900">{Math.round(orden.progreso)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${orden.progreso === 100
                                        ? 'bg-green-600'
                                        : orden.progreso >= 50
                                            ? 'bg-blue-600'
                                            : 'bg-yellow-600'
                                        }`}
                                    style={{ width: `${orden.progreso}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tareas y Evidencias */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Tareas y Evidencias</h2>
                            {esEmpleado && (
                                <button
                                    onClick={() => setShowSolicitarTarea(true)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Solicitar Tarea
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {orden.tareas?.map((tarea) => (
                                <div key={tarea.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-gray-900">Tarea {tarea.orden}</span>
                                                {tarea.completada ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                )}
                                                {tarea.fueraDeTiempo && (
                                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                                        Fuera de tiempo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                                        </div>

                                        {esEmpleado && !tarea.completada && (
                                            <button
                                                onClick={() => {
                                                    setTareaSeleccionada(tarea.id);
                                                    setShowSubirEvidencia(true);
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Upload className="w-4 h-4" />
                                                Subir Evidencia
                                            </button>
                                        )}
                                    </div>

                                    {/* Evidencias de la tarea */}
                                    {tarea.evidencias && tarea.evidencias.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Evidencias:</p>
                                            {tarea.evidencias.map((evidencia) => (
                                                <div
                                                    key={evidencia.id}
                                                    className={`p-3 rounded-lg border ${evidencia.status === 'aprobada'
                                                        ? 'bg-green-50 border-green-200'
                                                        : evidencia.status === 'rechazada'
                                                            ? 'bg-red-50 border-red-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="w-4 h-4 text-gray-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{evidencia.nombre}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    Intento #{evidencia.intento} • {formatFecha(evidencia.fechaSubida)}
                                                                    {evidencia.esFueraDeTiempo && ' • Fuera de tiempo'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {evidencia.status === 'aprobada' && (
                                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                                    Aprobada
                                                                </span>
                                                            )}
                                                            {evidencia.status === 'rechazada' && (
                                                                <>
                                                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                                                        Rechazada
                                                                    </span>
                                                                    {esEmpleado && !evidencia.apelacion && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setTareaSeleccionada(evidencia.id);
                                                                                setShowApelarModal(true);
                                                                            }}
                                                                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                                                        >
                                                                            Apelar
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                            {evidencia.status === 'pendiente_revision' && puedeRevisar && (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleRevisarEvidencia(evidencia.id, 'aprobada')}
                                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                                    >
                                                                        <ThumbsUp className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setTareaSeleccionada(evidencia.id);
                                                                            setShowRevisarModal(true);
                                                                        }}
                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                    >
                                                                        <ThumbsDown className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {evidencia.motivoRechazo && (
                                                        <div className="mt-2 text-xs text-red-600">
                                                            <strong>Motivo:</strong> {evidencia.motivoRechazo}
                                                        </div>
                                                    )}

                                                    {evidencia.apelacion && (
                                                        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                                            <p className="text-xs font-semibold text-yellow-900">Apelación:</p>
                                                            <p className="text-xs text-yellow-700">{evidencia.apelacion}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
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
                                <p className="text-sm text-gray-600">Fecha de Inicio</p>
                                <p className="font-medium text-gray-900">{formatFecha(orden.fechaInicio)}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Fecha Límite</p>
                                <p
                                    className={`font-medium ${vencida ? 'text-red-600' : urgente ? 'text-yellow-600' : 'text-gray-900'
                                        }`}
                                >
                                    {formatFecha(orden.fechaLimite)}
                                </p>
                                {diasRestantes !== null && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {vencida ? `Vencida hace ${Math.abs(diasRestantes)} días` : `${diasRestantes} días restantes`}
                                    </p>
                                )}
                            </div>

                            {orden.fechaCompletada && (
                                <div>
                                    <p className="text-sm text-gray-600">Fecha de Completado</p>
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
                                <p className="text-sm text-gray-600">Empleado</p>
                                <p className="font-medium text-gray-900">
                                    {orden.empleado.nombre} {orden.empleado.apellido}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Creador</p>
                                <p className="font-medium text-gray-900">
                                    {orden.creador.nombre} {orden.creador.apellido}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Subir Evidencia */}
            {showSubirEvidencia && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Subir Evidencia</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del archivo</label>
                                <input
                                    type="text"
                                    value={nombreArchivo}
                                    onChange={(e) => setNombreArchivo(e.target.value)}
                                    placeholder="reporte_mensual.pdf"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL del archivo</label>
                                <input
                                    type="text"
                                    value={archivoUrl}
                                    onChange={(e) => setArchivoUrl(e.target.value)}
                                    placeholder="https://storage.ejemplo.com/archivo.pdf"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                                <select
                                    value={tipoArchivo}
                                    onChange={(e) => setTipoArchivo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="imagen">Imagen</option>
                                    <option value="video">Video</option>
                                    <option value="documento">Documento</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowSubirEvidencia(false);
                                    setArchivoUrl('');
                                    setNombreArchivo('');
                                }}
                                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubirEvidencia}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Subir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Rechazar Evidencia */}
            {showRevisarModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Rechazar Evidencia</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Motivo del rechazo <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={motivoRechazo}
                                onChange={(e) => setMotivoRechazo(e.target.value)}
                                placeholder="Explica por qué rechazas esta evidencia..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRevisarModal(false);
                                    setMotivoRechazo('');
                                }}
                                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleRevisarEvidencia(tareaSeleccionada!, 'rechazada')}
                                disabled={!motivoRechazo.trim()}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${motivoRechazo.trim()
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

            {/* Modal: Apelar */}
            {showApelarModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Apelar Rechazo</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tu apelación <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={apelacion}
                                onChange={(e) => setApelacion(e.target.value)}
                                placeholder="Explica por qué consideras que la evidencia debe ser aprobada..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowApelarModal(false);
                                    setApelacion('');
                                }}
                                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleApelar(tareaSeleccionada!)}
                                disabled={!apelacion.trim()}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${apelacion.trim()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Enviar Apelación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Solicitar Tarea */}
            {showSolicitarTarea && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Solicitar Tarea Adicional</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                <textarea
                                    value={nuevaTareaDesc}
                                    onChange={(e) => setNuevaTareaDesc(e.target.value)}
                                    placeholder="Describe la tarea que necesitas agregar..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Justificación</label>
                                <textarea
                                    value={justificacion}
                                    onChange={(e) => setJustificacion(e.target.value)}
                                    placeholder="¿Por qué es necesaria esta tarea?"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowSolicitarTarea(false);
                                    setNuevaTareaDesc('');
                                    setJustificacion('');
                                }}
                                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSolicitarTarea}
                                disabled={!nuevaTareaDesc.trim() || !justificacion.trim()}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${nuevaTareaDesc.trim() && justificacion.trim()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Enviar Solicitud
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
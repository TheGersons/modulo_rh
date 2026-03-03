import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    FileText,
    Image,
    Download,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Filter,
    RefreshCw,
    ClipboardList,
    Target,
    User,
    Calendar,
    MessageSquare,
} from 'lucide-react';
import { kpisService } from '../services/kpis.service';
import { ordenesTrabajoService } from '../services/ordenes-trabajo.service';
import Layout from '../components/layout/Layout';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

interface EvidenciaKPI {
    id: string;
    kpiId: string;
    empleadoId: string;
    periodo: string;
    archivoUrl: string;
    tipo: string;
    nombre: string;
    tamanio?: number;
    valorNumerico?: number;
    nota?: string;
    intento: number;
    status: 'pendiente_revision' | 'aprobada' | 'rechazada';
    motivoRechazo?: string;
    apelacion?: string;
    esFueraDeTiempo: boolean;
    fechaSubida: string;
    kpi: {
        key: string;
        indicador: string;
        tipoCalculo: string;
        tipoCriticidad: string;
        area: string;
    };
    empleado: {
        nombre: string;
        apellido: string;
    };
}

interface EvidenciaOrden {
    id: string;
    tareaId: string;
    archivoUrl: string;
    tipo: string;
    nombre: string;
    intento: number;
    status: string;
    motivoRechazo?: string;
    apelacion?: string;
    esFueraDeTiempo: boolean;
    fechaSubida: string;
    tarea: {
        descripcion: string;
        orden: number;
        ordenTrabajo: {
            titulo: string;
            empleado: {
                nombre: string;
                apellido: string;
            };
            kpi: {
                key: string;
                indicador: string;
            };
        };
    };
}

type TipoVista = 'kpis' | 'ordenes';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-HN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const formatTamanio = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getIconoArchivo = (tipo: string) => {
    if (tipo.startsWith('image/')) return Image;
    return FileText;
};

const getCriticidadBadge = (criticidad: string) => {
    const map: Record<string, string> = {
        critico: 'bg-red-100 text-red-700',
        importante: 'bg-orange-100 text-orange-700',
        no_critico: 'bg-gray-100 text-gray-600',
    };
    const labels: Record<string, string> = {
        critico: 'Crítico',
        importante: 'Importante',
        no_critico: 'Normal',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[criticidad] ?? 'bg-gray-100 text-gray-600'}`}>
            {labels[criticidad] ?? criticidad}
        </span>
    );
};

// ─────────────────────────────────────────────
// COMPONENTE TARJETA DE EVIDENCIA KPI
// ─────────────────────────────────────────────

function TarjetaEvidenciaKPI({
    evidencia,
    onRevisar,
}: {
    evidencia: EvidenciaKPI;
    onRevisar: (id: string, status: 'aprobada' | 'rechazada', motivo?: string) => void;
}) {
    const [expandida, setExpandida] = useState(false);
    const [mostrarRechazo, setMostrarRechazo] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [procesando, setProcesando] = useState(false);
    const IconoArchivo = getIconoArchivo(evidencia.tipo);

    const handleAprobar = async () => {
        setProcesando(true);
        await onRevisar(evidencia.id, 'aprobada');
        setProcesando(false);
    };

    const handleRechazar = async () => {
        if (!motivoRechazo.trim()) return;
        setProcesando(true);
        await onRevisar(evidencia.id, 'rechazada', motivoRechazo);
        setProcesando(false);
        setMostrarRechazo(false);
        setMotivoRechazo('');
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-mono text-gray-400">{evidencia.kpi.key}</span>
                                {getCriticidadBadge(evidencia.kpi.tipoCriticidad)}
                                {evidencia.esFueraDeTiempo && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                        Fuera de tiempo
                                    </span>
                                )}
                                {evidencia.intento > 1 && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                        Intento #{evidencia.intento}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{evidencia.kpi.indicador}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {evidencia.empleado.nombre} {evidencia.empleado.apellido}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatFecha(evidencia.fechaSubida)}
                                </span>
                                <span>{evidencia.kpi.area}</span>
                                <span>Período: {evidencia.periodo}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones acción */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setExpandida(!expandida)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ver evidencia"
                        >
                            {expandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleAprobar}
                            disabled={procesando}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                        </button>
                        <button
                            onClick={() => setMostrarRechazo(!mostrarRechazo)}
                            disabled={procesando}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                        </button>
                    </div>
                </div>

                {/* Rechazo inline */}
                {mostrarRechazo && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-800 mb-2">Motivo de rechazo:</p>
                        <textarea
                            value={motivoRechazo}
                            onChange={(e) => setMotivoRechazo(e.target.value)}
                            placeholder="Explica por qué rechazas esta evidencia..."
                            className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
                            rows={3}
                        />
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => { setMostrarRechazo(false); setMotivoRechazo(''); }}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRechazar}
                                disabled={!motivoRechazo.trim() || procesando}
                                className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                Confirmar rechazo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detalle expandido */}
            {expandida && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-3">
                    {/* Archivo */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <IconoArchivo className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{evidencia.nombre}</p>
                            {evidencia.tamanio && (
                                <p className="text-xs text-gray-500">{formatTamanio(evidencia.tamanio)}</p>
                            )}
                        </div>
                        <a
                            href={evidencia.archivoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            Ver
                        </a>
                        <a
                            href={evidencia.archivoUrl}
                            download
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Descargar
                        </a>
                    </div>

                    {/* Preview imagen */}
                    {evidencia.tipo.startsWith('image/') && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 max-h-64">
                            <img
                                src={evidencia.archivoUrl}
                                alt="Evidencia"
                                className="w-full h-full object-contain bg-gray-100"
                            />
                        </div>
                    )}

                    {/* Valor numérico */}
                    {evidencia.valorNumerico !== undefined && evidencia.valorNumerico !== null && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm text-blue-700 font-medium">Valor reportado:</span>
                            <span className="text-sm font-bold text-blue-900">{evidencia.valorNumerico}</span>
                        </div>
                    )}

                    {/* Nota */}
                    {evidencia.nota && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Nota del empleado:
                            </p>
                            <p className="text-sm text-gray-700">{evidencia.nota}</p>
                        </div>
                    )}

                    {/* Apelación */}
                    {evidencia.apelacion && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-xs font-semibold text-orange-700 mb-1">Apelación:</p>
                            <p className="text-sm text-orange-900">{evidencia.apelacion}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// COMPONENTE TARJETA DE EVIDENCIA ORDEN
// ─────────────────────────────────────────────

function TarjetaEvidenciaOrden({
    evidencia,
    onRevisar,
}: {
    evidencia: EvidenciaOrden;
    onRevisar: (id: string, status: 'aprobada' | 'rechazada', motivo?: string) => void;
}) {
    const [expandida, setExpandida] = useState(false);
    const [mostrarRechazo, setMostrarRechazo] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [procesando, setProcesando] = useState(false);
    const IconoArchivo = getIconoArchivo(evidencia.tipo);

    const handleAprobar = async () => {
        setProcesando(true);
        await onRevisar(evidencia.id, 'aprobada');
        setProcesando(false);
    };

    const handleRechazar = async () => {
        if (!motivoRechazo.trim()) return;
        setProcesando(true);
        await onRevisar(evidencia.id, 'rechazada', motivoRechazo);
        setProcesando(false);
        setMostrarRechazo(false);
        setMotivoRechazo('');
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                            <ClipboardList className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-mono text-gray-400">
                                    {evidencia.tarea.ordenTrabajo.kpi.key}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    Tarea {evidencia.tarea.orden}
                                </span>
                                {evidencia.esFueraDeTiempo && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                        Fuera de tiempo
                                    </span>
                                )}
                                {evidencia.intento > 1 && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                        Intento #{evidencia.intento}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {evidencia.tarea.ordenTrabajo.titulo}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                {evidencia.tarea.descripcion}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {evidencia.tarea.ordenTrabajo.empleado.nombre}{' '}
                                    {evidencia.tarea.ordenTrabajo.empleado.apellido}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatFecha(evidencia.fechaSubida)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setExpandida(!expandida)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {expandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleAprobar}
                            disabled={procesando}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                        </button>
                        <button
                            onClick={() => setMostrarRechazo(!mostrarRechazo)}
                            disabled={procesando}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                        </button>
                    </div>
                </div>

                {mostrarRechazo && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-800 mb-2">Motivo de rechazo:</p>
                        <textarea
                            value={motivoRechazo}
                            onChange={(e) => setMotivoRechazo(e.target.value)}
                            placeholder="Explica por qué rechazas esta evidencia..."
                            className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
                            rows={3}
                        />
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => { setMostrarRechazo(false); setMotivoRechazo(''); }}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRechazar}
                                disabled={!motivoRechazo.trim() || procesando}
                                className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                Confirmar rechazo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {expandida && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <IconoArchivo className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{evidencia.nombre}</p>
                        </div>
                        <a
                            href={evidencia.archivoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            Ver
                        </a>
                        <a
                            href={evidencia.archivoUrl}
                            download
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Descargar
                        </a>
                    </div>

                    {evidencia.tipo.startsWith('image/') && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 max-h-64">
                            <img
                                src={evidencia.archivoUrl}
                                alt="Evidencia"
                                className="w-full h-full object-contain bg-gray-100"
                            />
                        </div>
                    )}

                    {evidencia.apelacion && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-xs font-semibold text-orange-700 mb-1">Apelación:</p>
                            <p className="text-sm text-orange-900">{evidencia.apelacion}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────

export default function RevisionEvidenciasPage() {
    const [tipoVista, setTipoVista] = useState<TipoVista>('kpis');
    const [evidenciasKPI, setEvidenciasKPI] = useState<EvidenciaKPI[]>([]);
    const [evidenciasOrden, setEvidenciasOrden] = useState<EvidenciaOrden[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filtroEmpleado, setFiltroEmpleado] = useState('');

    useEffect(() => {
        cargarEvidencias();
    }, [tipoVista]);

    const cargarEvidencias = async (silencioso = false) => {
        if (!silencioso) setLoading(true);
        else setRefreshing(true);

        try {
            if (tipoVista === 'kpis') {
                const data = await kpisService.getEvidenciasPendientes();
                setEvidenciasKPI(data);
            } else {
                // Evidencias pendientes de órdenes — filtramos las que están en pendiente_revision
                const ordenes = await ordenesTrabajoService.getAll({ status: 'en_proceso' });
                const todasEvidencias: EvidenciaOrden[] = [];
                for (const orden of ordenes) {
                    const tareas = await ordenesTrabajoService.getTareas(orden.id);
                    for (const tarea of tareas) {
                        if (tarea.evidencias) {
                            const pendientes = tarea.evidencias
                                .filter((e) => e.status === 'pendiente_revision')
                                .map((e) => ({
                                    ...e,
                                    tarea: {
                                        descripcion: tarea.descripcion,
                                        orden: tarea.orden,
                                        ordenTrabajo: {
                                            titulo: orden.titulo,
                                            empleado: orden.empleado,
                                            kpi: orden.kpi,
                                        },
                                    },
                                }));
                            todasEvidencias.push(...pendientes);
                        }
                    }
                }
                setEvidenciasOrden(todasEvidencias);
            }
        } catch (error) {
            console.error('Error al cargar evidencias:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRevisarKPI = async (
        id: string,
        status: 'aprobada' | 'rechazada',
        motivo?: string,
    ) => {
        try {
            await kpisService.revisarEvidencia(id, { status, motivoRechazo: motivo });
            setEvidenciasKPI((prev) => prev.filter((e) => e.id !== id));
        } catch (error) {
            console.error('Error al revisar evidencia KPI:', error);
        }
    };

    const handleRevisarOrden = async (
        id: string,
        status: 'aprobada' | 'rechazada',
        motivo?: string,
    ) => {
        try {
            await ordenesTrabajoService.revisarEvidencia(id, status, motivo);
            setEvidenciasOrden((prev) => prev.filter((e) => e.id !== id));
        } catch (error) {
            console.error('Error al revisar evidencia de orden:', error);
        }
    };

    // Filtrado por nombre de empleado
    const evidenciasKPIFiltradas = evidenciasKPI.filter((e) => {
        if (!filtroEmpleado) return true;
        const nombre = `${e.empleado.nombre} ${e.empleado.apellido}`.toLowerCase();
        return nombre.includes(filtroEmpleado.toLowerCase());
    });

    const evidenciasOrdenFiltradas = evidenciasOrden.filter((e) => {
        if (!filtroEmpleado) return true;
        const nombre = `${e.tarea.ordenTrabajo.empleado.nombre} ${e.tarea.ordenTrabajo.empleado.apellido}`.toLowerCase();
        return nombre.includes(filtroEmpleado.toLowerCase());
    });

    const totalPendientes =
        tipoVista === 'kpis' ? evidenciasKPIFiltradas.length : evidenciasOrdenFiltradas.length;

    const totalKPIs = evidenciasKPI.length;
    const totalOrdenes = evidenciasOrden.length;

    return (
        <Layout>
            <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Revisión de Evidencias</h1>
                        <p className="text-gray-600 mt-1">
                            Revisa y aprueba las evidencias enviadas por tu equipo
                        </p>
                    </div>
                    <button
                        onClick={() => cargarEvidencias(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">KPIs pendientes</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{totalKPIs}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Target className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Órdenes pendientes</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">{totalOrdenes}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <ClipboardList className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total a revisar</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">
                                    {totalKPIs + totalOrdenes}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs + Filtro */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setTipoVista('kpis')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tipoVista === 'kpis'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Target className="w-4 h-4" />
                            KPIs
                            {totalKPIs > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tipoVista === 'kpis' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {totalKPIs}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setTipoVista('ordenes')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tipoVista === 'ordenes'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <ClipboardList className="w-4 h-4" />
                            Órdenes
                            {totalOrdenes > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tipoVista === 'ordenes' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    {totalOrdenes}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Filtro empleado */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filtrar por empleado..."
                            value={filtroEmpleado}
                            onChange={(e) => setFiltroEmpleado(e.target.value)}
                            className="text-sm text-gray-700 placeholder-gray-400 outline-none w-48"
                        />
                    </div>
                </div>

                {/* Contenido */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                            <p className="mt-4 text-gray-600">Cargando evidencias...</p>
                        </div>
                    </div>
                ) : totalPendientes === 0 ? (
                    <div className="bg-white rounded-xl p-16 text-center border border-gray-200 shadow-sm">
                        <div className="p-4 bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Todo al día</h3>
                        <p className="text-gray-600">
                            {filtroEmpleado
                                ? 'No hay evidencias pendientes para ese empleado'
                                : `No hay evidencias de ${tipoVista === 'kpis' ? 'KPIs' : 'órdenes'} pendientes de revisión`}
                        </p>
                        {filtroEmpleado && (
                            <button
                                onClick={() => setFiltroEmpleado('')}
                                className="mt-4 text-sm text-blue-600 hover:underline"
                            >
                                Limpiar filtro
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Contador */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                                {totalPendientes} evidencia{totalPendientes !== 1 ? 's' : ''} pendiente
                                {totalPendientes !== 1 ? 's' : ''} de revisión
                            </span>
                        </div>

                        {tipoVista === 'kpis'
                            ? evidenciasKPIFiltradas.map((ev) => (
                                <TarjetaEvidenciaKPI
                                    key={ev.id}
                                    evidencia={ev}
                                    onRevisar={handleRevisarKPI}
                                />
                            ))
                            : evidenciasOrdenFiltradas.map((ev) => (
                                <TarjetaEvidenciaOrden
                                    key={ev.id}
                                    evidencia={ev}
                                    onRevisar={handleRevisarOrden}
                                />
                            ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Clock,
    CheckCircle,
    AlertTriangle,
    Plus,
    Filter,
    Eye,
    Calendar,
    User,
    TrendingUp,
} from 'lucide-react';
import { ordenesTrabajoService, type OrdenTrabajo } from '../services/ordenes-trabajo.service';
import { useAuth } from '../contexts/AuthContext';

// Estado visual derivado de las evidencias de la orden
function getEstadoReal(orden: OrdenTrabajo): {
    label: string;
    color: string;
    bg: string;
    border: string;
} {
    const status = orden.status;

    // Contar evidencias de todas las tareas
    const todasEvidencias = orden.tareas?.flatMap(t => t.evidencias ?? []) ?? [];
    const pendientesRevision = todasEvidencias.filter(e => e.status === 'pendiente_revision').length;
    const rechazadas = todasEvidencias.filter(e => e.status === 'rechazada').length;
    const aprobadas = todasEvidencias.filter(e => e.status === 'aprobada').length;

    if (['completada', 'aprobada'].includes(status)) {
        return { label: 'Completada', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200' };
    }
    if (status === 'vencida') {
        return { label: 'Vencida', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' };
    }
    if (status === 'cancelada') {
        return { label: 'Cancelada', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' };
    }
    if (status === 'en_pausa') {
        return { label: 'En Pausa', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    }

    // Estados derivados de evidencias cuando la orden está activa
    if (pendientesRevision > 0) {
        return { label: 'Esperando revisión', color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200' };
    }
    if (rechazadas > 0 && pendientesRevision === 0) {
        return { label: 'Evidencia rechazada', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' };
    }
    if (aprobadas > 0) {
        return { label: 'En progreso', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' };
    }
    if (status === 'en_proceso') {
        return { label: 'En Proceso', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' };
    }

    return { label: 'Pendiente', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' };
}


export default function OrdenesTrabajoPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState<string>('todos');

    useEffect(() => {
        cargarOrdenes();
    }, [filtroStatus]);

    const cargarOrdenes = async () => {
        try {
            setLoading(true);
            const filters: any = {
                creadorId: user?.id, // ← solo las que yo solicité
            };
            if (filtroStatus !== 'todos') {
                filters.status = filtroStatus;
            }
            const data = await ordenesTrabajoService.getAll(filters);
            setOrdenes(data);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (orden: OrdenTrabajo) => {
        const estado = getEstadoReal(orden);
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${estado.bg} ${estado.color}`}>
                {estado.label}
            </span>
        );
    };

    const getProgresoColor = (progreso: number, status: string) => {
        if (['completada', 'aprobada'].includes(status)) return 'bg-green-500';
        if (progreso >= 70) return 'bg-blue-500';
        if (progreso >= 30) return 'bg-yellow-500';
        return 'bg-red-400';
    };

    const getDiasRestantes = (fechaLimite: string) =>
        Math.ceil((new Date(fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const formatFecha = (fecha: string) =>
        new Date(fecha).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });

    const stats = {
        total: ordenes.length,
        activas: ordenes.filter(o => ['pendiente', 'en_proceso'].includes(o.status)).length,
        completadas: ordenes.filter(o => ['completada', 'aprobada'].includes(o.status)).length,
        vencidas: ordenes.filter(o => o.status === 'vencida' ||
            (['pendiente', 'en_proceso'].includes(o.status) && new Date(o.fechaLimite) < new Date())).length,
    };

    if (loading) {
        return (

            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando órdenes...</p>
                </div>
            </div>

        );
    }

    return (

        <div className="p-8 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Órdenes Solicitadas</h1>
                    <p className="text-gray-600 mt-1">Órdenes de trabajo que has creado y su progreso</p>
                </div>
                <button
                    onClick={() => navigate('/ordenes/crear')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Orden
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-blue-50', icon: Briefcase, iconColor: 'text-blue-600' },
                    { label: 'Activas', value: stats.activas, color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock, iconColor: 'text-blue-600' },
                    { label: 'Completadas', value: stats.completadas, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, iconColor: 'text-green-600' },
                    { label: 'Vencidas', value: stats.vencidas, color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, iconColor: 'text-red-600' },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{s.label}</p>
                                    <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${s.bg}`}>
                                    <Icon className={`w-6 h-6 ${s.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { value: 'todos', label: 'Todas' },
                            { value: 'pendiente', label: 'Pendientes' },
                            { value: 'en_proceso', label: 'En Proceso' },
                            { value: 'vencida', label: 'Vencidas' },
                            { value: 'completada', label: 'Completadas' },
                            { value: 'aprobada', label: 'Aprobadas' },
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFiltroStatus(f.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroStatus === f.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lista */}
            {ordenes.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay órdenes</h3>
                    <p className="text-gray-500 text-sm">
                        {filtroStatus === 'todos'
                            ? 'Aún no has creado ninguna orden de trabajo'
                            : `No hay órdenes en estado "${filtroStatus}"`}
                    </p>
                    <button
                        onClick={() => navigate('/ordenes/crear')}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Crear primera orden
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {ordenes.map((orden) => {
                        const diasRestantes = getDiasRestantes(orden.fechaLimite);
                        const estaActiva = ['pendiente', 'en_proceso'].includes(orden.status);
                        const vencida = diasRestantes < 0 && estaActiva;
                        const urgente = diasRestantes >= 0 && diasRestantes <= 3 && estaActiva;
                        const completada = ['completada', 'aprobada'].includes(orden.status);
                        const progreso = Math.round(orden.progreso ?? 0);
                        const estadoReal = getEstadoReal(orden);

                        return (
                            <div
                                key={orden.id}
                                onClick={() => navigate(`/ordenes/${orden.id}`)}
                                className={`bg-white rounded-xl p-6 shadow-sm border transition-all cursor-pointer hover:shadow-md ${vencida ? 'border-red-200' :
                                        urgente ? 'border-yellow-200' :
                                            completada ? 'border-green-200' :
                                                estadoReal.border
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">

                                        {/* Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`p-3 rounded-lg flex-shrink-0 ${completada ? 'bg-green-50' : vencida ? 'bg-red-50' : 'bg-blue-50'
                                                }`}>
                                                <Briefcase className={`w-6 h-6 ${completada ? 'text-green-600' : vencida ? 'text-red-600' : 'text-blue-600'
                                                    }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">{orden.titulo}</h3>
                                                    {getStatusBadge(orden)}
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{orden.descripcion}</p>

                                                {/* Meta info */}
                                                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <TrendingUp className="w-3.5 h-3.5" />
                                                        KPI: {orden.kpi?.indicador ?? orden.kpi?.key}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        Asignado a: {orden.empleado.nombre} {orden.empleado.apellido}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Límite: {formatFecha(orden.fechaLimite)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progreso */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">
                                                    Progreso: {orden.tareasCompletadas}/{orden.cantidadTareas} tareas
                                                </span>
                                                <span className={`font-semibold ${progreso === 100 ? 'text-green-600' :
                                                        progreso >= 50 ? 'text-blue-600' : 'text-gray-700'
                                                    }`}>
                                                    {progreso}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${getProgresoColor(progreso, orden.status)}`}
                                                    style={{ width: `${progreso}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Alertas de tiempo */}
                                        {(vencida || urgente) && (
                                            <div className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${vencida ? 'text-red-600' : 'text-yellow-600'
                                                }`}>
                                                <AlertTriangle className="w-4 h-4" />
                                                {vencida
                                                    ? `Vencida hace ${Math.abs(diasRestantes)} día${Math.abs(diasRestantes) !== 1 ? 's' : ''}`
                                                    : `Vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`
                                                }
                                            </div>
                                        )}

                                        {/* Badge completada */}
                                        {completada && (
                                            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                Orden completada — todas las evidencias aprobadas
                                            </div>
                                        )}
                                    </div>

                                    {/* Botón ver */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/ordenes/${orden.id}`); }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                                        title="Ver detalle"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

    );
}
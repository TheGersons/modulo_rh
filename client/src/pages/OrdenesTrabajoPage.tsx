import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Plus,
    Filter,
    Eye,
    Calendar,
    Pause,
} from 'lucide-react';
import { ordenesTrabajoService, type OrdenTrabajo, } from '../services/ordenes-trabajo.service';
import { useAuth } from '../contexts/AuthContext';

export default function OrdenesTrabajoPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState<string>('todos');
    const [_mostrarModal, _setMostrarModal] = useState(false);

    useEffect(() => {
        cargarOrdenes();
    }, [filtroStatus]);

    const cargarOrdenes = async () => {
        try {
            setLoading(true);
            const filters: any = {};

            // Si es empleado, solo sus órdenes
            if (user?.role === 'empleado') {
                filters.empleadoId = user.id;
            }

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

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: any; label: string }> = {
            pendiente: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Pendiente' },
            en_proceso: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'En Proceso' },
            completada: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completada' },
            vencida: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Vencida' },
            en_pausa: { color: 'bg-yellow-100 text-yellow-700', icon: Pause, label: 'En Pausa' },
            cancelada: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Cancelada' },
            aprobada: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Aprobada' },
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

    const getDiasRestantes = (fechaLimite: string): number => {
        const dias = Math.ceil((new Date(fechaLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return dias;
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Stats
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
                    <p className="mt-4 text-gray-600">Cargando órdenes de trabajo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Órdenes de Trabajo</h1>
                    <p className="text-gray-600 mt-1">
                        Gestiona tus tareas y evidencias de KPIs
                    </p>
                </div>

                {(user?.role === 'jefe' || user?.role === 'admin') && (
                    <button
                        onClick={() => navigate('/ordenes/crear')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Orden
                    </button>
                )}
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
                            <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Activas</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.activas}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Completadas</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completadas}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Vencidas</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{stats.vencidas}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
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
                            { value: 'todos', label: 'Todas' },
                            { value: 'pendiente', label: 'Pendientes' },
                            { value: 'en_proceso', label: 'En Proceso' },
                            { value: 'vencida', label: 'Vencidas' },
                            { value: 'completada', label: 'Completadas' },
                        ].map((filtro) => (
                            <button
                                key={filtro.value}
                                onClick={() => setFiltroStatus(filtro.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroStatus === filtro.value
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

            {/* Lista de Órdenes */}
            {ordenes.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay órdenes de trabajo</h3>
                    <p className="text-gray-600">
                        {filtroStatus === 'todos'
                            ? 'Aún no tienes órdenes asignadas'
                            : `No hay órdenes en estado "${filtroStatus}"`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {ordenes.map((orden) => {
                        const diasRestantes = getDiasRestantes(orden.fechaLimite);
                        const vencida = diasRestantes < 0 && ['pendiente', 'en_proceso'].includes(orden.status);
                        const urgente = diasRestantes <= 3 && diasRestantes >= 0 && ['pendiente', 'en_proceso'].includes(orden.status);

                        return (
                            <div
                                key={orden.id}
                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/ordenes/${orden.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <Briefcase className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{orden.titulo}</h3>
                                                    {getStatusBadge(orden.status)}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{orden.descripcion}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        KPI: {orden.kpi.key}
                                                    </span>
                                                    {user?.role !== 'empleado' && (
                                                        <span>
                                                            Para: {orden.empleado.nombre} {orden.empleado.apellido}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progreso */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-gray-600">
                                                    Progreso: {orden.tareasCompletadas} / {orden.cantidadTareas} tareas
                                                </span>
                                                <span className="font-semibold text-gray-900">{Math.round(orden.progreso)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${orden.progreso === 100
                                                        ? 'bg-green-600'
                                                        : orden.progreso >= 50
                                                            ? 'bg-blue-600'
                                                            : 'bg-yellow-600'
                                                        }`}
                                                    style={{ width: `${orden.progreso}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Fecha límite */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Límite: {formatFecha(orden.fechaLimite)}</span>
                                            </div>

                                            {vencida && (
                                                <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Vencida hace {Math.abs(diasRestantes)} días
                                                </span>
                                            )}

                                            {urgente && (
                                                <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    ¡Vence en {diasRestantes} días!
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botón Ver */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/ordenes/${orden.id}`);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
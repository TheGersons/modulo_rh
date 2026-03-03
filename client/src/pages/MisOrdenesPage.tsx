import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    Search,
    Filter,
    Calendar,
    Target,
    PauseCircle,
    TrendingUp,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

interface Orden {
    id: string;
    titulo: string;
    descripcion: string;
    status: string;
    tipoOrden: string;
    progreso: number;
    tareasCompletadas: number;
    cantidadTareas: number;
    fechaInicio: string;
    fechaLimite: string;
    fechaCompletada?: string;
    kpi: {
        id: string;
        key: string;
        indicador: string;
        tipoCriticidad: string;
    };
    creador: {
        nombre: string;
        apellido: string;
    };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pendiente: { label: 'Pendiente', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
    en_proceso: { label: 'En Proceso', color: 'text-blue-700', bg: 'bg-blue-100', icon: TrendingUp },
    completada: { label: 'Completada', color: 'text-purple-700', bg: 'bg-purple-100', icon: CheckCircle },
    aprobada: { label: 'Aprobada', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
    rechazada: { label: 'Rechazada', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
    vencida: { label: 'Vencida', color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
    en_pausa: { label: 'En Pausa', color: 'text-gray-700', bg: 'bg-gray-100', icon: PauseCircle },
    cancelada: { label: 'Cancelada', color: 'text-gray-500', bg: 'bg-gray-100', icon: XCircle },
    pendiente_revision: { label: 'Pend. Revisión', color: 'text-orange-700', bg: 'bg-orange-100', icon: Clock },
};

export default function MisOrdenesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');

    useEffect(() => {
        if (user?.id) cargarOrdenes();
    }, [user]);

    const cargarOrdenes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const res = await fetch(
                `/api/ordenes-trabajo?empleadoId=${user!.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setOrdenes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const ordenesFiltradas = ordenes.filter((o) => {
        const matchSearch =
            o.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.kpi?.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.kpi?.indicador?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filtroStatus === 'todos' || o.status === filtroStatus;
        return matchSearch && matchStatus;
    });

    // Stats
    const stats = {
        activas: ordenes.filter((o) => ['pendiente', 'en_proceso'].includes(o.status)).length,
        completadas: ordenes.filter((o) => ['completada', 'aprobada'].includes(o.status)).length,
        vencidas: ordenes.filter((o) => o.status === 'vencida').length,
        revision: ordenes.filter((o) => o.status === 'completada').length,
    };

    const getDiasRestantes = (fechaLimite: string) => {
        const diff = new Date(fechaLimite).getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const getProgresoColor = (progreso: number) => {
        if (progreso >= 100) return 'bg-green-500';
        if (progreso >= 60) return 'bg-blue-500';
        if (progreso >= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                        <p className="mt-4 text-gray-600">Cargando tus órdenes...</p>
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
                    <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
                    <p className="text-gray-600 mt-1">
                        Hola, <span className="font-medium text-blue-600">{user?.nombre}</span> — aquí están tus órdenes de trabajo activas e historial
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Activas', value: stats.activas, color: 'text-blue-600', bg: 'bg-blue-50', icon: TrendingUp },
                        { label: 'En Revisión', value: stats.revision, color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
                        { label: 'Completadas', value: stats.completadas, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
                        { label: 'Vencidas', value: stats.vencidas, color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{s.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${s.bg}`}>
                                        <Icon className={`w-5 h-5 ${s.color}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Búsqueda */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por título o KPI..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Filtro status */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="w-4 h-4 text-gray-400" />
                            {[
                                { value: 'todos', label: 'Todas' },
                                { value: 'pendiente', label: 'Pendientes' },
                                { value: 'en_proceso', label: 'En Proceso' },
                                { value: 'completada', label: 'En Revisión' },
                                { value: 'aprobada', label: 'Aprobadas' },
                                { value: 'rechazada', label: 'Rechazadas' },
                                { value: 'vencida', label: 'Vencidas' },
                            ].map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setFiltroStatus(f.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtroStatus === f.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lista */}
                {ordenesFiltradas.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {ordenes.length === 0 ? 'No tienes órdenes asignadas' : 'Sin resultados'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {ordenes.length === 0
                                ? 'Cuando te asignen una orden de trabajo aparecerá aquí'
                                : 'Intenta ajustar los filtros de búsqueda'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ordenesFiltradas.map((orden) => {
                            const statusCfg = STATUS_CONFIG[orden.status] ?? STATUS_CONFIG['pendiente'];
                            const StatusIcon = statusCfg.icon;
                            const diasRestantes = getDiasRestantes(orden.fechaLimite);
                            const esCritico = orden.kpi?.tipoCriticidad === 'critico';
                            const venceProximo = diasRestantes <= 3 && diasRestantes > 0 && !['aprobada', 'completada'].includes(orden.status);
                            const vencida = diasRestantes < 0 && !['aprobada', 'completada', 'cancelada'].includes(orden.status);

                            return (
                                <div
                                    key={orden.id}
                                    onClick={() => navigate(`/mis-ordenes/${orden.id}`)}
                                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start gap-4">

                                        {/* Icono KPI */}
                                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${esCritico ? 'bg-red-50' : 'bg-blue-50'}`}>
                                            <Target className={`w-5 h-5 ${esCritico ? 'text-red-600' : 'text-blue-600'}`} />
                                        </div>

                                        {/* Contenido */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">{orden.titulo}</h3>
                                                        {esCritico && (
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium flex-shrink-0">
                                                                Crítico
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        {orden.kpi?.key} — {orden.kpi?.indicador}
                                                    </p>
                                                </div>

                                                {/* Status badge */}
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ${statusCfg.bg} ${statusCfg.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusCfg.label}
                                                </span>
                                            </div>

                                            {/* Descripción */}
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-1">{orden.descripcion}</p>

                                            {/* Barra de progreso */}
                                            <div className="mb-3">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>{orden.tareasCompletadas} de {orden.cantidadTareas} tareas</span>
                                                    <span className="font-medium">{Math.round(orden.progreso)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${getProgresoColor(orden.progreso)}`}
                                                        style={{ width: `${Math.min(orden.progreso, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Footer info */}
                                            <div className="flex items-center justify-between text-xs text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>
                                                        Vence: {new Date(orden.fechaLimite).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    {vencida && (
                                                        <span className="ml-1 text-red-600 font-medium">— Vencida</span>
                                                    )}
                                                    {venceProximo && (
                                                        <span className="ml-1 text-orange-600 font-medium">— {diasRestantes}d restantes</span>
                                                    )}
                                                </div>
                                                <span>Asignada por: {orden.creador?.nombre} {orden.creador?.apellido}</span>
                                            </div>
                                        </div>

                                        {/* Flecha */}
                                        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 self-center" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}
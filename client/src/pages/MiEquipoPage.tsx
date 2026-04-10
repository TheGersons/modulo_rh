import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Target, AlertTriangle, CheckCircle, Clock, ChevronDown,
    ChevronUp, Building, Briefcase, TrendingUp, XCircle, Eye,
    AlertCircle, RefreshCw, Filter, FileCheck, ExternalLink,
    X, BarChart2, ClipboardList, Activity,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import apiClient from '../services/api.service';

// ─── Tipos base ───────────────────────────────────────────────────────────────

interface OrdenActiva {
    id: string; titulo: string; status: string;
    fechaLimite: string; progreso: number;
    kpi: { indicador: string; key: string };
}

interface Alerta {
    id: string; tipo: string; nivel: string;
    titulo: string; fechaDeteccion: string;
}

interface EvidenciaPendiente {
    id: string; empleadoId: string; archivoUrl: string;
    nombre: string; fechaSubida: string; esFueraDeTiempo: boolean;
    kpi: { id: string; indicador: string; key: string };
}

interface EmpleadoEquipo {
    id: string; nombre: string; apellido: string; role: string;
    area: { id: string; nombre: string } | null;
    puesto: { id: string; nombre: string } | null;
    kpis: {
        total: number; aprobados: number; enRevision: number;
        rechazados: number; pendientes: number; porcentajeCumplimiento: number;
    };
    ordenes: { activas: number; vencidas: number; detalle: OrdenActiva[] };
    alertas: Alerta[];
    evidenciasPendientes: EvidenciaPendiente[];
    tieneProblemas: boolean;
    tieneEvidenciasParaRevisar: boolean;
}

interface AreaInfo {
    id: string; nombre: string; areaPadreId: string | null;
    _count: { empleados: number };
}

interface MiEquipoData {
    areas: AreaInfo[];
    empleados: EmpleadoEquipo[];
    resumen: {
        total: number; conKpisRojos: number; conOrdenesVencidas: number;
        conAlertas: number; conEvidenciasPendientes: number;
    };
    periodo: string;
}

// ─── Tipos del modal ──────────────────────────────────────────────────────────

interface KpiDetalle {
    id: string; key: string; indicador: string; descripcion?: string;
    tipoCalculo: string; meta?: number; operadorMeta?: string; unidad?: string;
    tipoCriticidad: string; periodicidad: string; sentido: string;
    estado: 'aprobado' | 'rechazado' | 'pendiente_revision' | 'pendiente';
    valorObtenido: number | null; esFueraDeTiempo: boolean;
    fechaUltimaEvidencia: string | null; motivoRechazo: string | null;
    intentos: number; archivoUrl: string | null; nombreArchivo: string | null;
}

interface EmpleadoKpisData {
    empleado: { id: string; nombre: string; apellido: string };
    periodo: string;
    kpis: KpiDetalle[];
    resumen: {
        total: number; aprobados: number; rechazados: number;
        enRevision: number; pendientes: number; fueraDeTiempo: number;
        porcentajeCumplimiento: number;
    };
}

interface OrdenDetalle {
    id: string; titulo: string; descripcion: string; status: string;
    fechaInicio: string; fechaLimite: string; fechaCompletada?: string;
    progreso: number; cantidadTareas: number; tareasCompletadas: number;
    tipoOrden: string; diasRestantes: number; vencida: boolean; urgente: boolean;
    evidenciasPendientes: number; evidenciasRechazadas: number;
    kpi: { indicador: string; key: string };
    creador: { nombre: string; apellido: string };
    tareas: any[];
}

interface EmpleadoOrdenesData {
    empleado: { id: string; nombre: string; apellido: string };
    ordenes: OrdenDetalle[];
    resumen: {
        total: number; activas: number; completadas: number;
        vencidas: number; tasaCumplimiento: number;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NIVEL_ALERTA: Record<string, { bg: string; text: string; dot: string }> = {
    ALTO: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    MEDIO: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    BAJO: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
};

const KPI_ESTADO: Record<string, { bg: string; text: string; label: string; border: string }> = {
    aprobado: { bg: 'bg-green-50', text: 'text-green-700', label: 'Aprobado', border: 'border-green-200' },
    rechazado: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rechazado', border: 'border-red-200' },
    pendiente_revision: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'En revisión', border: 'border-orange-200' },
    pendiente: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Pendiente', border: 'border-gray-200' },
};

function getPeriodoActual() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function estaVencida(fechaLimite: string) {
    return new Date(fechaLimite) < new Date();
}

// ─── Modal de perfil ──────────────────────────────────────────────────────────

function ModalPerfil({ empleado, periodo, onClose, navigate }: {
    empleado: EmpleadoEquipo;
    periodo: string;
    onClose: () => void;
    navigate: (path: string) => void;
}) {
    const [tab, setTab] = useState<'resumen' | 'kpis' | 'ordenes'>('resumen');
    const [kpisData, setKpisData] = useState<EmpleadoKpisData | null>(null);
    const [ordenesData, setOrdenesData] = useState<EmpleadoOrdenesData | null>(null);
    const [loadingKpis, setLoadingKpis] = useState(false);
    const [loadingOrdenes, setLoadingOrdenes] = useState(false);

    useEffect(() => {
        if (tab === 'kpis' && !kpisData) cargarKpis();
        if (tab === 'ordenes' && !ordenesData) cargarOrdenes();
    }, [tab]);

    const cargarKpis = async () => {
        try {
            setLoadingKpis(true);
            const res = await apiClient.get(`/mi-equipo/empleado/${empleado.id}/kpis?periodo=${periodo}`);
            setKpisData(res.data);
        } catch (e) { console.error(e); }
        finally { setLoadingKpis(false); }
    };

    const cargarOrdenes = async () => {
        try {
            setLoadingOrdenes(true);
            const res = await apiClient.get(`/mi-equipo/empleado/${empleado.id}/ordenes`);
            setOrdenesData(res.data);
        } catch (e) { console.error(e); }
        finally { setLoadingOrdenes(false); }
    };

    const pct = empleado.kpis.porcentajeCumplimiento;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${empleado.kpis.rechazados > 0 || empleado.ordenes.vencidas > 0 ? 'bg-red-500' :
                            empleado.alertas.length > 0 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}>
                            {empleado.nombre[0]}{empleado.apellido[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{empleado.nombre} {empleado.apellido}</h2>
                            <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                                {empleado.puesto && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{empleado.puesto.nombre}</span>}
                                {empleado.area && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{empleado.area.nombre}</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                    {[
                        { key: 'resumen', label: 'Resumen', icon: Activity },
                        { key: 'kpis', label: 'KPIs', icon: Target },
                        { key: 'ordenes', label: 'Órdenes', icon: ClipboardList },
                    ].map((t) => {
                        const Icon = t.icon;
                        return (
                            <button key={t.key} onClick={() => setTab(t.key as any)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}>
                                <Icon className="w-4 h-4" />{t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* ── RESUMEN ── */}
                    {tab === 'resumen' && (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Cumplimiento KPIs', value: `${pct}%`, color: pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600', bg: pct >= 80 ? 'bg-green-50' : pct >= 50 ? 'bg-yellow-50' : 'bg-red-50' },
                                    { label: 'KPIs Aprobados', value: `${empleado.kpis.aprobados}/${empleado.kpis.total}`, color: 'text-green-600', bg: 'bg-green-50' },
                                    { label: 'Órdenes Activas', value: empleado.ordenes.activas, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Órdenes Vencidas', value: empleado.ordenes.vencidas, color: empleado.ordenes.vencidas > 0 ? 'text-red-600' : 'text-gray-600', bg: empleado.ordenes.vencidas > 0 ? 'bg-red-50' : 'bg-gray-50' },
                                ].map((m) => (
                                    <div key={m.label} className={`${m.bg} rounded-xl p-4 text-center`}>
                                        <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{m.label}</p>
                                    </div>
                                ))}
                            </div>

                            {empleado.kpis.total > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Distribución de KPIs</p>
                                    <div className="flex rounded-full overflow-hidden h-3 bg-gray-200 mb-2">
                                        {empleado.kpis.aprobados > 0 && <div className="bg-green-500 h-3" style={{ width: `${(empleado.kpis.aprobados / empleado.kpis.total) * 100}%` }} />}
                                        {empleado.kpis.enRevision > 0 && <div className="bg-orange-400 h-3" style={{ width: `${(empleado.kpis.enRevision / empleado.kpis.total) * 100}%` }} />}
                                        {empleado.kpis.rechazados > 0 && <div className="bg-red-500 h-3" style={{ width: `${(empleado.kpis.rechazados / empleado.kpis.total) * 100}%` }} />}
                                        {empleado.kpis.pendientes > 0 && <div className="bg-gray-300 h-3" style={{ width: `${(empleado.kpis.pendientes / empleado.kpis.total) * 100}%` }} />}
                                    </div>
                                    <div className="flex gap-4 flex-wrap text-xs text-gray-500">
                                        {[
                                            { color: 'bg-green-500', label: 'Aprobados', val: empleado.kpis.aprobados },
                                            { color: 'bg-orange-400', label: 'En revisión', val: empleado.kpis.enRevision },
                                            { color: 'bg-red-500', label: 'Rechazados', val: empleado.kpis.rechazados },
                                            { color: 'bg-gray-300', label: 'Pendientes', val: empleado.kpis.pendientes },
                                        ].map((l) => (
                                            <span key={l.label} className="flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full inline-block ${l.color}`} />
                                                {l.label}: {l.val}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {empleado.ordenes.detalle.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Órdenes activas</p>
                                    <div className="space-y-2">
                                        {empleado.ordenes.detalle.map((orden) => {
                                            const vencida = estaVencida(orden.fechaLimite);
                                            const dias = Math.ceil((new Date(orden.fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                            return (
                                                <div key={orden.id} className={`flex items-center justify-between p-3 rounded-lg border ${vencida ? 'bg-red-50 border-red-200' : dias <= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-gray-800 truncate">{orden.titulo}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{orden.kpi?.indicador ?? 'Orden personalizada'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                                        <div className="text-right">
                                                            <p className={`text-xs font-medium ${vencida ? 'text-red-600' : dias <= 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                                                                {vencida ? `Venció hace ${Math.abs(dias)}d` : `${dias}d restantes`}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{Math.round(orden.progreso ?? 0)}% avance</p>
                                                        </div>
                                                        <button onClick={() => { onClose(); navigate(`/ordenes/${orden.id}`); }} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {empleado.alertas.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Alertas activas</p>
                                    <div className="space-y-2">
                                        {empleado.alertas.map((alerta) => {
                                            const cfg = NIVEL_ALERTA[alerta.nivel] ?? NIVEL_ALERTA.BAJO;
                                            return (
                                                <div key={alerta.id} className={`flex items-start gap-2 p-3 rounded-lg ${cfg.bg}`}>
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-medium ${cfg.text}`}>{alerta.titulo}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{formatFecha(alerta.fechaDeteccion)}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${cfg.bg} ${cfg.text}`}>{alerta.nivel}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {!empleado.tieneProblemas && !empleado.tieneEvidenciasParaRevisar && (
                                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-100">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <p className="text-sm text-green-700 font-medium">Sin problemas reportados este período</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── KPIs ── */}
                    {tab === 'kpis' && (
                        <>
                            {loadingKpis ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                                </div>
                            ) : kpisData ? (
                                <>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                        {[
                                            { label: 'Total', value: kpisData.resumen.total, color: 'text-gray-700', bg: 'bg-gray-50' },
                                            { label: 'Aprobados', value: kpisData.resumen.aprobados, color: 'text-green-700', bg: 'bg-green-50' },
                                            { label: 'En revisión', value: kpisData.resumen.enRevision, color: 'text-orange-700', bg: 'bg-orange-50' },
                                            { label: 'Rechazados', value: kpisData.resumen.rechazados, color: 'text-red-700', bg: 'bg-red-50' },
                                            { label: 'Pendientes', value: kpisData.resumen.pendientes, color: 'text-blue-700', bg: 'bg-blue-50' },
                                            { label: 'F. de tiempo', value: kpisData.resumen.fueraDeTiempo, color: 'text-red-700', bg: 'bg-red-50' },
                                        ].map((s) => (
                                            <div key={s.label} className={`${s.bg} rounded-lg p-3 text-center`}>
                                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        {kpisData.kpis.map((kpi) => {
                                            const cfg = KPI_ESTADO[kpi.estado];
                                            return (
                                                <div key={kpi.id} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <p className="text-sm font-semibold text-gray-900">{kpi.indicador}</p>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white border ${cfg.border} ${cfg.text}`}>{cfg.label}</span>
                                                                {kpi.tipoCriticidad === 'critico' && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Crítico</span>}
                                                                {kpi.esFueraDeTiempo && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Fuera de tiempo</span>}
                                                            </div>
                                                            {kpi.descripcion && <p className="text-xs text-gray-500 mb-2">{kpi.descripcion}</p>}
                                                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                                                {kpi.meta !== undefined && kpi.meta !== null && (
                                                                    <span>Meta: <span className="font-medium text-gray-700">{kpi.operadorMeta} {kpi.meta} {kpi.unidad}</span></span>
                                                                )}
                                                                {kpi.valorObtenido !== null && (
                                                                    <span>Obtenido: <span className="font-medium text-gray-700">{kpi.valorObtenido} {kpi.unidad}</span></span>
                                                                )}
                                                                {kpi.intentos > 0 && <span>Intentos: <span className="font-medium text-gray-700">{kpi.intentos}</span></span>}
                                                                {kpi.fechaUltimaEvidencia && <span>Última evidencia: <span className="font-medium text-gray-700">{formatFecha(kpi.fechaUltimaEvidencia)}</span></span>}
                                                                <span className="text-xs text-gray-400 capitalize">{kpi.periodicidad}</span>
                                                            </div>
                                                            {kpi.motivoRechazo && (
                                                                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                                                                    <span className="font-medium">Motivo de rechazo: </span>{kpi.motivoRechazo}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {kpi.archivoUrl && (
                                                            <a href={kpi.archivoUrl} target="_blank" rel="noopener noreferrer"
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors flex-shrink-0" title="Ver evidencia">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {kpisData.kpis.length === 0 && (
                                            <div className="text-center py-10 text-gray-400">
                                                <Target className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No hay KPIs asignados para este puesto</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-gray-400"><p className="text-sm">Error al cargar KPIs</p></div>
                            )}
                        </>
                    )}

                    {/* ── ÓRDENES ── */}
                    {tab === 'ordenes' && (
                        <>
                            {loadingOrdenes ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                                </div>
                            ) : ordenesData ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {[
                                            { label: 'Total', value: ordenesData.resumen.total, color: 'text-gray-700', bg: 'bg-gray-50' },
                                            { label: 'Activas', value: ordenesData.resumen.activas, color: 'text-blue-700', bg: 'bg-blue-50' },
                                            { label: 'Completadas', value: ordenesData.resumen.completadas, color: 'text-green-700', bg: 'bg-green-50' },
                                            { label: 'Vencidas', value: ordenesData.resumen.vencidas, color: 'text-red-700', bg: 'bg-red-50' },
                                            { label: 'A tiempo', value: `${ordenesData.resumen.tasaCumplimiento}%`, color: ordenesData.resumen.tasaCumplimiento >= 80 ? 'text-green-700' : 'text-orange-700', bg: ordenesData.resumen.tasaCumplimiento >= 80 ? 'bg-green-50' : 'bg-orange-50' },
                                        ].map((s) => (
                                            <div key={s.label} className={`${s.bg} rounded-lg p-3 text-center`}>
                                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        {ordenesData.ordenes.map((orden) => {
                                            const completada = ['completada', 'aprobada'].includes(orden.status);
                                            const progreso = Math.round(orden.progreso ?? 0);
                                            return (
                                                <div key={orden.id} className={`rounded-xl border p-4 ${orden.vencida ? 'border-red-200 bg-red-50' :
                                                    orden.urgente ? 'border-yellow-200 bg-yellow-50' :
                                                        completada ? 'border-green-200 bg-green-50' :
                                                            'border-gray-200 bg-gray-50'
                                                    }`}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <p className="text-sm font-semibold text-gray-900">{orden.titulo}</p>
                                                                {orden.vencida && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Vencida</span>}
                                                                {orden.urgente && !orden.vencida && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Urgente</span>}
                                                                {completada && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Completada</span>}
                                                                {orden.evidenciasPendientes > 0 && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">{orden.evidenciasPendientes} ev. pendiente{orden.evidenciasPendientes > 1 ? 's' : ''}</span>}
                                                                {orden.evidenciasRechazadas > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">{orden.evidenciasRechazadas} rechazada{orden.evidenciasRechazadas > 1 ? 's' : ''}</span>}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap mb-3">
                                                                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{orden.kpi?.indicador ?? 'Orden personalizada'}</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                                                                    {completada
                                                                        ? `Completada: ${formatFecha(orden.fechaCompletada!)}`
                                                                        : orden.vencida
                                                                            ? `Venció: ${formatFecha(orden.fechaLimite)} (hace ${Math.abs(orden.diasRestantes)}d)`
                                                                            : `Límite: ${formatFecha(orden.fechaLimite)} (${orden.diasRestantes}d)`
                                                                    }
                                                                </span>
                                                                <span>Por: {orden.creador.nombre} {orden.creador.apellido}</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between text-xs text-gray-500">
                                                                    <span>{orden.tareasCompletadas}/{orden.cantidadTareas} tareas</span>
                                                                    <span className="font-medium">{progreso}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                    <div className={`h-1.5 rounded-full transition-all ${completada ? 'bg-green-500' : progreso >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                                                        style={{ width: `${progreso}%` }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => { onClose(); navigate(`/ordenes/${orden.id}`); }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors flex-shrink-0">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {ordenesData.ordenes.length === 0 && (
                                            <div className="text-center py-10 text-gray-400">
                                                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No hay órdenes de trabajo asignadas</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-gray-400"><p className="text-sm">Error al cargar órdenes</p></div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MiEquipoPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<MiEquipoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandidos, setExpandidos] = useState<string[]>([]);
    const [filtroArea, setFiltroArea] = useState('todas');
    const [filtroProblemas, setFiltroProblemas] = useState(false);
    const [filtroPendientes, setFiltroPendientes] = useState(false);
    const [periodo, setPeriodo] = useState(getPeriodoActual());
    const [empleadoModal, setEmpleadoModal] = useState<EmpleadoEquipo | null>(null);

    useEffect(() => { cargarEquipo(); }, [periodo]);

    const cargarEquipo = async () => {
        try {
            setLoading(true); setError('');
            const res = await apiClient.get(`/mi-equipo?periodo=${periodo}`);
            setData(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar el equipo');
        } finally { setLoading(false); }
    };

    const toggleExpandido = (id: string) =>
        setExpandidos((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando tu equipo...</p>
                </div>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div><p className="font-semibold text-red-900">Error</p><p className="text-sm text-red-700">{error}</p></div>
                </div>
            </div>
        </Layout>
    );

    if (!data || data.empleados.length === 0) return (
        <Layout>
            <div className="p-8">
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin equipo asignado</h3>
                    <p className="text-gray-500 text-sm">No tienes áreas bajo tu jefatura en este momento.</p>
                </div>
            </div>
        </Layout>
    );

    const { resumen, areas, empleados } = data;
    const areasPadre = areas.filter((a) => !a.areaPadreId);

    const empleadosFiltrados = empleados.filter((emp) => {
        const matchArea = filtroArea === 'todas' || emp.area?.id === filtroArea;
        const matchProblemas = !filtroProblemas || emp.tieneProblemas;
        const matchPendientes = !filtroPendientes || emp.tieneEvidenciasParaRevisar;
        return matchArea && matchProblemas && matchPendientes;
    });

    return (
        <Layout>
            <div className="p-8 space-y-6 max-w-6xl mx-auto">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mi Equipo</h1>
                        <p className="text-gray-500 mt-1 text-sm">Seguimiento del período <span className="font-medium text-gray-700">{periodo}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        <button onClick={cargarEquipo} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Recargar">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Total empleados', value: resumen.total, color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
                        { label: 'Con KPIs rojos', value: resumen.conKpisRojos, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
                        { label: 'Órdenes vencidas', value: resumen.conOrdenesVencidas, color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
                        { label: 'Con alertas', value: resumen.conAlertas, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle },
                        { label: 'Evidencias por revisar', value: resumen.conEvidenciasPendientes, color: 'text-purple-600', bg: 'bg-purple-50', icon: FileCheck },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div><p className="text-xs text-gray-500">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></div>
                                    <div className={`p-3 rounded-lg ${s.bg}`}><Icon className={`w-5 h-5 ${s.color}`} /></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="todas">Todas las áreas</option>
                        {areas.map((a) => <option key={a.id} value={a.id}>{a.areaPadreId ? `  └ ${a.nombre}` : a.nombre}</option>)}
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                        <input type="checkbox" checked={filtroProblemas} onChange={(e) => setFiltroProblemas(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600" />
                        Solo con problemas
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                        <input type="checkbox" checked={filtroPendientes} onChange={(e) => setFiltroPendientes(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                        Evidencias por revisar
                    </label>
                    <span className="text-xs text-gray-400 ml-auto">{empleadosFiltrados.length} de {empleados.length} empleados</span>
                </div>

                {areasPadre.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                        {areasPadre.map((area) => {
                            const subAreas = areas.filter((a) => a.areaPadreId === area.id);
                            return (
                                <div key={area.id} className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{area.nombre}</p>
                                        {subAreas.length > 0 && <p className="text-xs text-gray-400">{subAreas.length} sub-área{subAreas.length > 1 ? 's' : ''}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {empleadosFiltrados.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No hay empleados con los filtros seleccionados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {empleadosFiltrados.map((emp) => {
                            const expandido = expandidos.includes(emp.id);
                            const tieneAlertas = emp.alertas.length > 0;
                            const tieneOrdenesVencidas = emp.ordenes.vencidas > 0;
                            const tieneKpisRojos = emp.kpis.rechazados > 0;
                            const tieneEvidencias = emp.tieneEvidenciasParaRevisar;
                            const pct = emp.kpis.porcentajeCumplimiento;

                            const borderColor =
                                tieneKpisRojos || tieneOrdenesVencidas ? 'border-red-200' :
                                    tieneAlertas ? 'border-yellow-200' :
                                        tieneEvidencias ? 'border-purple-200' : 'border-gray-200';

                            return (
                                <div key={emp.id} className={`bg-white rounded-xl shadow-sm border ${borderColor} transition-all`}>
                                    <div className="flex items-center gap-4 p-5">
                                        <button onClick={() => setEmpleadoModal(emp)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 hover:opacity-80 transition-opacity ${tieneKpisRojos || tieneOrdenesVencidas ? 'bg-red-500' :
                                                tieneAlertas ? 'bg-yellow-500' :
                                                    tieneEvidencias ? 'bg-purple-500' : 'bg-blue-500'
                                                }`} title="Ver perfil detallado">
                                            {emp.nombre[0]}{emp.apellido[0]}
                                        </button>

                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpandido(emp.id)}>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-gray-900">{emp.nombre} {emp.apellido}</p>
                                                {tieneKpisRojos && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" />{emp.kpis.rechazados} rechazado{emp.kpis.rechazados > 1 ? 's' : ''}</span>}
                                                {tieneOrdenesVencidas && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" />{emp.ordenes.vencidas} vencida{emp.ordenes.vencidas > 1 ? 's' : ''}</span>}
                                                {tieneAlertas && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{emp.alertas.length} alerta{emp.alertas.length > 1 ? 's' : ''}</span>}
                                                {tieneEvidencias && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1"><FileCheck className="w-3 h-3" />{emp.evidenciasPendientes.length} por revisar</span>}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                {emp.puesto && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{emp.puesto.nombre}</span>}
                                                {emp.area && <span className="flex items-center gap-1"><Building className="w-3 h-3" />{emp.area.nombre}</span>}
                                            </div>
                                        </div>

                                        <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0">
                                            <div className="flex items-center gap-2">
                                                <Target className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-700">{pct}%</span>
                                            </div>
                                            <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-400">{emp.kpis.aprobados}/{emp.kpis.total} KPIs</span>
                                        </div>

                                        <button onClick={() => setEmpleadoModal(emp)}
                                            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0">
                                            <BarChart2 className="w-3.5 h-3.5" />Ver perfil
                                        </button>

                                        <button onClick={() => toggleExpandido(emp.id)} className="flex-shrink-0">
                                            {expandido ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </button>
                                    </div>

                                    {expandido && (
                                        <div className="border-t border-gray-100 p-5 space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                {[
                                                    { label: 'Total', value: emp.kpis.total, color: 'text-gray-700', bg: 'bg-gray-50' },
                                                    { label: 'Aprobados', value: emp.kpis.aprobados, color: 'text-green-700', bg: 'bg-green-50' },
                                                    { label: 'En revisión', value: emp.kpis.enRevision, color: 'text-orange-700', bg: 'bg-orange-50' },
                                                    { label: 'Rechazados', value: emp.kpis.rechazados, color: 'text-red-700', bg: 'bg-red-50' },
                                                    { label: 'Pendientes', value: emp.kpis.pendientes, color: 'text-blue-700', bg: 'bg-blue-50' },
                                                ].map((stat) => (
                                                    <div key={stat.label} className={`${stat.bg} rounded-lg p-3 text-center`}>
                                                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {emp.evidenciasPendientes.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                        <FileCheck className="w-3.5 h-3.5" />Evidencias por revisar ({emp.evidenciasPendientes.length})
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {emp.evidenciasPendientes.map((ev) => (
                                                            <div key={ev.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${ev.esFueraDeTiempo ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-gray-800 truncate">{ev.kpi?.indicador}</p>
                                                                    <p className="text-xs text-gray-500">{ev.esFueraDeTiempo ? '⚠ Fuera de tiempo · ' : ''}{formatFecha(ev.fechaSubida)}</p>
                                                                </div>
                                                                <a href={ev.archivoUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-purple-600 rounded ml-2">
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <button onClick={() => setEmpleadoModal(emp)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                                                <BarChart2 className="w-4 h-4" />
                                                Ver perfil completo con KPIs y órdenes detalladas
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {empleadoModal && (
                <ModalPerfil
                    empleado={empleadoModal}
                    periodo={periodo}
                    onClose={() => setEmpleadoModal(null)}
                    navigate={navigate}
                />
            )}
        </Layout>
    );
}
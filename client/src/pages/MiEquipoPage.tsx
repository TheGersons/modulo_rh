import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Target, AlertTriangle, Clock, ChevronDown,
    ChevronUp, Building, Briefcase, XCircle,
    AlertCircle, RefreshCw, Filter, FileCheck, ExternalLink,
    BarChart2,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import apiClient from '../services/api.service';
import ModalPerfilEmpleado, {
    formatFecha,
    getPeriodoActual,
} from '../components/ModalPerfilEmpleado';
import type { EmpleadoEquipo } from '../components/ModalPerfilEmpleado';

// ─── Tipos base ───────────────────────────────────────────────────────────────

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
                <ModalPerfilEmpleado
                    empleado={empleadoModal}
                    periodo={periodo}
                    onClose={() => setEmpleadoModal(null)}
                    navigate={navigate}
                />
            )}
        </Layout>
    );
}

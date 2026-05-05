import { useState, useEffect } from 'react';
import {
    ShieldCheck, FileText, Image as ImageIcon, ExternalLink, Filter, RefreshCw,
    Target, ClipboardList, ChevronLeft, ChevronRight, AlertTriangle,
    CheckCircle, Clock, XCircle, User, Building, Briefcase, Search,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { auditoriaService } from '../services/auditoria.service';
import { areasService } from '../services/areas.service';

type Tab = 'kpis' | 'ordenes';

interface AreaItem {
    id: string;
    nombre: string;
    areaPadreId: string | null;
}

interface EvidenciaKpi {
    id: string;
    archivoUrl: string;
    nombre: string;
    tipo: string;
    tamanio?: number;
    fechaSubida: string;
    status: 'aprobada' | 'pendiente_revision' | 'rechazada';
    esFueraDeTiempo: boolean;
    esRespaldoGracia?: boolean;
    periodo: string;
    intento: number;
    motivoRechazo?: string;
    valorNumerico?: number;
    kpi: { key: string; indicador: string; area: string; tipoCriticidad: string };
    empleado: {
        id: string;
        nombre: string;
        apellido: string;
        area: { id: string; nombre: string } | null;
        puesto: { id: string; nombre: string } | null;
    };
}

interface EvidenciaOrden {
    id: string;
    archivoUrl: string;
    nombre: string;
    tipo: string;
    tamanio?: number;
    fechaSubida: string;
    status: string;
    esFueraDeTiempo: boolean;
    intento: number;
    motivoRechazo?: string;
    tarea: {
        descripcion: string;
        orden: number;
        ordenTrabajo: {
            id: string;
            titulo: string;
            fechaLimite: string;
            empleado: {
                id: string;
                nombre: string;
                apellido: string;
                area: { id: string; nombre: string } | null;
                puesto: { id: string; nombre: string } | null;
            };
            kpi: { key: string; indicador: string } | null;
        };
    };
}

interface ResumenData {
    kpi: { total: number; aprobadas: number; pendientes: number; rechazadas: number; fueraTiempo: number };
    orden: { total: number; aprobadas: number; pendientes: number; rechazadas: number; fueraTiempo: number };
    total: number;
}

interface PageData<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const STATUS_CFG: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    aprobada: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Aprobada', icon: CheckCircle },
    pendiente_revision: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Pendiente', icon: Clock },
    rechazada: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Rechazada', icon: XCircle },
};

const formatFecha = (s: string) =>
    new Date(s).toLocaleDateString('es-HN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

const formatTamanio = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getPeriodoActual = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const iconoArchivo = (tipo: string) => (tipo?.startsWith('image/') ? ImageIcon : FileText);

export default function AuditoriaPage() {
    const [tab, setTab] = useState<Tab>('kpis');
    const [areas, setAreas] = useState<AreaItem[]>([]);
    const [resumen, setResumen] = useState<ResumenData | null>(null);

    // filtros
    const [filtroPeriodo, setFiltroPeriodo] = useState<string>(getPeriodoActual());
    const [filtroArea, setFiltroArea] = useState<string>('');
    const [filtroStatus, setFiltroStatus] = useState<string>('');
    const [filtroFueraTiempo, setFiltroFueraTiempo] = useState<boolean>(false);
    const [busquedaTexto, setBusquedaTexto] = useState<string>('');

    // datos por tab
    const [kpiData, setKpiData] = useState<PageData<EvidenciaKpi> | null>(null);
    const [ordenData, setOrdenData] = useState<PageData<EvidenciaOrden> | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => { cargarAreas(); }, []);
    useEffect(() => { cargar(); }, [tab, page, filtroPeriodo, filtroArea, filtroStatus, filtroFueraTiempo]);
    useEffect(() => { setPage(1); }, [tab, filtroPeriodo, filtroArea, filtroStatus, filtroFueraTiempo]);

    const cargarAreas = async () => {
        try {
            const data = await areasService.getAll();
            setAreas(Array.isArray(data) ? data : data?.items ?? []);
        } catch (e) { console.error(e); }
    };

    const cargar = async () => {
        setLoading(true);
        try {
            const filtros = {
                periodo: filtroPeriodo || undefined,
                areaId: filtroArea || undefined,
                status: filtroStatus || undefined,
                fueraDeTiempo: filtroFueraTiempo ? true : undefined,
                page,
                pageSize: 20,
            };
            const [resPage, res] = await Promise.all([
                tab === 'kpis'
                    ? auditoriaService.getEvidenciasKpi(filtros)
                    : auditoriaService.getEvidenciasOrden(filtros),
                auditoriaService.getResumen({
                    periodo: filtros.periodo,
                    areaId: filtros.areaId,
                }),
            ]);
            if (tab === 'kpis') setKpiData(resPage);
            else setOrdenData(resPage);
            setResumen(res);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const limpiarFiltros = () => {
        setFiltroPeriodo(getPeriodoActual());
        setFiltroArea('');
        setFiltroStatus('');
        setFiltroFueraTiempo(false);
        setBusquedaTexto('');
    };

    const filtrarTexto = <T extends { nombre: string }>(items: T[], extraText: (it: T) => string): T[] => {
        if (!busquedaTexto.trim()) return items;
        const q = busquedaTexto.toLowerCase();
        return items.filter((it) => it.nombre.toLowerCase().includes(q) || extraText(it).toLowerCase().includes(q));
    };

    const itemsKpi = kpiData ? filtrarTexto(
        kpiData.items,
        (it) => `${it.kpi.indicador} ${it.empleado.nombre} ${it.empleado.apellido} ${it.empleado.puesto?.nombre ?? ''}`,
    ) : [];

    const itemsOrden = ordenData ? filtrarTexto(
        ordenData.items,
        (it) => {
            const ot = it.tarea.ordenTrabajo;
            return `${ot.titulo} ${ot.empleado.nombre} ${ot.empleado.apellido} ${ot.kpi?.indicador ?? ''}`;
        },
    ) : [];

    return (
        <Layout>
            <div className="p-8 space-y-6 max-w-7xl mx-auto">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                            Auditoría
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Vista global de todas las evidencias subidas a la plataforma — solo lectura
                        </p>
                    </div>
                    <button onClick={cargar} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Recargar">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Resumen */}
                {resumen && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Total archivos', value: resumen.total, color: 'text-gray-700', bg: 'bg-gray-50', icon: FileText },
                            { label: 'KPIs aprobadas', value: resumen.kpi.aprobadas, color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle },
                            { label: 'KPIs pendientes', value: resumen.kpi.pendientes, color: 'text-orange-700', bg: 'bg-orange-50', icon: Clock },
                            { label: 'KPIs rechazadas', value: resumen.kpi.rechazadas, color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
                            { label: 'Órdenes total', value: resumen.orden.total, color: 'text-blue-700', bg: 'bg-blue-50', icon: ClipboardList },
                            { label: 'Fuera de tiempo', value: resumen.kpi.fueraTiempo + resumen.orden.fueraTiempo, color: 'text-red-700', bg: 'bg-red-50', icon: AlertTriangle },
                        ].map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Icon className={`w-4 h-4 ${s.color}`} />
                                    </div>
                                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-200">
                    {([
                        { key: 'kpis' as Tab, label: 'Evidencias de KPIs', icon: Target },
                        { key: 'ordenes' as Tab, label: 'Evidencias de Órdenes', icon: ClipboardList },
                    ]).map((t) => {
                        const Icon = t.icon;
                        return (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}>
                                <Icon className="w-4 h-4" />{t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-3 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input type="month" value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Todas las áreas</option>
                        {areas.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.areaPadreId ? `  └ ${a.nombre}` : a.nombre}
                            </option>
                        ))}
                    </select>
                    <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Todos los estados</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="pendiente_revision">Pendiente revisión</option>
                        <option value="rechazada">Rechazada</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                        <input type="checkbox" checked={filtroFueraTiempo} onChange={(e) => setFiltroFueraTiempo(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-red-600" />
                        Solo fuera de tiempo
                    </label>
                    <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Buscar por nombre, empleado..." value={busquedaTexto}
                            onChange={(e) => setBusquedaTexto(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={limpiarFiltros}
                        className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Limpiar
                    </button>
                </div>

                {/* Lista */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    </div>
                ) : tab === 'kpis' ? (
                    <ListaKpi items={itemsKpi} totalSinFiltro={kpiData?.total ?? 0}
                        page={kpiData?.page ?? 1} totalPages={kpiData?.totalPages ?? 1}
                        onPage={setPage} />
                ) : (
                    <ListaOrden items={itemsOrden} totalSinFiltro={ordenData?.total ?? 0}
                        page={ordenData?.page ?? 1} totalPages={ordenData?.totalPages ?? 1}
                        onPage={setPage} />
                )}
            </div>
        </Layout>
    );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ListaKpi({ items, totalSinFiltro, page, totalPages, onPage }: {
    items: EvidenciaKpi[];
    totalSinFiltro: number;
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
}) {
    if (items.length === 0) {
        return (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay evidencias con los filtros seleccionados</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {items.map((ev) => {
                const cfg = STATUS_CFG[ev.status] ?? STATUS_CFG.pendiente_revision;
                const Icono = iconoArchivo(ev.tipo);
                const StatusIcon = cfg.icon;
                return (
                    <div key={ev.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all p-4">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${ev.tipo?.startsWith('image/') ? 'bg-purple-50' : 'bg-blue-50'}`}>
                                <Icono className={`w-6 h-6 ${ev.tipo?.startsWith('image/') ? 'text-purple-600' : 'text-blue-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{ev.kpi.indicador}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text}`}>
                                        <StatusIcon className="w-3 h-3 inline mr-1" />
                                        {cfg.label}
                                    </span>
                                    {ev.esFueraDeTiempo && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Fuera de tiempo</span>
                                    )}
                                    {ev.esRespaldoGracia && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Respaldo gracia</span>
                                    )}
                                    {ev.intento > 1 && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Intento #{ev.intento}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{ev.empleado.nombre} {ev.empleado.apellido}</span>
                                    {ev.empleado.area && <span className="flex items-center gap-1"><Building className="w-3 h-3" />{ev.empleado.area.nombre}</span>}
                                    {ev.empleado.puesto && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{ev.empleado.puesto.nombre}</span>}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap mt-1">
                                    <span>Período {ev.periodo}</span>
                                    <span>Subida: {formatFecha(ev.fechaSubida)}</span>
                                    <span className="truncate">{ev.nombre} {ev.tamanio ? `· ${formatTamanio(ev.tamanio)}` : ''}</span>
                                    {ev.valorNumerico !== null && ev.valorNumerico !== undefined && (
                                        <span>Valor: <span className="font-medium text-gray-600">{ev.valorNumerico}</span></span>
                                    )}
                                </div>
                                {ev.motivoRechazo && (
                                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                                        <span className="font-medium">Motivo rechazo: </span>{ev.motivoRechazo}
                                    </div>
                                )}
                            </div>
                            <a href={ev.archivoUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0">
                                <ExternalLink className="w-3.5 h-3.5" />Abrir
                            </a>
                        </div>
                    </div>
                );
            })}

            <Paginacion page={page} totalPages={totalPages} totalSinFiltro={totalSinFiltro} onPage={onPage} />
        </div>
    );
}

function ListaOrden({ items, totalSinFiltro, page, totalPages, onPage }: {
    items: EvidenciaOrden[];
    totalSinFiltro: number;
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
}) {
    if (items.length === 0) {
        return (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay evidencias de órdenes con los filtros seleccionados</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {items.map((ev) => {
                const cfg = STATUS_CFG[ev.status] ?? STATUS_CFG.pendiente_revision;
                const Icono = iconoArchivo(ev.tipo);
                const StatusIcon = cfg.icon;
                const ot = ev.tarea.ordenTrabajo;
                return (
                    <div key={ev.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all p-4">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${ev.tipo?.startsWith('image/') ? 'bg-purple-50' : 'bg-blue-50'}`}>
                                <Icono className={`w-6 h-6 ${ev.tipo?.startsWith('image/') ? 'text-purple-600' : 'text-blue-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{ot.titulo}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text}`}>
                                        <StatusIcon className="w-3 h-3 inline mr-1" />
                                        {cfg.label}
                                    </span>
                                    {ev.esFueraDeTiempo && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Fuera de tiempo</span>
                                    )}
                                    {ev.intento > 1 && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Intento #{ev.intento}</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 mb-1 truncate">Tarea {ev.tarea.orden}: {ev.tarea.descripcion}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{ot.empleado.nombre} {ot.empleado.apellido}</span>
                                    {ot.empleado.area && <span className="flex items-center gap-1"><Building className="w-3 h-3" />{ot.empleado.area.nombre}</span>}
                                    {ot.empleado.puesto && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{ot.empleado.puesto.nombre}</span>}
                                    {ot.kpi && <span className="flex items-center gap-1"><Target className="w-3 h-3" />{ot.kpi.indicador}</span>}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap mt-1">
                                    <span>Subida: {formatFecha(ev.fechaSubida)}</span>
                                    {ot.fechaLimite && <span>Límite OT: {formatFecha(ot.fechaLimite)}</span>}
                                    <span className="truncate">{ev.nombre} {ev.tamanio ? `· ${formatTamanio(ev.tamanio)}` : ''}</span>
                                </div>
                                {ev.motivoRechazo && (
                                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                                        <span className="font-medium">Motivo rechazo: </span>{ev.motivoRechazo}
                                    </div>
                                )}
                            </div>
                            <a href={ev.archivoUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0">
                                <ExternalLink className="w-3.5 h-3.5" />Abrir
                            </a>
                        </div>
                    </div>
                );
            })}

            <Paginacion page={page} totalPages={totalPages} totalSinFiltro={totalSinFiltro} onPage={onPage} />
        </div>
    );
}

function Paginacion({ page, totalPages, totalSinFiltro, onPage }: {
    page: number;
    totalPages: number;
    totalSinFiltro: number;
    onPage: (p: number) => void;
}) {
    if (totalPages <= 1) {
        return (
            <p className="text-xs text-center text-gray-400 mt-3">{totalSinFiltro} resultado{totalSinFiltro !== 1 ? 's' : ''}</p>
        );
    }
    return (
        <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">
                Página {page} de {totalPages} · {totalSinFiltro} resultados
            </span>
            <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

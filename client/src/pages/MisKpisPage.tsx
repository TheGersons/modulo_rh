import { useState, useEffect, useRef } from 'react';
import {
    Target,
    CheckCircle,
    AlertCircle,
    Clock,
    Upload,
    ChevronDown,
    ChevronUp,
    Plus,
    FileText,
    Image,
    Film,
    File,
    Info,
    TrendingUp,
    Hash,
    Timer,
    Calculator,
    ToggleLeft,
    Eye,
    Download,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { kpisService } from '../services/kpis.service';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FormulaCalculo {
    descripcion: string;
}

interface KPI {
    id: string;
    key: string;
    indicador: string;
    descripcion?: string;
    tipoCalculo: string;
    formulaCalculo: string; // JSON string
    meta?: number;
    operadorMeta?: string;
    unidad?: string;
    tipoCriticidad: string;
    periodicidad: string;
    sentido: string;
}

interface Evidencia {
    id: string;
    archivoUrl: string;
    tipo: string;
    nombre: string;
    tamanio?: number;
    intento: number;
    status: string; // "pendiente_revision" | "aprobada" | "rechazada"
    motivoRechazo?: string;
    apelacion?: string;
    respuestaApelacion?: string;
    fechaSubida: string;
    esFueraDeTiempo: boolean;
    // Para KPIs con valores numéricos
    valorNumerico?: number;
    nota?: string;
}

interface KPIConEvidencias extends KPI {
    evidencias: Evidencia[];
    statusKPI: 'pendiente' | 'en_progreso' | 'pendiente_revision' | 'aprobado' | 'rechazado';
    evidenciasRequeridas: number;
    evidenciasAprobadas: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_ICON: Record<string, any> = {
    porcentaje: TrendingUp,
    formula: Calculator,
    tiempo: Timer,
    conteo: Hash,
    binario: ToggleLeft,
};

const ARCHIVO_ICON: Record<string, any> = {
    imagen: Image,
    video: Film,
    pdf: FileText,
    documento: File,
};

const EVIDENCIA_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    pendiente_revision: { label: 'En revisión', color: 'text-orange-700', bg: 'bg-orange-100' },
    aprobada: { label: 'Aprobada', color: 'text-green-700', bg: 'bg-green-100' },
    rechazada: { label: 'Rechazada', color: 'text-red-700', bg: 'bg-red-100' },
};

const KPI_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pendiente: { label: 'Pendiente', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
    en_progreso: { label: 'En Progreso', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
    pendiente_revision: { label: 'En Revisión', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' },
    aprobado: { label: 'Aprobado', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200' },
    rechazado: { label: 'Rechazado', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' },
};

/** Calcula cuántas evidencias requiere un KPI según su tipo y meta */
function getEvidenciasRequeridas(kpi: KPI): number {
    if (kpi.tipoCalculo === 'conteo' && kpi.meta && kpi.meta > 0) return kpi.meta;
    return 1;
}

/** Deriva el status del KPI a partir de sus evidencias */
function derivarStatusKPI(
    evidencias: Evidencia[],
    requeridas: number
): KPIConEvidencias['statusKPI'] {
    if (!evidencias || evidencias.length === 0) return 'pendiente';
    if (evidencias.some((e) => e.status === 'aprobada')) {
        const aprobadas = evidencias.filter((e) => e.status === 'aprobada').length;
        if (aprobadas >= requeridas) return 'aprobado';
    }
    if (evidencias.every((e) => e.status === 'rechazada')) return 'rechazado';
    if (evidencias.some((e) => e.status === 'pendiente_revision')) return 'pendiente_revision';
    if (evidencias.some((e) => e.status === 'rechazada')) return 'en_progreso'; // tiene rechazadas, puede re-subir
    return 'en_progreso';
}

function formatBytes(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MisKPIsPage() {
    const { user } = useAuth();
    const [kpis, setKpis] = useState<KPIConEvidencias[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandidos, setExpandidos] = useState<string[]>([]);
    const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'en_progreso' | 'pendiente_revision' | 'aprobado' | 'rechazado'>('todos');

    // Subida de evidencia
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [subiendoEvidencia, setSubiendoEvidencia] = useState<string | null>(null); // kpiId
    const [kpiSeleccionado, setKpiSeleccionado] = useState<string | null>(null);
    const [valorNumerico, setValorNumerico] = useState<string>('');
    const [notaEvidencia, setNotaEvidencia] = useState<string>('');
    const [mostrarFormSubida, setMostrarFormSubida] = useState<string | null>(null); // kpiId

    // Apelación
    const [apelandoEvidencia, setApelandoEvidencia] = useState<string | null>(null);
    const [textoApelacion, setTextoApelacion] = useState('');

    useEffect(() => {
        if (user?.id) cargarKPIs();
    }, [user]);

    // ─── Carga de datos ──────────────────────────────────────────────────────────

    const cargarKPIs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            // 1. KPIs del puesto/área del empleado
            const kpisData = await kpisService.getMisKpis();

            // 2. Evidencias del empleado para el período actual
            const periodo = getPeriodoActual();
            const resEv = await fetch(
                `/api/kpis/mis-evidencias?periodo=${periodo}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const evidenciasData: Record<string, Evidencia[]> = resEv.ok ? await resEv.json() : {};

            // 3. Combinar
            const combinados: KPIConEvidencias[] = (Array.isArray(kpisData) ? kpisData : []).map((kpi) => {
                const evidencias = evidenciasData[kpi.id] ?? [];
                const requeridas = getEvidenciasRequeridas(kpi);
                const aprobadas = evidencias.filter((e) => e.status === 'aprobada').length;
                return {
                    ...kpi,
                    evidencias,
                    statusKPI: derivarStatusKPI(evidencias, requeridas),
                    evidenciasRequeridas: requeridas,
                    evidenciasAprobadas: aprobadas,
                };
            });

            setKpis(combinados);
        } catch (error) {
            console.error('Error al cargar KPIs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPeriodoActual = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    // ─── Acciones ────────────────────────────────────────────────────────────────

    const toggleExpanded = (kpiId: string) => {
        setExpandidos((prev) =>
            prev.includes(kpiId) ? prev.filter((id) => id !== kpiId) : [...prev, kpiId]
        );
    };

    const handleAbrirSubida = (kpiId: string) => {
        setMostrarFormSubida(kpiId);
        setValorNumerico('');
        setNotaEvidencia('');
    };

    const handleSeleccionarArchivo = (kpiId: string) => {
        setKpiSeleccionado(kpiId);
        fileInputRef.current?.click();
    };

    const handleArchivoSeleccionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !kpiSeleccionado) return;

        const kpi = kpis.find((k) => k.id === kpiSeleccionado);
        const necesitaValor = ['formula', 'tiempo', 'conteo'].includes(kpi?.tipoCalculo ?? '');

        if (necesitaValor && !valorNumerico) {
            alert('Debes ingresar el valor numérico antes de seleccionar el archivo.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            setSubiendoEvidencia(kpiSeleccionado);
            const token = localStorage.getItem('accessToken');

            // FormData con el archivo real y metadatos
            const formData = new FormData();
            formData.append('archivo', file);
            formData.append('kpiId', kpiSeleccionado);
            formData.append('kpiKey', kpi!.key);
            formData.append('periodo', getPeriodoActual());
            formData.append('anio', String(new Date().getFullYear()));
            if (necesitaValor && valorNumerico) {
                formData.append('valorNumerico', valorNumerico);
            }
            if (notaEvidencia) {
                formData.append('nota', notaEvidencia);
            }

            const res = await fetch('/api/storage/evidencia-kpi', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                // Sin Content-Type — el navegador lo pone automáticamente con el boundary
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Error al subir evidencia');
            }

            setMostrarFormSubida(null);
            setValorNumerico('');
            setNotaEvidencia('');
            await cargarKPIs();
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Error al subir la evidencia. Intenta de nuevo.');
        } finally {
            setSubiendoEvidencia(null);
            setKpiSeleccionado(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleApelar = async (evidenciaId: string) => {
        if (!textoApelacion.trim()) return;
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`/api/kpis/evidencias/${evidenciaId}/apelar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ apelacion: textoApelacion }),
            });
            setApelandoEvidencia(null);
            setTextoApelacion('');
            await cargarKPIs();
        } catch (error) {
            alert('Error al enviar la apelación.');
        }
    };

    // ─── Computed ────────────────────────────────────────────────────────────────

    const kpisFiltrados = kpis.filter((k) => filtro === 'todos' || k.statusKPI === filtro);

    const stats = {
        total: kpis.length,
        aprobados: kpis.filter((k) => k.statusKPI === 'aprobado').length,
        revision: kpis.filter((k) => k.statusKPI === 'pendiente_revision').length,
        pendientes: kpis.filter((k) => ['pendiente', 'en_progreso', 'rechazado'].includes(k.statusKPI)).length,
    };

    const getNecesitaValorLabel = (tipoCalculo: string, unidad?: string): string => {
        if (tipoCalculo === 'tiempo') return `Tiempo real (${unidad ?? 'horas'})`;
        if (tipoCalculo === 'conteo') return `Cantidad real (${unidad ?? 'unidades'})`;
        if (tipoCalculo === 'formula') return `Resultado calculado (${unidad ?? ''})`;
        return '';
    };

    const getFormulaDescripcion = (formulaCalculo: string): string => {
        try {
            const parsed: FormulaCalculo = JSON.parse(formulaCalculo);
            return parsed.descripcion ?? '';
        } catch {
            return formulaCalculo;
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                        <p className="mt-4 text-gray-600">Cargando tus KPIs...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Input oculto */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleArchivoSeleccionado}
            />

            <div className="p-8 space-y-6 max-w-4xl mx-auto">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mis KPIs</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Período actual: <span className="font-medium text-gray-700">{getPeriodoActual()}</span>
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Aprobados', value: stats.aprobados, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
                        { label: 'En Revisión', value: stats.revision, color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
                        { label: 'Pendientes', value: stats.pendientes, color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">{s.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-gray-400">de {stats.total} total</p>
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
                <div className="flex gap-2 flex-wrap">
                    {[
                        { value: 'todos', label: 'Todos' },
                        { value: 'pendiente', label: 'Pendientes' },
                        { value: 'en_progreso', label: 'En Progreso' },
                        { value: 'pendiente_revision', label: 'En Revisión' },
                        { value: 'aprobado', label: 'Aprobados' },
                        { value: 'rechazado', label: 'Rechazados' },
                    ].map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFiltro(f.value as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtro === f.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Lista de KPIs */}
                {kpisFiltrados.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin KPIs</h3>
                        <p className="text-gray-400 text-sm">No hay KPIs en esta categoría</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {kpisFiltrados.map((kpi) => {
                            const statusCfg = KPI_STATUS_CONFIG[kpi.statusKPI];
                            const TipoIcon = TIPO_ICON[kpi.tipoCalculo] ?? Target;
                            const expandido = expandidos.includes(kpi.id);
                            const esCritico = kpi.tipoCriticidad === 'critico';
                            const formulaDesc = getFormulaDescripcion(kpi.formulaCalculo);
                            const necesitaValor = ['formula', 'tiempo', 'conteo'].includes(kpi.tipoCalculo);
                            const valorLabel = getNecesitaValorLabel(kpi.tipoCalculo, kpi.unidad);
                            const mostrandoForm = mostrarFormSubida === kpi.id;
                            const cargando = subiendoEvidencia === kpi.id;

                            // Cuántas evidencias faltan de las requeridas
                            const aprobadas = kpi.evidenciasAprobadas;
                            const requeridas = kpi.evidenciasRequeridas;
                            const enRevision = kpi.evidencias.filter((e) => e.status === 'pendiente_revision').length;
                            const falta = Math.max(0, requeridas - aprobadas - enRevision);

                            // Puede subir si no está aprobado del todo
                            const puedeSubir = kpi.statusKPI !== 'aprobado';

                            return (
                                <div
                                    key={kpi.id}
                                    className={`bg-white rounded-xl shadow-sm border transition-all ${statusCfg.border}`}
                                >
                                    {/* Header KPI */}
                                    <div
                                        className="flex items-start gap-4 p-5 cursor-pointer"
                                        onClick={() => toggleExpanded(kpi.id)}
                                    >
                                        {/* Icono tipo */}
                                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${esCritico ? 'bg-red-50' : 'bg-blue-50'}`}>
                                            <TipoIcon className={`w-5 h-5 ${esCritico ? 'text-red-600' : 'text-blue-600'}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Título y badges */}
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-mono text-blue-600 font-medium">{kpi.key}</span>
                                                        {esCritico && (
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                                Crítico
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{kpi.indicador}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusCfg.bg} ${statusCfg.color}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>

                                            {/* Fórmula / descripción */}
                                            <p className="text-xs text-gray-500 mb-2">{formulaDesc}</p>

                                            {/* Progreso evidencias */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all ${aprobadas >= requeridas ? 'bg-green-500' : 'bg-blue-500'
                                                            }`}
                                                        style={{ width: `${Math.min((aprobadas / requeridas) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                    {aprobadas}/{requeridas} evidencias
                                                    {enRevision > 0 && ` · ${enRevision} en revisión`}
                                                </span>
                                            </div>

                                            {/* Meta */}
                                            {kpi.meta !== undefined && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Meta: <span className="font-medium text-gray-600">
                                                        {kpi.operadorMeta} {kpi.meta} {kpi.unidad}
                                                    </span>
                                                    <span className="ml-2 capitalize text-gray-400">· {kpi.sentido}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Chevron */}
                                        <div className="flex-shrink-0 self-center">
                                            {expandido
                                                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                                                : <ChevronDown className="w-4 h-4 text-gray-400" />
                                            }
                                        </div>
                                    </div>

                                    {/* Detalle expandido */}
                                    {expandido && (
                                        <div className="border-t border-gray-100 p-5 space-y-4">

                                            {/* Descripción del KPI */}
                                            {kpi.descripcion && (
                                                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-xs text-blue-700">{kpi.descripcion}</p>
                                                </div>
                                            )}

                                            {/* Slots de evidencias requeridas */}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                    Evidencias requeridas ({requeridas})
                                                </p>

                                                <div className="space-y-2">
                                                    {Array.from({ length: requeridas }).map((_, idx) => {
                                                        // Buscar evidencia aprobada o en revisión para este slot
                                                        const evidenciasAprobadas = kpi.evidencias.filter((e) => e.status === 'aprobada');
                                                        const evidenciasRevision = kpi.evidencias.filter((e) => e.status === 'pendiente_revision');
                                                        const evidenciasRechazadas = kpi.evidencias.filter((e) => e.status === 'rechazada');

                                                        let evidenciaSlot: Evidencia | undefined;
                                                        if (idx < evidenciasAprobadas.length) {
                                                            evidenciaSlot = evidenciasAprobadas[idx];
                                                        } else if ((idx - evidenciasAprobadas.length) < evidenciasRevision.length) {
                                                            evidenciaSlot = evidenciasRevision[idx - evidenciasAprobadas.length];
                                                        } else if ((idx - evidenciasAprobadas.length - evidenciasRevision.length) < evidenciasRechazadas.length) {
                                                            evidenciaSlot = evidenciasRechazadas[idx - evidenciasAprobadas.length - evidenciasRevision.length];
                                                        }

                                                        const slotStatus = evidenciaSlot?.status;
                                                        const slotCfg = slotStatus ? EVIDENCIA_STATUS[slotStatus] : null;

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-center gap-3 p-3 rounded-lg border ${slotStatus === 'aprobada' ? 'bg-green-50 border-green-200' :
                                                                    slotStatus === 'pendiente_revision' ? 'bg-orange-50 border-orange-200' :
                                                                        slotStatus === 'rechazada' ? 'bg-red-50 border-red-200' :
                                                                            'bg-gray-50 border-gray-200 border-dashed'
                                                                    }`}
                                                            >
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${slotStatus === 'aprobada' ? 'bg-green-500 text-white' :
                                                                    slotStatus === 'pendiente_revision' ? 'bg-orange-400 text-white' :
                                                                        slotStatus === 'rechazada' ? 'bg-red-400 text-white' :
                                                                            'bg-gray-200 text-gray-500'
                                                                    }`}>
                                                                    {slotStatus === 'aprobada' ? '✓' :
                                                                        slotStatus === 'pendiente_revision' ? '⏳' :
                                                                            slotStatus === 'rechazada' ? '✗' :
                                                                                idx + 1}
                                                                </div>

                                                                {evidenciaSlot ? (
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <p className="text-xs font-medium text-gray-800 truncate">
                                                                                {evidenciaSlot.nombre}
                                                                            </p>
                                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                                <a
                                                                                    href={evidenciaSlot.archivoUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                                                                    title="Ver archivo"
                                                                                >
                                                                                    <Eye className="w-3.5 h-3.5" />
                                                                                </a>

                                                                                <a
                                                                                    href={evidenciaSlot.archivoUrl}
                                                                                    download={evidenciaSlot.nombre}
                                                                                    className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                                                                                    title="Descargar"
                                                                                >
                                                                                    <Download className="w-3.5 h-3.5" />
                                                                                </a>
                                                                                {slotCfg && (
                                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${slotCfg.bg} ${slotCfg.color}`}>
                                                                                        {slotCfg.label}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {evidenciaSlot.valorNumerico !== undefined && (
                                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                                Valor registrado: <span className="font-medium">{evidenciaSlot.valorNumerico} {kpi.unidad}</span>
                                                                            </p>
                                                                        )}
                                                                        {evidenciaSlot.motivoRechazo && (
                                                                            <p className="text-xs text-red-600 mt-0.5">
                                                                                Rechazo: {evidenciaSlot.motivoRechazo}
                                                                            </p>
                                                                        )}
                                                                        {/* Apelar */}
                                                                        {slotStatus === 'rechazada' && !evidenciaSlot.apelacion && (
                                                                            <div className="mt-1">
                                                                                {apelandoEvidencia === evidenciaSlot.id ? (
                                                                                    <div className="space-y-1.5 mt-2">
                                                                                        <textarea
                                                                                            value={textoApelacion}
                                                                                            onChange={(e) => setTextoApelacion(e.target.value)}
                                                                                            placeholder="¿Por qué consideras válida esta evidencia?"
                                                                                            rows={2}
                                                                                            className="w-full text-xs p-2 border border-gray-300 rounded-lg resize-none focus:ring-1 focus:ring-blue-500"
                                                                                        />
                                                                                        <div className="flex gap-2">
                                                                                            <button
                                                                                                onClick={() => handleApelar(evidenciaSlot!.id)}
                                                                                                disabled={!textoApelacion.trim()}
                                                                                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                                                                                            >
                                                                                                Enviar
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => { setApelandoEvidencia(null); setTextoApelacion(''); }}
                                                                                                className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200"
                                                                                            >
                                                                                                Cancelar
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => setApelandoEvidencia(evidenciaSlot!.id)}
                                                                                        className="text-xs text-blue-600 hover:underline mt-0.5"
                                                                                    >
                                                                                        Apelar rechazo
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {evidenciaSlot.apelacion && (
                                                                            <p className="text-xs text-blue-600 mt-0.5">
                                                                                Apelación enviada {evidenciaSlot.respuestaApelacion ? `· Resp: ${evidenciaSlot.respuestaApelacion}` : '· Pendiente de respuesta'}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 flex-1">Evidencia {idx + 1} pendiente</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Evidencias extra (más allá de las requeridas) */}
                                            {kpi.evidencias.length > requeridas && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                        Evidencias adicionales
                                                    </p>
                                                    <div className="space-y-2">
                                                        {kpi.evidencias.slice(requeridas).map((ev) => {
                                                            const evCfg = EVIDENCIA_STATUS[ev.status];
                                                            const EvIcon = ARCHIVO_ICON[ev.tipo] ?? File;
                                                            return (
                                                                <div key={ev.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    <EvIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-medium text-gray-700 truncate">{ev.nombre}</p>
                                                                        <p className="text-xs text-gray-400">{formatBytes(ev.tamanio)}</p>
                                                                    </div>
                                                                    {evCfg && (
                                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${evCfg.bg} ${evCfg.color}`}>
                                                                            {evCfg.label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Formulario de subida */}
                                            {puedeSubir && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    {!mostrandoForm ? (
                                                        <button
                                                            onClick={() => handleAbrirSubida(kpi.id)}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            {falta > 0 ? `Subir evidencia requerida (${falta} pendiente${falta > 1 ? 's' : ''})` : 'Agregar evidencia extra'}
                                                        </button>
                                                    ) : (
                                                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {falta > 0 ? `Subir evidencia requerida` : 'Agregar evidencia extra'}
                                                            </p>

                                                            {/* Input valor numérico si aplica */}
                                                            {necesitaValor && (
                                                                <div>
                                                                    <label className="text-xs text-gray-500 mb-1 block">{valorLabel}</label>
                                                                    <input
                                                                        type="number"
                                                                        value={valorNumerico}
                                                                        onChange={(e) => setValorNumerico(e.target.value)}
                                                                        placeholder="0"
                                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                    />
                                                                    {kpi.tipoCalculo === 'formula' && (
                                                                        <p className="text-xs text-gray-400 mt-1">Fórmula: {formulaDesc}</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Nota opcional */}
                                                            <div>
                                                                <label className="text-xs text-gray-500 mb-1 block">Nota (opcional)</label>
                                                                <textarea
                                                                    value={notaEvidencia}
                                                                    onChange={(e) => setNotaEvidencia(e.target.value)}
                                                                    placeholder="Describe brevemente qué evidencia es..."
                                                                    rows={2}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </div>

                                                            {/* Botones */}
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleSeleccionarArchivo(kpi.id)}
                                                                    disabled={cargando || (necesitaValor && !valorNumerico)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                                >
                                                                    {cargando ? (
                                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                    ) : (
                                                                        <Upload className="w-4 h-4" />
                                                                    )}
                                                                    Seleccionar archivo
                                                                </button>
                                                                <button
                                                                    onClick={() => setMostrarFormSubida(null)}
                                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}
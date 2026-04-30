import { useState, useEffect, useRef } from 'react';
import {
    Target, CheckCircle, AlertCircle, Clock, Upload, ChevronDown, ChevronUp,
    Plus, FileText, Image, Film, File, Info, TrendingUp, Hash, Timer,
    Calculator, ToggleLeft, Eye, Download, StickyNote, ArrowUp, ArrowDown,
    Minus, Crosshair, Trash2,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { kpisService } from '../services/kpis.service';
import { fmtNum, fmtConUnidad } from '../utils/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FormulaCalculo {
    descripcion?: string;
    labelEsperado?: string;
    valorEsperado?: number;
    labelObtenido?: string;
    modoEvaluacion?: 'tolerancia' | 'umbral';
    toleranciaPorc?: number;
    numerador?: string;
    denominador?: string;
    multiplicador?: number;
    tipo?: string;
    campo?: string;
    metas?: { Q1: number; Q2: number; Q3: number; Q4: number };
    metaAnual?: number;
    porcentajes?: { Q1: number; Q2: number; Q3: number; Q4: number };
}

interface KPI {
    id: string;
    key: string;
    indicador: string;
    descripcion?: string;
    tipoCalculo: string;
    formulaCalculo: string;
    meta?: number;
    operadorMeta?: string;
    unidad?: string;
    tipoCriticidad: string;
    periodicidad: string;
    aplicaOrdenTrabajo: boolean;
    sentido: string;
}

interface Evidencia {
    id: string;
    archivoUrl: string;
    tipo: string;
    nombre: string;
    tamanio?: number;
    intento: number;
    status: string;
    motivoRechazo?: string;
    apelacion?: string;
    respuestaApelacion?: string;
    fechaSubida: string;
    esFueraDeTiempo: boolean;
    valorNumerico?: number;
    nota?: string;
}

interface RespaldoGracia {
    id: string;
    archivoUrl: string;
    tipo: string;
    nombre: string;
    nota?: string;
    status: 'pendiente_revision' | 'aprobada' | 'rechazada';
    motivoRechazo?: string;
    fechaSubida: string;
}

interface ResultadoAuto {
    resultado: number;
    ordenesAprobadas: number;
    totalOrdenes: number;
    evidenciasOrdenes: { archivoUrl: string; tipo: string; nombre: string; ordenTitulo: string }[];
    respaldosGracia?: RespaldoGracia[];
    respaldoAprobado?: boolean;
    respaldoEnRevision?: boolean;
    estado: 'verde' | 'amarillo' | 'rojo' | 'no_aplica' | null;
    meta?: number;
}

interface KPIConEvidencias extends KPI {
    evidencias: Evidencia[];
    statusKPI: 'pendiente' | 'en_progreso' | 'pendiente_revision' | 'aprobado' | 'rechazado';
    evidenciasRequeridas: number;
    evidenciasAprobadas: number;
    notaKPI?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_ICON: Record<string, any> = {
    porcentaje: TrendingUp, formula: Calculator, tiempo: Timer,
    conteo: Hash, binario: ToggleLeft, precision: Crosshair,
    acumulado_trimestral: TrendingUp,
};

const TIPO_LABEL: Record<string, string> = {
    porcentaje: 'Porcentaje', formula: 'Fórmula', tiempo: 'Tiempo',
    conteo: 'Conteo', binario: 'Binario', precision: 'Precisión',
    acumulado_trimestral: 'Acumulado Trimestral',
};

const ARCHIVO_ICON: Record<string, any> = {
    imagen: Image, video: Film, pdf: FileText, documento: File,
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

function getEvidenciasRequeridas(_kpi: KPI): number {
    // Siempre 1 evidencia requerida — para conteo la meta es el VALOR a alcanzar,
    // no la cantidad de evidencias a subir.
    return 1;
}

function necesitaValorNumerico(kpi: KPI): boolean {
    if (['binario', 'porcentaje', 'precision'].includes(kpi.tipoCalculo)) return false;
    return true;
}

function getTrimestreActual(): 'Q1' | 'Q2' | 'Q3' | 'Q4' {
    const mes = new Date().getMonth() + 1;
    if (mes <= 3) return 'Q1';
    if (mes <= 6) return 'Q2';
    if (mes <= 9) return 'Q3';
    return 'Q4';
}

function getMetaTrimestreActual(f: FormulaCalculo): number | null {
    const q = getTrimestreActual();
    if (f.metas) return f.metas[q];
    if (f.metaAnual !== undefined && f.porcentajes) return f.metaAnual * f.porcentajes[q];
    return null;
}

function getValorLabel(kpi: KPI): string {
    if (kpi.tipoCalculo === 'tiempo') return `Valor real (${kpi.unidad ?? 'días'})`;
    if (kpi.tipoCalculo === 'conteo') return `Cantidad real (${kpi.unidad ?? 'unidades'})`;
    if (kpi.tipoCalculo === 'formula') return `Resultado calculado (${kpi.unidad ?? ''})`;
    if (kpi.tipoCalculo === 'acumulado_trimestral') return `Valor acumulado al ${getTrimestreActual()} (${kpi.unidad ?? ''})`;
    return '';
}

function evaluarOperador(valor: number, operador: string, referencia: number): boolean {
    switch (operador) {
        case '>=': return valor >= referencia;
        case '>': return valor > referencia;
        case '<=': return valor <= referencia;
        case '<': return valor < referencia;
        case '=': return valor === referencia;
        default: return valor >= referencia;
    }
}

// Cuando operador = '=' y hay sentido, se interpreta como >= (Mayor es mejor)
// o <= (Menor es mejor): superar la meta sigue siendo cumplir.
function normalizarOperador(operador: string | undefined, sentido: string | undefined): string {
    const esMenorMejor = sentido === 'Menor es mejor';
    if (!operador) return esMenorMejor ? '<=' : '>=';
    if (operador === '=' && sentido) return esMenorMejor ? '<=' : '>=';
    return operador;
}

function evaluarCumplimiento(kpi: KPI, valor: number): 'cumple' | 'no_cumple' | null {
    if (['binario', 'porcentaje'].includes(kpi.tipoCalculo)) return null;
    if (kpi.tipoCalculo === 'acumulado_trimestral') {
        try {
            const f: FormulaCalculo = JSON.parse(kpi.formulaCalculo);
            const metaQ = getMetaTrimestreActual(f);
            if (metaQ === null) return null;
            const op = kpi.sentido === 'Menor es mejor' ? '<=' : '>=';
            return evaluarOperador(valor, op, metaQ) ? 'cumple' : 'no_cumple';
        } catch { return null; }
    }
    if (kpi.meta === undefined) return null;
    const op = normalizarOperador(kpi.operadorMeta, kpi.sentido);
    return evaluarOperador(valor, op, kpi.meta) ? 'cumple' : 'no_cumple';
}

/**
 * Calcula precisión según el modo configurado.
 * Modo tolerancia: 100 - |desviación%|, cumple si desviación <= tolerancia Y precisión >= meta
 * Modo umbral:     obtenido [operador] esperado, cumple si pasa umbral Y precisión >= meta
 */
function calcularPrecision(
    formula: FormulaCalculo,
    obtenidoStr: string,
    meta?: number,
    operadorMeta?: string,
): { precision: number | null; cumple: boolean | null; detalle: string } {
    const esperado = formula.valorEsperado;
    const obtenido = parseFloat(obtenidoStr);

    if (!obtenidoStr || isNaN(obtenido) || !esperado || esperado === 0) {
        return { precision: null, cumple: null, detalle: '' };
    }

    const desviacionPorc = Math.abs(((obtenido - esperado) / esperado) * 100);
    const precision = 100 - desviacionPorc;
    const cumpleMeta = meta !== undefined ? precision >= meta : true;
    const modo = formula.modoEvaluacion ?? 'tolerancia';

    if (modo === 'tolerancia') {
        const tolerancia = formula.toleranciaPorc ?? 5;
        const dentroTolerancia = desviacionPorc <= tolerancia;
        const cumple = dentroTolerancia && cumpleMeta;
        return {
            precision,
            cumple,
            detalle: `Desviación: ${fmtNum(desviacionPorc)}% (tolerancia ±${tolerancia}%)`,
        };
    } else {
        const op = operadorMeta ?? '>=';
        const pasoUmbral = evaluarOperador(obtenido, op, esperado);
        const cumple = pasoUmbral && cumpleMeta;
        return {
            precision,
            cumple,
            detalle: pasoUmbral
                ? `✓ ${obtenido} ${op} ${esperado} (umbral cumplido)`
                : `✗ ${obtenido} no cumple ${op} ${esperado}`,
        };
    }
}

function derivarStatusKPI(evidencias: Evidencia[], requeridas: number): KPIConEvidencias['statusKPI'] {
    if (!evidencias || evidencias.length === 0) return 'pendiente';
    const aprobadas = evidencias.filter((e) => e.status === 'aprobada').length;
    if (aprobadas >= requeridas) return 'aprobado';
    if (evidencias.every((e) => e.status === 'rechazada')) return 'rechazado';
    if (evidencias.some((e) => e.status === 'pendiente_revision')) return 'pendiente_revision';
    if (evidencias.some((e) => e.status === 'rechazada')) return 'en_progreso';
    return 'en_progreso';
}

function formatBytes(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFormulaDescripcion(formulaCalculo: string): string {
    try { return (JSON.parse(formulaCalculo) as FormulaCalculo).descripcion ?? ''; }
    catch { return formulaCalculo; }
}

// ─── Ventana de gracia (KPIs basados en órdenes de trabajo) ──────────────────
// Misma convención que el backend: días 1..N del mes siguiente al periodo,
// donde N = DIAS_GRACIA_KPI (5 por defecto).
const DIAS_GRACIA = 5;

function getVentanaGracia(periodo: string, dias = DIAS_GRACIA): { inicio: Date; fin: Date } {
    const [a, m] = periodo.split('-').map(Number);
    return {
        inicio: new Date(a, m, 1, 0, 0, 0, 0),
        fin: new Date(a, m, dias, 23, 59, 59, 999),
    };
}

function enVentanaGracia(now: Date, periodo: string, dias = DIAS_GRACIA): boolean {
    const { inicio, fin } = getVentanaGracia(periodo, dias);
    return now >= inicio && now <= fin;
}

function fmtFecha(d: Date): string {
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MisKPIsPage() {
    const { user } = useAuth();
    const [kpis, setKpis] = useState<KPIConEvidencias[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandidos, setExpandidos] = useState<string[]>([]);
    const [filtro, setFiltro] = useState<string>('todos');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [subiendoEvidencia, setSubiendoEvidencia] = useState<string | null>(null);
    const [kpiSeleccionado, setKpiSeleccionado] = useState<string | null>(null);
    const [valorNumerico, setValorNumerico] = useState<string>('');
    const [notaEvidencia, setNotaEvidencia] = useState<string>('');
    const [confirmadoBinario, setConfirmadoBinario] = useState(false);
    const [mostrarFormSubida, setMostrarFormSubida] = useState<string | null>(null);
    const [valorEsperado, setValorEsperado] = useState<string>('');
    const [valorObtenido, setValorObtenido] = useState<string>('');

    const [resultadosAuto, setResultadosAuto] = useState<Record<string, ResultadoAuto>>({});

    const [editandoNota, setEditandoNota] = useState<string | null>(null);
    const [textoNota, setTextoNota] = useState<string>('');
    const [guardandoNota, setGuardandoNota] = useState(false);
    const [apelandoEvidencia, setApelandoEvidencia] = useState<string | null>(null);
    const [textoApelacion, setTextoApelacion] = useState('');
    const [eliminandoEvidencia, setEliminandoEvidencia] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // Usar user?.id como dependencia evita re-fires cuando el objeto user
    // cambia referencia sin cambiar datos (causa de race conditions)
    useEffect(() => {
        if (!user?.id) return;
        const controller = new AbortController();
        cargarKPIs(controller.signal);
        return () => controller.abort();
    }, [user?.id]);

    const getPeriodoActual = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const cargarKPIs = async (signal?: AbortSignal) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const periodo = getPeriodoActual();
            const headers = { Authorization: `Bearer ${token}` };

            // Las 3 peticiones iniciales en paralelo
            const [kpisData, resEv, resNotas] = await Promise.all([
                kpisService.getMisKpis(),
                fetch(`/api/kpis/mis-evidencias?periodo=${periodo}`, { headers, signal }),
                fetch(`/api/kpis/mis-notas?periodo=${periodo}`, { headers, signal }).catch(() => null),
            ]);

            // Si el componente se desmontó durante la carga, no actualizar estado
            if (signal?.aborted) return;

            const evidenciasData: Record<string, Evidencia[]> = resEv.ok ? await resEv.json() : {};
            const notasData: Record<string, string> = resNotas?.ok ? await resNotas.json() : {};

            const combinados: KPIConEvidencias[] = (Array.isArray(kpisData) ? kpisData : []).map((kpi) => {
                const evidencias = evidenciasData[kpi.id] ?? [];
                const requeridas = getEvidenciasRequeridas(kpi);
                const aprobadas = evidencias.filter((e: Evidencia) => e.status === 'aprobada').length;
                return { ...kpi, evidencias, statusKPI: derivarStatusKPI(evidencias, requeridas), evidenciasRequeridas: requeridas, evidenciasAprobadas: aprobadas, notaKPI: notasData[kpi.id] };
            });

            setKpis(combinados);

            // Resultados automáticos en paralelo también
            const autoKpis = combinados.filter((k) => k.tipoCalculo === 'division' && k.aplicaOrdenTrabajo);
            if (autoKpis.length > 0) {
                const autoResults: Record<string, ResultadoAuto> = {};
                await Promise.all(autoKpis.map(async (kpi) => {
                    try {
                        const res = await fetch(`/api/kpis/${kpi.id}/resultado-automatico?periodo=${periodo}`, { headers, signal });
                        if (res.ok && !signal?.aborted) autoResults[kpi.id] = await res.json();
                    } catch { /* silencioso */ }
                }));
                if (!signal?.aborted) setResultadosAuto(autoResults);
            }
        } catch (error: any) {
            if (error?.name === 'AbortError') return; // navegó antes de que terminara — ignorar
            console.error('Error al cargar KPIs:', error);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    };

    const toggleExpanded = (kpiId: string) =>
        setExpandidos((prev) => prev.includes(kpiId) ? prev.filter((id) => id !== kpiId) : [...prev, kpiId]);

    const handleAbrirSubida = (kpiId: string) => {
        setMostrarFormSubida(kpiId);
        setValorNumerico(''); setNotaEvidencia('');
        setConfirmadoBinario(false); setValorEsperado(''); setValorObtenido('');
    };

    const handleSeleccionarArchivo = (kpiId: string) => {
        const kpi = kpis.find((k) => k.id === kpiId);
        if (!kpi) return;
        // KPIs basados en órdenes de trabajo: respaldo libre durante la ventana de gracia,
        // sin exigir valor numérico ni confirmación binaria.
        if (!kpi.aplicaOrdenTrabajo) {
            if (kpi.tipoCalculo === 'binario' && !confirmadoBinario) { alert('Debes confirmar que completaste la actividad.'); return; }
            if (necesitaValorNumerico(kpi) && !valorNumerico) { alert(`Debes ingresar ${getValorLabel(kpi)}.`); return; }
            if (kpi.tipoCalculo === 'precision' && !valorObtenido) { alert('Debes ingresar el resultado obtenido.'); return; }
        }
        setKpiSeleccionado(kpiId);
        fileInputRef.current?.click();
    };

    const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !kpiSeleccionado) return;
        const kpi = kpis.find((k) => k.id === kpiSeleccionado);
        if (!kpi) return;

        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('kpiId', kpiSeleccionado);
        formData.append('kpiKey', kpi.key);
        formData.append('periodo', getPeriodoActual());
        formData.append('anio', String(new Date().getFullYear()));

        // KPIs aplicaOrdenTrabajo: solo nota + archivo (respaldo libre), no valor numérico
        if (!kpi.aplicaOrdenTrabajo) {
            if (necesitaValorNumerico(kpi) && valorNumerico) formData.append('valorNumerico', valorNumerico);
            if (kpi.tipoCalculo === 'binario') formData.append('valorNumerico', '1');
            if (kpi.tipoCalculo === 'precision' && valorObtenido) {
                const formula: FormulaCalculo = JSON.parse(kpi.formulaCalculo);
                const { precision } = calcularPrecision(formula, valorObtenido, kpi.meta, kpi.operadorMeta);
                if (precision !== null) formData.append('valorNumerico', fmtNum(precision));
                formData.append('valorObtenido', valorObtenido);
            }
        }
        if (notaEvidencia) formData.append('nota', notaEvidencia);

        setSubiendoEvidencia(kpiSeleccionado);
        setUploadProgress(0);

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
                setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
            }
        };

        xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                setMostrarFormSubida(null);
                setValorNumerico(''); setNotaEvidencia(''); setConfirmadoBinario(false); setValorObtenido('');
                setUploadProgress(0);
                await cargarKPIs();
            } else {
                let msg = 'Error al subir evidencia';
                try { msg = JSON.parse(xhr.responseText)?.message || msg; } catch { /* noop */ }
                alert(msg);
            }
            setSubiendoEvidencia(null);
            setKpiSeleccionado(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        xhr.onerror = () => {
            alert('Error de red al subir la evidencia.');
            setSubiendoEvidencia(null);
            setKpiSeleccionado(null);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        xhr.open('POST', '/api/storage/evidencia-kpi');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    };

    const handleGuardarNota = async (kpiId: string) => {
        try {
            setGuardandoNota(true);
            const token = localStorage.getItem('accessToken');
            await fetch(`/api/kpis/${kpiId}/nota`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nota: textoNota, periodo: getPeriodoActual() }),
            });
            setKpis((prev) => prev.map((k) => k.id === kpiId ? { ...k, notaKPI: textoNota } : k));
            setEditandoNota(null); setTextoNota('');
        } catch { alert('Error al guardar la nota.'); }
        finally { setGuardandoNota(false); }
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
            setApelandoEvidencia(null); setTextoApelacion('');
            await cargarKPIs();
        } catch { alert('Error al enviar la apelación.'); }
    };

    const handleEliminarEvidencia = async (evidenciaId: string) => {
        if (!confirm('¿Eliminar esta evidencia? Solo puedes eliminar evidencias en revisión.')) return;
        try {
            setEliminandoEvidencia(evidenciaId);
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/kpis/evidencias/${evidenciaId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Error al eliminar');
            }
            await cargarKPIs();
        } catch (error: any) {
            alert(error.message || 'Error al eliminar la evidencia.');
        } finally {
            setEliminandoEvidencia(null);
        }
    };

    const kpisFiltrados = kpis.filter((k) => filtro === 'todos' || k.statusKPI === filtro);
    const stats = {
        total: kpis.length,
        aprobados: kpis.filter((k) => k.statusKPI === 'aprobado').length,
        revision: kpis.filter((k) => k.statusKPI === 'pendiente_revision').length,
        pendientes: kpis.filter((k) => ['pendiente', 'en_progreso', 'rechazado'].includes(k.statusKPI)).length,
    };

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
            <input ref={fileInputRef} type="file" className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleArchivoSeleccionado} />

            <div className="p-8 space-y-6 max-w-4xl mx-auto">

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mis KPIs</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Período actual: <span className="font-medium text-gray-700">{getPeriodoActual()}</span>
                    </p>
                </div>

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

                <div className="flex gap-2 flex-wrap">
                    {[
                        { value: 'todos', label: 'Todos' }, { value: 'pendiente', label: 'Pendientes' },
                        { value: 'en_progreso', label: 'En Progreso' }, { value: 'pendiente_revision', label: 'En Revisión' },
                        { value: 'aprobado', label: 'Aprobados' }, { value: 'rechazado', label: 'Rechazados' },
                    ].map((f) => (
                        <button key={f.value} onClick={() => setFiltro(f.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtro === f.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>

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
                            const esMenorMejor = kpi.sentido === 'Menor es mejor';
                            const formulaDesc = getFormulaDescripcion(kpi.formulaCalculo);
                            const esBinario = kpi.tipoCalculo === 'binario';
                            const esPrecision = kpi.tipoCalculo === 'precision';
                            const necesitaValor = necesitaValorNumerico(kpi);
                            const mostrandoForm = mostrarFormSubida === kpi.id;
                            const cargando = subiendoEvidencia === kpi.id;
                            const isAutomatic = kpi.tipoCalculo === 'division' && kpi.aplicaOrdenTrabajo;
                            const aplicaOT = kpi.aplicaOrdenTrabajo;
                            const autoData = isAutomatic ? resultadosAuto[kpi.id] : undefined;

                            // Ventana de gracia: solo aplica a KPIs basados en órdenes de trabajo
                            // (incluye aplicaOrdenTrabajo de cualquier tipoCalculo, no solo division).
                            const periodoActual = getPeriodoActual();
                            const ventana = aplicaOT ? getVentanaGracia(periodoActual) : null;
                            const enGracia = aplicaOT && enVentanaGracia(new Date(), periodoActual);
                            const respaldoAprobado = !!autoData?.respaldoAprobado;
                            const respaldoEnRevision = !!autoData?.respaldoEnRevision;

                            const aprobadas = kpi.evidenciasAprobadas;
                            const requeridas = kpi.evidenciasRequeridas;
                            const enRevision = kpi.evidencias.filter((e) => e.status === 'pendiente_revision').length;
                            const falta = Math.max(0, requeridas - aprobadas - enRevision);
                            // KPIs basados en orden de trabajo solo permiten subir respaldo durante la ventana de gracia.
                            // El resto, flujo normal.
                            const puedeSubir = aplicaOT
                                ? enGracia
                                : kpi.statusKPI !== 'aprobado';

                            const ultimaEvidenciaConValor = kpi.evidencias
                                .filter((e) => e.valorNumerico !== undefined)
                                .sort((a, b) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime())[0];
                            const cumplimiento = ultimaEvidenciaConValor?.valorNumerico !== undefined
                                ? evaluarCumplimiento(kpi, ultimaEvidenciaConValor.valorNumerico)
                                : null;

                            // Para KPIs automáticos, el statusKPI se deriva del resultado calculado
                            const autoStatusCfg = isAutomatic && autoData
                                ? autoData.estado === 'no_aplica'
                                    ? { label: 'No aplica', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' }
                                    : autoData.totalOrdenes === 0
                                        ? KPI_STATUS_CONFIG['pendiente']
                                        : KPI_STATUS_CONFIG['en_progreso']
                                : null;
                            const autoBadgeLabel = isAutomatic
                                ? autoData?.estado === 'no_aplica'
                                    ? 'No aplica'
                                    : autoData?.totalOrdenes === 0
                                        ? 'Sin órdenes'
                                        : 'Automático'
                                : null;

                            return (
                                <div key={kpi.id} className={`bg-white rounded-xl shadow-sm border transition-all ${statusCfg.border}`}>

                                    {/* Header */}
                                    <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => toggleExpanded(kpi.id)}>
                                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${esCritico ? 'bg-red-50' : 'bg-blue-50'}`}>
                                            <TipoIcon className={`w-5 h-5 ${esCritico ? 'text-red-600' : 'text-blue-600'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-mono text-blue-600 font-medium">{kpi.indicador}</span>
                                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                            {TIPO_LABEL[kpi.tipoCalculo] ?? kpi.tipoCalculo}
                                                        </span>
                                                        {esCritico && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Crítico</span>}
                                                        {esMenorMejor && <span className="flex items-center gap-0.5 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full"><ArrowDown className="w-3 h-3" /> Menor es mejor</span>}
                                                        {!esMenorMejor && !esBinario && <span className="flex items-center gap-0.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><ArrowUp className="w-3 h-3" /> Mayor es mejor</span>}
                                                        {esBinario && <span className="flex items-center gap-0.5 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"><Minus className="w-3 h-3" /> Sí / No</span>}
                                                        {kpi.aplicaOrdenTrabajo && <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">🔧 Orden de Trabajo</span>}
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{kpi.descripcion}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${(autoStatusCfg ?? statusCfg).bg} ${(autoStatusCfg ?? statusCfg).color}`}>
                                                    {isAutomatic ? autoBadgeLabel : statusCfg.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">{formulaDesc}</p>
                                            <div className="flex items-center gap-3 mb-1">
                                                {isAutomatic ? (
                                                    autoData ? (
                                                        <>
                                                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                                <div className={`h-1.5 rounded-full transition-all ${autoData.estado === 'verde' ? 'bg-green-500' : autoData.estado === 'amarillo' ? 'bg-yellow-400' : autoData.totalOrdenes > 0 ? 'bg-red-400' : 'bg-gray-300'}`}
                                                                    style={{ width: `${Math.min(autoData.resultado, 100)}%` }} />
                                                            </div>
                                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                                {autoData.ordenesAprobadas}/{autoData.totalOrdenes} órdenes · {fmtNum(autoData.resultado)}%
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Calculando...</span>
                                                    )
                                                ) : (() => {
                                                    // Progreso en 3 etapas:
                                                    // 0%  → sin evidencia
                                                    // 50% → evidencia subida, en revisión
                                                    // 100%→ aprobada
                                                    const progresoPorc = aprobadas >= requeridas
                                                        ? 100
                                                        : enRevision > 0
                                                            ? 50
                                                            : 0;
                                                    const barColor = progresoPorc === 100
                                                        ? 'bg-green-500'
                                                        : progresoPorc === 50
                                                            ? 'bg-orange-400'
                                                            : 'bg-gray-300';
                                                    const etiqueta = progresoPorc === 100
                                                        ? 'Aprobada'
                                                        : progresoPorc === 50
                                                            ? 'En revisión'
                                                            : 'Pendiente';
                                                    return (
                                                        <div className="flex-1 space-y-1 min-w-0">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                                    <div className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
                                                                        style={{ width: `${progresoPorc}%` }} />
                                                                </div>
                                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                                    {aprobadas}/{requeridas} · {etiqueta}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-xs text-gray-400 px-0.5">
                                                                <span>Pendiente</span>
                                                                <span>En revisión</span>
                                                                <span>Aprobada</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {progresoPorc === 0 && 'Sube tu evidencia para avanzar.'}
                                                                {progresoPorc === 50 && 'Evidencia recibida — esperando aprobación de tu jefe.'}
                                                                {progresoPorc === 100 && '¡Evidencia aprobada! Este KPI está completado.'}
                                                            </p>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {kpi.meta !== undefined && !esBinario && kpi.tipoCalculo !== 'acumulado_trimestral' && (
                                                    <p className="text-xs text-gray-400">
                                                        Meta: <span className="font-medium text-gray-600">{normalizarOperador(kpi.operadorMeta, kpi.sentido)} {fmtConUnidad(kpi.meta, kpi.unidad)}</span>
                                                        <span className="ml-1 text-gray-400 capitalize">· {kpi.periodicidad}</span>
                                                    </p>
                                                )}
                                                {kpi.tipoCalculo === 'acumulado_trimestral' && (() => {
                                                    try {
                                                        const f: FormulaCalculo = JSON.parse(kpi.formulaCalculo);
                                                        const q = getTrimestreActual();
                                                        const metaQ = getMetaTrimestreActual(f);
                                                        if (metaQ === null) return null;
                                                        const opAT = kpi.sentido === 'Menor es mejor' ? '<=' : '>=';
                                                        return (
                                                            <p className="text-xs text-gray-400">
                                                                Meta {q}: <span className="font-medium text-gray-600">{opAT} {fmtConUnidad(metaQ, kpi.unidad)}</span>
                                                                <span className="ml-1 text-gray-400 capitalize">· {kpi.periodicidad}</span>
                                                            </p>
                                                        );
                                                    } catch { return null; }
                                                })()}
                                                {isAutomatic && autoData && autoData.totalOrdenes > 0 && (
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${autoData.estado === 'verde' ? 'bg-green-100 text-green-700' : autoData.estado === 'amarillo' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                        {autoData.estado === 'verde' ? '✓ Cumple meta' : autoData.estado === 'amarillo' ? '⚠ Cerca de meta' : '✗ No cumple meta'} ({fmtNum(autoData.resultado)}%)
                                                    </span>
                                                )}
                                                {!isAutomatic && cumplimiento && ultimaEvidenciaConValor && (
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cumplimiento === 'cumple' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {cumplimiento === 'cumple' ? '✓ Cumple meta' : '✗ No cumple meta'} ({esPrecision ? `${fmtNum(ultimaEvidenciaConValor.valorNumerico)}%` : fmtConUnidad(ultimaEvidenciaConValor.valorNumerico, kpi.unidad)})
                                                    </span>
                                                )}
                                                {kpi.notaKPI && <span className="flex items-center gap-1 text-xs text-amber-600"><StickyNote className="w-3 h-3" /> Tiene nota</span>}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 self-center">
                                            {expandido ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </div>
                                    </div>

                                    {/* Detalle expandido */}
                                    {expandido && (
                                        <div className="border-t border-gray-100 p-5 space-y-5">

                                            {kpi.descripcion && (
                                                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-xs text-blue-700">{kpi.descripcion}</p>
                                                </div>
                                            )}

                                            {/* Banner de ventana de gracia (KPIs basados en órdenes de trabajo) */}
                                            {aplicaOT && ventana && (
                                                <div className={`p-3 rounded-lg border text-xs ${enGracia ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                                    <div className="flex items-start gap-2">
                                                        <Clock className={`w-4 h-4 flex-shrink-0 mt-0.5 ${enGracia ? 'text-amber-600' : 'text-gray-400'}`} />
                                                        <div className="space-y-0.5">
                                                            {enGracia ? (
                                                                <>
                                                                    <p className="font-semibold">Ventana de respaldo abierta hasta el {fmtFecha(ventana.fin)}</p>
                                                                    {isAutomatic && autoData?.totalOrdenes === 0 ? (
                                                                        <p>Si durante el periodo no recibiste órdenes de trabajo, sube un respaldo para que el KPI se marque como <strong>"No aplica"</strong> y no afecte tu evaluación.</p>
                                                                    ) : (
                                                                        <p>Puedes subir respaldo o contexto adicional para este KPI durante estos días.</p>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p className="font-semibold">Respaldos disponibles del {fmtFecha(ventana.inicio)} al {fmtFecha(ventana.fin)}</p>
                                                                    <p>Antes de esa fecha no se puede subir respaldo a este KPI.</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Panel de resultado automático */}
                                            {isAutomatic && (
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calculator className="w-4 h-4 text-blue-600" />
                                                        <p className="text-sm font-semibold text-blue-800">Resultado calculado automáticamente</p>
                                                    </div>
                                                    {autoData ? (
                                                        <>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                                                                    <p className="text-xs text-gray-500 mb-1">Órdenes recibidas</p>
                                                                    <p className="text-xl font-bold text-gray-800">{autoData.totalOrdenes}</p>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                                                                    <p className="text-xs text-gray-500 mb-1">Órdenes completadas</p>
                                                                    <p className="text-xl font-bold text-green-700">{autoData.ordenesAprobadas}</p>
                                                                </div>
                                                                <div className={`rounded-lg p-3 text-center border ${autoData.estado === 'verde' ? 'bg-green-50 border-green-200' : autoData.estado === 'amarillo' ? 'bg-yellow-50 border-yellow-200' : autoData.totalOrdenes > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-blue-100'}`}>
                                                                    <p className="text-xs text-gray-500 mb-1">Resultado</p>
                                                                    <p className={`text-xl font-bold ${autoData.estado === 'verde' ? 'text-green-700' : autoData.estado === 'amarillo' ? 'text-yellow-700' : autoData.totalOrdenes > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                                                                        {fmtNum(autoData.resultado)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {kpi.meta !== undefined && (
                                                                <p className="text-xs text-blue-600">Meta: {normalizarOperador(kpi.operadorMeta, kpi.sentido)} {fmtNum(kpi.meta)}% · Fórmula: (órdenes completadas / órdenes recibidas) × 100</p>
                                                            )}
                                                            {autoData.evidenciasOrdenes.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-600 mb-2">Evidencias de órdenes de trabajo ({autoData.evidenciasOrdenes.length})</p>
                                                                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                                                        {autoData.evidenciasOrdenes.map((ev, idx) => (
                                                                            <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                                                                                {ev.tipo.startsWith('image/') ? <Image className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> : <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                                                                                <span className="text-xs text-gray-500 truncate flex-1">{ev.ordenTitulo}</span>
                                                                                <a href={ev.archivoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex-shrink-0 flex items-center gap-1">
                                                                                    <Eye className="w-3 h-3" />Ver
                                                                                </a>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {autoData.evidenciasOrdenes.length === 0 && autoData.totalOrdenes > 0 && (
                                                                <p className="text-xs text-gray-400 italic">Las evidencias de las órdenes aún no han sido aprobadas.</p>
                                                            )}

                                                            {/* Respaldos de gracia */}
                                                            {autoData.respaldosGracia && autoData.respaldosGracia.length > 0 && (
                                                                <div className="pt-2 border-t border-blue-100">
                                                                    <p className="text-xs font-semibold text-gray-600 mb-2">Respaldos subidos en ventana de gracia ({autoData.respaldosGracia.length})</p>
                                                                    <div className="space-y-1.5">
                                                                        {autoData.respaldosGracia.map((r) => {
                                                                            const cfg = EVIDENCIA_STATUS[r.status];
                                                                            return (
                                                                                <div key={r.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                                                                                    {r.tipo.startsWith('image/') ? <Image className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> : <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-xs text-gray-700 truncate">{r.nombre}</p>
                                                                                        {r.nota && <p className="text-xs text-gray-400 italic truncate">"{r.nota}"</p>}
                                                                                        {r.motivoRechazo && <p className="text-xs text-red-600 truncate">Rechazo: {r.motivoRechazo}</p>}
                                                                                    </div>
                                                                                    {cfg && <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>}
                                                                                    <a href={r.archivoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex-shrink-0 flex items-center gap-1">
                                                                                        <Eye className="w-3 h-3" />Ver
                                                                                    </a>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    {autoData.estado === 'no_aplica' && (
                                                                        <p className="text-xs text-gray-600 mt-2">✓ Respaldo aprobado · Este KPI quedará como <strong>"No aplica"</strong> al cierre y no afectará tu promedio.</p>
                                                                    )}
                                                                    {respaldoEnRevision && !respaldoAprobado && (
                                                                        <p className="text-xs text-orange-600 mt-2">⏳ Tu respaldo está en revisión por tu jefe.</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Formulario de respaldo (solo durante la ventana de gracia) */}
                                                            {enGracia && (
                                                                <div className="pt-2 border-t border-blue-100">
                                                                    {mostrarFormSubida !== kpi.id ? (
                                                                        <button onClick={() => handleAbrirSubida(kpi.id)}
                                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors">
                                                                            <Plus className="w-4 h-4" />
                                                                            {autoData.totalOrdenes === 0 ? 'Subir respaldo (sin órdenes en el periodo)' : 'Subir respaldo o contexto adicional'}
                                                                        </button>
                                                                    ) : (
                                                                        <div className="space-y-3 p-4 bg-white rounded-xl border border-amber-200">
                                                                            <p className="text-sm font-semibold text-amber-800">Subir respaldo de gracia</p>
                                                                            <p className="text-xs text-gray-600">
                                                                                {autoData.totalOrdenes === 0
                                                                                    ? 'Adjunta evidencia de que durante el periodo no recibiste órdenes de trabajo (ej: capturas de bandeja, correos, etc).'
                                                                                    : 'Adjunta contexto adicional (ej: trabajos atendidos por fuera del sistema).'}
                                                                            </p>
                                                                            <div>
                                                                                <label className="text-xs font-medium text-gray-600 mb-1 block">Nota / justificación (opcional)</label>
                                                                                <textarea value={notaEvidencia} onChange={(e) => setNotaEvidencia(e.target.value)}
                                                                                    placeholder="Describe brevemente el contexto..." rows={2}
                                                                                    spellCheck={false}
                                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500" />
                                                                            </div>
                                                                            {subiendoEvidencia === kpi.id && (
                                                                                <div className="space-y-1.5">
                                                                                    <div className="flex justify-between text-xs text-gray-500">
                                                                                        <span>Subiendo archivo...</span>
                                                                                        <span className="font-medium">{uploadProgress}%</span>
                                                                                    </div>
                                                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                                        <div className="h-2 rounded-full bg-amber-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <p className="text-xs text-gray-400">Formatos: imágenes, video, PDF, Word, Excel · Máximo 30 MB.</p>
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => handleSeleccionarArchivo(kpi.id)}
                                                                                    disabled={subiendoEvidencia === kpi.id}
                                                                                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
                                                                                    {subiendoEvidencia === kpi.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                                                                                    {subiendoEvidencia === kpi.id ? 'Subiendo...' : 'Seleccionar archivo'}
                                                                                </button>
                                                                                {subiendoEvidencia !== kpi.id && (
                                                                                    <button onClick={() => setMostrarFormSubida(null)}
                                                                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                                                                        Cancelar
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-xs text-blue-600">Cargando resultado...</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Instrucción por tipo (solo para KPIs no automáticos) */}
                                            {!isAutomatic && <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${esBinario ? 'bg-gray-50 border border-gray-200' :
                                                esPrecision ? 'bg-teal-50 border border-teal-100' :
                                                    esMenorMejor ? 'bg-purple-50 border border-purple-100' :
                                                        'bg-green-50 border border-green-100'
                                                }`}>
                                                <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${esBinario ? 'text-gray-500' : esPrecision ? 'text-teal-500' : esMenorMejor ? 'text-purple-500' : 'text-green-500'}`} />
                                                <div className="space-y-1">
                                                    {esBinario && <p className="text-gray-700">Este KPI es de tipo <strong>Sí/No</strong>. Confirma que realizaste la actividad y sube la evidencia.</p>}
                                                    {kpi.tipoCalculo === 'tiempo' && <p className={esMenorMejor ? 'text-purple-700' : 'text-green-700'}>Registra el tiempo real. Meta: <strong>{normalizarOperador(kpi.operadorMeta, kpi.sentido)} {fmtConUnidad(kpi.meta, kpi.unidad)}</strong>. {esMenorMejor ? 'Menor es mejor.' : 'Mayor es mejor.'}</p>}
                                                    {kpi.tipoCalculo === 'conteo' && <p className={esMenorMejor ? 'text-purple-700' : 'text-green-700'}>Registra la cantidad real. Meta: <strong>{normalizarOperador(kpi.operadorMeta, kpi.sentido)} {fmtConUnidad(kpi.meta, kpi.unidad)}</strong>. {esMenorMejor ? 'Mientras menos, mejor.' : 'Mientras más, mejor.'}</p>}
                                                    {kpi.tipoCalculo === 'formula' && <p className="text-green-700">Calcula usando: <strong>{formulaDesc}</strong>. Ingresa el resultado y sube la evidencia.</p>}
                                                    {kpi.tipoCalculo === 'porcentaje' && <p className="text-green-700">Sube la evidencia del cumplimiento. Meta: <strong>{normalizarOperador(kpi.operadorMeta, kpi.sentido)} {fmtConUnidad(kpi.meta, kpi.unidad)}</strong>.</p>}
                                                    {esPrecision && (() => {
                                                        const f: FormulaCalculo = JSON.parse(kpi.formulaCalculo);
                                                        const modo = f.modoEvaluacion ?? 'tolerancia';
                                                        return (
                                                            <>
                                                                <p className="text-teal-700">Ingresa tu <strong>{f.labelObtenido ?? 'resultado obtenido'}</strong>. El valor de referencia es <strong>{f.valorEsperado} {kpi.unidad}</strong>.</p>
                                                                {modo === 'tolerancia'
                                                                    ? <p className="text-teal-600">Modo <strong>tolerancia ±{f.toleranciaPorc ?? 5}%</strong>: cumples si tu desviación es ≤ ese margen y la precisión ≥ <strong>{fmtNum(kpi.meta)}%</strong>.</p>
                                                                    : <p className="text-teal-600">Modo <strong>umbral directo</strong>: cumples si tu resultado {kpi.operadorMeta} {fmtNum(f.valorEsperado)} y la precisión ≥ <strong>{fmtNum(kpi.meta)}%</strong>.</p>
                                                                }
                                                            </>
                                                        );
                                                    })()}
                                                    {kpi.tipoCalculo === 'division' && (() => {
                                                        const f: FormulaCalculo = JSON.parse(kpi.formulaCalculo);
                                                        return <p className="text-purple-700">Fórmula: <strong>({f.numerador} / {f.denominador}) × {f.multiplicador}</strong>. Ingresa el resultado.</p>;
                                                    })()}
                                                    {kpi.tipoCalculo === 'acumulado_trimestral' && (() => {
                                                        const f: FormulaCalculo = JSON.parse(kpi.formulaCalculo);
                                                        const q = getTrimestreActual();
                                                        const metaQ = getMetaTrimestreActual(f);
                                                        return (
                                                            <>
                                                                <p className={esMenorMejor ? 'text-purple-700' : 'text-green-700'}>
                                                                    KPI de <strong>acumulado trimestral</strong>. Registra el valor acumulado hasta el cierre del <strong>{q}</strong>.
                                                                    {metaQ !== null && <> Meta del {q}: <strong>{fmtConUnidad(metaQ, kpi.unidad)}</strong>.</>}
                                                                </p>
                                                                {f.metaAnual !== undefined && (
                                                                    <p className="text-green-600 text-xs">
                                                                        Meta anual: {fmtConUnidad(f.metaAnual, kpi.unidad)}
                                                                        {metaQ !== null && <> · Meta {q}: {fmtConUnidad(metaQ, kpi.unidad)}</>}
                                                                    </p>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>}

                                            {/* Slots de evidencias (solo para KPIs no automáticos) */}
                                            {!isAutomatic && <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                    Evidencias {esBinario ? '' : `requeridas (${requeridas})`}
                                                </p>
                                                <div className="space-y-2">
                                                    {Array.from({ length: requeridas }).map((_, idx) => {
                                                        const evA = kpi.evidencias.filter((e) => e.status === 'aprobada');
                                                        const evR = kpi.evidencias.filter((e) => e.status === 'pendiente_revision');
                                                        const evX = kpi.evidencias.filter((e) => e.status === 'rechazada');
                                                        let slot: Evidencia | undefined;
                                                        if (idx < evA.length) slot = evA[idx];
                                                        else if (idx - evA.length < evR.length) slot = evR[idx - evA.length];
                                                        else if (idx - evA.length - evR.length < evX.length) slot = evX[idx - evA.length - evR.length];

                                                        const ss = slot?.status;
                                                        const sCfg = ss ? EVIDENCIA_STATUS[ss] : null;
                                                        const sCumpl = slot?.valorNumerico !== undefined ? evaluarCumplimiento(kpi, slot.valorNumerico) : null;

                                                        return (
                                                            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${ss === 'aprobada' ? 'bg-green-50 border-green-200' :
                                                                ss === 'pendiente_revision' ? 'bg-orange-50 border-orange-200' :
                                                                    ss === 'rechazada' ? 'bg-red-50 border-red-200' :
                                                                        'bg-gray-50 border-gray-200 border-dashed'
                                                                }`}>
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${ss === 'aprobada' ? 'bg-green-500 text-white' :
                                                                    ss === 'pendiente_revision' ? 'bg-orange-400 text-white' :
                                                                        ss === 'rechazada' ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-500'
                                                                    }`}>
                                                                    {ss === 'aprobada' ? '✓' : ss === 'pendiente_revision' ? '⏳' : ss === 'rechazada' ? '✗' : idx + 1}
                                                                </div>

                                                                {slot ? (
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                            <p className="text-xs font-medium text-gray-800 truncate">{slot.nombre}</p>
                                                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                                                <a href={slot.archivoUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-blue-600 rounded"><Eye className="w-3.5 h-3.5" /></a>
                                                                                <a href={slot.archivoUrl} download={slot.nombre} className="p-1 text-gray-400 hover:text-gray-700 rounded"><Download className="w-3.5 h-3.5" /></a>
                                                                                {slot.status === 'pendiente_revision' && (
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); handleEliminarEvidencia(slot!.id); }}
                                                                                        disabled={eliminandoEvidencia === slot.id}
                                                                                        title="Eliminar evidencia"
                                                                                        className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50 transition-colors">
                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                )}
                                                                                {sCfg && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sCfg.bg} ${sCfg.color}`}>{sCfg.label}</span>}
                                                                            </div>
                                                                        </div>
                                                                        {slot.valorNumerico !== undefined && (
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <p className="text-xs text-gray-500">
                                                                                    {esPrecision ? 'Precisión: ' : 'Valor: '}
                                                                                    <span className="font-medium">{esPrecision ? `${fmtNum(slot.valorNumerico)}%` : fmtConUnidad(slot.valorNumerico, kpi.unidad)}</span>
                                                                                </p>
                                                                                {sCumpl && <span className={`text-xs font-medium ${sCumpl === 'cumple' ? 'text-green-600' : 'text-red-600'}`}>{sCumpl === 'cumple' ? '✓ Cumple' : '✗ No cumple'}</span>}
                                                                            </div>
                                                                        )}
                                                                        {esBinario && slot.valorNumerico === 1 && <p className="text-xs text-green-600 mt-0.5">✓ Actividad confirmada</p>}
                                                                        {slot.nota && <p className="text-xs text-gray-500 mt-0.5 italic">"{slot.nota}"</p>}
                                                                        {slot.motivoRechazo && <p className="text-xs text-red-600 mt-0.5">Rechazo: {slot.motivoRechazo}</p>}
                                                                        {ss === 'rechazada' && !slot.apelacion && (
                                                                            <div className="mt-1.5">
                                                                                {apelandoEvidencia === slot.id ? (
                                                                                    <div className="space-y-1.5">
                                                                                        <textarea value={textoApelacion} onChange={(e) => setTextoApelacion(e.target.value)}
                                                                                            placeholder="¿Por qué consideras válida esta evidencia?" rows={2}
                                                                                            spellCheck={false}
                                                                                            className="w-full text-xs p-2 border border-gray-300 rounded-lg resize-none focus:ring-1 focus:ring-blue-500" />
                                                                                        <div className="flex gap-2">
                                                                                            <button onClick={() => handleApelar(slot!.id)} disabled={!textoApelacion.trim()} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50">Enviar</button>
                                                                                            <button onClick={() => { setApelandoEvidencia(null); setTextoApelacion(''); }} className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200">Cancelar</button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <button onClick={() => setApelandoEvidencia(slot!.id)} className="text-xs text-blue-600 hover:underline">Apelar rechazo</button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {slot.apelacion && <p className="text-xs text-blue-600 mt-0.5">Apelación enviada {slot.respuestaApelacion ? `· Resp: ${slot.respuestaApelacion}` : '· Pendiente'}</p>}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 flex-1 mt-0.5">{esBinario ? 'Evidencia pendiente' : `Evidencia ${idx + 1} pendiente`}</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>}

                                            {/* Evidencias adicionales (solo para KPIs no automáticos) */}
                                            {!isAutomatic && kpi.evidencias.length > requeridas && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Evidencias adicionales</p>
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
                                                                    <div className="flex items-center gap-1.5">
                                                                        <a href={ev.archivoUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-blue-600 rounded"><Eye className="w-3.5 h-3.5" /></a>
                                                                        {ev.status === 'pendiente_revision' && (
                                                                            <button
                                                                                onClick={() => handleEliminarEvidencia(ev.id)}
                                                                                disabled={eliminandoEvidencia === ev.id}
                                                                                title="Eliminar evidencia"
                                                                                className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50 transition-colors">
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        )}
                                                                        {evCfg && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${evCfg.bg} ${evCfg.color}`}>{evCfg.label}</span>}
                                                                    </div>
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
                                                        <button onClick={() => handleAbrirSubida(kpi.id)}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                                                            <Plus className="w-4 h-4" />
                                                            {falta > 0 ? `Subir evidencia requerida (${falta} pendiente${falta > 1 ? 's' : ''})` : 'Agregar evidencia extra'}
                                                        </button>
                                                    ) : (
                                                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                            <p className="text-sm font-semibold text-gray-700">{falta > 0 ? 'Subir evidencia requerida' : 'Agregar evidencia extra'}</p>

                                                            {/* Binario */}
                                                            {esBinario && (
                                                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                                                                    <input type="checkbox" checked={confirmadoBinario} onChange={(e) => setConfirmadoBinario(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-800">Confirmo que realicé esta actividad</p>
                                                                        <p className="text-xs text-gray-500 mt-0.5">{formulaDesc}</p>
                                                                    </div>
                                                                </label>
                                                            )}

                                                            {/* Precisión */}
                                                            {esPrecision && (() => {
                                                                const formula: FormulaCalculo = JSON.parse(kpi.formulaCalculo);
                                                                const modo = formula.modoEvaluacion ?? 'tolerancia';
                                                                const { precision, cumple, detalle } = calcularPrecision(formula, valorObtenido, kpi.meta, kpi.operadorMeta);

                                                                return (
                                                                    <div className="space-y-3">
                                                                        {/* Valor esperado — informativo */}
                                                                        <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg space-y-0.5">
                                                                            <p className="text-xs text-teal-700">
                                                                                <span className="font-medium">{formula.labelEsperado ?? 'Resultado esperado'}:</span>{' '}
                                                                                <span className="font-bold">{formula.valorEsperado} {kpi.unidad}</span>
                                                                                <span className="ml-1 text-teal-500">(definido por el sistema)</span>
                                                                            </p>
                                                                            {modo === 'tolerancia' && <p className="text-xs text-teal-600">Tolerancia permitida: ±{formula.toleranciaPorc ?? 5}%</p>}
                                                                            {modo === 'umbral' && <p className="text-xs text-teal-600">Tu resultado debe ser {kpi.operadorMeta} {formula.valorEsperado}</p>}
                                                                        </div>

                                                                        {/* Resultado obtenido */}
                                                                        <div>
                                                                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                                                                                {formula.labelObtenido ?? 'Resultado obtenido'} <span className="text-red-500">*</span>
                                                                            </label>
                                                                            <div className="flex items-center gap-2">
                                                                                <input type="number" value={valorObtenido} onChange={(e) => setValorObtenido(e.target.value)}
                                                                                    placeholder="0" step="any"
                                                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                                                                                {kpi.unidad && <span className="text-sm text-gray-500 font-medium">{kpi.unidad}</span>}
                                                                            </div>
                                                                        </div>

                                                                        {/* Feedback en tiempo real */}
                                                                        {precision !== null && (
                                                                            <div className={`p-2.5 rounded-lg text-xs font-medium space-y-0.5 ${cumple ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                                                <p>Precisión calculada: <strong>{fmtNum(precision)}%</strong></p>
                                                                                <p>{detalle}</p>
                                                                                {kpi.meta !== undefined && <p>{cumple ? `✓ Cumple la meta de precisión (≥ ${fmtNum(kpi.meta)}%)` : `✗ No cumple la meta de precisión (≥ ${fmtNum(kpi.meta)}%)`}</p>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}

                                                            {/* Valor numérico genérico */}
                                                            {necesitaValor && (
                                                                <div>
                                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">{getValorLabel(kpi)} <span className="text-red-500">*</span></label>
                                                                    <div className="flex items-center gap-2">
                                                                        <input type="number" value={valorNumerico} onChange={(e) => setValorNumerico(e.target.value)}
                                                                            placeholder="0" min="0" step="any"
                                                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                                                        {kpi.unidad && <span className="text-sm text-gray-500 font-medium">{kpi.unidad}</span>}
                                                                    </div>
                                                                    {valorNumerico && (() => {
                                                                        const val = parseFloat(valorNumerico);
                                                                        if (isNaN(val)) return null;
                                                                        if (kpi.tipoCalculo === 'acumulado_trimestral') {
                                                                            try {
                                                                                const f: FormulaCalculo = JSON.parse(kpi.formulaCalculo);
                                                                                const q = getTrimestreActual();
                                                                                const metaQ = getMetaTrimestreActual(f);
                                                                                if (metaQ === null) return null;
                                                                                const opAT = kpi.sentido === 'Menor es mejor' ? '<=' : '>=';
                                                                                const cumple = evaluarOperador(val, opAT, metaQ);
                                                                                return (
                                                                                    <p className={`text-xs mt-1.5 font-medium ${cumple ? 'text-green-600' : 'text-red-600'}`}>
                                                                                        {cumple ? `✓ Cumple meta ${q} (${opAT} ${fmtConUnidad(metaQ, kpi.unidad)})` : `✗ No cumple meta ${q} (${opAT} ${fmtConUnidad(metaQ, kpi.unidad)})`}
                                                                                    </p>
                                                                                );
                                                                            } catch { return null; }
                                                                        }
                                                                        if (kpi.meta === undefined) return null;
                                                                        const res = evaluarCumplimiento(kpi, val);
                                                                        const opShow = normalizarOperador(kpi.operadorMeta, kpi.sentido);
                                                                        return res ? (
                                                                            <p className={`text-xs mt-1.5 font-medium ${res === 'cumple' ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {res === 'cumple' ? `✓ Cumple (${opShow} ${fmtConUnidad(kpi.meta, kpi.unidad)})` : `✗ No cumple (${opShow} ${fmtConUnidad(kpi.meta, kpi.unidad)})`}
                                                                            </p>
                                                                        ) : null;
                                                                    })()}
                                                                    {kpi.tipoCalculo === 'formula' && <p className="text-xs text-gray-400 mt-1">Fórmula: {formulaDesc}</p>}
                                                                </div>
                                                            )}

                                                            {/* Nota */}
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 mb-1 block">Nota (opcional)</label>
                                                                <textarea value={notaEvidencia} onChange={(e) => setNotaEvidencia(e.target.value)}
                                                                    placeholder="Describe brevemente qué evidencia es..." rows={2}
                                                                    spellCheck={false}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500" />
                                                            </div>

                                                            {/* Barra de progreso */}
                                                            {cargando && (
                                                                <div className="space-y-1.5">
                                                                    <div className="flex justify-between text-xs text-gray-500">
                                                                        <span>Subiendo archivo...</span>
                                                                        <span className="font-medium">{uploadProgress}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                        <div
                                                                            className="h-2 rounded-full bg-blue-500 transition-all duration-200"
                                                                            style={{ width: `${uploadProgress}%` }}
                                                                        />
                                                                    </div>
                                                                    {uploadProgress === 100 && (
                                                                        <p className="text-xs text-blue-600">Procesando en el servidor...</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <p className="text-xs text-gray-400">
                                                                Formatos: imágenes, video, PDF, Word, Excel · Máximo <span className="font-medium">30 MB</span> por archivo
                                                            </p>

                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleSeleccionarArchivo(kpi.id)}
                                                                    disabled={cargando || (esBinario && !confirmadoBinario) || (necesitaValor && !valorNumerico) || (esPrecision && !valorObtenido)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                                                                    {cargando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                                                                    {cargando ? 'Subiendo...' : 'Seleccionar archivo'}
                                                                </button>
                                                                {!cargando && (
                                                                    <button onClick={() => setMostrarFormSubida(null)}
                                                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                                                        Cancelar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Nota del KPI */}
                                            <div className="pt-2 border-t border-gray-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                                        <StickyNote className="w-3.5 h-3.5" /> Nota del período
                                                    </p>
                                                    {!editandoNota && (
                                                        <button onClick={() => { setEditandoNota(kpi.id); setTextoNota(kpi.notaKPI ?? ''); }} className="text-xs text-blue-600 hover:underline">
                                                            {kpi.notaKPI ? 'Editar' : 'Agregar nota'}
                                                        </button>
                                                    )}
                                                </div>
                                                {editandoNota === kpi.id ? (
                                                    <div className="space-y-2">
                                                        <textarea value={textoNota} onChange={(e) => setTextoNota(e.target.value)}
                                                            placeholder="Agrega observaciones, contexto o comentarios sobre este KPI..." rows={3}
                                                            spellCheck={false}
                                                            className="w-full text-xs p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500" />
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleGuardarNota(kpi.id)} disabled={guardandoNota}
                                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                                                                {guardandoNota ? 'Guardando...' : 'Guardar'}
                                                            </button>
                                                            <button onClick={() => { setEditandoNota(null); setTextoNota(''); }}
                                                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : kpi.notaKPI ? (
                                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                                        <p className="text-xs text-amber-800 leading-relaxed">{kpi.notaKPI}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic">Sin nota para este período</p>
                                                )}
                                            </div>

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
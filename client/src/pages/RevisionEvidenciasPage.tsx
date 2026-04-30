import { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Clock, Eye, FileText, Image, Download,
    ChevronDown, ChevronUp, AlertCircle, Filter, RefreshCw,
    ClipboardList, Target, User, Calendar, MessageSquare,
    ChevronLeft, ChevronRight, Search, TrendingUp,
} from 'lucide-react';
import { kpisService } from '../services/kpis.service';
import { ordenesTrabajoService } from '../services/ordenes-trabajo.service';
import Layout from '../components/layout/Layout';
import apiClient from '../services/api.service';

// ─── Tipos ────────────────────────────────────────────────────────────────────

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
        descripcion?: string;
        tipoCalculo: string;
        formulaCalculo?: string;
        tipoCriticidad: string;
        meta?: number;
        operadorMeta?: string;
        sentido?: string;
        unidad?: string;
        area: string;
    };
    empleado: {
        nombre: string;
        apellido: string;
        puesto?: { nombre: string };
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
            id: string;
            titulo: string;
            fechaLimite?: string;
            empleado: { nombre: string; apellido: string };
            kpi: { key: string; indicador: string } | null;
        };
    };
}

type TipoVista = 'kpis' | 'ordenes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-HN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

const formatTamanio = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getIconoArchivo = (tipo: string) => tipo.startsWith('image/') ? Image : FileText;

const CRITICIDAD_CFG: Record<string, { bg: string; text: string; label: string }> = {
    critico: { bg: 'bg-red-100', text: 'text-red-700', label: 'Crítico' },
    importante: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Importante' },
    no_critico: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Normal' },
};

const POR_PAGINA = 10;

// ─── Helper: evaluar cumplimiento ────────────────────────────────────────────

function evalOp(valor: number, op: string, meta: number): boolean {
    switch (op) {
        case '>=': return valor >= meta;
        case '>':  return valor > meta;
        case '<=': return valor <= meta;
        case '<':  return valor < meta;
        case '=':  return valor === meta;
        default:   return valor >= meta;
    }
}

// Cuando operador = '=' y hay sentido, se interpreta como >= (Mayor es mejor)
// o <= (Menor es mejor): superar la meta sigue siendo cumplir.
function normalizarOp(operador: string | undefined, sentido: string | undefined): string {
    const esMenorMejor = sentido === 'Menor es mejor';
    if (!operador) return esMenorMejor ? '<=' : '>=';
    if (operador === '=' && sentido) return esMenorMejor ? '<=' : '>=';
    return operador;
}

function BadgeCumple({ cumple }: { cumple: boolean }) {
    return cumple
        ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✓ Cumple meta</span>
        : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">✗ No cumple meta</span>;
}

function ValorReportado({ evidencia }: { evidencia: EvidenciaKPI }) {
    const { tipoCalculo, formulaCalculo, meta, operadorMeta, sentido, unidad } = evidencia.kpi;
    const val = evidencia.valorNumerico;

    if (val === undefined || val === null) return null;

    let formula: Record<string, any> = {};
    try { if (formulaCalculo) formula = JSON.parse(formulaCalculo); } catch { /* noop */ }

    const op = normalizarOp(operadorMeta, sentido);
    const cumple = meta !== undefined ? evalOp(val, op, meta) : null;

    const Wrap = ({ children }: { children: React.ReactNode }) => (
        <div className="flex items-center gap-3 flex-wrap p-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-blue-700 shrink-0">Valor reportado:</span>
            {children}
        </div>
    );

    switch (tipoCalculo) {
        case 'binario':
        case 'dashboard_presentado':
            return (
                <Wrap>
                    <span className="text-sm font-semibold text-green-700">
                        ✓ Empleado reporta haber cumplido la actividad
                    </span>
                </Wrap>
            );

        case 'division':
        case 'formula': {
            const mult = formula.multiplicador && formula.multiplicador !== 1 ? ` × ${formula.multiplicador}` : '';
            const desc = formula.numerador && formula.denominador
                ? <span className="text-xs text-blue-600">({formula.numerador} / {formula.denominador}{mult})</span>
                : null;
            return (
                <Wrap>
                    <span className="text-sm font-bold text-blue-900">{val} {unidad}</span>
                    {desc}
                    {cumple !== null && <BadgeCumple cumple={cumple} />}
                    {meta !== undefined && (
                        <span className="text-xs text-gray-500">Meta: {op} {meta} {unidad}</span>
                    )}
                </Wrap>
            );
        }

        case 'conteo': {
            const target = formula.target ? <span className="text-xs text-blue-600">de {formula.target}</span> : null;
            return (
                <Wrap>
                    <span className="text-sm font-bold text-blue-900">{val} {unidad}</span>
                    {target}
                    {cumple !== null && <BadgeCumple cumple={cumple} />}
                    {meta !== undefined && (
                        <span className="text-xs text-gray-500">Meta: {op} {meta}</span>
                    )}
                </Wrap>
            );
        }

        case 'precision': {
            const labelEsp = formula.labelEsperado ? `${formula.labelEsperado} = ${formula.valorEsperado}` : null;
            return (
                <Wrap>
                    <span className="text-sm font-bold text-blue-900">Precisión: {val}%</span>
                    {labelEsp && <span className="text-xs text-blue-600">Esperado: {labelEsp}</span>}
                    {cumple !== null && <BadgeCumple cumple={cumple} />}
                    {meta !== undefined && (
                        <span className="text-xs text-gray-500">Meta: {op} {meta}%</span>
                    )}
                </Wrap>
            );
        }

        case 'porcentaje_kpis_equipo':
            return (
                <Wrap>
                    <span className="text-sm font-bold text-blue-900">{val}% del equipo</span>
                    {cumple !== null && <BadgeCumple cumple={cumple} />}
                    {meta !== undefined && (
                        <span className="text-xs text-gray-500">Meta: {op} {meta}%</span>
                    )}
                </Wrap>
            );

        default:
            return (
                <Wrap>
                    <span className="text-sm font-bold text-blue-900">{val} {unidad}</span>
                    {cumple !== null && <BadgeCumple cumple={cumple} />}
                </Wrap>
            );
    }
}

// ─── Helper: fórmula legible ──────────────────────────────────────────────────

const TIPO_CALCULO_LABEL: Record<string, string> = {
    binario: 'Binario (Sí / No)',
    division: 'División',
    conteo: 'Conteo',
    precision: 'Precisión',
    porcentaje_kpis_equipo: '% KPIs del equipo',
    dashboard_presentado: 'Dashboard presentado',
};

function renderFormulaLegible(tipoCalculo: string, formulaCalculo?: string): React.ReactNode {
    if (!formulaCalculo) return null;
    let formula: Record<string, any> = {};
    try { formula = JSON.parse(formulaCalculo); } catch { return null; }

    switch (tipoCalculo) {
        case 'binario':
            return formula.descripcion
                ? <span>Condición: <strong>{formula.descripcion}</strong></span>
                : <span>Debe cumplirse la condición (Sí / No)</span>;

        case 'division': {
            const mult = formula.multiplicador && formula.multiplicador !== 1
                ? ` × ${formula.multiplicador}`
                : '';
            const inv = formula.invertir ? ' (invertido)' : '';
            return (
                <span>
                    <strong>{formula.numerador || '—'}</strong>
                    {' / '}
                    <strong>{formula.denominador || '—'}</strong>
                    {mult}{inv}
                </span>
            );
        }

        case 'conteo':
            return formula.target
                ? <span>Conteo de: <strong>{formula.target}</strong>{formula.filtro ? ` — filtro: ${formula.filtro}` : ''}</span>
                : <span>Conteo de registros</span>;

        case 'precision':
            return (
                <span>
                    {formula.labelEsperado && <><strong>{formula.labelEsperado}</strong>{' = '}</>}
                    <strong>{formula.valorEsperado ?? '—'}</strong>
                    {formula.modoEvaluacion === 'tolerancia' && formula.toleranciaPorc != null
                        ? ` (tolerancia ±${formula.toleranciaPorc}%)`
                        : ''}
                </span>
            );

        case 'porcentaje_kpis_equipo':
            return <span>Porcentaje de KPIs del equipo que cumplen la meta</span>;

        case 'dashboard_presentado':
            return <span>Se valida si el dashboard fue presentado</span>;

        default:
            return null;
    }
}

// ─── Tarjeta KPI ──────────────────────────────────────────────────────────────

function TarjetaEvidenciaKPI({ evidencia, onRevisar, onResponderApelacion }: {
    evidencia: EvidenciaKPI;
    onRevisar: (id: string, status: 'aprobada' | 'rechazada', motivo?: string) => Promise<void>;
    onResponderApelacion: (id: string, respuesta: string, confirmaRechazo: boolean) => Promise<void>;
}) {
    const [expandida, setExpandida] = useState(false);
    const [mostrarRechazo, setMostrarRechazo] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [mostrarApelacion, setMostrarApelacion] = useState(false);
    const [respuestaApelacion, setRespuestaApelacion] = useState('');
    const [confirmaRechazo, setConfirmaRechazo] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const IconoArchivo = getIconoArchivo(evidencia.tipo);
    const criticidadCfg = CRITICIDAD_CFG[evidencia.kpi.tipoCriticidad] ?? CRITICIDAD_CFG.no_critico;

    const handleAprobar = async () => { setProcesando(true); await onRevisar(evidencia.id, 'aprobada'); setProcesando(false); };
    const handleRechazar = async () => {
        if (!motivoRechazo.trim()) return;
        setProcesando(true);
        await onRevisar(evidencia.id, 'rechazada', motivoRechazo);
        setProcesando(false); setMostrarRechazo(false); setMotivoRechazo('');
    };
    const handleResponder = async () => {
        if (!respuestaApelacion.trim()) return;
        setProcesando(true);
        await onResponderApelacion(evidencia.id, respuestaApelacion, confirmaRechazo);
        setProcesando(false); setMostrarApelacion(false); setRespuestaApelacion(''); setConfirmaRechazo(false);
    };

    return (
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${evidencia.apelacion ? 'border-amber-300' : 'border-gray-200'}`}>
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-50 rounded-lg shrink-0"><Target className="w-5 h-5 text-blue-600" /></div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-mono text-gray-400">{evidencia.kpi?.key}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${criticidadCfg.bg} ${criticidadCfg.text}`}>{criticidadCfg.label}</span>
                                {evidencia.esFueraDeTiempo && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Fuera de tiempo</span>}
                                {evidencia.intento > 1 && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Intento #{evidencia.intento}</span>}
                                {evidencia.apelacion && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1"><MessageSquare className="w-3 h-3" />Apelación</span>}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{evidencia.kpi?.indicador}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />{evidencia.empleado.nombre} {evidencia.empleado.apellido}
                                    {evidencia.empleado.puesto && ` — ${evidencia.empleado.puesto.nombre}`}
                                </span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatFecha(evidencia.fechaSubida)}</span>
                                <span>{evidencia.kpi.area}</span>
                                <span>Período: {evidencia.periodo}</span>
                                {evidencia.kpi.meta !== undefined && (
                                    <span className="font-medium text-gray-600">Meta: {normalizarOp(evidencia.kpi.operadorMeta, evidencia.kpi.sentido)} {evidencia.kpi.meta} {evidencia.kpi.unidad}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setExpandida(!expandida)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            {expandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button onClick={handleAprobar} disabled={procesando}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                            <CheckCircle className="w-4 h-4" />Aprobar
                        </button>
                        <button onClick={() => setMostrarRechazo(!mostrarRechazo)} disabled={procesando}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                            <XCircle className="w-4 h-4" />Rechazar
                        </button>
                    </div>
                </div>

                {mostrarRechazo && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-800 mb-2">Motivo de rechazo <span className="text-red-500">*</span></p>
                        <textarea value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)}
                            placeholder="Explica por qué rechazas esta evidencia..."
                            className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 resize-none" rows={3} />
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => { setMostrarRechazo(false); setMotivoRechazo(''); }}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleRechazar} disabled={!motivoRechazo.trim() || procesando}
                                className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Confirmar rechazo</button>
                        </div>
                    </div>
                )}

                {evidencia.apelacion && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />Apelación del empleado:
                        </p>
                        <p className="text-sm text-amber-900 mb-3">{evidencia.apelacion}</p>
                        <button onClick={() => setMostrarApelacion(!mostrarApelacion)}
                            className="text-xs font-medium text-amber-700 hover:text-amber-900 underline">
                            {mostrarApelacion ? 'Cancelar' : 'Responder apelación'}
                        </button>
                        {mostrarApelacion && (
                            <div className="mt-3 space-y-3">
                                <textarea value={respuestaApelacion} onChange={(e) => setRespuestaApelacion(e.target.value)}
                                    placeholder="Escribe tu respuesta..."
                                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 resize-none" rows={3} />
                                <label className="flex items-center gap-2 cursor-pointer p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <input type="checkbox" checked={confirmaRechazo} onChange={(e) => setConfirmaRechazo(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-red-600" />
                                    <div>
                                        <p className="text-xs font-medium text-red-800">Mantener rechazo</p>
                                        <p className="text-xs text-red-600">Sin marcar, la evidencia queda aprobada</p>
                                    </div>
                                </label>
                                <button onClick={handleResponder} disabled={!respuestaApelacion.trim() || procesando}
                                    className={`w-full px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 ${confirmaRechazo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                    {procesando ? 'Guardando...' : confirmaRechazo ? 'Mantener rechazo' : 'Aprobar evidencia'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {expandida && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-3">

                    {/* ── Requisitos del KPI ── */}
                    <div className="p-4 bg-white rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-blue-700 mb-3 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />Requisitos del KPI
                        </p>
                        <div className="space-y-2">
                            {/* Nombre */}
                            <div className="flex gap-2">
                                <span className="text-xs text-gray-500 w-24 shrink-0">Nombre</span>
                                <span className="text-xs font-medium text-gray-900">{evidencia.kpi?.indicador}</span>
                            </div>
                            {/* Descripción */}
                            {evidencia.kpi.descripcion && (
                                <div className="flex gap-2">
                                    <span className="text-xs text-gray-500 w-24 shrink-0">Descripción</span>
                                    <span className="text-xs text-gray-700">{evidencia.kpi.descripcion}</span>
                                </div>
                            )}
                            {/* Tipo de cálculo */}
                            <div className="flex gap-2">
                                <span className="text-xs text-gray-500 w-24 shrink-0">Tipo</span>
                                <span className="text-xs font-medium text-gray-700">
                                    {TIPO_CALCULO_LABEL[evidencia.kpi.tipoCalculo] ?? evidencia.kpi.tipoCalculo}
                                </span>
                            </div>
                            {/* Fórmula */}
                            {(() => {
                                const fl = renderFormulaLegible(evidencia.kpi.tipoCalculo, evidencia.kpi.formulaCalculo);
                                return fl ? (
                                    <div className="flex gap-2">
                                        <span className="text-xs text-gray-500 w-24 shrink-0">Fórmula</span>
                                        <span className="text-xs text-gray-700">{fl}</span>
                                    </div>
                                ) : null;
                            })()}
                            {/* Meta */}
                            {evidencia.kpi.meta !== undefined && evidencia.kpi.meta !== null && (
                                <div className="flex gap-2">
                                    <span className="text-xs text-gray-500 w-24 shrink-0">Meta</span>
                                    <span className="text-xs font-semibold text-green-700">
                                        {normalizarOp(evidencia.kpi.operadorMeta, evidencia.kpi.sentido)} {evidencia.kpi.meta} {evidencia.kpi.unidad}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Archivo de evidencia ── */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-gray-100 rounded-lg"><IconoArchivo className="w-5 h-5 text-gray-600" /></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{evidencia.nombre}</p>
                            {evidencia.tamanio && <p className="text-xs text-gray-500">{formatTamanio(evidencia.tamanio)}</p>}
                        </div>
                        <a href={evidencia.archivoUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye className="w-4 h-4" />Ver
                        </a>
                        <a href={evidencia.archivoUrl} download
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Download className="w-4 h-4" />Descargar
                        </a>
                    </div>
                    {evidencia.tipo.startsWith('image/') && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 max-h-64">
                            <img src={evidencia.archivoUrl} alt="Evidencia" className="w-full h-full object-contain bg-gray-100" />
                        </div>
                    )}
                    <ValorReportado evidencia={evidencia} />
                    {evidencia.nota && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" />Nota del empleado:</p>
                            <p className="text-sm text-gray-700">{evidencia.nota}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Tarjeta Orden ────────────────────────────────────────────────────────────

function TarjetaEvidenciaOrden({ evidencia, onRevisar }: {
    evidencia: EvidenciaOrden;
    onRevisar: (id: string, status: 'aprobada' | 'rechazada', motivo?: string) => Promise<void>;
}) {
    const [expandida, setExpandida] = useState(false);
    const [mostrarRechazo, setMostrarRechazo] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [procesando, setProcesando] = useState(false);
    const IconoArchivo = getIconoArchivo(evidencia.tipo);

    const handleAprobar = async () => { setProcesando(true); await onRevisar(evidencia.id, 'aprobada'); setProcesando(false); };
    const handleRechazar = async () => {
        if (!motivoRechazo.trim()) return;
        setProcesando(true);
        await onRevisar(evidencia.id, 'rechazada', motivoRechazo);
        setProcesando(false); setMostrarRechazo(false); setMotivoRechazo('');
    };

    const diasRestantes = evidencia.tarea.ordenTrabajo.fechaLimite
        ? Math.ceil((new Date(evidencia.tarea.ordenTrabajo.fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${evidencia.esFueraDeTiempo ? 'border-red-300' : 'border-gray-200'}`}>
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-purple-50 rounded-lg shrink-0"><ClipboardList className="w-5 h-5 text-purple-600" /></div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-mono text-gray-400">{evidencia.tarea.ordenTrabajo.kpi?.key ?? 'Personalizado'}</span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Tarea {evidencia.tarea.orden}</span>
                                {evidencia.esFueraDeTiempo && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Fuera de tiempo</span>}
                                {evidencia.intento > 1 && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Intento #{evidencia.intento}</span>}
                                {evidencia.apelacion && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1"><MessageSquare className="w-3 h-3" />Apelación</span>}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{evidencia.tarea.ordenTrabajo.titulo}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{evidencia.tarea.descripcion}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{evidencia.tarea.ordenTrabajo.empleado.nombre} {evidencia.tarea.ordenTrabajo.empleado.apellido}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatFecha(evidencia.fechaSubida)}</span>
                                {diasRestantes !== null && (
                                    <span className={`font-medium ${diasRestantes < 0 ? 'text-red-600' : diasRestantes <= 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                                        {diasRestantes < 0 ? `Venció hace ${Math.abs(diasRestantes)}d` : `${diasRestantes}d restantes`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setExpandida(!expandida)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            {expandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button onClick={handleAprobar} disabled={procesando}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                            <CheckCircle className="w-4 h-4" />Aprobar
                        </button>
                        <button onClick={() => setMostrarRechazo(!mostrarRechazo)} disabled={procesando}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                            <XCircle className="w-4 h-4" />Rechazar
                        </button>
                    </div>
                </div>

                {mostrarRechazo && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-800 mb-2">Motivo de rechazo <span className="text-red-500">*</span></p>
                        <textarea value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)}
                            placeholder="Explica por qué rechazas esta evidencia..."
                            className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 resize-none" rows={3} />
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => { setMostrarRechazo(false); setMotivoRechazo(''); }}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleRechazar} disabled={!motivoRechazo.trim() || procesando}
                                className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Confirmar rechazo</button>
                        </div>
                    </div>
                )}

                {evidencia.apelacion && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-semibold text-amber-800 mb-1">Apelación del empleado:</p>
                        <p className="text-sm text-amber-900">{evidencia.apelacion}</p>
                    </div>
                )}
            </div>

            {expandida && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-gray-100 rounded-lg"><IconoArchivo className="w-5 h-5 text-gray-600" /></div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{evidencia.nombre}</p></div>
                        <a href={evidencia.archivoUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye className="w-4 h-4" />Ver
                        </a>
                        <a href={evidencia.archivoUrl} download
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Download className="w-4 h-4" />Descargar
                        </a>
                    </div>
                    {evidencia.tipo.startsWith('image/') && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 max-h-64">
                            <img src={evidencia.archivoUrl} alt="Evidencia" className="w-full h-full object-contain bg-gray-100" />
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

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RevisionEvidenciasPage() {
    const [tipoVista, setTipoVista] = useState<TipoVista>('kpis');
    const [evidenciasKPI, setEvidenciasKPI] = useState<EvidenciaKPI[]>([]);
    const [evidenciasOrden, setEvidenciasOrden] = useState<EvidenciaOrden[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [resultadosAuto, setResultadosAuto] = useState<any[]>([]);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroCriticidad, setFiltroCriticidad] = useState('todas');
    const [filtroFueraDeTiempo, setFiltroFueraDeTiempo] = useState(false);
    const [filtroConApelacion, setFiltroConApelacion] = useState(false);

    // Paginación
    const [paginaKPI, setPaginaKPI] = useState(1);
    const [paginaOrden, setPaginaOrden] = useState(1);

    useEffect(() => { cargarEvidencias(); }, [tipoVista]);
    useEffect(() => { cargarResultadosAuto(); }, []);
    useEffect(() => { setPaginaKPI(1); }, [busqueda, filtroCriticidad, filtroFueraDeTiempo, filtroConApelacion]);
    useEffect(() => { setPaginaOrden(1); }, [busqueda]);

    const getPeriodoActual = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const cargarResultadosAuto = async () => {
        try {
            const data = await kpisService.getResultadosAutoEquipo(getPeriodoActual());
            setResultadosAuto(Array.isArray(data) ? data : []);
        } catch { /* silencioso */ }
    };

    const cargarEvidencias = async (silencioso = false) => {
        if (!silencioso) setLoading(true);
        else setRefreshing(true);
        try {
            if (tipoVista === 'kpis') {
                const data = await kpisService.getEvidenciasPendientes();
                setEvidenciasKPI(data);
            } else {
                const res = await apiClient.get('/ordenes-trabajo/evidencias-pendientes');
                setEvidenciasOrden(res.data);
            }
        } catch (error) {
            console.error('Error al cargar evidencias:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRevisarKPI = async (id: string, status: 'aprobada' | 'rechazada', motivo?: string) => {
        try {
            await kpisService.revisarEvidencia(id, { status, motivoRechazo: motivo });
            setEvidenciasKPI((prev) => prev.filter((e) => e.id !== id));
        } catch (error) { console.error(error); }
    };

    const handleResponderApelacionKPI = async (id: string, respuesta: string, confirmaRechazo: boolean) => {
        try {
            await apiClient.post(`/kpis/evidencias/${id}/responder-apelacion`, { respuesta, confirmaRechazo });
            setEvidenciasKPI((prev) => prev.filter((e) => e.id !== id));
        } catch (error) { console.error(error); }
    };

    const handleRevisarOrden = async (id: string, status: 'aprobada' | 'rechazada', motivo?: string) => {
        try {
            await ordenesTrabajoService.revisarEvidencia(id, status, motivo);
            setEvidenciasOrden((prev) => prev.filter((e) => e.id !== id));
        } catch (error) { console.error(error); }
    };

    // Filtrado
    const kpisFiltrados = evidenciasKPI.filter((e) => {
        const nombre = `${e.empleado.nombre} ${e.empleado.apellido}`.toLowerCase();
        const kpi = (e.kpi?.indicador ?? '').toLowerCase();
        return (!busqueda || nombre.includes(busqueda.toLowerCase()) || kpi.includes(busqueda.toLowerCase()))
            && (filtroCriticidad === 'todas' || e.kpi.tipoCriticidad === filtroCriticidad)
            && (!filtroFueraDeTiempo || e.esFueraDeTiempo)
            && (!filtroConApelacion || !!e.apelacion);
    });

    const ordenesFiltradas = evidenciasOrden.filter((e) => {
        if (!busqueda) return true;
        const nombre = `${e.tarea.ordenTrabajo.empleado.nombre} ${e.tarea.ordenTrabajo.empleado.apellido}`.toLowerCase();
        return nombre.includes(busqueda.toLowerCase()) || e.tarea.ordenTrabajo.titulo.toLowerCase().includes(busqueda.toLowerCase());
    });

    // Paginación
    const totalKPIs = kpisFiltrados.length;
    const totalOrdenes = ordenesFiltradas.length;
    const totalPaginasKPI = Math.max(1, Math.ceil(totalKPIs / POR_PAGINA));
    const totalPaginasOrden = Math.max(1, Math.ceil(totalOrdenes / POR_PAGINA));
    const kpisPaginados = kpisFiltrados.slice((paginaKPI - 1) * POR_PAGINA, paginaKPI * POR_PAGINA);
    const ordenesPaginadas = ordenesFiltradas.slice((paginaOrden - 1) * POR_PAGINA, paginaOrden * POR_PAGINA);
    const hayFiltros = busqueda || filtroCriticidad !== 'todas' || filtroFueraDeTiempo || filtroConApelacion;

    const paginaActual = tipoVista === 'kpis' ? paginaKPI : paginaOrden;
    const setPagina = tipoVista === 'kpis' ? setPaginaKPI : setPaginaOrden;
    const totalPaginas = tipoVista === 'kpis' ? totalPaginasKPI : totalPaginasOrden;
    const totalActual = tipoVista === 'kpis' ? totalKPIs : totalOrdenes;
    const totalRaw = tipoVista === 'kpis' ? evidenciasKPI.length : evidenciasOrden.length;

    return (
        <Layout>
            <div className="p-8 space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Revisión de Evidencias</h1>
                        <p className="text-gray-600 mt-1">Revisa y aprueba las evidencias enviadas por tu equipo</p>
                    </div>
                    <button onClick={() => cargarEvidencias(true)} disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'KPIs pendientes', value: evidenciasKPI.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Target },
                        { label: 'Órdenes pendientes', value: evidenciasOrden.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: ClipboardList },
                        { label: 'Total a revisar', value: evidenciasKPI.length + evidenciasOrden.length, color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">{s.label}</p>
                                        <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${s.bg}`}><Icon className={`w-6 h-6 ${s.color}`} /></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Panel KPIs Automáticos */}
                {resultadosAuto.length > 0 && (
                    <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 border-b border-blue-100">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <p className="text-sm font-semibold text-blue-800">KPIs Automáticos del Equipo — {getPeriodoActual()}</p>
                            <span className="text-xs text-blue-500">(división × órdenes de trabajo)</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Empleado</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">KPI</th>
                                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Completadas</th>
                                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Recibidas</th>
                                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Resultado</th>
                                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Meta</th>
                                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultadosAuto.map((r, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="px-5 py-2.5 font-medium text-gray-800">{r.empleado}</td>
                                            <td className="px-4 py-2.5 text-gray-600">
                                                <p className="font-mono text-xs text-blue-600">{r.kpiKey}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-48">{r.kpiIndicador}</p>
                                            </td>
                                            <td className="px-4 py-2.5 text-center font-bold text-green-700">{r.ordenesAprobadas}</td>
                                            <td className="px-4 py-2.5 text-center text-gray-600">{r.totalOrdenes}</td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className="font-bold text-gray-800">{r.resultado.toFixed(1)}%</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-xs text-gray-500">
                                                {r.meta !== null && r.meta !== undefined ? `≥ ${r.meta}%` : '—'}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.estado === 'verde' ? 'bg-green-100 text-green-700' : r.estado === 'amarillo' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    {r.estado === 'verde' ? '✓ Cumple' : r.estado === 'amarillo' ? '⚠ Cerca' : '✗ No cumple'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
                    <button onClick={() => setTipoVista('kpis')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tipoVista === 'kpis' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <Target className="w-4 h-4" />KPIs
                        {evidenciasKPI.length > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tipoVista === 'kpis' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                {evidenciasKPI.length}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setTipoVista('ordenes')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tipoVista === 'ordenes' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <ClipboardList className="w-4 h-4" />Órdenes
                        {evidenciasOrden.length > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tipoVista === 'ordenes' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'}`}>
                                {evidenciasOrden.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-48">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input type="text" placeholder={tipoVista === 'kpis' ? 'Buscar empleado o KPI...' : 'Buscar empleado u orden...'}
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                                className="text-sm text-gray-700 placeholder-gray-400 outline-none flex-1" />
                        </div>

                        {tipoVista === 'kpis' && (
                            <>
                                <select value={filtroCriticidad} onChange={(e) => setFiltroCriticidad(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="todas">Todas las criticidades</option>
                                    <option value="critico">Crítico</option>
                                    <option value="importante">Importante</option>
                                    <option value="no_critico">Normal</option>
                                </select>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                                    <input type="checkbox" checked={filtroFueraDeTiempo} onChange={(e) => setFiltroFueraDeTiempo(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-red-600" />
                                    Solo fuera de tiempo
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                                    <input type="checkbox" checked={filtroConApelacion} onChange={(e) => setFiltroConApelacion(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-amber-600" />
                                    Con apelación
                                </label>
                            </>
                        )}

                        {hayFiltros && (
                            <button onClick={() => { setBusqueda(''); setFiltroCriticidad('todas'); setFiltroFueraDeTiempo(false); setFiltroConApelacion(false); }}
                                className="text-xs text-blue-600 hover:underline">
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                        Mostrando {totalActual} resultado{totalActual !== 1 ? 's' : ''}
                        {totalActual !== totalRaw && ` de ${totalRaw}`}
                    </p>
                </div>

                {/* Contenido */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                            <p className="mt-4 text-gray-600">Cargando evidencias...</p>
                        </div>
                    </div>
                ) : totalActual === 0 ? (
                    <div className="bg-white rounded-xl p-16 text-center border border-gray-200 shadow-sm">
                        <div className="p-4 bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {hayFiltros ? 'Sin resultados para los filtros aplicados' : 'Todo al día'}
                        </h3>
                        <p className="text-gray-600">
                            {hayFiltros ? 'Prueba ajustando los filtros' : `No hay evidencias de ${tipoVista === 'kpis' ? 'KPIs' : 'órdenes'} pendientes`}
                        </p>
                        {hayFiltros && (
                            <button onClick={() => { setBusqueda(''); setFiltroCriticidad('todas'); setFiltroFueraDeTiempo(false); setFiltroConApelacion(false); }}
                                className="mt-4 text-sm text-blue-600 hover:underline">Limpiar filtros</button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>Página {paginaActual} de {totalPaginas} — {totalActual} pendiente{totalActual !== 1 ? 's' : ''}</span>
                        </div>

                        {tipoVista === 'kpis'
                            ? kpisPaginados.map((ev) => (
                                <TarjetaEvidenciaKPI key={ev.id} evidencia={ev}
                                    onRevisar={handleRevisarKPI}
                                    onResponderApelacion={handleResponderApelacionKPI} />
                            ))
                            : ordenesPaginadas.map((ev) => (
                                <TarjetaEvidenciaOrden key={ev.id} evidencia={ev} onRevisar={handleRevisarOrden} />
                            ))
                        }

                        {/* Paginación */}
                        {totalPaginas > 1 && (
                            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm">
                                <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaActual === 1}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeft className="w-4 h-4" />Anterior
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                                        .filter((n) => n === 1 || n === totalPaginas || (n >= paginaActual - 1 && n <= paginaActual + 1))
                                        .reduce<(number | string)[]>((acc, n, idx, arr) => {
                                            if (idx > 0 && (arr[idx - 1] as number) !== n - 1) acc.push('...');
                                            acc.push(n);
                                            return acc;
                                        }, [])
                                        .map((item, idx) =>
                                            item === '...' ? (
                                                <span key={`dot-${idx}`} className="px-2 text-gray-400">...</span>
                                            ) : (
                                                <button key={item} onClick={() => setPagina(item as number)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${paginaActual === item ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                                                    {item}
                                                </button>
                                            )
                                        )
                                    }
                                </div>

                                <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Siguiente<ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
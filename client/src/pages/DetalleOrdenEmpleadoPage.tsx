import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Target, Clock, CheckCircle, XCircle, AlertCircle,
    Upload, FileText, Image, Film, File, ChevronDown, ChevronUp,
    TrendingUp, PauseCircle, User, Info, Plus, Eye, Download,
} from 'lucide-react';
import Layout from '../components/layout/Layout';

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
}

interface Tarea {
    id: string;
    descripcion: string;
    orden: number;
    completada: boolean;
    fueraDeTiempo: boolean;
    fechaCompletada?: string;
    intentosEvidencia: number;
    evidencias: Evidencia[];
}

interface OrdenDetalle {
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
    enPausa: boolean;
    motivoPausa?: string;
    kpi: {
        id: string; key: string; indicador: string; descripcion?: string;
        tipoCriticidad: string; periodicidad: string;
        meta?: number; operadorMeta?: string; unidad?: string;
    };
    creador: { nombre: string; apellido: string };
    tareas: Tarea[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pendiente: { label: 'Pendiente', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
    en_proceso: { label: 'En Proceso', color: 'text-blue-700', bg: 'bg-blue-100', icon: TrendingUp },
    completada: { label: 'Completada', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
    aprobada: { label: 'Aprobada', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
    rechazada: { label: 'Rechazada', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
    vencida: { label: 'Vencida', color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
    en_pausa: { label: 'En Pausa', color: 'text-gray-700', bg: 'bg-gray-100', icon: PauseCircle },
    cancelada: { label: 'Cancelada', color: 'text-gray-500', bg: 'bg-gray-100', icon: XCircle },
};

const EVIDENCIA_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    pendiente_revision: { label: 'Pendiente de revisión', color: 'text-orange-700', bg: 'bg-orange-100' },
    aprobada: { label: 'Aprobada', color: 'text-green-700', bg: 'bg-green-100' },
    rechazada: { label: 'Rechazada', color: 'text-red-700', bg: 'bg-red-100' },
};

const TIPO_ARCHIVO_ICON: Record<string, any> = {
    imagen: Image, video: Film, pdf: FileText, documento: File,
};

export default function DetalleOrdenEmpleadoPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [orden, setOrden] = useState<OrdenDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [tareasExpandidas, setTareasExpandidas] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tareaSeleccionada, setTareaSeleccionada] = useState<string | null>(null);
    const [subiendoEvidencia, setSubiendoEvidencia] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const [apelandoEvidencia, setApelandoEvidencia] = useState<string | null>(null);
    const [textoApelacion, setTextoApelacion] = useState('');

    const [showSolicitarTarea, setShowSolicitarTarea] = useState(false);
    const [nuevaTareaDesc, setNuevaTareaDesc] = useState('');
    const [justificacion, setJustificacion] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => { if (id) cargarOrden(); }, [id]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };


    const cargarOrden = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/ordenes-trabajo/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setOrden(data);
            const tareasPendientes = (data.tareas || [])
                .filter((t: Tarea) => !t.completada)
                .map((t: Tarea) => t.id);
            setTareasExpandidas(tareasPendientes);
        } catch (error) {
            console.error('Error al cargar orden:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTarea = (tareaId: string) =>
        setTareasExpandidas((prev) =>
            prev.includes(tareaId) ? prev.filter((i) => i !== tareaId) : [...prev, tareaId]
        );

    const handleSeleccionarArchivo = (tareaId: string) => {
        setTareaSeleccionada(tareaId);
        fileInputRef.current?.click();
    };

    const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tareaSeleccionada) return;

        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('tareaId', tareaSeleccionada);
        formData.append('ordenTitulo', orden?.titulo ?? '');

        setSubiendoEvidencia(tareaSeleccionada);
        setUploadProgress(0);

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
                setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
            }
        };

        xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                setUploadProgress(0);
                await cargarOrden();
            } else {
                let msg = 'Error al subir evidencia';
                try { msg = JSON.parse(xhr.responseText)?.message || msg; } catch { /* noop */ }
                alert(msg);
            }
            setSubiendoEvidencia(null);
            setTareaSeleccionada(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        xhr.onerror = () => {
            alert('Error de red al subir la evidencia.');
            setSubiendoEvidencia(null);
            setTareaSeleccionada(null);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        xhr.open('POST', '/api/storage/evidencia-orden');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    };

    const handleApelar = async (evidenciaId: string) => {
        if (!textoApelacion.trim()) return;
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/ordenes-trabajo/evidencias/${evidenciaId}/apelar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ apelacion: textoApelacion }),
            });
            if (!res.ok) throw new Error();
            setApelandoEvidencia(null);
            setTextoApelacion('');
            await cargarOrden();
        } catch { alert('Error al enviar la apelación.'); }
    };

    const handleEnviarRevision = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/ordenes-trabajo/${id}/calcular-progreso`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            showToast('Orden enviada para revisión');
            await cargarOrden();
        } catch {
            alert('Error al enviar la orden.');
        }
    };




    const handleSolicitarTarea = async () => {
        if (!nuevaTareaDesc.trim() || !justificacion.trim()) return;
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/ordenes-trabajo/solicitudes-tarea`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ordenTrabajoId: id, descripcion: nuevaTareaDesc.trim(), justificacion: justificacion.trim() }),
            });
            if (!res.ok) throw new Error();
            setShowSolicitarTarea(false);
            setNuevaTareaDesc('');
            setJustificacion('');
            showToast('Solicitud enviada correctamente');
            await cargarOrden();
        } catch { alert('Error al enviar la solicitud.'); }
    };

    const formatBytes = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const puedeSubirEvidencia = (tarea: Tarea) => {
        if (!orden) return false;
        if (['aprobada', 'cancelada', 'vencida'].includes(orden.status)) return false;
        if (tarea.completada) {
            const ultima = tarea.evidencias?.[tarea.evidencias.length - 1];
            return ultima?.status === 'rechazada';
        }
        return true;
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                        <p className="mt-4 text-gray-600">Cargando orden...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!orden) {
        return (
            <Layout>
                <div className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Orden no encontrada</h3>
                    <button onClick={() => navigate('/mis-ordenes')} className="mt-4 text-blue-600 hover:underline text-sm">
                        ← Volver a mis órdenes
                    </button>
                </div>
            </Layout>
        );
    }

    const statusCfg = STATUS_CONFIG[orden.status] ?? STATUS_CONFIG['pendiente'];
    const StatusIcon = statusCfg.icon;
    const esCritico = orden.kpi?.tipoCriticidad === 'critico';
    const diasRestantes = Math.ceil((new Date(orden.fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const ordenCerrada = ['aprobada', 'cancelada', 'vencida'].includes(orden.status);

    return (
        <Layout>
            <input ref={fileInputRef} type="file" className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleArchivoSeleccionado} />

            <div className="p-8 space-y-6 max-w-4xl mx-auto">

                <button onClick={() => navigate('/mis-ordenes')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a mis órdenes
                </button>

                {/* Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl flex-shrink-0 ${esCritico ? 'bg-red-50' : 'bg-blue-50'}`}>
                                <Target className={`w-6 h-6 ${esCritico ? 'text-red-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-xl font-bold text-gray-900">{orden.titulo}</h1>
                                    {esCritico && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Crítico</span>}
                                </div>
                                <p className="text-sm text-blue-600 font-medium mb-1">{orden.kpi?.key} — {orden.kpi?.indicador}</p>
                                <p className="text-sm text-gray-500">{orden.descripcion}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ${statusCfg.bg} ${statusCfg.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusCfg.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Progreso</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${orden.progreso >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(orden.progreso, 100)}%` }} />
                                </div>
                                <span className="text-xs font-medium text-gray-700">{Math.round(orden.progreso)}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{orden.tareasCompletadas}/{orden.cantidadTareas} tareas</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Fecha límite</p>
                            <p className="text-sm font-medium text-gray-700">
                                {new Date(orden.fechaLimite).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            {!ordenCerrada && diasRestantes > 0 && (
                                <p className={`text-xs mt-0.5 ${diasRestantes <= 3 ? 'text-red-500' : 'text-gray-400'}`}>{diasRestantes}d restantes</p>
                            )}
                            {!ordenCerrada && diasRestantes <= 0 && <p className="text-xs text-red-500 mt-0.5">Vencida</p>}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Periodicidad</p>
                            <p className="text-sm font-medium text-gray-700 capitalize">{orden.kpi?.periodicidad}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Asignada por</p>
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-700">{orden.creador?.nombre} {orden.creador?.apellido}</p>
                            </div>
                        </div>
                    </div>

                    {orden.kpi?.meta && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <p className="text-sm text-gray-600">
                                Meta del KPI: <span className="font-medium text-gray-900">{orden.kpi.operadorMeta} {orden.kpi.meta} {orden.kpi.unidad}</span>
                            </p>
                        </div>
                    )}

                    {orden.enPausa && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <PauseCircle className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-600"><span className="font-medium">En pausa:</span> {orden.motivoPausa}</p>
                            </div>
                        </div>
                    )}
                </div>

                {orden.status === 'aprobada' && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800 font-medium">Esta orden fue aprobada. El KPI ha sido registrado exitosamente.</p>
                    </div>
                )}
                {orden.status === 'completada' && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                        <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <p className="text-sm text-purple-800 font-medium">Todas las evidencias fueron subidas. Tu jefe está revisando el trabajo.</p>
                    </div>
                )}

                {/* Tareas */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Tareas ({orden.tareasCompletadas}/{orden.cantidadTareas})
                        </h2>
                        {!ordenCerrada && (
                            <button onClick={() => setShowSolicitarTarea(true)}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                <Plus className="w-4 h-4" />
                                Solicitar tarea adicional
                            </button>
                        )}
                    </div>

                    {(orden.tareas || []).sort((a, b) => a.orden - b.orden).map((tarea) => {
                        const expandida = tareasExpandidas.includes(tarea.id);
                        const ultimaEvidencia = tarea.evidencias?.[tarea.evidencias.length - 1];
                        const puedeSubir = puedeSubirEvidencia(tarea);
                        const cargando = subiendoEvidencia === tarea.id;

                        return (
                            <div key={tarea.id} className={`bg-white rounded-xl shadow-sm border transition-all ${tarea.completada
                                ? ultimaEvidencia?.status === 'rechazada' ? 'border-red-200' : 'border-green-200'
                                : 'border-gray-200'
                                }`}>
                                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => toggleTarea(tarea.id)}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${tarea.completada
                                        ? ultimaEvidencia?.status === 'aprobada' ? 'bg-green-100 text-green-700'
                                            : ultimaEvidencia?.status === 'rechazada' ? 'bg-red-100 text-red-700'
                                                : 'bg-purple-100 text-purple-700'
                                        : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {tarea.completada
                                            ? ultimaEvidencia?.status === 'aprobada' ? '✓'
                                                : ultimaEvidencia?.status === 'rechazada' ? '✗' : '⏳'
                                            : tarea.orden}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{tarea.descripcion}</p>
                                        {tarea.completada && ultimaEvidencia && (
                                            <p className={`text-xs mt-0.5 ${EVIDENCIA_STATUS[ultimaEvidencia.status]?.color ?? 'text-gray-400'}`}>
                                                Evidencia: {EVIDENCIA_STATUS[ultimaEvidencia.status]?.label}
                                                {tarea.fueraDeTiempo && ' · Fuera de tiempo'}
                                            </p>
                                        )}
                                        {!tarea.completada && <p className="text-xs text-gray-400 mt-0.5">Pendiente de evidencia</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {puedeSubir && !ordenCerrada && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSeleccionarArchivo(tarea.id); }}
                                                disabled={cargando}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                                            >
                                                {cargando
                                                    ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                    : <Upload className="w-3 h-3" />}
                                                {cargando ? `${uploadProgress}%` : tarea.completada ? 'Re-subir' : 'Subir evidencia'}
                                            </button>
                                        )}
                                        {expandida ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    {cargando && (
                                        <div className="px-4 pt-1 pb-2">
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-200"
                                                    style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {expandida && (
                                    <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                                        {tarea.evidencias?.length > 0 ? (
                                            <div className="space-y-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Historial de evidencias</p>
                                                {tarea.evidencias.map((ev) => {
                                                    const evStatus = EVIDENCIA_STATUS[ev.status] ?? EVIDENCIA_STATUS['pendiente_revision'];
                                                    const TipoIcon = TIPO_ARCHIVO_ICON[ev.tipo] ?? File;
                                                    return (
                                                        <div key={ev.id} className={`rounded-lg border p-3 ${ev.status === 'aprobada' ? 'border-green-200 bg-green-50' :
                                                            ev.status === 'rechazada' ? 'border-red-200 bg-red-50' :
                                                                'border-orange-200 bg-orange-50'
                                                            }`}>
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <TipoIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 truncate">{ev.nombre}</p>
                                                                        <p className="text-xs text-gray-400">
                                                                            Intento #{ev.intento}
                                                                            {ev.tamanio && ` · ${formatBytes(ev.tamanio)}`}
                                                                            {' · '}{new Date(ev.fechaSubida).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
                                                                            {ev.esFueraDeTiempo && <span className="ml-1 text-red-500">· Fuera de tiempo</span>}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${evStatus.bg} ${evStatus.color}`}>
                                                                        {evStatus.label}
                                                                    </span>
                                                                    <a href={ev.archivoUrl} target="_blank" rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors" title="Ver archivo">
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                    </a>
                                                                    <a href={ev.archivoUrl} download={ev.nombre}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors" title="Descargar">
                                                                        <Download className="w-3.5 h-3.5" />
                                                                    </a>
                                                                </div>
                                                            </div>

                                                            {ev.status === 'rechazada' && ev.motivoRechazo && (
                                                                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                                                                    <span className="font-medium">Motivo: </span>{ev.motivoRechazo}
                                                                </div>
                                                            )}

                                                            {ev.status === 'rechazada' && !ev.apelacion && (
                                                                <div className="mt-2">
                                                                    {apelandoEvidencia === ev.id ? (
                                                                        <div className="space-y-2">
                                                                            <textarea value={textoApelacion} onChange={(e) => setTextoApelacion(e.target.value)}
                                                                                placeholder="Explica por qué consideras que la evidencia es válida..." rows={3}
                                                                                className="w-full text-xs p-2 border border-gray-300 rounded-lg resize-none focus:ring-1 focus:ring-blue-500" />
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => handleApelar(ev.id)} disabled={!textoApelacion.trim()}
                                                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                                                                                    Enviar apelación
                                                                                </button>
                                                                                <button onClick={() => { setApelandoEvidencia(null); setTextoApelacion(''); }}
                                                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">
                                                                                    Cancelar
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <button onClick={() => setApelandoEvidencia(ev.id)}
                                                                            className="text-xs text-blue-600 hover:underline font-medium">
                                                                            ¿No estás de acuerdo? Apelar rechazo
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {ev.apelacion && (
                                                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                                                    <span className="font-medium">Tu apelación: </span>{ev.apelacion}
                                                                    {ev.respuestaApelacion && (
                                                                        <div className="mt-1 pt-1 border-t border-blue-200 text-blue-600">
                                                                            <span className="font-medium">Respuesta: </span>{ev.respuestaApelacion}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-400">Aún no hay evidencias subidas</p>
                                                {puedeSubir && !ordenCerrada && (
                                                    <button onClick={() => handleSeleccionarArchivo(tarea.id)}
                                                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                        Subir primera evidencia
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {orden.kpi?.descripcion && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-800 mb-1">Descripción del KPI</p>
                                <p className="text-sm text-blue-700">{orden.kpi.descripcion}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Solicitar tarea adicional */}
            {showSolicitarTarea && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Solicitar Tarea Adicional</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                <textarea value={nuevaTareaDesc} onChange={(e) => setNuevaTareaDesc(e.target.value)}
                                    placeholder="Describe la tarea que necesitas agregar..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Justificación</label>
                                <textarea value={justificacion} onChange={(e) => setJustificacion(e.target.value)}
                                    placeholder="¿Por qué es necesaria esta tarea?"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setShowSolicitarTarea(false); setNuevaTareaDesc(''); setJustificacion(''); }}
                                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleSolicitarTarea} disabled={!nuevaTareaDesc.trim() || !justificacion.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                Enviar Solicitud
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    {toast}
                </div>
            )}
        </Layout>
    );
}
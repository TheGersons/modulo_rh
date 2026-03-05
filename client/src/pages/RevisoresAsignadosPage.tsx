import { useState, useEffect } from 'react';
import {
    Users, UserCheck, Plus, Pencil, Trash2, X, Check,
    AlertTriangle, Search, ArrowRight, RefreshCw, Shield,
    ChevronDown, Info,
} from 'lucide-react';
import Layout from '../components/layout/Layout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UsuarioBasico {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    role: string;
    area?: { id: string; nombre: string };
    puesto?: { nombre: string };
}

interface RevisorAsignado {
    id: string;
    empleadoId: string;
    revisorId: string;
    motivo?: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
    empleado: UsuarioBasico;
    revisor: UsuarioBasico;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    rrhh: 'bg-blue-100 text-blue-700',
    jefe: 'bg-green-100 text-green-700',
    empleado: 'bg-gray-100 text-gray-600',
};

const ROLE_LABEL: Record<string, string> = {
    admin: 'Admin', rrhh: 'RRHH', jefe: 'Jefe', empleado: 'Empleado',
};

function RoleBadge({ role }: { role: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[role] ?? 'bg-gray-100 text-gray-600'}`}>
            {ROLE_LABEL[role] ?? role}
        </span>
    );
}

function NombreCompleto({ u }: { u: UsuarioBasico }) {
    return <span>{u.nombre} {u.apellido}</span>;
}

// ─── Modal para crear / editar asignación ────────────────────────────────────

function ModalAsignacion({
    asignacion,
    empleados,
    revisores,
    onGuardar,
    onCerrar,
}: {
    asignacion?: RevisorAsignado;
    empleados: UsuarioBasico[];
    revisores: UsuarioBasico[];
    onGuardar: (data: { empleadoId: string; revisorId: string; motivo?: string }) => Promise<void>;
    onCerrar: () => void;
}) {
    const [empleadoId, setEmpleadoId] = useState(asignacion?.empleadoId ?? '');
    const [revisorId, setRevisorId] = useState(asignacion?.revisorId ?? '');
    const [motivo, setMotivo] = useState(asignacion?.motivo ?? '');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const [busqEmpleado, setBusqEmpleado] = useState('');
    const [busqRevisor, setBusqRevisor] = useState('');
    const [abiertaEmpleado, setAbiertaEmpleado] = useState(false);
    const [abiertaRevisor, setAbiertaRevisor] = useState(false);

    const empleadosFiltrados = empleados.filter((u) => {
        const q = busqEmpleado.toLowerCase();
        return `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q);
    });
    const revisoresFiltrados = revisores.filter((u) => {
        const q = busqRevisor.toLowerCase();
        return `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q) && u.id !== empleadoId;
    });

    const empleadoSeleccionado = revisores.find((u) => u.id === empleadoId);
    const revisorSeleccionado = revisores.find((u) => u.id === revisorId);

    const handleSubmit = async () => {
        if (!empleadoId || !revisorId) {
            setError('Debes seleccionar tanto el empleado como el revisor.');
            return;
        }
        if (empleadoId === revisorId) {
            setError('Un empleado no puede ser su propio revisor.');
            return;
        }
        setError('');
        setGuardando(true);
        try {
            await onGuardar({ empleadoId, revisorId, motivo: motivo || undefined });
        } catch (e: any) {
            setError(e.message ?? 'Error al guardar');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {asignacion ? 'Editar asignación' : 'Nueva asignación de revisor'}
                        </h2>
                    </div>
                    <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Info */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700">
                            Las evidencias del <strong>empleado</strong> seleccionado serán revisadas por el <strong>revisor</strong> asignado, ignorando la jerarquía de área.
                        </p>
                    </div>

                    {/* Selector empleado */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Empleado <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => { setAbiertaEmpleado(!abiertaEmpleado); setAbiertaRevisor(false); }}
                                className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-lg text-sm hover:border-blue-400 transition-colors"
                            >
                                {empleadoSeleccionado
                                    ? <span className="font-medium text-gray-900">{empleadoSeleccionado.nombre} {empleadoSeleccionado.apellido}</span>
                                    : <span className="text-gray-400">Seleccionar empleado...</span>
                                }
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                            {abiertaEmpleado && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2 px-2">
                                            <Search className="w-4 h-4 text-gray-400" />
                                            <input
                                                autoFocus
                                                value={busqEmpleado}
                                                onChange={(e) => setBusqEmpleado(e.target.value)}
                                                placeholder="Buscar..."
                                                className="flex-1 text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto">
                                        {empleadosFiltrados.length === 0
                                            ? <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
                                            : empleadosFiltrados.map((u) => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => { setEmpleadoId(u.id); setAbiertaEmpleado(false); setBusqEmpleado(''); }}
                                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${empleadoId === u.id ? 'bg-blue-50' : ''}`}
                                                >
                                                    <p className="text-sm font-medium text-gray-900">{u.nombre} {u.apellido}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <RoleBadge role={u.role} />
                                                        {u.area && <span className="text-xs text-gray-400">{u.area.nombre}</span>}
                                                    </div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Flecha visual */}
                    <div className="flex items-center justify-center gap-3 py-1">
                        <div className="flex-1 h-px bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <span>sus evidencias van a</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Selector revisor */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Revisor asignado <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => { setAbiertaRevisor(!abiertaRevisor); setAbiertaEmpleado(false); }}
                                className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-lg text-sm hover:border-blue-400 transition-colors"
                            >
                                {revisorSeleccionado
                                    ? <span className="font-medium text-gray-900">{revisorSeleccionado.nombre} {revisorSeleccionado.apellido}</span>
                                    : <span className="text-gray-400">Seleccionar revisor...</span>
                                }
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                            {abiertaRevisor && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2 px-2">
                                            <Search className="w-4 h-4 text-gray-400" />
                                            <input
                                                autoFocus
                                                value={busqRevisor}
                                                onChange={(e) => setBusqRevisor(e.target.value)}
                                                placeholder="Buscar..."
                                                className="flex-1 text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto">
                                        {revisoresFiltrados.length === 0
                                            ? <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
                                            : revisoresFiltrados.map((u) => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => { setRevisorId(u.id); setAbiertaRevisor(false); setBusqRevisor(''); }}
                                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${revisorId === u.id ? 'bg-blue-50' : ''}`}
                                                >
                                                    <p className="text-sm font-medium text-gray-900">{u.nombre} {u.apellido}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <RoleBadge role={u.role} />
                                                        {u.area && <span className="text-xs text-gray-400">{u.area.nombre}</span>}
                                                    </div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Motivo */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Motivo / contexto <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Jefe de área sin superior jerárquico, supervisión mutua entre pares..."
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button onClick={onCerrar} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={guardando || !empleadoId || !revisorId}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {guardando
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Check className="w-4 h-4" />
                        }
                        {asignacion ? 'Guardar cambios' : 'Crear asignación'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RevisoresAsignadosPage() {
    const [asignaciones, setAsignaciones] = useState<RevisorAsignado[]>([]);
    const [empleados, setEmpleados] = useState<UsuarioBasico[]>([]);
    const [revisores, setRevisores] = useState<UsuarioBasico[]>([]);
    const [loading, setLoading] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [editando, setEditando] = useState<RevisorAsignado | undefined>();
    const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activos' | 'inactivos'>('activos');
    const [procesando, setProcesando] = useState<string | null>(null);

    useEffect(() => { cargar(); }, []);

    const getToken = () => localStorage.getItem('accessToken');

    const fetchJson = async (url: string, opts?: RequestInit) => {
        const res = await fetch(url, {
            ...opts,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
                ...(opts?.headers ?? {}),
            },
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message ?? `Error ${res.status}`);
        }
        return res.json();
    };

    const cargar = async () => {
        try {
            setLoading(true);
            const [asigs, emps, revs] = await Promise.all([
                fetchJson('/api/revisores-asignados'),
                fetchJson('/api/revisores-asignados/empleados-disponibles'),
                fetchJson('/api/revisores-asignados/posibles-revisores'),
            ]);
            setAsignaciones(asigs);
            setEmpleados(emps);
            setRevisores(revs);
        } catch (e) {
            console.error('Error al cargar revisores:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCrear = async (data: { empleadoId: string; revisorId: string; motivo?: string }) => {
        await fetchJson('/api/revisores-asignados', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        setMostrarModal(false);
        await cargar();
    };

    const handleEditar = async (data: { empleadoId: string; revisorId: string; motivo?: string }) => {
        if (!editando) return;
        await fetchJson(`/api/revisores-asignados/${editando.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ revisorId: data.revisorId, motivo: data.motivo }),
        });
        setEditando(undefined);
        await cargar();
    };

    const handleToggleActivo = async (asig: RevisorAsignado) => {
        setProcesando(asig.id);
        try {
            await fetchJson(`/api/revisores-asignados/${asig.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ activo: !asig.activo }),
            });
            await cargar();
        } finally {
            setProcesando(null);
        }
    };

    const handleEliminar = async (id: string) => {
        setProcesando(id);
        try {
            await fetchJson(`/api/revisores-asignados/${id}`, { method: 'DELETE' });
            setConfirmEliminar(null);
            await cargar();
        } finally {
            setProcesando(null);
        }
    };

    // Filtrado
    const asignacionesFiltradas = asignaciones.filter((a) => {
        const q = busqueda.toLowerCase();
        const matchBusq = !q
            || `${a.empleado.nombre} ${a.empleado.apellido}`.toLowerCase().includes(q)
            || `${a.revisor.nombre} ${a.revisor.apellido}`.toLowerCase().includes(q);
        const matchActivo =
            filtroActivo === 'todos' ? true :
                filtroActivo === 'activos' ? a.activo :
                    !a.activo;
        return matchBusq && matchActivo;
    });

    const totalActivos = asignaciones.filter((a) => a.activo).length;
    const totalInactivos = asignaciones.filter((a) => !a.activo).length;

    return (
        <Layout>
            <div className="p-8 space-y-6 max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Revisores Asignados</h1>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Excepción de jerarquía — define quién revisa las evidencias de personas específicas
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={cargar}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Actualizar"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setEditando(undefined); setMostrarModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nueva asignación
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total asignaciones', value: asignaciones.length, color: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-200', icon: Users },
                        { label: 'Activas', value: totalActivos, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: UserCheck },
                        { label: 'Inactivas', value: totalInactivos, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', icon: X },
                    ].map(({ label, value, color, bg, border, icon: Icon }) => (
                        <div key={label} className={`${bg} border ${border} rounded-xl p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">{label}</p>
                                    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                                </div>
                                <Icon className={`w-6 h-6 ${color} opacity-40`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex-1 min-w-48 max-w-xs">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none"
                        />
                        {busqueda && (
                            <button onClick={() => setBusqueda('')} className="text-gray-400 hover:text-gray-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                        {(['todos', 'activos', 'inactivos'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFiltroActivo(f)}
                                className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${filtroActivo === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
                            <p className="mt-3 text-gray-500 text-sm">Cargando asignaciones...</p>
                        </div>
                    </div>
                ) : asignacionesFiltradas.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
                        <UserCheck className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin asignaciones</h3>
                        <p className="text-gray-400 text-sm">
                            {busqueda ? 'No hay resultados para esa búsqueda' : 'Aún no hay revisores asignados manualmente'}
                        </p>
                        {!busqueda && (
                            <button
                                onClick={() => { setEditando(undefined); setMostrarModal(true); }}
                                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 mx-auto"
                            >
                                <Plus className="w-4 h-4" /> Crear primera asignación
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {asignacionesFiltradas.map((asig) => (
                            <div
                                key={asig.id}
                                className={`bg-white rounded-xl border shadow-sm transition-all ${asig.activo ? 'border-gray-200' : 'border-gray-100 opacity-60'
                                    }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-center gap-4 flex-wrap">

                                        {/* Empleado */}
                                        <div className="flex items-center gap-3 flex-1 min-w-48">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-700 font-bold text-sm">
                                                    {asig.empleado.nombre[0]}{asig.empleado.apellido[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    <NombreCompleto u={asig.empleado} />
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <RoleBadge role={asig.empleado.role} />
                                                    {asig.empleado.area && (
                                                        <span className="text-xs text-gray-400">{asig.empleado.area.nombre}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Flecha */}
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>

                                        {/* Revisor */}
                                        <div className="flex items-center gap-3 flex-1 min-w-48">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <span className="text-green-700 font-bold text-sm">
                                                    {asig.revisor.nombre[0]}{asig.revisor.apellido[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    <NombreCompleto u={asig.revisor} />
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <RoleBadge role={asig.revisor.role} />
                                                    {asig.revisor.area && (
                                                        <span className="text-xs text-gray-400">{asig.revisor.area.nombre}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Estado + acciones */}
                                        <div className="flex items-center gap-2 ml-auto">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${asig.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {asig.activo ? 'Activa' : 'Inactiva'}
                                            </span>

                                            {/* Toggle activo */}
                                            <button
                                                onClick={() => handleToggleActivo(asig)}
                                                disabled={procesando === asig.id}
                                                className={`p-2 rounded-lg transition-colors text-xs font-medium ${asig.activo
                                                        ? 'text-yellow-600 hover:bg-yellow-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                    } disabled:opacity-50`}
                                                title={asig.activo ? 'Desactivar' : 'Activar'}
                                            >
                                                {procesando === asig.id
                                                    ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                    : asig.activo ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />
                                                }
                                            </button>

                                            {/* Editar */}
                                            <button
                                                onClick={() => { setEditando(asig); setMostrarModal(true); }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            {/* Eliminar */}
                                            {confirmEliminar === asig.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEliminar(asig.id)}
                                                        disabled={procesando === asig.id}
                                                        className="px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        Confirmar
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmEliminar(null)}
                                                        className="px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmEliminar(asig.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Motivo */}
                                    {asig.motivo && (
                                        <div className="mt-3 pl-[3.25rem]">
                                            <p className="text-xs text-gray-400 italic">"{asig.motivo}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {mostrarModal && (
                <ModalAsignacion
                    asignacion={editando}
                    empleados={editando ? revisores : empleados}
                    revisores={revisores}
                    onGuardar={editando ? handleEditar : handleCrear}
                    onCerrar={() => { setMostrarModal(false); setEditando(undefined); }}
                />
            )}
        </Layout>
    );
}
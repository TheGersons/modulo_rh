import { useState, useEffect } from 'react';
import {
    Building,
    Plus,
    Edit,
    Trash2,
    Users,
    AlertCircle,
    CheckCircle,
    Save,
    X,
    ChevronRight,
    ArrowLeft,
    FolderOpen,
} from 'lucide-react';
import { areasService } from '../services/areas.service';
import { empleadosService } from '../services/empleados.service';
import { usePermissions } from '../hooks/usePermissions';
import Layout from '../components/layout/Layout';

interface Area {
    id: string;
    nombre: string;
    descripcion?: string;
    jefeId?: string;
    areaPadreId?: string;
    promedioGlobal: number;
    totalKpis: number;
    kpisRojos: number;
    activa: boolean;
    jefe?: {
        nombre: string;
        apellido: string;
    };
    areaPadre?: {
        id: string;
        nombre: string;
    };
    subAreas?: Array<{
        id: string;
        nombre: string;
        activa: boolean;
    }>;
}

interface Empleado {
    id: string;
    nombre: string;
    apellido: string;
    activo: string;
}

export default function AreasPage() {
    const { isAdmin, isRRHH } = usePermissions();
    const [todasLasAreas, setTodasLasAreas] = useState<Area[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(true);

    // Navegación jerárquica
    const [areaPadreActual, setAreaPadreActual] = useState<Area | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string; nombre: string }>>([]);

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const areasPorPagina = 5;

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [areaSeleccionada, setAreaSeleccionada] = useState<Area | null>(null);

    // Form state
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [jefeId, setJefeId] = useState('');
    const [areaPadreId, setAreaPadreId] = useState('');
    const [activa, setActiva] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const puedeGestionar = isAdmin || isRRHH;

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        setPaginaActual(1);
    }, [areaPadreActual]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [areasData, empleadosData] = await Promise.all([
                areasService.getAll(),
                empleadosService.getAll(),
            ]);
            setTodasLasAreas(areasData);
            setEmpleados(empleadosData.filter((e: Empleado) => e.activo));
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar áreas según el nivel actual
    const areasActuales = todasLasAreas.filter((area) => {
        if (areaPadreActual) {
            return area.areaPadreId === areaPadreActual.id;
        }
        return !area.areaPadreId; // Solo áreas principales
    });

    // Paginación
    const totalPaginas = Math.ceil(areasActuales.length / areasPorPagina);
    const indexInicio = (paginaActual - 1) * areasPorPagina;
    const indexFin = indexInicio + areasPorPagina;
    const areasPaginadas = areasActuales.slice(indexInicio, indexFin);

    // Navegación jerárquica
    const navegarASubAreas = (area: Area) => {
        setAreaPadreActual(area);
        setBreadcrumb([...breadcrumb, { id: area.id, nombre: area.nombre }]);
    };

    const navegarAtras = () => {
        if (breadcrumb.length === 0) return;

        const nuevoBreadcrumb = [...breadcrumb];
        nuevoBreadcrumb.pop();
        setBreadcrumb(nuevoBreadcrumb);

        if (nuevoBreadcrumb.length === 0) {
            setAreaPadreActual(null);
        } else {
            const ultimoId = nuevoBreadcrumb[nuevoBreadcrumb.length - 1].id;
            const area = todasLasAreas.find((a) => a.id === ultimoId);
            setAreaPadreActual(area || null);
        }
    };

    const navegarANivel = (nivel: number) => {
        if (nivel === -1) {
            // Raíz
            setAreaPadreActual(null);
            setBreadcrumb([]);
        } else {
            const nuevoBreadcrumb = breadcrumb.slice(0, nivel + 1);
            setBreadcrumb(nuevoBreadcrumb);
            const areaId = nuevoBreadcrumb[nuevoBreadcrumb.length - 1].id;
            const area = todasLasAreas.find((a) => a.id === areaId);
            setAreaPadreActual(area || null);
        }
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setAreaSeleccionada(null);
        setNombre('');
        setDescripcion('');
        setJefeId('');
        setAreaPadreId(areaPadreActual?.id || '');
        setActiva(true);
        setError('');
        setShowModal(true);
    };

    const abrirModalEditar = (area: Area) => {
        setModoEdicion(true);
        setAreaSeleccionada(area);
        setNombre(area.nombre);
        setDescripcion(area.descripcion || '');
        setJefeId(area.jefeId || '');
        setAreaPadreId(area.areaPadreId || '');
        setActiva(area.activa);
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async () => {
        setError('');

        if (!nombre.trim()) {
            setError('El nombre del área es requerido');
            return;
        }

        if (modoEdicion && areaSeleccionada && areaPadreId === areaSeleccionada.id) {
            setError('Un área no puede ser padre de sí misma');
            return;
        }

        try {
            setSubmitting(true);

            const areaData = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || undefined,
                jefeId: jefeId || undefined,
                areaPadreId: areaPadreId || undefined,
                activa,
            };

            if (modoEdicion && areaSeleccionada) {
                await areasService.update(areaSeleccionada.id, areaData);
                alert('Área actualizada exitosamente');
            } else {
                await areasService.create(areaData);
                alert('Área creada exitosamente');
            }

            setShowModal(false);
            await cargarDatos();
        } catch (error: any) {
            console.error('Error al guardar área:', error);
            setError(error.response?.data?.message || 'Error al guardar el área');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        const area = todasLasAreas.find((a) => a.id === id);
        const tieneSubAreas = area?.subAreas && area.subAreas.length > 0;

        let mensaje = `¿Estás seguro de eliminar el área "${nombre}"?`;
        if (tieneSubAreas) {
            mensaje += `\n\n⚠️ ATENCIÓN: Esta área tiene ${area.subAreas!.length} sub-área(s). Debes eliminarlas primero.`;
        }

        if (!confirm(mensaje)) {
            return;
        }

        try {
            await areasService.delete(id);
            alert('Área eliminada exitosamente');
            await cargarDatos();
        } catch (error: any) {
            console.error('Error al eliminar área:', error);
            alert(error.response?.data?.message || 'Error al eliminar el área');
        }
    };

    const handleToggleActiva = async (id: string) => {
        try {
            const area = todasLasAreas.find((a) => a.id === id);
            if (!area) return;

            await areasService.update(id, { activa: !area.activa });
            await cargarDatos();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            alert('Error al cambiar el estado del área');
        }
    };

    if (!puedeGestionar) {
        return (
            <Layout>
                <div className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Denegado</h3>
                    <p className="text-gray-600">Solo administradores y RRHH pueden gestionar áreas.</p>
                </div>
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando áreas...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Stats
    const areasPrincipales = todasLasAreas.filter((a) => !a.areaPadreId);
    const subAreas = todasLasAreas.filter((a) => a.areaPadreId);
    const stats = {
        areasPrincipales: areasPrincipales.length,
        subAreas: subAreas.length,
        activas: todasLasAreas.filter((a) => a.activa).length,
        conJefe: todasLasAreas.filter((a) => a.jefeId).length,
    };

    return (
        <Layout>
            <div className="p-8 space-y-6">
                {/* Header con Breadcrumb */}
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <button
                                onClick={() => navegarANivel(-1)}
                                className="hover:text-blue-600 transition-colors"
                            >
                                Áreas
                            </button>
                            {breadcrumb.map((item, idx) => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4" />
                                    <button
                                        onClick={() => navegarANivel(idx)}
                                        className={`hover:text-blue-600 transition-colors ${idx === breadcrumb.length - 1 ? 'font-semibold text-gray-900' : ''
                                            }`}
                                    >
                                        {item.nombre}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            {areaPadreActual ? `Sub-áreas de ${areaPadreActual.nombre}` : 'Áreas Principales'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {areasActuales.length} {areaPadreActual ? 'sub-área(s)' : 'área(s) principal(es)'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {areaPadreActual && (
                            <button
                                onClick={navegarAtras}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Volver
                            </button>
                        )}

                        <button
                            onClick={abrirModalCrear}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Nueva {areaPadreActual ? 'Sub-área' : 'Área'}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Áreas Principales</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.areasPrincipales}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Building className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Sub-áreas</p>
                                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.subAreas}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <FolderOpen className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Activas</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.activas}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Con Jefe Asignado</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.conJefe}</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    {areaPadreActual ? 'Sub-área' : 'Área'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Jefe</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                    {areaPadreActual ? '' : 'Sub-áreas'}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">KPIs</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Promedio</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {areasPaginadas.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600">
                                            No hay {areaPadreActual ? 'sub-áreas' : 'áreas'} registradas
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                areasPaginadas.map((area) => (
                                    <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{area.nombre}</p>
                                                {area.descripcion && (
                                                    <p className="text-sm text-gray-600">{area.descripcion}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {area.jefe ? (
                                                <p className="text-gray-900">
                                                    {area.jefe.nombre} {area.jefe.apellido}
                                                </p>
                                            ) : (
                                                <span className="text-sm text-gray-400">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {!areaPadreActual && (
                                                <>
                                                    {area.subAreas && area.subAreas.length > 0 ? (
                                                        <button
                                                            onClick={() => navegarASubAreas(area)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
                                                        >
                                                            <FolderOpen className="w-3 h-3" />
                                                            {area.subAreas.length}
                                                        </button>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-gray-900">{area.totalKpis}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`font-bold ${area.promedioGlobal >= 90
                                                    ? 'text-green-600'
                                                    : area.promedioGlobal >= 70
                                                        ? 'text-blue-600'
                                                        : 'text-red-600'
                                                    }`}
                                            >
                                                {area.promedioGlobal.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleActiva(area.id)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${area.activa
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {area.activa ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Activa
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Inactiva
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {!areaPadreActual && area.subAreas && area.subAreas.length > 0 && (
                                                    <button
                                                        onClick={() => navegarASubAreas(area)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Ver sub-áreas"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => abrirModalEditar(area)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(area.id, area.nombre)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                            disabled={paginaActual === 1}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>

                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                            <button
                                key={numero}
                                onClick={() => setPaginaActual(numero)}
                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${paginaActual === numero ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {numero}
                            </button>
                        ))}

                        <button
                            onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                            disabled={paginaActual === totalPaginas}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                {/* Modal Crear/Editar */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {modoEdicion ? 'Editar Área' : `Nueva ${areaPadreActual ? 'Sub-área' : 'Área'}`}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre {areaPadreActual && 'de la Sub-área'}{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder={areaPadreActual ? 'Ej: Gerencia' : 'Ej: Administrativa'}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Breve descripción..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={3}
                                    />
                                </div>

                                {/* Área Padre (solo si no estamos en una sub-área) */}
                                {!areaPadreActual && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Área Padre (Opcional)
                                        </label>
                                        <select
                                            value={areaPadreId}
                                            onChange={(e) => setAreaPadreId(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            disabled={modoEdicion && areaSeleccionada?.id === areaPadreId}
                                        >
                                            <option value="">Ninguna (Área principal)</option>
                                            {areasPrincipales
                                                .filter((a) => !modoEdicion || a.id !== areaSeleccionada?.id)
                                                .map((area) => (
                                                    <option key={area.id} value={area.id}>
                                                        {area.nombre}
                                                    </option>
                                                ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Las sub-áreas heredan configuraciones de su área padre
                                        </p>
                                    </div>
                                )}

                                {/* Jefe */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jefe del Área
                                    </label>
                                    <select
                                        value={jefeId}
                                        onChange={(e) => setJefeId(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Sin asignar</option>
                                        {empleados.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.nombre} {emp.apellido}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={activa}
                                            onChange={(e) => setActiva(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Área activa</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {modoEdicion ? 'Actualizar' : 'Crear'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
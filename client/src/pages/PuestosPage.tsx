import { useState, useEffect } from 'react';
import {
    Briefcase,
    Plus,
    Edit,
    Trash2,
    Users,
    Building,
    CheckCircle,
    XCircle,
    Save,
    X,
    AlertCircle,
    FolderOpen,
} from 'lucide-react';
import { puestosService } from '../services/puestos.service';
import { areasService } from '../services/areas.service';
import { usePermissions } from '../hooks/usePermissions';
import Layout from '../components/layout/Layout';

interface Puesto {
    id: string;
    nombre: string;
    descripcion?: string;
    areaId: string;
    activo: boolean;
    area: {
        id: string;
        nombre: string;
        areaPadre?: {
            id: string;
            nombre: string;
        };
    };
    _count?: {
        empleados: number;
        kpis: number;
    };
}

interface Area {
    id: string;
    nombre: string;
    areaPadreId?: string;
}

export default function PuestosPage() {
    const { isAdmin, isRRHH } = usePermissions();
    const [puestos, setPuestos] = useState<Puesto[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [filtroArea, setFiltroArea] = useState('todas');

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const puestosPorPagina = 10;

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [puestoSeleccionado, setPuestoSeleccionado] = useState<Puesto | null>(null);

    // Form state
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [areaId, setAreaId] = useState('');
    const [activo, setActivo] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const puedeGestionar = isAdmin || isRRHH;

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [puestosData, areasData] = await Promise.all([
                puestosService.getAll(),
                areasService.getAll(),
            ]);
            setPuestos(puestosData);
            setAreas(areasData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrado
    const puestosFiltrados = puestos.filter((puesto) => {
        if (filtroArea === 'todas') return true;
        return puesto.areaId === filtroArea;
    });

    // Paginación
    const totalPaginas = Math.ceil(puestosFiltrados.length / puestosPorPagina);
    const indexInicio = (paginaActual - 1) * puestosPorPagina;
    const indexFin = indexInicio + puestosPorPagina;
    const puestosPaginados = puestosFiltrados.slice(indexInicio, indexFin);

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setPuestoSeleccionado(null);
        setNombre('');
        setDescripcion('');
        setAreaId('');
        setActivo(true);
        setError('');
        setShowModal(true);
    };

    const abrirModalEditar = (puesto: Puesto) => {
        setModoEdicion(true);
        setPuestoSeleccionado(puesto);
        setNombre(puesto.nombre);
        setDescripcion(puesto.descripcion || '');
        setAreaId(puesto.areaId);
        setActivo(puesto.activo);
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async () => {
        setError('');

        if (!nombre.trim()) {
            setError('El nombre del puesto es requerido');
            return;
        }

        if (!areaId) {
            setError('Debes seleccionar un área');
            return;
        }

        try {
            setSubmitting(true);

            const puestoData = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || undefined,
                areaId,
                activo,
            };

            if (modoEdicion && puestoSeleccionado) {
                await puestosService.update(puestoSeleccionado.id, puestoData);
                alert('Puesto actualizado exitosamente');
            } else {
                await puestosService.create(puestoData);
                alert('Puesto creado exitosamente');
            }

            setShowModal(false);
            await cargarDatos();
        } catch (error: any) {
            console.error('Error al guardar puesto:', error);
            setError(error.response?.data?.message || 'Error al guardar el puesto');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        if (
            !confirm(
                `¿Estás seguro de eliminar el puesto "${nombre}"?\n\nEsto puede afectar a los empleados asignados.`
            )
        ) {
            return;
        }

        try {
            await puestosService.delete(id);
            alert('Puesto eliminado exitosamente');
            await cargarDatos();
        } catch (error: any) {
            console.error('Error al eliminar puesto:', error);
            alert(error.response?.data?.message || 'Error al eliminar el puesto');
        }
    };

    const handleToggleActivo = async (id: string) => {
        try {
            const puesto = puestos.find((p) => p.id === id);
            if (!puesto) return;

            await puestosService.update(id, { activo: !puesto.activo });
            await cargarDatos();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            alert('Error al cambiar el estado del puesto');
        }
    };

    if (!puedeGestionar) {
        return (
            <Layout>
                <div className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Denegado</h3>
                    <p className="text-gray-600">Solo administradores y RRHH pueden gestionar puestos.</p>
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
                        <p className="mt-4 text-gray-600">Cargando puestos...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const stats = {
        total: puestos.length,
        activos: puestos.filter((p) => p.activo).length,
        conEmpleados: puestos.filter((p) => (p._count?.empleados || 0) > 0).length,
        conKpis: puestos.filter((p) => (p._count?.kpis || 0) > 0).length,
    };

    return (
        <Layout>
            <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Puestos</h1>
                        <p className="text-gray-600 mt-1">{puestos.length} puestos registrados</p>
                    </div>

                    <button
                        onClick={abrirModalCrear}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Puesto
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Puestos</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Activos</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.activos}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Con Empleados</p>
                                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.conEmpleados}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Con KPIs</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.conKpis}</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-400" />
                        <select
                            value={filtroArea}
                            onChange={(e) => {
                                setFiltroArea(e.target.value);
                                setPaginaActual(1);
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="todas">Todas las áreas</option>
                            {areas
                                .filter((a) => !a.areaPadreId)
                                .map((area) => (
                                    <optgroup key={area.id} label={area.nombre}>
                                        <option value={area.id}>{area.nombre}</option>
                                        {areas
                                            .filter((sub) => sub.areaPadreId === area.id)
                                            .map((subArea) => (
                                                <option key={subArea.id} value={subArea.id}>
                                                    └─ {subArea.nombre}
                                                </option>
                                            ))}
                                    </optgroup>
                                ))}
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Puesto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Área
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Empleados
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                    KPIs
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {puestosPaginados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600">No hay puestos registrados</p>
                                    </td>
                                </tr>
                            ) : (
                                puestosPaginados.map((puesto) => (
                                    <tr key={puesto.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{puesto.nombre}</p>
                                                {puesto.descripcion && (
                                                    <p className="text-sm text-gray-600">{puesto.descripcion}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                {puesto.area.areaPadre && (
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Building className="w-3 h-3" />
                                                        {puesto.area.areaPadre.nombre}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-900 flex items-center gap-1">
                                                    {puesto.area.areaPadre && <FolderOpen className="w-3 h-3" />}
                                                    {puesto.area.nombre}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-gray-900">
                                                {puesto._count?.empleados || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-gray-900">
                                                {puesto._count?.kpis || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleActivo(puesto.id)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${puesto.activo
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {puesto.activo ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Activo
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Inactivo
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => abrirModalEditar(puesto)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(puesto.id, puesto.nombre)}
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
                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${paginaActual === numero
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
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
                                    {modoEdicion ? 'Editar Puesto' : 'Nuevo Puesto'}
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
                                        Nombre del Puesto <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej: Desarrollador Senior"
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
                                        placeholder="Breve descripción del puesto..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={3}
                                    />
                                </div>

                                {/* Área */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Área <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={areaId}
                                        onChange={(e) => setAreaId(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Selecciona un área</option>
                                        {areas
                                            .filter((a) => !a.areaPadreId)
                                            .map((area) => (
                                                <>
                                                    <option key={area.id} value={area.id}>
                                                        {area.nombre}
                                                    </option>
                                                    {areas
                                                        .filter((sub) => sub.areaPadreId === area.id)
                                                        .map((subArea) => (
                                                            <option key={subArea.id} value={subArea.id}>
                                                                └─ {subArea.nombre}
                                                            </option>
                                                        ))}
                                                </>
                                            ))}
                                    </select>
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={activo}
                                            onChange={(e) => setActivo(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Puesto activo</span>
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
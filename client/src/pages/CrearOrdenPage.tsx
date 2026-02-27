import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Briefcase,
    Plus,
    Trash2,
    Users,
    Calendar,
    FileText,
    AlertCircle,
    CheckCircle,
    Search,
} from 'lucide-react';
import { ordenesTrabajoService } from '../services/ordenes-trabajo.service';
import { kpisService } from '../services/kpis.service';
import { empleadosService } from '../services/empleados.service';
import Layout from '../components/layout/Layout';

interface KPI {
    id: string;
    key: string;
    indicador: string;
    area: string;
    puesto?: string;
    tipoCalculo: string;
}

interface Empleado {
    id: string;
    nombre: string;
    apellido: string;
    puesto?: string;
    area?: { nombre: string };
}

interface TareaForm {
    descripcion: string;
    orden: number;
}

export default function CrearOrdenPage() {
    const navigate = useNavigate();

    // Form state
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [kpiId, setKpiId] = useState('');
    const [empleadoId, setEmpleadoId] = useState('');
    const [fechaLimite, setFechaLimite] = useState('');
    const [tipoOrden, setTipoOrden] = useState<'kpi_sistema' | 'orden_empleado'>('kpi_sistema');
    const [tareas, setTareas] = useState<TareaForm[]>([{ descripcion: '', orden: 1 }]);

    // Bulk creation
    const [modoCreacion, setModoCreacion] = useState<'individual' | 'multiple'>('individual');
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<string[]>([]);

    // Data
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [kpisFiltrados, setKpisFiltrados] = useState<KPI[]>([]);
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState<Empleado[]>([]);

    // UI
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [searchKpi, setSearchKpi] = useState('');
    const [searchEmpleado, setSearchEmpleado] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        // Filtrar KPIs
        if (searchKpi) {
            setKpisFiltrados(
                kpis.filter(
                    (k) =>
                        k.key.toLowerCase().includes(searchKpi.toLowerCase()) ||
                        k.indicador.toLowerCase().includes(searchKpi.toLowerCase())
                )
            );
        } else {
            setKpisFiltrados(kpis);
        }
    }, [searchKpi, kpis]);

    useEffect(() => {
        // Filtrar empleados
        if (searchEmpleado) {
            setEmpleadosFiltrados(
                empleados.filter(
                    (e) =>
                        e.nombre.toLowerCase().includes(searchEmpleado.toLowerCase()) ||
                        e.apellido.toLowerCase().includes(searchEmpleado.toLowerCase())
                )
            );
        } else {
            setEmpleadosFiltrados(empleados);
        }
    }, [searchEmpleado, empleados]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [kpisData, empleadosData] = await Promise.all([
                kpisService.getAll(),
                empleadosService.getAll(),
            ]);

            setKpis(kpisData);
            setEmpleados(empleadosData);
            setKpisFiltrados(kpisData);
            setEmpleadosFiltrados(empleadosData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const agregarTarea = () => {
        setTareas([...tareas, { descripcion: '', orden: tareas.length + 1 }]);
    };

    const eliminarTarea = (index: number) => {
        if (tareas.length === 1) return;
        const nuevasTareas = tareas.filter((_, i) => i !== index);
        // Reordenar
        setTareas(nuevasTareas.map((t, i) => ({ ...t, orden: i + 1 })));
    };

    const actualizarTarea = (index: number, valor: string) => {
        const nuevasTareas = [...tareas];
        nuevasTareas[index].descripcion = valor;
        setTareas(nuevasTareas);
    };

    const toggleEmpleado = (id: string) => {
        if (empleadosSeleccionados.includes(id)) {
            setEmpleadosSeleccionados(empleadosSeleccionados.filter((e) => e !== id));
        } else {
            setEmpleadosSeleccionados([...empleadosSeleccionados, id]);
        }
    };

    const validarFormulario = () => {
        if (!titulo.trim()) {
            setError('El título es requerido');
            return false;
        }
        if (!descripcion.trim()) {
            setError('La descripción es requerida');
            return false;
        }
        if (!kpiId) {
            setError('Debes seleccionar un KPI');
            return false;
        }
        if (modoCreacion === 'individual' && !empleadoId) {
            setError('Debes seleccionar un empleado');
            return false;
        }
        if (modoCreacion === 'multiple' && empleadosSeleccionados.length === 0) {
            setError('Debes seleccionar al menos un empleado');
            return false;
        }
        if (!fechaLimite) {
            setError('La fecha límite es requerida');
            return false;
        }
        if (tareas.some((t) => !t.descripcion.trim())) {
            setError('Todas las tareas deben tener descripción');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        setError('');
        if (!validarFormulario()) return;

        try {
            setSubmitting(true);

            const ordenData = {
                kpiId,
                empleadoId: empleadoId || empleadosSeleccionados[0],
                titulo,
                descripcion,
                cantidadTareas: tareas.length,
                fechaLimite,
                tipoOrden,
                tareas: tareas.map((t) => ({
                    descripcion: t.descripcion,
                    orden: t.orden,
                })),
            };

            if (modoCreacion === 'individual') {
                await ordenesTrabajoService.create(ordenData);
                alert('Orden de trabajo creada exitosamente');
            } else {
                await ordenesTrabajoService.createBulk(ordenData, empleadosSeleccionados);
                alert(`${empleadosSeleccionados.length} órdenes creadas exitosamente`);
            }

            navigate('/ordenes');
        } catch (error: any) {
            console.error('Error al crear orden:', error);
            setError(error.response?.data?.message || 'Error al crear la orden');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando formulario...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const kpiSeleccionado = kpis.find((k) => k.id === kpiId);

    return (
        <Layout>
            <div className="p-8 max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/ordenes')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Trabajo</h1>
                        <p className="text-gray-600 mt-1">Crea y asigna tareas basadas en KPIs</p>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-900">Error</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Modo de Creación */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Modo de Creación</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setModoCreacion('individual')}
                            className={`p-4 rounded-lg border-2 transition-all ${modoCreacion === 'individual'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Users className={`w-6 h-6 mx-auto mb-2 ${modoCreacion === 'individual' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <p className={`font-semibold ${modoCreacion === 'individual' ? 'text-blue-900' : 'text-gray-900'}`}>
                                Individual
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Una orden para un empleado</p>
                        </button>

                        <button
                            onClick={() => setModoCreacion('multiple')}
                            className={`p-4 rounded-lg border-2 transition-all ${modoCreacion === 'multiple'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Users className={`w-6 h-6 mx-auto mb-2 ${modoCreacion === 'multiple' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <p className={`font-semibold ${modoCreacion === 'multiple' ? 'text-blue-900' : 'text-gray-900'}`}>
                                Múltiple
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Misma orden para varios empleados</p>
                        </button>
                    </div>
                </div>

                {/* Información General */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        Información General
                    </h2>

                    <div className="space-y-4">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ej: Análisis de Presupuesto Trimestral"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Describe el objetivo de esta orden de trabajo..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none"
                            />
                        </div>

                        {/* Grid: KPI y Tipo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Seleccionar KPI */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    KPI <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchKpi}
                                        onChange={(e) => setSearchKpi(e.target.value)}
                                        placeholder="Buscar KPI..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <select
                                    value={kpiId}
                                    onChange={(e) => setKpiId(e.target.value)}
                                    className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Selecciona un KPI</option>
                                    {kpisFiltrados.map((kpi) => (
                                        <option key={kpi.id} value={kpi.id}>
                                            {kpi.key} - {kpi.indicador}
                                        </option>
                                    ))}
                                </select>
                                {kpiSeleccionado && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-blue-700">
                                            <strong>Área:</strong> {kpiSeleccionado.area}
                                        </p>
                                        <p className="text-xs text-blue-700">
                                            <strong>Tipo:</strong> {kpiSeleccionado.tipoCalculo}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Tipo de Orden */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Orden <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={tipoOrden}
                                    onChange={(e) => setTipoOrden(e.target.value as any)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="kpi_sistema">KPI del Sistema</option>
                                    <option value="orden_empleado">Orden Solicitada</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    {tipoOrden === 'kpi_sistema'
                                        ? 'Orden basada en un KPI definido'
                                        : 'Orden solicitada manualmente'}
                                </p>
                            </div>
                        </div>

                        {/* Fecha Límite */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Límite <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={fechaLimite}
                                    onChange={(e) => setFechaLimite(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asignar Empleados */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        {modoCreacion === 'individual' ? 'Asignar Empleado' : 'Asignar Empleados'}
                    </h2>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchEmpleado}
                            onChange={(e) => setSearchEmpleado(e.target.value)}
                            placeholder="Buscar empleado..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {modoCreacion === 'individual' ? (
                        <select
                            value={empleadoId}
                            onChange={(e) => setEmpleadoId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Selecciona un empleado</option>
                            {empleadosFiltrados.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.nombre} {emp.apellido} - {emp.puesto || 'Sin puesto'} ({emp.area?.nombre || 'Sin área'})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                            {empleadosFiltrados.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No se encontraron empleados</p>
                            ) : (
                                empleadosFiltrados.map((emp) => (
                                    <label
                                        key={emp.id}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={empleadosSeleccionados.includes(emp.id)}
                                            onChange={() => toggleEmpleado(emp.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {emp.nombre} {emp.apellido}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {emp.puesto || 'Sin puesto'} • {emp.area?.nombre || 'Sin área'}
                                            </p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    )}

                    {modoCreacion === 'multiple' && empleadosSeleccionados.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <strong>{empleadosSeleccionados.length}</strong> empleado(s) seleccionado(s)
                            </p>
                        </div>
                    )}
                </div>

                {/* Tareas */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Tareas ({tareas.length})
                        </h2>
                        <button
                            onClick={agregarTarea}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Tarea
                        </button>
                    </div>

                    <div className="space-y-3">
                        {tareas.map((tarea, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm flex-shrink-0">
                                    {tarea.orden}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={tarea.descripcion}
                                        onChange={(e) => actualizarTarea(index, e.target.value)}
                                        placeholder={`Descripción de la tarea ${tarea.orden}...`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={2}
                                    />
                                </div>
                                {tareas.length > 1 && (
                                    <button
                                        onClick={() => eliminarTarea(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center justify-end gap-4 pb-8">
                    <button
                        onClick={() => navigate('/ordenes')}
                        disabled={submitting}
                        className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Creando...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>
                                    {modoCreacion === 'individual'
                                        ? 'Crear Orden'
                                        : `Crear ${empleadosSeleccionados.length} Órdenes`}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Layout>
    );
}
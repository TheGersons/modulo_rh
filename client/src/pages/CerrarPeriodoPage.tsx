import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Users,
    Target,
    Play,
    CheckCircle,
    AlertCircle,
    Building,
    FolderOpen,
} from 'lucide-react';
import { evaluacionesService } from '../services/evaluaciones.service';
import { areasService } from '../services/areas.service';
import { empleadosService } from '../services/empleados.service';
import { usePermissions } from '../hooks/usePermissions';

interface Area {
    id: string;
    nombre: string;
    areaPadreId?: string;
}

interface Empleado {
    id: string;
    nombre: string;
    apellido: string;
    area?: { nombre: string };
}

interface ResultadoCierre {
    mensaje: string;
    periodo: string;
    anio: number;
    evaluacionesCreadas: number;
    detalles: Array<{
        empleado: string;
        evaluacionId: string;
        ordenes: number;
        kpisEvaluados: number;
        promedio: number;
        kpisRojos: number;
    }>;
}

export default function CerrarPeriodoPage() {
    const navigate = useNavigate();
    const { can } = usePermissions();
    const [areas, setAreas] = useState<Area[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);

    // Form state
    const [periodo, setPeriodo] = useState('');
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [areaId, setAreaId] = useState<string>('');
    const [subAreasSeleccionadas, setSubAreasSeleccionadas] = useState<string[]>([]);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<string[]>([]);
    const [modoSeleccion, setModoSeleccion] = useState<'todos' | 'area' | 'especificos'>('todos');

    // UI state
    const [loading, setLoading] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState<ResultadoCierre | null>(null);
    const [error, setError] = useState('');

    const puedeAcceder = can('cerrar_periodo');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [areasData, empleadosData] = await Promise.all([
                areasService.getAll(),
                empleadosService.getAll(),
            ]);
            setAreas(areasData);
            setEmpleados(empleadosData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Obtener áreas principales (sin padre)
    const areasPrincipales = areas.filter((a) => !a.areaPadreId);

    // Obtener sub-áreas del área seleccionada
    const subAreasDisponibles = areaId ? areas.filter((a) => a.areaPadreId === areaId) : [];

    // Obtener empleados filtrados
    const empleadosFiltrados = () => {
        if (modoSeleccion === 'area') {
            if (!areaId) return [];

            // Incluir área seleccionada + sub-áreas seleccionadas
            const areasIds = [areaId, ...subAreasSeleccionadas];

            return empleados.filter((emp) => {
                if (!emp.area) return false;
                // Buscar el área del empleado en la lista
                const areaEmpleado = areas.find((a) => a.nombre === emp.area!.nombre);
                return areaEmpleado && areasIds.includes(areaEmpleado.id);
            });
        }
        return [];
    };

    const handleCerrarPeriodo = async () => {
        setError('');

        if (!periodo) {
            setError('Debes seleccionar un periodo');
            return;
        }

        if (
            !window.confirm(
                `¿Estás seguro de cerrar el periodo ${periodo} ${anio}?\n\nEsto generará evaluaciones automáticas para los empleados seleccionados.`
            )
        ) {
            return;
        }

        try {
            setProcesando(true);

            const data: any = {
                periodo,
                anio,
            };

            if (modoSeleccion === 'area') {
                // Enviar área principal + sub-áreas seleccionadas
                const areasIds = [areaId, ...subAreasSeleccionadas].filter(Boolean);
                if (areasIds.length > 0) {
                    data.areasIds = areasIds;
                }
            } else if (modoSeleccion === 'especificos') {
                data.empleadoIds = empleadosSeleccionados;
            }

            const response = await evaluacionesService.cerrarPeriodo(data);
            setResultado(response);
        } catch (error: any) {
            console.error('Error al cerrar periodo:', error);
            setError(error.response?.data?.message || 'Error al cerrar el periodo');
        } finally {
            setProcesando(false);
        }
    };

    const toggleEmpleado = (id: string) => {
        if (empleadosSeleccionados.includes(id)) {
            setEmpleadosSeleccionados(empleadosSeleccionados.filter((e) => e !== id));
        } else {
            setEmpleadosSeleccionados([...empleadosSeleccionados, id]);
        }
    };

    const toggleSubArea = (subAreaId: string) => {
        if (subAreasSeleccionadas.includes(subAreaId)) {
            setSubAreasSeleccionadas(subAreasSeleccionadas.filter((id) => id !== subAreaId));
        } else {
            setSubAreasSeleccionadas([...subAreasSeleccionadas, subAreaId]);
        }
    };

    const seleccionarTodasSubAreas = () => {
        setSubAreasSeleccionadas(subAreasDisponibles.map((s) => s.id));
    };

    const deseleccionarTodasSubAreas = () => {
        setSubAreasSeleccionadas([]);
    };

    const getPeriodoLabel = (periodo: string) => {
        const labels: Record<string, string> = {
            enero: 'Enero',
            febrero: 'Febrero',
            marzo: 'Marzo',
            abril: 'Abril',
            mayo: 'Mayo',
            junio: 'Junio',
            julio: 'Julio',
            agosto: 'Agosto',
            septiembre: 'Septiembre',
            octubre: 'Octubre',
            noviembre: 'Noviembre',
            diciembre: 'Diciembre',
            trimestre_1: 'Trimestre 1 (Ene-Mar)',
            trimestre_2: 'Trimestre 2 (Abr-Jun)',
            trimestre_3: 'Trimestre 3 (Jul-Sep)',
            trimestre_4: 'Trimestre 4 (Oct-Dic)',
            semestre_1: 'Semestre 1 (Ene-Jun)',
            semestre_2: 'Semestre 2 (Jul-Dic)',
            anual: 'Anual',
        };
        return labels[periodo] || periodo;
    };

    if (!puedeAcceder) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Denegado</h3>
                <p className="text-gray-600">Solo administradores y RRHH pueden cerrar periodos.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    const empleadosAreaFiltrados = empleadosFiltrados();
    const totalEmpleadosArea = modoSeleccion === 'area' ? empleadosAreaFiltrados.length : 0;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Cerrar Periodo de Evaluación</h1>
                        <p className="text-blue-100 mt-1">
                            Genera evaluaciones automáticas basadas en órdenes completadas
                        </p>
                    </div>
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

            {/* Resultado del Cierre */}
            {resultado && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-green-900 mb-2">
                                ¡Periodo Cerrado Exitosamente!
                            </h3>
                            <p className="text-green-700 mb-4">
                                Se generaron <strong>{resultado.evaluacionesCreadas}</strong> evaluaciones para{' '}
                                {getPeriodoLabel(resultado.periodo)} {resultado.anio}
                            </p>

                            <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                                <h4 className="font-semibold text-gray-900 mb-3">Resumen por Empleado:</h4>
                                <div className="space-y-2">
                                    {resultado.detalles.map((detalle, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{detalle.empleado}</p>
                                                <p className="text-sm text-gray-600">
                                                    {detalle.ordenes} órdenes • {detalle.kpisEvaluados} KPIs evaluados
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-blue-600">{detalle.promedio}%</p>
                                                {detalle.kpisRojos > 0 && (
                                                    <p className="text-xs text-red-600">{detalle.kpisRojos} KPIs rojos</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => navigate(`/kpis/mis-evaluaciones/${detalle.evaluacionId}`)}
                                                className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                            >
                                                Ver
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => navigate('/kpis/mis-evaluaciones')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Ver Todas las Evaluaciones
                                </button>
                                <button
                                    onClick={() => {
                                        setResultado(null);
                                        setPeriodo('');
                                        setEmpleadosSeleccionados([]);
                                        setSubAreasSeleccionadas([]);
                                    }}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Cerrar Otro Periodo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulario de Cierre */}
            {!resultado && (
                <>
                    {/* Selección de Periodo */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Seleccionar Periodo
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Periodo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Periodo <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={periodo}
                                    onChange={(e) => setPeriodo(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Selecciona un periodo</option>
                                    <optgroup label="Meses">
                                        {[
                                            'enero',
                                            'febrero',
                                            'marzo',
                                            'abril',
                                            'mayo',
                                            'junio',
                                            'julio',
                                            'agosto',
                                            'septiembre',
                                            'octubre',
                                            'noviembre',
                                            'diciembre',
                                        ].map((mes) => (
                                            <option key={mes} value={mes}>
                                                {getPeriodoLabel(mes)}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Trimestres">
                                        {['trimestre_1', 'trimestre_2', 'trimestre_3', 'trimestre_4'].map((trim) => (
                                            <option key={trim} value={trim}>
                                                {getPeriodoLabel(trim)}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Semestres">
                                        {['semestre_1', 'semestre_2'].map((sem) => (
                                            <option key={sem} value={sem}>
                                                {getPeriodoLabel(sem)}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Anual">
                                        <option value="anual">Anual</option>
                                    </optgroup>
                                </select>
                            </div>

                            {/* Año */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Año <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={anio}
                                    onChange={(e) => setAnio(Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Selección de Empleados */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Seleccionar Empleados
                        </h2>

                        {/* Modo de selección */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <button
                                onClick={() => {
                                    setModoSeleccion('todos');
                                    setEmpleadosSeleccionados([]);
                                    setAreaId('');
                                    setSubAreasSeleccionadas([]);
                                }}
                                className={`p-4 rounded-lg border-2 transition-all ${modoSeleccion === 'todos'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Users
                                    className={`w-6 h-6 mx-auto mb-2 ${modoSeleccion === 'todos' ? 'text-blue-600' : 'text-gray-400'
                                        }`}
                                />
                                <p
                                    className={`font-semibold ${modoSeleccion === 'todos' ? 'text-blue-900' : 'text-gray-900'
                                        }`}
                                >
                                    Todos
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {empleados.filter((e) => e.area).length} empleados
                                </p>
                            </button>

                            <button
                                onClick={() => {
                                    setModoSeleccion('area');
                                    setEmpleadosSeleccionados([]);
                                }}
                                className={`p-4 rounded-lg border-2 transition-all ${modoSeleccion === 'area'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Target
                                    className={`w-6 h-6 mx-auto mb-2 ${modoSeleccion === 'area' ? 'text-blue-600' : 'text-gray-400'
                                        }`}
                                />
                                <p
                                    className={`font-semibold ${modoSeleccion === 'area' ? 'text-blue-900' : 'text-gray-900'
                                        }`}
                                >
                                    Por Área
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{areasPrincipales.length} áreas</p>
                            </button>

                            <button
                                onClick={() => {
                                    setModoSeleccion('especificos');
                                    setEmpleadosSeleccionados([]);
                                    setAreaId('');
                                    setSubAreasSeleccionadas([]);
                                }}
                                className={`p-4 rounded-lg border-2 transition-all ${modoSeleccion === 'especificos'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <CheckCircle
                                    className={`w-6 h-6 mx-auto mb-2 ${modoSeleccion === 'especificos' ? 'text-blue-600' : 'text-gray-400'
                                        }`}
                                />
                                <p
                                    className={`font-semibold ${modoSeleccion === 'especificos' ? 'text-blue-900' : 'text-gray-900'
                                        }`}
                                >
                                    Específicos
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Selección manual</p>
                            </button>
                        </div>

                        {/* Selección por área */}
                        {modoSeleccion === 'area' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Building className="w-4 h-4 inline mr-1" />
                                        Selecciona un área principal
                                    </label>
                                    <select
                                        value={areaId}
                                        onChange={(e) => {
                                            setAreaId(e.target.value);
                                            setSubAreasSeleccionadas([]);
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Selecciona un área</option>
                                        {areasPrincipales.map((area) => (
                                            <option key={area.id} value={area.id}>
                                                {area.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sub-áreas si existen */}
                                {subAreasDisponibles.length > 0 && areaId && (
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                <FolderOpen className="w-4 h-4 inline mr-1" />
                                                Sub-áreas (opcional)
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={seleccionarTodasSubAreas}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Seleccionar todas
                                                </button>
                                                <button
                                                    onClick={deseleccionarTodasSubAreas}
                                                    className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                                                >
                                                    Ninguna
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {subAreasDisponibles.map((subArea) => (
                                                <label
                                                    key={subArea.id}
                                                    className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={subAreasSeleccionadas.includes(subArea.id)}
                                                        onChange={() => toggleSubArea(subArea.id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-900">{subArea.nombre}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Si no seleccionas ninguna, se evaluarán solo los empleados del área principal
                                        </p>
                                    </div>
                                )}

                                {/* Info de empleados del área */}
                                {areaId && totalEmpleadosArea > 0 && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>{totalEmpleadosArea}</strong> empleado(s) serán evaluados{' '}
                                            {subAreasSeleccionadas.length > 0 && `(incluyendo ${subAreasSeleccionadas.length} sub-área(s))`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selección específica */}
                        {modoSeleccion === 'especificos' && (
                            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                                <div className="space-y-2">
                                    {empleados
                                        .filter((e) => e.area)
                                        .map((emp) => (
                                            <label
                                                key={emp.id}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={empleadosSeleccionados.includes(emp.id)}
                                                    onChange={() => toggleEmpleado(emp.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {emp.nombre} {emp.apellido}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{emp.area?.nombre}</p>
                                                </div>
                                            </label>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Info de selección */}
                        {modoSeleccion === 'especificos' && empleadosSeleccionados.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <strong>{empleadosSeleccionados.length}</strong> empleado(s) seleccionado(s)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botón de Acción */}
                    <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div>
                            <p className="text-sm text-gray-600">
                                {modoSeleccion === 'todos' && 'Se evaluarán todos los empleados activos'}
                                {modoSeleccion === 'area' && areaId && `Se evaluarán ${totalEmpleadosArea} empleados del área seleccionada`}
                                {modoSeleccion === 'especificos' &&
                                    `Se evaluarán ${empleadosSeleccionados.length} empleados seleccionados`}
                            </p>
                            {periodo && (
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                    Periodo: {getPeriodoLabel(periodo)} {anio}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleCerrarPeriodo}
                            disabled={!periodo || procesando}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {procesando ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    <span>Cerrar Periodo y Evaluar</span>
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
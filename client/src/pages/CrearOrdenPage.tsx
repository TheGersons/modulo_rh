import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Users,
  Target,
  Calendar,
  FileText,
  Building,
  Briefcase,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { empleadosService } from '../services/empleados.service';
import { kpisService } from '../services/kpis.service';
import { areasService } from '../services/areas.service';
import { ordenesTrabajoService } from '../services/ordenes-trabajo.service';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  puesto?: {
    id: string;
    nombre: string;
  } | null;
  area?: {
    id: string;
    nombre: string;
  } | null;
}

interface KPI {
  id: string;
  key: string;
  indicador: string;
  meta: number;
  unidad: string;
  areaRelacion?: {
    id: string;
    nombre: string;
  } | null;
  puestoRelacion?: {
    id: string;
    nombre: string;
  } | null;
}

interface Area {
  id: string;
  nombre: string;
  areaPadreId?: string;
}

export default function CrearOrdenPage() {
  const navigate = useNavigate();

  // Datos de catálogos
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [kpisFiltrados, setKpisFiltrados] = useState<KPI[]>([]);

  // Filtros para empleados
  const [filtroArea, setFiltroArea] = useState('todas');
  const [filtroSubArea, setFiltroSubArea] = useState('todas');
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState<Empleado[]>([]);

  // Form state
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<string[]>([]);
  const [kpiId, setKpiId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [tipoAsignacion, setTipoAsignacion] = useState<'individual' | 'multiple'>('individual');

  // UI state
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar empleados según área y sub-área
  useEffect(() => {
    let filtrados = empleados;

    if (filtroArea !== 'todas') {
      if (filtroSubArea !== 'todas') {
        // Filtrar por sub-área específica
        filtrados = filtrados.filter((e) => e.area?.id === filtroSubArea);
      } else {
        // Filtrar por área principal y sus sub-áreas
        filtrados = filtrados.filter((e) => {
          const areaEmpleado = e.area?.id;
          const areaPadreEmpleado = areas.find((a) => a.id === areaEmpleado)?.areaPadreId;
          return areaEmpleado === filtroArea || areaPadreEmpleado === filtroArea;
        });
      }
    }

    setEmpleadosFiltrados(filtrados);
  }, [filtroArea, filtroSubArea, empleados, areas]);

  // Filtrar KPIs según empleados seleccionados y filtros de área
  useEffect(() => {
    // Sin selección ni filtro → todos los KPIs
    if (empleadosSeleccionados.length === 0 && filtroArea === 'todas') {
      setKpisFiltrados(kpis);
      return;
    }

    // Empleados de referencia: los seleccionados tienen prioridad,
    // si no hay seleccionados usamos los filtrados por área
    const empleadosReferencia = empleadosSeleccionados.length > 0
      ? empleados.filter((e) => empleadosSeleccionados.includes(e.id))
      : empleadosFiltrados;

    // Construir el set de areaIds relevantes incluyendo área padre
    // Ej: empleado en sub-área "Contabilidad" (padre: "Administrativa")
    //     → incluir ambas para que los KPIs de área padre también aparezcan
    const areaIdsDirectas = empleadosReferencia
      .map((e) => e.area?.id)
      .filter(Boolean) as string[];

    const areaIdsConPadre = new Set<string>(areaIdsDirectas);
    areaIdsDirectas.forEach((areaId) => {
      const areaDato = areas.find((a) => a.id === areaId);
      if (areaDato?.areaPadreId) areaIdsConPadre.add(areaDato.areaPadreId);
    });

    // Puestos — solo de empleados que SÍ tienen puesto asignado
    const puestoIds = new Set(
      empleadosReferencia
        .map((e) => e.puesto?.id)
        .filter(Boolean) as string[]
    );

    const filtrados = kpis.filter((kpi) => {
      const tieneArea = !!kpi.areaRelacion;
      const tienePuesto = !!kpi.puestoRelacion;

      // KPI genérico (sin área ni puesto) → siempre visible
      if (!tieneArea && !tienePuesto) return true;

      // KPI con puesto específico → mostrar solo si algún empleado
      // seleccionado tiene ese puesto
      if (tienePuesto) {
        return puestoIds.has(kpi.puestoRelacion!.id);
      }

      // KPI de área → mostrar si el área del KPI está en el set
      // (área directa del empleado o área padre)
      if (tieneArea) {
        return areaIdsConPadre.has(kpi.areaRelacion!.id);
      }

      return false;
    });

    // NUNCA hacer fallback a todos — si no hay coincidencia, lista vacía
    setKpisFiltrados(filtrados);
  }, [empleadosSeleccionados, filtroArea, filtroSubArea, kpis, empleados, empleadosFiltrados, areas]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [empleadosData, areasData, kpisData] = await Promise.all([
        empleadosService.getAll(),
        areasService.getAll(),
        kpisService.getAll(),
      ]);
      setEmpleados(empleadosData.filter((e: Empleado) => e.activo));
      setEmpleadosFiltrados(empleadosData.filter((e: Empleado) => e.activo));
      setAreas(areasData);
      setKpis(kpisData);
      setKpisFiltrados(kpisData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmpleado = (empleadoId: string) => {
    setEmpleadosSeleccionados((prev) =>
      prev.includes(empleadoId)
        ? prev.filter((id) => id !== empleadoId)
        : [...prev, empleadoId]
    );
    setKpiId('');
  };

  const seleccionarTodos = () => {
    setEmpleadosSeleccionados(empleadosFiltrados.map((e) => e.id));
  };

  const limpiarSeleccion = () => {
    setEmpleadosSeleccionados([]);
  };

  const handleSubmit = async () => {
    setError('');

    if (empleadosSeleccionados.length === 0) {
      setError('Debes seleccionar al menos un empleado');
      return;
    }

    if (!kpiId) {
      setError('Debes seleccionar un KPI');
      return;
    }

    if (!titulo.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    if (!fechaLimite) {
      setError('La fecha límite es requerida');
      return;
    }

    const fechaSeleccionada = new Date(fechaLimite);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      setError('La fecha límite debe ser mayor o igual a hoy');
      return;
    }

    try {
      setGuardando(true);

      const ordenData = {
        kpiId,
        empleadoId: empleadosSeleccionados[0], // Requerido por DTO
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        cantidadTareas: 1,
        fechaLimite: new Date(fechaLimite).toISOString(),
        tipoOrden: 'kpi_sistema',
        tareas: [
          {
            descripcion: descripcion.trim(),
            orden: 1,
          },
        ],
      };

      if (empleadosSeleccionados.length === 1) {
        await ordenesTrabajoService.create(ordenData);
      } else {
        await ordenesTrabajoService.createBulk(ordenData, empleadosSeleccionados);
      }

      navigate('/ordenes');
    } catch (error: any) {
      console.error('Error al crear orden:', error);
      setError(error.response?.data?.message || 'Error al crear la orden de trabajo');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const kpiSeleccionado = kpis.find((k) => k.id === kpiId);
  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/ordenes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Trabajo</h1>
              <p className="text-gray-600 mt-1">Asigna tareas vinculadas a KPIs</p>
            </div>
          </div>

          {/* Tipo de Asignación */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTipoAsignacion('individual')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${tipoAsignacion === 'individual'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Individual
            </button>
            <button
              onClick={() => setTipoAsignacion('multiple')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${tipoAsignacion === 'multiple'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Múltiple
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Empleados */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Seleccionar Empleados</h2>
                  <p className="text-sm text-gray-600">
                    {empleadosSeleccionados.length} seleccionado(s) de {empleadosFiltrados.length}
                  </p>
                </div>
              </div>

              {tipoAsignacion === 'multiple' && (
                <div className="flex gap-2">
                  <button
                    onClick={seleccionarTodos}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Seleccionar todos
                  </button>
                  <button
                    onClick={limpiarSeleccion}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              )}
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Filtro Área Principal */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Área Principal</label>
                <select
                  value={filtroArea}
                  onChange={(e) => {
                    setFiltroArea(e.target.value);
                    setFiltroSubArea('todas');
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todas">Todas las áreas</option>
                  {areas
                    .filter((a) => !a.areaPadreId)
                    .map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                </select>
              </div>

              {/* Filtro Sub-área */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sub-área</label>
                <select
                  value={filtroSubArea}
                  onChange={(e) => setFiltroSubArea(e.target.value)}
                  disabled={filtroArea === 'todas'}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="todas">
                    {filtroArea === 'todas' ? 'Primero selecciona un área' : 'Todas las sub-áreas'}
                  </option>
                  {filtroArea !== 'todas' &&
                    areas
                      .filter((a) => a.areaPadreId === filtroArea)
                      .map((subArea) => (
                        <option key={subArea.id} value={subArea.id}>
                          {subArea.nombre}
                        </option>
                      ))}
                </select>
              </div>
            </div>

            {/* Lista de Empleados */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {empleadosFiltrados.map((emp) => {
                const isSelected = empleadosSeleccionados.includes(emp.id);
                const puestoNombre = emp.puesto?.nombre ?? 'Sin puesto';
                const areaNombre = emp.area?.nombre ?? 'Sin área';

                return (
                  <div
                    key={emp.id}
                    onClick={() => toggleEmpleado(emp.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox/Radio */}
                      <div
                        className={`w-5 h-5 rounded ${tipoAsignacion === 'individual' ? 'rounded-full' : 'rounded'
                          } border-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {emp.nombre} {emp.apellido}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {puestoNombre}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {areaNombre}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {empleadosFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No hay empleados en esta área</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Detalles */}
          <div className="space-y-6">
            {/* KPI */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">KPI</h2>
              </div>

              <select
                value={kpiId}
                onChange={(e) => setKpiId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="">Selecciona un KPI</option>
                {kpisFiltrados.map((kpi) => {
                  //const areaNombre = kpi.areaRelacion?.nombre ?? 'Sin área';
                  return (
                    <option key={kpi.id} value={kpi.id}>
                      {kpi.indicador}
                    </option>
                  );
                })}
              </select>

              {kpiSeleccionado && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-1">{kpiSeleccionado.indicador}</p>
                  <p className="text-xs text-purple-700">
                    Meta: {kpiSeleccionado.meta}
                    {kpiSeleccionado.unidad}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {kpiSeleccionado.areaRelacion?.nombre ?? 'Sin área'}
                  </p>
                </div>
              )}
            </div>

            {/* Detalles */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Detalles</h2>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título de la orden"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  placeholder="Describe la orden de trabajo..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Fecha Límite */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha Límite <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  min={today}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/ordenes')}
                disabled={guardando}
                className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={guardando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Crear {empleadosSeleccionados.length > 1 ? `(${empleadosSeleccionados.length})` : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
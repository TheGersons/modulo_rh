import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Calculator,
  Copy,
} from 'lucide-react';
import { kpisService } from '../services/kpis.service';
import { areasService } from '../services/areas.service';
import Layout from '../components/layout/Layout';
import { usePermissions } from '../hooks/usePermissions';

interface KPI {
  id: string;
  key: string;
  area: string;
  areaId: string;
  puesto?: string | { id: string; nombre: string };
  indicador: string;
  descripcion?: string;
  tipoCalculo: string;
  formulaCalculo: string;
  meta?: number;
  operadorMeta?: string;
  umbralAmarillo?: number;
  tipoCriticidad: string;
  periodicidad: string;
  sentido: string;
  unidad?: string;
  activo: boolean;
  aplicaOrdenTrabajo: boolean;
  areaRelacion?: {
    nombre: string;
  };
}

interface Area {
  id: string;
  nombre: string;
  areaPadreId?: string | null;
}

export default function KPIsPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCriticidad, setFiltroCriticidad] = useState<string>('todas');
  const [filtroPuesto, setFiltroPuesto] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<boolean | undefined>(undefined);
  const [filtroAreaPadre, setFiltroAreaPadre] = useState<string>('todas');
  const [filtroSubArea, setFiltroSubArea] = useState<string>('todas');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [kpisPorPagina] = useState(10);

  const puedeGestionarKpis = can('gestionar_kpis');
  const areasPadre = areas.filter((a) => !a.areaPadreId);
  const subAreasFiltradas = filtroAreaPadre === 'todas'
    ? []
    : areas.filter((a) => a.areaPadreId === filtroAreaPadre);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filtroAreaPadre, filtroSubArea, filtroCriticidad, filtroPuesto, filtroEstado]);

  // Resetear puesto seleccionado cuando cambia el área
  useEffect(() => {
    setFiltroPuesto('todos');
  }, [filtroAreaPadre, filtroSubArea]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [kpisData, areasData] = await Promise.all([
        kpisService.getAll(),
        areasService.getAll(),
      ]);
      setKpis(kpisData);
      setAreas(areasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (id: string) => {
    try {
      await kpisService.toggle(id);
      await cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado del KPI');
    }
  };

  const handleEliminar = async (id: string, key: string) => {
    if (!confirm(`¿Estás seguro de eliminar el KPI ${key}?`)) return;

    try {
      await kpisService.delete(id);
      await cargarDatos();
      alert('KPI eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      alert(error.response?.data?.message || 'Error al eliminar el KPI');
    }
  };

  const handleDuplicar = (kpiId: string) => {
    navigate(`/configuracion/kpis?duplicar=${kpiId}`);
  };

  const getTipoCalculoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      binario: 'Binario',
      division: 'División',
      conteo: 'Conteo',
      porcentaje_kpis_equipo: '% KPIs Equipo',
      dashboard_presentado: 'Dashboard',
      personalizado: 'Personalizado',
      precision: 'Precision'
    };
    return labels[tipo] || tipo;
  };

  const getTipoCalculoBadge = (tipo: string) => {
    const badges: Record<string, string> = {
      binario: 'bg-blue-100 text-blue-700',
      division: 'bg-purple-100 text-purple-700',
      conteo: 'bg-green-100 text-green-700',
      porcentaje_kpis_equipo: 'bg-orange-100 text-orange-700',
      dashboard_presentado: 'bg-pink-100 text-pink-700',
      personalizado: 'bg-gray-100 text-gray-700',
      precision: 'bg-teal-100 text-teal-700',
    };
    return badges[tipo] || 'bg-gray-100 text-gray-700';
  };

  // Helper: normaliza texto quitando tildes, apóstrofes y mayúsculas
  const normalizar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quita diacríticos (tildes, diéresis, etc.)
      .replace(/[''`]/g, '')           // quita apóstrofes
      .toLowerCase();

  // Filtrado
  const termNorm = normalizar(searchTerm);

  // KPIs que pasan el filtro de área (sin aplicar el resto) → para derivar puestos disponibles
  const kpisPorArea = kpis.filter((kpi) => {
    if (filtroAreaPadre === 'todas') return true;
    if (filtroSubArea !== 'todas') return kpi.areaId === filtroSubArea;
    return subAreasFiltradas.some((sa) => sa.id === kpi.areaId);
  });

  // Lista de puestos únicos presentes en los KPIs del área seleccionada
  const puestosDisponibles: { id: string; nombre: string }[] = [];
  const puestosVistos = new Set<string>();
  for (const kpi of kpisPorArea) {
    if (kpi.puesto) {
      const id = typeof kpi.puesto === 'object' ? kpi.puesto.id : kpi.puesto;
      const nombre = typeof kpi.puesto === 'object' ? kpi.puesto.nombre : kpi.puesto;
      if (!puestosVistos.has(id)) {
        puestosVistos.add(id);
        puestosDisponibles.push({ id, nombre });
      }
    }
  }
  puestosDisponibles.sort((a, b) => a.nombre.localeCompare(b.nombre));

  const kpisFiltrados = kpis.filter((kpi) => {
    const areaNombre = kpi.areaRelacion?.nombre ?? (typeof kpi.area === 'object' ? (kpi.area as any)?.nombre : kpi.area) ?? '';
    const matchSearch =
      searchTerm === '' ||
      normalizar(kpi.key).includes(termNorm) ||
      normalizar(kpi.indicador).includes(termNorm) ||
      (kpi.descripcion && normalizar(kpi.descripcion).includes(termNorm)) ||
      normalizar(areaNombre).includes(termNorm);

    const matchArea =
      filtroAreaPadre === 'todas' ||
      (filtroSubArea !== 'todas'
        ? kpi.areaId === filtroSubArea
        : subAreasFiltradas.some((sa) => sa.id === kpi.areaId));
    const matchCriticidad = filtroCriticidad === 'todas' || kpi.tipoCriticidad === filtroCriticidad;
    const matchPuesto =
      filtroPuesto === 'todos' ||
      (kpi.puesto &&
        (typeof kpi.puesto === 'object' ? kpi.puesto.id : kpi.puesto) === filtroPuesto);
    const matchEstado = filtroEstado === undefined || kpi.activo === filtroEstado;

    return matchSearch && matchArea && matchCriticidad && matchPuesto && matchEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(kpisFiltrados.length / kpisPorPagina);
  const indexInicio = (paginaActual - 1) * kpisPorPagina;
  const indexFin = indexInicio + kpisPorPagina;
  const kpisPaginados = kpisFiltrados.slice(indexInicio, indexFin);

  // Stats
  const stats = {
    total: kpis.length,
    activos: kpis.filter((k) => k.activo).length,
    criticos: kpis.filter((k) => k.tipoCriticidad === 'critico').length,
    porArea: areas.map((area) => ({
      nombre: area.nombre,
      cantidad: kpis.filter((k) => k.areaId === area.id).length,
    })),
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando KPIs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KPIs</h1>
            <p className="text-gray-600 mt-1">{kpis.length} indicadores configurados</p>
          </div>

          {puedeGestionarKpis && (
            <button
              onClick={() => navigate('/configuracion/kpis')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo KPI
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total KPIs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.criticos}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código o indicador..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Área padre */}
            <select
              value={filtroAreaPadre}
              onChange={(e) => {
                setFiltroAreaPadre(e.target.value);
                setFiltroSubArea('todas'); // reset sub-área al cambiar padre
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todas">Todas las áreas</option>
              {areasPadre.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>

            {/* Sub-área */}
            <select
              value={filtroSubArea}
              onChange={(e) => setFiltroSubArea(e.target.value)}
              disabled={filtroAreaPadre === 'todas'}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="todas">
                {filtroAreaPadre === 'todas' ? 'Selecciona un área' : 'Todas las sub-áreas'}
              </option>
              {subAreasFiltradas.map((sa) => (
                <option key={sa.id} value={sa.id}>
                  {sa.nombre}
                </option>
              ))}
            </select>

            {/* Criticidad */}
            <select
              value={filtroCriticidad}
              onChange={(e) => setFiltroCriticidad(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todas">Todas las criticidades</option>
              <option value="critico">Crítico</option>
              <option value="no_critico">No Crítico</option>
            </select>

            {/* Puesto */}
            <select
              value={filtroPuesto}
              onChange={(e) => setFiltroPuesto(e.target.value)}
              disabled={puestosDisponibles.length === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="todos">
                {puestosDisponibles.length === 0 ? 'Sin puestos' : 'Todos los puestos'}
              </option>
              {puestosDisponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Estado */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFiltroEstado(undefined)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroEstado === undefined
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroEstado(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroEstado === true
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFiltroEstado(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroEstado === false
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Inactivos
            </button>
          </div>
        </div>

        {/* Info de resultados */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            Mostrando {kpisFiltrados.length > 0 ? indexInicio + 1 : 0} -{' '}
            {Math.min(indexFin, kpisFiltrados.length)} de {kpisFiltrados.length} KPIs
          </p>
        </div>

        {/* Lista de KPIs */}
        {kpisPaginados.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron KPIs</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {kpisPaginados.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{kpi.indicador}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoCalculoBadge(
                              kpi.tipoCalculo
                            )}`}
                          >
                            <Calculator className="w-3 h-3 inline mr-1" />
                            {getTipoCalculoLabel(kpi.tipoCalculo)}
                          </span>
                          {kpi.tipoCriticidad === 'critico' && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              Crítico
                            </span>
                          )}
                          {kpi.activo ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Activo
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              Inactivo
                            </span>
                          )}
                          {kpi.aplicaOrdenTrabajo && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              🔧 Orden de Trabajo
                            </span>
                          )}
                        </div>
                        {kpi.descripcion && (
                          <p className="text-gray-500 font-medium mb-2">{kpi.descripcion}</p>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Área</p>
                            <p className="font-medium text-gray-900">
                              {kpi.areaRelacion?.nombre || (typeof kpi.area === 'object' ? (kpi.area as any)?.nombre : kpi.area)}
                            </p>
                          </div>
                          {kpi.puesto && (
                            <div>
                              <p className="text-gray-500">Puesto</p>
                              <p className="font-medium text-gray-900">
                                {typeof kpi.puesto === 'object' ? kpi.puesto?.nombre : kpi.puesto}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-500">Periodicidad</p>
                            <p className="font-medium text-gray-900">{kpi.periodicidad}</p>
                          </div>
                          {kpi.meta && (
                            <div>
                              <p className="text-gray-500">Meta</p>
                              <p className="font-medium text-gray-900">
                                {kpi.operadorMeta} {kpi.meta}
                                {kpi.unidad}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  {puedeGestionarKpis && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActivo(kpi.id)}
                        className={`p-2 rounded-lg transition-colors ${kpi.activo
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        title={kpi.activo ? 'Desactivar' : 'Activar'}
                      >
                        {kpi.activo ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>

                      <button
                        onClick={() => navigate(`/configuracion/kpis?edit=${kpi.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDuplicar(kpi.id)}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Duplicar para otro puesto/área"
                      >
                        <Copy className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleEliminar(kpi.id, kpi.key)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                if (
                  numero === 1 ||
                  numero === totalPaginas ||
                  (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                ) {
                  return (
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
                  );
                } else if (numero === paginaActual - 2 || numero === paginaActual + 2) {
                  return (
                    <span key={numero} className="text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Target, Filter, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { kpisService } from '../services/kpis.service';
import { areasService } from '../services/areas.service';

interface KPI {
  id: string;
  key: string;
  area: string;
  areaId: string;
  puesto: string | null;
  indicador: string;
  descripcion: string | null;
  formula: string | null;
  meta: number;
  tolerancia: number;
  umbralAmarillo: number;
  periodicidad: string;
  sentido: string;
  unidad: string | null;
  orden: number;
  activo: boolean;
  areaRelacion?: {
    nombre: string;
  };
}

interface Area {
  id: string;
  nombre: string;
}

export default function GestionKPIsPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroArea, setFiltroArea] = useState<string>('todos');
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentKPI, setCurrentKPI] = useState<KPI | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    key: '',
    area: '',
    areaId: '',
    puesto: '',
    indicador: '',
    descripcion: '',
    formula: '',
    meta: 0,
    tolerancia: 0,
    periodicidad: 'mensual',
    sentido: 'Mayor es mejor',
    unidad: '%',
    orden: 0,
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, [filtroArea, filtroActivo]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar áreas
      const areasData = await areasService.getAll();
      setAreas(areasData);

      // Cargar KPIs con filtros
      const filters: any = {};
      if (filtroArea !== 'todos') filters.areaId = filtroArea;
      if (filtroActivo !== 'todos') filters.activo = filtroActivo === 'activos';

      const kpisData = await kpisService.getAll(filters);
      setKpis(kpisData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (kpi?: KPI) => {
    if (kpi) {
      setIsEditing(true);
      setCurrentKPI(kpi);
      setFormData({
        key: kpi.key,
        area: kpi.area,
        areaId: kpi.areaId,
        puesto: kpi.puesto || '',
        indicador: kpi.indicador,
        descripcion: kpi.descripcion || '',
        formula: kpi.formula || '',
        meta: kpi.meta,
        tolerancia: kpi.tolerancia,
        periodicidad: kpi.periodicidad,
        sentido: kpi.sentido,
        unidad: kpi.unidad || '%',
        orden: kpi.orden,
        activo: kpi.activo,
      });
    } else {
      setIsEditing(false);
      setCurrentKPI(null);
      setFormData({
        key: '',
        area: '',
        areaId: '',
        puesto: '',
        indicador: '',
        descripcion: '',
        formula: '',
        meta: 0,
        tolerancia: 0,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
        orden: 0,
        activo: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentKPI(null);
  };

  const handleAreaChange = (areaId: string) => {
    const areaSeleccionada = areas.find(a => a.id === areaId);
    setFormData({
      ...formData,
      areaId,
      area: areaSeleccionada?.nombre || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.key.trim()) {
      alert('El campo Key es obligatorio');
      return;
    }

    if (!formData.areaId) {
      alert('Debes seleccionar un área');
      return;
    }

    if (!formData.indicador.trim()) {
      alert('El campo Indicador es obligatorio');
      return;
    }

    if (formData.meta <= 0) {
      alert('La meta debe ser mayor a 0');
      return;
    }

    try {
      if (isEditing && currentKPI) {
        await kpisService.update(currentKPI.id, formData);
        alert('KPI actualizado exitosamente');
      } else {
        await kpisService.create(formData);
        alert('KPI creado exitosamente');
      }

      handleCloseModal();
      cargarDatos();
    } catch (error: any) {
      console.error('Error al guardar KPI:', error);
      alert(error.response?.data?.message || 'Error al guardar el KPI');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el KPI "${nombre}"?`)) {
      try {
        await kpisService.delete(id);
        alert('KPI eliminado exitosamente');
        cargarDatos();
      } catch (error: any) {
        console.error('Error al eliminar KPI:', error);
        alert(error.response?.data?.message || 'Error al eliminar el KPI');
      }
    }
  };

  const handleToggleActivo = async (id: string) => {
    try {
      await kpisService.update(id, { activo: !kpis.find(k => k.id === id)?.activo });
      cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const kpisFiltrados = kpis.filter(kpi => {
    const matchSearch = 
      kpi.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.indicador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando KPIs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de KPIs</h1>
          <p className="text-gray-600 mt-1">Administra el catálogo completo de indicadores</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo KPI
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total KPIs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.length}</p>
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
              <p className="text-2xl font-bold text-green-600 mt-1">
                {kpis.filter(k => k.activo).length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ToggleRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {kpis.filter(k => !k.activo).length}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <ToggleLeft className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Áreas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{areas.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por key, indicador o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro por Área */}
          <select
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todas las áreas</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.nombre}</option>
            ))}
          </select>

          {/* Filtro por Estado */}
          <select
            value={filtroActivo}
            onChange={(e) => setFiltroActivo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de KPIs */}
      {kpisFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay KPIs</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filtroArea !== 'todos' || filtroActivo !== 'todos'
              ? 'No se encontraron KPIs con los filtros aplicados'
              : 'Comienza creando tu primer KPI'}
          </p>
          {!searchTerm && filtroArea === 'todos' && filtroActivo === 'todos' && (
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Primer KPI
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indicador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sentido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periodicidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kpisFiltrados.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">{kpi.key}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{kpi.indicador}</div>
                      {kpi.puesto && (
                        <div className="text-xs text-gray-500">Puesto: {kpi.puesto}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{kpi.area}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {kpi.meta} {kpi.unidad}
                      </span>
                      <div className="text-xs text-gray-500">
                        Tolerancia: {kpi.tolerancia > 0 ? '+' : ''}{kpi.tolerancia}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        kpi.sentido === 'Mayor es mejor'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {kpi.sentido === 'Mayor es mejor' ? '↑ Mayor' : '↓ Menor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{kpi.periodicidad}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActivo(kpi.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          kpi.activo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {kpi.activo ? (
                          <>
                            <ToggleRight className="w-3 h-3" />
                            Activo
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3 h-3" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(kpi)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(kpi.id, kpi.indicador)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Editar KPI' : 'Nuevo KPI'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditing ? 'Modifica los datos del KPI' : 'Completa la información del nuevo KPI'}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key (Código) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                      placeholder="Ej: GER-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      required
                    />
                  </div>

                  {/* Área */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.areaId}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccionar área</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Indicador */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indicador <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.indicador}
                      onChange={(e) => setFormData({ ...formData, indicador: e.target.value })}
                      placeholder="Ej: Tiempo de respuesta al cliente"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Puesto (Opcional) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puesto Específico (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.puesto}
                      onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                      placeholder="Ej: Gerente de Ventas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Describe brevemente el KPI..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-none"
                    />
                  </div>

                  {/* Fórmula */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fórmula de Cálculo
                    </label>
                    <input
                      type="text"
                      value={formData.formula}
                      onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                      placeholder="Ej: (Total ventas / Meta) * 100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                  </div>

                  {/* Meta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.meta}
                      onChange={(e) => setFormData({ ...formData, meta: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Tolerancia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tolerancia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.tolerancia}
                      onChange={(e) => setFormData({ ...formData, tolerancia: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.sentido === 'Mayor es mejor' 
                        ? 'Usa valores negativos (ej: -5)' 
                        : 'Usa valores positivos (ej: +5)'}
                    </p>
                  </div>

                  {/* Sentido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sentido <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.sentido}
                      onChange={(e) => setFormData({ ...formData, sentido: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Mayor es mejor">Mayor es mejor (↑)</option>
                      <option value="Menor es mejor">Menor es mejor (↓)</option>
                    </select>
                  </div>

                  {/* Periodicidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periodicidad <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.periodicidad}
                      onChange={(e) => setFormData({ ...formData, periodicidad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="mensual">Mensual</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  {/* Unidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidad
                    </label>
                    <input
                      type="text"
                      value={formData.unidad}
                      onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                      placeholder="Ej: %, días, unidades"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Orden */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orden
                    </label>
                    <input
                      type="number"
                      value={formData.orden}
                      onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Actualizar KPI' : 'Crear KPI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
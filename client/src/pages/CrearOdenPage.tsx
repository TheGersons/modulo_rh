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
  Briefcase,
  Building,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { empleadosService } from '../services/empleados.service';
import { kpisService } from '../services/kpis.service';
import { useAuth } from '../contexts/AuthContext';
import { ordenesService } from '../services/ordenes.service';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  puesto?: { nombre: string };
  area?: { nombre: string };
}

interface KPI {
  id: string;
  key: string;
  indicador: string;
  areaRelacion: { nombre: string };
  puestoRelacion?: { nombre: string };
}

export default function CrearOrdenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Datos de catálogos
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [kpisFiltrados, setKpisFiltrados] = useState<KPI[]>([]);

  // Form state
  const [empleadoId, setEmpleadoId] = useState('');
  const [kpiId, setKpiId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');

  // UI state
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    // Filtrar KPIs según empleado seleccionado
    if (empleadoId) {
      const empleado = empleados.find((e) => e.id === empleadoId);
      if (empleado) {
        // TODO: Implementar filtrado de KPIs por empleado cuando esté disponible
        // Por ahora mostrar todos los KPIs activos
        setKpisFiltrados(kpis);
      }
    } else {
      setKpisFiltrados([]);
      setKpiId('');
    }
  }, [empleadoId, kpis]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [empleadosData, kpisData] = await Promise.all([
        empleadosService.getAll(),
        kpisService.getAll(),
      ]);
      setEmpleados(empleadosData.filter((e: Empleado) => e.activo));
      setKpis(kpisData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    // Validaciones
    if (!empleadoId) {
      setError('Debes seleccionar un empleado');
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

    if (!fechaLimite) {
      setError('La fecha límite es requerida');
      return;
    }

    // Validar que la fecha sea futura
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
        empleadoId,
        kpiId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fechaLimite: new Date(fechaLimite).toISOString(),
        prioridad,
        asignadoPorId: user?.id,
      };

      await ordenesService.create(ordenData);
      alert('Orden de trabajo creada exitosamente');
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

  const empleadoSeleccionado = empleados.find((e) => e.id === empleadoId);
  const kpiSeleccionado = kpis.find((k) => k.id === kpiId);

  // Fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/ordenes')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Trabajo</h1>
            <p className="text-gray-600 mt-1">Asigna una tarea basada en KPIs</p>
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

        {/* Formulario */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
          {/* Empleado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Asignar a <span className="text-red-500">*</span>
            </label>
            <select
              value={empleadoId}
              onChange={(e) => setEmpleadoId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona un empleado</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido} - {emp.puesto?.nombre || 'Sin puesto'} ({emp.area?.nombre || 'Sin área'})
                </option>
              ))}
            </select>
            {empleadoSeleccionado && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Building className="w-4 h-4" />
                  <span>
                    <strong>{empleadoSeleccionado.area?.nombre || 'Sin área'}</strong> - {empleadoSeleccionado.puesto?.nombre || 'Sin puesto'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* KPI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              KPI Relacionado <span className="text-red-500">*</span>
            </label>
            <select
              value={kpiId}
              onChange={(e) => setKpiId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!empleadoId}
            >
              <option value="">
                {!empleadoId ? 'Primero selecciona un empleado' : 'Selecciona un KPI'}
              </option>
              {kpisFiltrados.map((kpi) => (
                <option key={kpi.id} value={kpi.id}>
                  [{kpi.key}] {kpi.indicador} - {kpi.areaRelacion.nombre}
                </option>
              ))}
            </select>
            {kpiSeleccionado && (
              <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700">
                  <strong>KPI:</strong> {kpiSeleccionado.indicador}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Área: {kpiSeleccionado.areaRelacion.nombre}
                  {kpiSeleccionado.puestoRelacion && ` • Puesto: ${kpiSeleccionado.puestoRelacion.nombre}`}
                </p>
              </div>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Título de la Orden <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Completar reporte de ventas Q4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Detallada
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe las tareas específicas, entregables esperados, criterios de éxito..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={5}
            />
          </div>

          {/* Fecha y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>

          {/* Preview de Prioridad */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Preview de Prioridad:</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                prioridad === 'critica'
                  ? 'bg-red-100 text-red-700'
                  : prioridad === 'alta'
                  ? 'bg-orange-100 text-orange-700'
                  : prioridad === 'media'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {prioridad.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate('/ordenes')}
            disabled={guardando}
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={guardando}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Crear Orden</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
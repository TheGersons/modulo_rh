import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Info,
  Target,
  Building,
  Briefcase,
  FolderOpen,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { kpisService } from '../services/kpis.service';
import { areasService } from '../services/areas.service';
import { puestosService } from '../services/puestos.service';

interface Area {
  id: string;
  nombre: string;
  areaPadreId?: string;
}

interface Puesto {
  id: string;
  nombre: string;
  areaId: string;
}

interface FormulaCalculo {
  tipo: string;
  numerador?: string;
  denominador?: string;
  multiplicador?: number;
  invertir?: boolean;
  target?: string;
  filtro?: string;
  descripcion?: string;
}

export default function GestionKPIsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Datos de catálogos
  const [areas, setAreas] = useState<Area[]>([]);
  const [subAreas, setSubAreas] = useState<Area[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);

  // Información básica
  const [codigo, setCodigo] = useState('');
  const [indicador, setIndicador] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [areaId, setAreaId] = useState('');
  const [subAreaId, setSubAreaId] = useState('');
  const [puestoId, setPuestoId] = useState('');

  // Tipo de cálculo y campos dinámicos
  const [tipoCalculo, setTipoCalculo] = useState('');
  const [descripcionCondicion, setDescripcionCondicion] = useState('');
  const [numerador, setNumerador] = useState('');
  const [denominador, setDenominador] = useState('');
  const [multiplicador, setMultiplicador] = useState('100');
  const [invertir, setInvertir] = useState(false);
  const [target, setTarget] = useState('');

  // Configuración de meta
  const [meta, setMeta] = useState('');
  const [operador, setOperador] = useState('>');
  const [unidad, setUnidad] = useState('%');
  const [tolerancia, setTolerancia] = useState('');
  const [criticidad, setCriticidad] = useState('no_critico');
  const [periodicidad, setPeriodicidad] = useState('mensual');
  const [sentido, setSentido] = useState('Mayor es mejor');

  useEffect(() => {
    cargarAreas();
    if (isEdit) {
      cargarKPI();
    }
  }, []);

  useEffect(() => {
    // Cargar sub-áreas cuando se selecciona un área
    if (areaId) {
      const areaSeleccionada = areas.find((a) => a.id === areaId);
      if (areaSeleccionada && !areaSeleccionada.areaPadreId) {
        // Es área padre, cargar sus sub-áreas
        const subs = areas.filter((a) => a.areaPadreId === areaId);
        setSubAreas(subs);
      } else {
        setSubAreas([]);
        setSubAreaId('');
      }

      // Cargar puestos del área
      cargarPuestos(areaId);
    } else {
      setSubAreas([]);
      setSubAreaId('');
      setPuestos([]);
      setPuestoId('');
    }
  }, [areaId, areas]);

  useEffect(() => {
    // Cargar puestos de sub-área si se selecciona
    if (subAreaId) {
      cargarPuestos(subAreaId);
    } else if (areaId) {
      cargarPuestos(areaId);
    }
  }, [subAreaId]);

  const cargarAreas = async () => {
    try {
      const data = await areasService.getAll();
      setAreas(data);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  const cargarPuestos = async (areaIdParam: string) => {
    try {
      const data = await puestosService.getAll(areaIdParam);
      setPuestos(data);
      // Si el puesto actual no está en la nueva lista, limpiar
      if (puestoId && !data.find((p: Puesto) => p.id === puestoId)) {
        setPuestoId('');
      }
    } catch (error) {
      console.error('Error al cargar puestos:', error);
      setPuestos([]);
    }
  };

  const cargarKPI = async () => {
    try {
      setLoading(true);
      const kpi = await kpisService.getById(editId!);

      setCodigo(kpi.key);
      setIndicador(kpi.indicador);
      setDescripcion(kpi.descripcion || '');
      setAreaId(kpi.areaId);

      // Si tiene sub-área (areaPadreId del área del KPI)
      const kpiArea = await areasService.getById(kpi.areaId);
      if (kpiArea.areaPadreId) {
        setAreaId(kpiArea.areaPadreId);
        setSubAreaId(kpi.areaId);
      }

      setPuestoId(kpi.puestoId || '');
      setTipoCalculo(kpi.tipoCalculo);
      setMeta(kpi.meta?.toString() || '');
      setOperador(kpi.operadorMeta || '>');
      setUnidad(kpi.unidad || '%');
      setTolerancia(kpi.tolerancia?.toString() || '');
      setCriticidad(kpi.tipoCriticidad || 'no_critico');
      setPeriodicidad(kpi.periodicidad);
      setSentido(kpi.sentido || 'Mayor es mejor');

      // Parsear fórmula
      if (kpi.formulaCalculo) {
        const formula: FormulaCalculo = JSON.parse(kpi.formulaCalculo);

        if (formula.tipo === 'binario') {
          setDescripcionCondicion(formula.descripcion || '');
        } else if (formula.tipo === 'division') {
          setNumerador(formula.numerador || '');
          setDenominador(formula.denominador || '');
          setMultiplicador(formula.multiplicador?.toString() || '100');
          setInvertir(formula.invertir || false);
        } else if (formula.tipo === 'conteo') {
          setTarget(formula.target || '');
        }
      }
    } catch (error) {
      console.error('Error al cargar KPI:', error);
      setError('Error al cargar el KPI');
    } finally {
      setLoading(false);
    }
  };

  const construirFormula = (): string => {
    const formula: FormulaCalculo = { tipo: tipoCalculo };

    if (tipoCalculo === 'binario') {
      formula.descripcion = descripcionCondicion;
    } else if (tipoCalculo === 'division') {
      formula.numerador = numerador;
      formula.denominador = denominador;
      formula.multiplicador = parseFloat(multiplicador);
      formula.invertir = invertir;
    } else if (tipoCalculo === 'conteo') {
      formula.target = target;
    }

    return JSON.stringify(formula);
  };

  const handleSubmit = async () => {
    setError('');

    // Validaciones
    if (!codigo.trim()) {
      setError('El código KPI es requerido');
      return;
    }

    if (!indicador.trim()) {
      setError('El indicador es requerido');
      return;
    }

    if (!areaId) {
      setError('Debes seleccionar un área');
      return;
    }

    // Validar que si hay sub-áreas disponibles, se seleccione una
    const tieneSubs = areas.some((a) => a.areaPadreId === areaId);

    if (tieneSubs && !subAreaId) {
      setError('Debes seleccionar una sub-área');
      return;
    }

    if (!puestoId) {
      setError('El puesto es requerido');
      return;
    }

    // Validaciones por tipo de cálculo
    if (tipoCalculo === 'division') {
      if (!numerador.trim() || !denominador.trim()) {
        setError('Numerador y denominador son requeridos para el tipo división');
        return;
      }
    }

    if (tipoCalculo === 'conteo') {
      if (!target.trim()) {
        setError('El campo "target" es requerido para el tipo conteo');
        return;
      }
    }

    try {
      setGuardando(true);

      const kpiData = {
        key: codigo.toUpperCase(),
        indicador: indicador.trim(),
        descripcion: descripcion.trim() || undefined,
        areaId: subAreaId || areaId, // Usar sub-área si está seleccionada
        puestoId: puestoId,
        tipoCalculo,
        formulaCalculo: construirFormula(),
        meta: meta ? parseFloat(meta) : undefined,
        operadorMeta: operador,
        unidad: unidad || undefined,
        tolerancia: tolerancia ? parseFloat(tolerancia) : undefined,
        tipoCriticidad: criticidad,
        periodicidad,
        sentido,
        activo: true,
      };

      if (isEdit) {
        await kpisService.update(editId!, kpiData);
        alert('KPI actualizado exitosamente');
      } else {
        await kpisService.create(kpiData);
        alert('KPI creado exitosamente');
      }

      navigate('/kpis');
    } catch (error: any) {
      console.error('Error al guardar KPI:', error);
      setError(error.response?.data?.message || 'Error al guardar el KPI');
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
            <p className="mt-4 text-gray-600">Cargando KPI...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Filtrar áreas principales (sin padre)
  const areasPrincipales = areas.filter((a) => !a.areaPadreId);

  return (

    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/kpis')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar KPI' : 'Nuevo KPI'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Modifica la configuración del KPI' : 'Configura un nuevo indicador de desempeño'}
          </p>
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

      {/* Información Básica */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Información Básica
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código KPI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código KPI <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: KPI-001"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              disabled={isEdit}
            />
          </div>

          {/* Indicador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indicador <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={indicador}
              onChange={(e) => setIndicador(e.target.value)}
              placeholder="Nombre del KPI"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe brevemente el KPI..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Área <span className="text-red-500">*</span>
            </label>
            <select
              value={areaId}
              onChange={(e) => {
                setAreaId(e.target.value);
                setSubAreaId('');
                setPuestoId('');
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

          {/* Sub-área (solo si el área tiene sub-áreas) */}
          {subAreas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FolderOpen className="w-4 h-4 inline mr-1" />
                Sub-área <span className="text-red-500">*</span>
              </label>
              <select
                value={subAreaId}
                onChange={(e) => {
                  setSubAreaId(e.target.value);
                  setPuestoId('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona una sub-área</option>
                {subAreas.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Puesto */}
          <div className={subAreas.length > 0 ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Puesto <span className="text-red-500">*</span>
            </label>
            <select
              value={puestoId}
              onChange={(e) => setPuestoId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!areaId && !subAreaId}
            >
              <option value="">
                {puestos.length === 0 ? 'No hay puestos disponibles' : 'Selecciona un puesto'}
              </option>
              {puestos.map((puesto) => (
                <option key={puesto.id} value={puesto.id}>
                  {puesto.nombre}
                </option>
              ))}
            </select>
            {puestos.length === 0 && (areaId || subAreaId) && (
              <p className="text-xs text-gray-500 mt-1">
                No hay puestos registrados para esta área. Crea puestos primero.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tipo de Cálculo */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Cálculo</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Cálculo <span className="text-red-500">*</span>
          </label>
          <select
            value={tipoCalculo}
            onChange={(e) => setTipoCalculo(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona un tipo</option>
            <option value="binario">Binario (Sí/No)</option>
            <option value="division">División</option>
            <option value="conteo">Conteo</option>
            <option value="porcentaje_kpis_equipo">% KPIs del Equipo</option>
            <option value="dashboard_presentado">Dashboard Presentado</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        {/* Campos dinámicos según tipo */}
        {tipoCalculo === 'binario' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-900">
                El KPI se evalúa como Cumplido/No Cumplido según una condición específica.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de la Condición
              </label>
              <input
                type="text"
                value={descripcionCondicion}
                onChange={(e) => setDescripcionCondicion(e.target.value)}
                placeholder="Ej: Entrega dentro de plazo"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {tipoCalculo === 'division' && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-purple-600 mt-0.5" />
              <p className="text-sm text-purple-900">
                Fórmula: (Numerador / Denominador) × Multiplicador
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numerador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={numerador}
                  onChange={(e) => setNumerador(e.target.value)}
                  placeholder="Campo del numerador"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Denominador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={denominador}
                  onChange={(e) => setDenominador(e.target.value)}
                  placeholder="Campo del denominador"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multiplicador
                </label>
                <input
                  type="number"
                  value={multiplicador}
                  onChange={(e) => setMultiplicador(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invertir}
                    onChange={(e) => setInvertir(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Invertir resultado</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {tipoCalculo === 'conteo' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-900">
                Cuenta el número de elementos que cumplen una condición.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campo a Contar (Target) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Nombre del campo"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        )}

        {tipoCalculo === 'porcentaje_kpis_equipo' && (
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-orange-600 mt-0.5" />
              <p className="text-sm text-orange-900">
                Se calcula automáticamente el porcentaje de KPIs completados por el equipo.
              </p>
            </div>
          </div>
        )}

        {tipoCalculo === 'dashboard_presentado' && (
          <div className="mt-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-pink-600 mt-0.5" />
              <p className="text-sm text-pink-900">
                Verifica si el dashboard fue presentado en el periodo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Configuración de Meta */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Meta</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Meta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta</label>
            <input
              type="number"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              placeholder="Ej: 90"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Operador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operador</label>
            <select
              value={operador}
              onChange={(e) => setOperador(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value=">">&gt; Mayor que</option>
              <option value=">=">&gt;= Mayor o igual</option>
              <option value="=">= Igual</option>
              <option value="<=">&lt;= Menor o igual</option>
              <option value="<">&lt; Menor que</option>
            </select>
          </div>

          {/* Unidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
            <select
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="%">%</option>
              <option value="$">$</option>
              <option value="unidades">unidades</option>
            </select>
          </div>

          {/* Tolerancia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tolerancia (%)
            </label>
            <input
              type="number"
              value={tolerancia}
              onChange={(e) => setTolerancia(e.target.value)}
              placeholder="Ej: 10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Umbral para estado amarillo</p>
          </div>

          {/* Criticidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Criticidad</label>
            <select
              value={criticidad}
              onChange={(e) => setCriticidad(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="no_critico">No Crítico</option>
              <option value="critico">Crítico</option>
            </select>
          </div>

          {/* Periodicidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodicidad</label>
            <select
              value={periodicidad}
              onChange={(e) => setPeriodicidad(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          {/* Sentido */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sentido</label>
            <select
              value={sentido}
              onChange={(e) => setSentido(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Mayor es mejor">Mayor es mejor</option>
              <option value="Menor es mejor">Menor es mejor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          onClick={() => navigate('/kpis')}
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
              <span>{isEdit ? 'Actualizar KPI' : 'Crear KPI'}</span>
            </>
          )}
        </button>
      </div>
    </div>

  );
}
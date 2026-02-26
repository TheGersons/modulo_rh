import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  Save,
  AlertCircle,
  Info,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import { kpisService } from '../services/kpis.service';
import { areasService } from '../services/areas.service';
import Layout from '../components/layout/Layout';

interface Area {
  id: string;
  nombre: string;
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

  // Form state
  const [key, setKey] = useState('');
  const [indicador, setIndicador] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [areaId, setAreaId] = useState('');
  const [puesto, setPuesto] = useState('');
  const [tipoCalculo, setTipoCalculo] = useState<string>('binario');
  const [meta, setMeta] = useState<number | ''>('');
  const [operadorMeta, setOperadorMeta] = useState('>=');
  const [tolerancia, setTolerancia] = useState<number | ''>('');
  const [tipoCriticidad, setTipoCriticidad] = useState<'critico' | 'no_critico'>('no_critico');
  const [periodicidad, setPeriodicidad] = useState('mensual');
  const [sentido, setSentido] = useState('mayor_mejor');
  const [unidad, setUnidad] = useState('');

  // Fórmula específica por tipo
  const [numerador, setNumerador] = useState('');
  const [denominador, setDenominador] = useState('');
  const [multiplicador, setMultiplicador] = useState<number>(100);
  const [invertir, setInvertir] = useState(false);
  const [targetConteo, setTargetConteo] = useState('');
  const [descripcionBinario, setDescripcionBinario] = useState('');

  // Data y UI
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarAreas();
    if (isEdit) {
      cargarKPI();
    }
  }, [editId]);

  const cargarAreas = async () => {
    try {
      const data = await areasService.getAll();
      setAreas(data);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  const cargarKPI = async () => {
    try {
      setLoading(true);
      const kpi = await kpisService.getById(editId!);

      setKey(kpi.key);
      setIndicador(kpi.indicador);
      setDescripcion(kpi.descripcion || '');
      setAreaId(kpi.areaId);
      setPuesto(kpi.puesto || '');
      setTipoCalculo(kpi.tipoCalculo);
      setMeta(kpi.meta || '');
      setOperadorMeta(kpi.operadorMeta || '>=');
      setTolerancia(kpi.tolerancia || '');
      setTipoCriticidad(kpi.tipoCriticidad as any);
      setPeriodicidad(kpi.periodicidad);
      setSentido(kpi.sentido);
      setUnidad(kpi.unidad || '');

      // Parsear fórmula
      if (kpi.formulaCalculo) {
        try {
          const formula: FormulaCalculo = JSON.parse(kpi.formulaCalculo);
          if (formula.numerador) setNumerador(formula.numerador);
          if (formula.denominador) setDenominador(formula.denominador);
          if (formula.multiplicador) setMultiplicador(formula.multiplicador);
          if (formula.invertir !== undefined) setInvertir(formula.invertir);
          if (formula.target) setTargetConteo(formula.target);
          if (formula.descripcion) setDescripcionBinario(formula.descripcion);
        } catch (e) {
          console.error('Error al parsear fórmula:', e);
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

    switch (tipoCalculo) {
      case 'binario':
        formula.descripcion = descripcionBinario || indicador;
        break;

      case 'division':
        formula.numerador = numerador;
        formula.denominador = denominador;
        formula.multiplicador = multiplicador;
        formula.invertir = invertir;
        break;

      case 'conteo':
        formula.target = targetConteo;
        break;

      case 'porcentaje_kpis_equipo':
        formula.filtro = 'verde';
        break;

      case 'dashboard_presentado':
        formula.descripcion = 'Dashboard presentado a tiempo';
        break;

      case 'personalizado':
        formula.descripcion = 'Fórmula personalizada';
        break;
    }

    return JSON.stringify(formula);
  };

  const validarFormulario = (): boolean => {
    setError('');

    if (!key.trim()) {
      setError('El código del KPI es requerido');
      return false;
    }
    if (!indicador.trim()) {
      setError('El indicador es requerido');
      return false;
    }
    if (!areaId) {
      setError('Debes seleccionar un área');
      return false;
    }

    // Validaciones específicas por tipo
    if (tipoCalculo === 'division') {
      if (!numerador || !denominador) {
        setError('Para división, debes especificar numerador y denominador');
        return false;
      }
    }

    if (tipoCalculo === 'conteo') {
      if (!targetConteo) {
        setError('Para conteo, debes especificar el target');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    try {
      setSubmitting(true);

      const formulaCalculo = construirFormula();

      const kpiData = {
        key: key.trim().toUpperCase(),
        indicador: indicador.trim(),
        descripcion: descripcion.trim() || undefined,
        areaId,
        puesto: puesto.trim() || undefined,
        tipoCalculo,
        formulaCalculo,
        meta: meta || undefined,
        operadorMeta: meta ? operadorMeta : undefined,
        tolerancia: tolerancia || undefined,
        tipoCriticidad,
        periodicidad,
        sentido,
        unidad: unidad.trim() || undefined,
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
      setSubmitting(false);
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
            {isEdit ? 'Actualiza la configuración del KPI' : 'Define un nuevo indicador de desempeño'}
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

        <div className="space-y-4">
          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código del KPI <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="Ej: KPI-TEC-001"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Identificador único del KPI</p>
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
              placeholder="Ej: Cumplimiento de presupuesto"
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
              placeholder="Descripción detallada del KPI..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none"
            />
          </div>

          {/* Grid: Área y Puesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puesto (Opcional)
              </label>
              <input
                type="text"
                value={puesto}
                onChange={(e) => setPuesto(e.target.value)}
                placeholder="Ej: Gerente, Analista"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tipo de Cálculo */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          Tipo de Cálculo
        </h2>

        <div className="mb-4">
          <select
            value={tipoCalculo}
            onChange={(e) => setTipoCalculo(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="binario">Binario (Cumplió / No cumplió)</option>
            <option value="division">División (A / B × multiplicador)</option>
            <option value="conteo">Conteo (Cantidad de items)</option>
            <option value="porcentaje_kpis_equipo">% KPIs del Equipo</option>
            <option value="dashboard_presentado">Dashboard Presentado</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        {/* Campos específicos por tipo */}
        {tipoCalculo === 'binario' && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-sm text-blue-900 mb-3">
              <strong>Binario:</strong> El resultado será 100% si cumple o 0% si no cumple
            </p>
            <input
              type="text"
              value={descripcionBinario}
              onChange={(e) => setDescripcionBinario(e.target.value)}
              placeholder="Descripción de la condición (opcional)"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {tipoCalculo === 'division' && (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-900 flex items-center gap-2 mb-3">
              <Info className="w-5 h-5" />
              <strong>División:</strong> Resultado = (numerador / denominador) × multiplicador
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numerador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={numerador}
                  onChange={(e) => setNumerador(e.target.value)}
                  placeholder="Ej: gasto_real"
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                  placeholder="Ej: presupuesto_aprobado"
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multiplicador
                </label>
                <input
                  type="number"
                  value={multiplicador}
                  onChange={(e) => setMultiplicador(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={invertir}
                onChange={(e) => setInvertir(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Invertir resultado (mejor cuando es menor)</span>
            </label>
          </div>
        )}

        {tipoCalculo === 'conteo' && (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-900 flex items-center gap-2 mb-3">
              <Info className="w-5 h-5" />
              <strong>Conteo:</strong> Cuenta la cantidad de items
            </p>
            <input
              type="text"
              value={targetConteo}
              onChange={(e) => setTargetConteo(e.target.value)}
              placeholder="Nombre del campo a contar (ej: reportes_presentados)"
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {tipoCalculo === 'porcentaje_kpis_equipo' && (
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-900">
              <Info className="w-5 h-5 inline mr-2" />
              <strong>% KPIs Equipo:</strong> Calcula (KPIs verdes / Total KPIs) × 100 del área
            </p>
          </div>
        )}

        {tipoCalculo === 'dashboard_presentado' && (
          <div className="p-4 bg-pink-50 rounded-lg">
            <p className="text-sm text-pink-900">
              <Info className="w-5 h-5 inline mr-2" />
              <strong>Dashboard:</strong> Verifica si el dashboard fue presentado a tiempo
            </p>
          </div>
        )}
      </div>

      {/* Configuración de Meta */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Configuración de Meta
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Meta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta (Opcional)
              </label>
              <input
                type="number"
                value={meta}
                onChange={(e) => setMeta(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 95"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Operador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operador
              </label>
              <select
                value={operadorMeta}
                onChange={(e) => setOperadorMeta(e.target.value)}
                disabled={!meta}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value=">">{'>'} Mayor que</option>
                <option value=">=">{'>='} Mayor o igual</option>
                <option value="=">= Igual a</option>
                <option value="<=">{'<='} Menor o igual</option>
                <option value="<">{'<'} Menor que</option>
              </select>
            </div>

            {/* Unidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad (Opcional)
              </label>
              <input
                type="text"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                placeholder="%, $, unidades"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tolerancia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tolerancia (%) - Umbral Amarillo
            </label>
            <input
              type="number"
              value={tolerancia}
              onChange={(e) => setTolerancia(e.target.value ? Number(e.target.value) : '')}
              placeholder="Ej: 10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Porcentaje de desviación permitido antes de marcar como rojo
            </p>
          </div>

          {/* Grid: Criticidad, Periodicidad, Sentido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Criticidad
              </label>
              <select
                value={tipoCriticidad}
                onChange={(e) => setTipoCriticidad(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="no_critico">No Crítico</option>
                <option value="critico">Crítico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periodicidad
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sentido
              </label>
              <select
                value={sentido}
                onChange={(e) => setSentido(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mayor_mejor">Mayor es mejor</option>
                <option value="menor_mejor">Menor es mejor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-4 pb-8">
        <button
          onClick={() => navigate('/kpis')}
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
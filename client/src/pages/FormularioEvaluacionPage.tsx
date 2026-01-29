import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ArrowLeft, Save, Send, AlertCircle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import type { KPI, EvaluacionDetalle } from '../types/kpi';
import { empleadosService } from '../services/empleados.service';
import { kpisService } from '../services/kpis.service';

interface EmpleadoInfo {
    nombre: string;
    apellido: string;
    puesto: string;
    area: string;
}

let areaId: string;

export default function FormularioEvaluacionPage() {
    const { empleadoId } = useParams();
    const navigate = useNavigate();

    const [empleado, _setEmpleado] = useState<EmpleadoInfo>({
        nombre: '',
        apellido: '',
        puesto: '',
        area: ''
    });

    useEffect(() => {
        //obtener info del empleado por su id
        const DataEmpleado = async () => {
            const emp = await empleadosService.getById(empleadoId!);
            _setEmpleado({
                nombre: emp.nombre,
                apellido: emp.apellido,
                puesto: emp.puesto,
                area: emp.area.nombre,
            });
            areaId = emp.areaId;
            console.log('Empleado cargado:', areaId);
        }
        DataEmpleado();
    }, [empleadoId]);    

    const [kpis, setKpis] = useState<KPI[]>([]);
    const [detalles, setDetalles] = useState<Record<string, EvaluacionDetalle>>({});
    const [comentarioGeneral, setComentarioGeneral] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, [empleadoId]);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            console.log('Cargando KPIs para el área final:', areaId);
            // Obtener KPIs asociados al área del empleado
            const kpisArea = await kpisService.getByArea(areaId);
            //formateamos la consulta
            const kpisFormateados: KPI[] = kpisArea.map((kpi: any) => ({
                id: kpi.id, 
                key: kpi.key,
                indicador: kpi.indicador,
                descripcion: kpi.descripcion,
                formula: kpi.formula,
                meta: kpi.meta,
                unidad: kpi.unidad,
                tolerancia: kpi.tolerancia,
                umbralAmarillo: kpi.umbralAmarillo,
                sentido: kpi.sentido,
                periodicidad: kpi.periodicidad,
            }));
            setKpis(kpisFormateados);
        
            // Inicializar detalles vacíos
            const detallesIniciales: Record<string, EvaluacionDetalle> = {};
            kpisFormateados.forEach(kpi => {
                detallesIniciales[kpi.id] = {
                    id: '',
                    kpiId: kpi.id,
                    resultadoNumerico: 0,
                    meta: kpi.meta,
                    tolerancia: kpi.tolerancia,
                    umbralAmarillo: kpi.umbralAmarillo || 0,
                    sentido: kpi.sentido,
                    resultadoPorcentaje: 0,
                    brechaVsMeta: 0,
                    estado: 'rojo',
                    comentarios: ''
                };
            });
            setDetalles(detallesIniciales);

        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const calcularResultado = (kpi: KPI, resultadoNumerico: number) => {
        let resultadoPorcentaje = 0;
        let brechaVsMeta = 0;
        let estado: 'verde' | 'amarillo' | 'rojo' = 'rojo';

        if (kpi.sentido === 'Mayor es mejor') {
            // Para KPIs donde mayor es mejor
            // Calcular el porcentaje pero limitado a 100%
            const porcentajeSinLimite = (resultadoNumerico / kpi.meta) * 100;
            resultadoPorcentaje = Math.min(porcentajeSinLimite, 100); // Límite de 100%

            brechaVsMeta = resultadoNumerico - kpi.meta;

            if (resultadoNumerico >= kpi.meta) {
                estado = 'verde';
            } else if (resultadoNumerico >= (kpi.umbralAmarillo || kpi.meta + kpi.tolerancia)) {
                estado = 'amarillo';
            } else {
                estado = 'rojo';
            }
        } else {
            // Para KPIs donde menor es mejor (ej: tiempo de respuesta, días)
            // Calcular el porcentaje pero limitado a 100%
            const porcentajeSinLimite = (kpi.meta / resultadoNumerico) * 100;
            resultadoPorcentaje = Math.min(porcentajeSinLimite, 100); // Límite de 100%

            brechaVsMeta = kpi.meta - resultadoNumerico;

            if (resultadoNumerico <= kpi.meta) {
                estado = 'verde';
            } else if (resultadoNumerico <= (kpi.umbralAmarillo || kpi.meta - kpi.tolerancia)) {
                estado = 'amarillo';
            } else {
                estado = 'rojo';
            }
        }

        return {
            resultadoPorcentaje: Math.round(resultadoPorcentaje * 100) / 100,
            brechaVsMeta: Math.round(brechaVsMeta * 100) / 100,
            estado
        };
    };
    const handleResultadoChange = (kpiId: string, valor: number) => {
        const kpi = kpis.find(k => k.id === kpiId);
        if (!kpi) return;

        const { resultadoPorcentaje, brechaVsMeta, estado } = calcularResultado(kpi, valor);

        setDetalles(prev => ({
            ...prev,
            [kpiId]: {
                ...prev[kpiId],
                resultadoNumerico: valor,
                resultadoPorcentaje,
                brechaVsMeta,
                estado
            }
        }));
    };

    const handleComentarioChange = (kpiId: string, comentario: string) => {
        setDetalles(prev => ({
            ...prev,
            [kpiId]: {
                ...prev[kpiId],
                comentarios: comentario
            }
        }));
    };

    const calcularPromedioYEstadisticas = () => {
        const valores = Object.values(detalles);
        if (valores.length === 0) return { promedio: 0, rojos: 0, porcentajeRojos: 0 };

        const suma = valores.reduce((acc, d) => acc + d.resultadoPorcentaje, 0);
        const promedio = suma / valores.length;
        const rojos = valores.filter(d => d.estado === 'rojo').length;
        const porcentajeRojos = (rojos / valores.length) * 100;

        return {
            promedio: Math.round(promedio * 100) / 100,
            rojos,
            porcentajeRojos: Math.round(porcentajeRojos * 100) / 100
        };
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'verde':
                return 'bg-green-50 border-green-200 text-green-700';
            case 'amarillo':
                return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            case 'rojo':
                return 'bg-red-50 border-red-200 text-red-700';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-700';
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case 'verde':
                return <TrendingUp className="w-5 h-5" />;
            case 'amarillo':
                return <Minus className="w-5 h-5" />;
            case 'rojo':
                return <TrendingDown className="w-5 h-5" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };

    const getEstadoLabel = (estado: string) => {
        switch (estado) {
            case 'verde':
                return 'Cumple Meta';
            case 'amarillo':
                return 'En Tolerancia';
            case 'rojo':
                return 'Por Debajo';
            default:
                return 'Sin Evaluar';
        }
    };

    const guardarBorrador = async () => {
        setSaving(true);
        try {
            console.log('Guardando borrador...', { empleadoId, detalles, comentarioGeneral });
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Borrador guardado exitosamente');
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el borrador');
        } finally {
            setSaving(false);
        }
    };

    const enviarEvaluacion = async () => {
        // Validar que todos los KPIs tengan resultado
        const sinEvaluar = Object.values(detalles).filter(d => d.resultadoNumerico === 0);
        if (sinEvaluar.length > 0) {
            alert('Por favor evalúa todos los KPIs antes de enviar');
            return;
        }

        setSaving(true);
        try {
            console.log('Enviando evaluación...', { empleadoId, detalles, comentarioGeneral });
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Evaluación enviada exitosamente');
            navigate('/kpis/evaluar');
        } catch (error) {
            console.error('Error al enviar:', error);
            alert('Error al enviar la evaluación');
        } finally {
            setSaving(false);
        }
    };

    const estadisticas = calcularPromedioYEstadisticas();

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-8 space-y-8 max-w-6xl mx-auto">
                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate('/kpis/evaluar')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver a la lista
                    </button>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl">
                                {empleado.nombre[0]}{empleado.apellido[0]}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {empleado.nombre} {empleado.apellido}
                                </h1>
                                <p className="text-gray-600">{empleado.puesto}</p>
                                <p className="text-sm text-gray-500">Área: {empleado.area}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Periodo</p>
                                <p className="text-lg font-bold text-gray-900">Q1 2026</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-start gap-4">
                        <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-blue-900 mb-2">Instrucciones de Evaluación</h3>
                            <p className="text-blue-800 text-sm leading-relaxed">
                                Ingresa el <strong>resultado numérico real</strong> obtenido para cada KPI. El sistema calculará automáticamente el porcentaje de cumplimiento, la brecha vs meta y el estado (🟢 Verde / 🟡 Amarillo / 🔴 Rojo) según los umbrales definidos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulario de evaluación */}
                <div className="space-y-6">
                    {kpis.map((kpi, index) => {
                        const detalle = detalles[kpi.id];
                        if (!detalle) return null;

                        return (
                            <div key={kpi.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                {/* Header del KPI */}
                                <div className="mb-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                                                    {kpi.key}
                                                </span>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {index + 1}. {kpi.indicador}
                                                </h3>
                                            </div>
                                            {kpi.descripcion && (
                                                <p className="text-sm text-gray-600 mb-2">{kpi.descripcion}</p>
                                            )}
                                            {kpi.formula && (
                                                <p className="text-xs text-gray-500 italic">Fórmula: {kpi.formula}</p>
                                            )}
                                        </div>

                                        {/* Badge de estado */}
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold ${getEstadoColor(detalle.estado)}`}>
                                            {getEstadoIcon(detalle.estado)}
                                            {getEstadoLabel(detalle.estado)}
                                        </div>
                                    </div>

                                    {/* Métricas del KPI */}
                                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Meta</p>
                                            <p className="text-lg font-bold text-gray-900">{kpi.meta}{kpi.unidad}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Umbral Amarillo</p>
                                            <p className="text-lg font-bold text-yellow-600">{kpi.umbralAmarillo}{kpi.unidad}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Sentido</p>
                                            <p className="text-sm font-semibold text-gray-700">{kpi.sentido}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Periodicidad</p>
                                            <p className="text-sm font-semibold text-gray-700 capitalize">{kpi.periodicidad}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Input de resultado */}
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Resultado Obtenido {kpi.unidad && `(${kpi.unidad})`}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={kpi.unidad === '%' ? 100 : undefined} // Solo limitar si la unidad es %
                                            value={detalle.resultadoNumerico || ''}
                                            onChange={(e) => {
                                                let valor = parseFloat(e.target.value) || 0;

                                                // Si la unidad es porcentaje, limitar a 100
                                                if (kpi.unidad === '%' && valor > 100) {
                                                    valor = 100;
                                                }

                                                // No permitir valores negativos
                                                if (valor < 0) {
                                                    valor = 0;
                                                }

                                                //solo usar 2 decimales
                                                valor = Math.round(valor * 100) / 100;

                                                //controlar los 0's que pueden sumar hasta x cantidad de decimales
                                                e.target.value = valor.toString();
                                                

                                                handleResultadoChange(kpi.id, valor);
                                            }}
                                            className="flex-1 px-6 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                                            placeholder={`Ej: ${kpi.meta}`}
                                        />
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 mb-1">Resultado %</p>
                                            <p className={`text-3xl font-bold ${detalle.estado === 'verde' ? 'text-green-600' :
                                                    detalle.estado === 'amarillo' ? 'text-yellow-600' :
                                                        'text-red-600'
                                                }`}>
                                                {detalle.resultadoPorcentaje.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mensaje informativo cuando se alcanza 100% */}
                                    {detalle.resultadoPorcentaje >= 100 && (
                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-700 font-semibold">
                                                ✓ Meta superada - Resultado óptimo (100%)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Brecha vs Meta */}
                                {detalle.resultadoNumerico > 0 && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700">Brecha vs Meta:</span>
                                            <span className={`text-lg font-bold ${detalle.brechaVsMeta >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {detalle.brechaVsMeta > 0 ? '+' : ''}{detalle.brechaVsMeta.toFixed(2)}{kpi.unidad}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Comentarios */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Comentarios
                                    </label>
                                    <textarea
                                        value={detalle.comentarios || ''}
                                        onChange={(e) => handleComentarioChange(kpi.id, e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                                        placeholder="Agrega comentarios sobre este indicador..."
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {/* Comentario general */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <label className="block text-lg font-bold text-gray-900 mb-4">
                            Comentario General de la Evaluación
                        </label>
                        <textarea
                            value={comentarioGeneral}
                            onChange={(e) => setComentarioGeneral(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                            placeholder="Agrega un comentario general sobre el desempeño del empleado..."
                        />
                    </div>

                    {/* Resumen de evaluación */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen de Evaluación</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <p className="text-sm text-gray-600 mb-2">Promedio General</p>
                                <p className="text-4xl font-bold text-blue-600">{estadisticas.promedio.toFixed(1)}%</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <p className="text-sm text-gray-600 mb-2">KPIs en Rojo 🔴</p>
                                <p className="text-4xl font-bold text-red-600">{estadisticas.rojos}</p>
                                <p className="text-xs text-gray-500 mt-1">{estadisticas.porcentajeRojos.toFixed(1)}% del total</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <p className="text-sm text-gray-600 mb-2">Total KPIs</p>
                                <p className="text-4xl font-bold text-gray-900">{kpis.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-4">
                        <button
                            onClick={guardarBorrador}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            Guardar Borrador
                        </button>
                        <button
                            onClick={enviarEvaluacion}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                            Enviar Evaluación
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
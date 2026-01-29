import { useState } from 'react';
import Layout from '../components/layout/Layout';
import {
    Download,
    FileText,
    BarChart3,
    Users,
    TrendingUp,
    Calendar,
    Filter,
    FileSpreadsheet,
    PieChart,
    Activity,
    Target,
    AlertTriangle,
    Award,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart as RechartsPie,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    AreaChart,
    Area,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface ReporteConfig {
    tipo: string;
    nombre: string;
    descripcion: string;
    icon: any;
    formatos: string[];
}

interface ReporteGenerado {
    id: string;
    nombre: string;
    tipo: string;
    formato: string;
    fecha: string;
    tamano: string;
}

export default function ReportesPage() {
    const [tipoReporte, setTipoReporte] = useState('resumen-ejecutivo');
    const [periodo, setPeriodo] = useState('Q1');
    const [anio, setAnio] = useState('2026');
    const [formato, setFormato] = useState('pdf');
    const [areaSeleccionada, setAreaSeleccionada] = useState('todas');
    const [generando, setGenerando] = useState(false);
    const [showVistaPrevia, setShowVistaPrevia] = useState(true);

    // ============================================
    // DATOS SIMULADOS PARA GRÁFICAS
    // ============================================

    // Datos para evolución trimestral
    const datosEvolucion = [
        { periodo: 'Q1 2025', promedio: 82.5, verde: 12, amarillo: 5, rojo: 3 },
        { periodo: 'Q2 2025', promedio: 85.2, verde: 14, amarillo: 4, rojo: 2 },
        { periodo: 'Q3 2025', promedio: 87.8, verde: 15, amarillo: 3, rojo: 2 },
        { periodo: 'Q4 2025', promedio: 89.5, verde: 16, amarillo: 3, rojo: 1 },
        { periodo: 'Q1 2026', promedio: 91.3, verde: 17, amarillo: 2, rojo: 1 },
    ];

    // Datos por área
    const datosAreas = [
        { area: 'Gerencia', promedio: 96.7, kpisRojos: 0, totalKpis: 3, empleados: 2 },
        { area: 'Administrativa', promedio: 92.3, kpisRojos: 0, totalKpis: 3, empleados: 2 },
        { area: 'Técnica', promedio: 88.1, kpisRojos: 1, totalKpis: 3, empleados: 2 },
        { area: 'Proyectos', promedio: 85.4, kpisRojos: 0, totalKpis: 3, empleados: 2 },
        { area: 'Comercial', promedio: 83.2, kpisRojos: 0, totalKpis: 3, empleados: 2 },
        { area: 'Compras', promedio: 90.8, kpisRojos: 0, totalKpis: 3, empleados: 2 },
    ];

    // Datos para distribución por rangos
    const datosDistribucion = [
        { rango: 'Excelente (90-100%)', cantidad: 8, porcentaje: 44.4, color: '#10b981' },
        { rango: 'Muy Bueno (75-89%)', cantidad: 7, porcentaje: 38.9, color: '#3b82f6' },
        { rango: 'Bueno (60-74%)', cantidad: 2, porcentaje: 11.1, color: '#f59e0b' },
        { rango: 'Regular (50-59%)', cantidad: 1, porcentaje: 5.6, color: '#ef4444' },
        { rango: 'Deficiente (0-49%)', cantidad: 0, porcentaje: 0, color: '#991b1b' },
    ];

    // Datos para radar (KPIs por área)
    const datosRadar = [
        { kpi: 'Cumplimiento', Gerencia: 95, Administrativa: 92, Técnica: 88, Proyectos: 85, Comercial: 83 },
        { kpi: 'Calidad', Gerencia: 97, Administrativa: 93, Técnica: 89, Proyectos: 86, Comercial: 84 },
        { kpi: 'Eficiencia', Gerencia: 96, Administrativa: 91, Técnica: 87, Proyectos: 84, Comercial: 82 },
        { kpi: 'Innovación', Gerencia: 98, Administrativa: 92, Técnica: 90, Proyectos: 85, Comercial: 81 },
        { kpi: 'Trabajo Equipo', Gerencia: 97, Administrativa: 93, Técnica: 88, Proyectos: 87, Comercial: 85 },
    ];

    // Top performers
    const topPerformers = [
        { nombre: 'Juan Pérez', area: 'Gerencia', promedio: 96.7, kpisVerdes: 3 },
        { nombre: 'Sandra Gómez', area: 'Gerencia', promedio: 95.8, kpisVerdes: 3 },
        { nombre: 'Miguel Hernández', area: 'Administrativa', promedio: 94.2, kpisVerdes: 3 },
        { nombre: 'Patricia Ruiz', area: 'Administrativa', promedio: 93.5, kpisVerdes: 3 },
        { nombre: 'Fernando Castro', area: 'Técnica', promedio: 92.8, kpisVerdes: 2 },
    ];

    // Bottom performers
    const bottomPerformers = [
        { nombre: 'Carlos López', area: 'Comercial', promedio: 78.5, kpisRojos: 2 },
        { nombre: 'Ana Martínez', area: 'Proyectos', promedio: 79.2, kpisRojos: 1 },
        { nombre: 'Luis Sánchez', area: 'Técnica', promedio: 81.3, kpisRojos: 1 },
    ];

    // Datos para tendencias mensuales
    const datosMensuales = [
        { mes: 'Ene', Gerencia: 95, Administrativa: 91, Técnica: 87, Proyectos: 84, Comercial: 82, Compras: 89 },
        { mes: 'Feb', Gerencia: 96, Administrativa: 92, Técnica: 88, Proyectos: 85, Comercial: 83, Compras: 90 },
        { mes: 'Mar', Gerencia: 97, Administrativa: 93, Técnica: 89, Proyectos: 86, Comercial: 84, Compras: 91 },
    ];

    // Datos de KPIs críticos
    const kpisCriticos = [
        { kpi: 'Tiempo de Respuesta', area: 'Técnica', valor: 6.5, meta: 4, umbral: 6, status: 'rojo' },
        { kpi: 'ROI Proyectos', area: 'Proyectos', valor: 18, meta: 20, umbral: 15, status: 'amarillo' },
    ];

    // Datos de cumplimiento por tipo de KPI
    const cumplimientoTipo = [
        { tipo: 'Operacionales', cumplimiento: 92.5 },
        { tipo: 'Estratégicos', cumplimiento: 88.3 },
        { tipo: 'Financieros', cumplimiento: 86.7 },
        { tipo: 'Cliente', cumplimiento: 91.2 },
        { tipo: 'Procesos', cumplimiento: 89.8 },
    ];

    const tiposReporte: ReporteConfig[] = [
        {
            tipo: 'resumen-ejecutivo',
            nombre: 'Resumen Ejecutivo',
            descripcion: 'Vista consolidada con todas las métricas principales, gráficas de evolución y distribución',
            icon: BarChart3,
            formatos: ['pdf', 'excel'],
        },
        {
            tipo: 'por-area',
            nombre: 'Análisis por Área',
            descripcion: 'Análisis detallado del desempeño de un área específica con comparativos',
            icon: Users,
            formatos: ['pdf', 'excel'],
        },
        {
            tipo: 'comparativo-areas',
            nombre: 'Comparativo entre Áreas',
            descripcion: 'Comparación de desempeño entre todas las áreas con gráficas de radar',
            icon: TrendingUp,
            formatos: ['pdf', 'excel'],
        },
        {
            tipo: 'tendencias',
            nombre: 'Tendencias y Evolución',
            descripcion: 'Análisis de tendencias históricas por periodo (12 meses/trimestres)',
            icon: Activity,
            formatos: ['pdf', 'excel'],
        },
        {
            tipo: 'top-performers',
            nombre: 'Top/Bottom Performers',
            descripcion: 'Empleados con mejor y peor desempeño, análisis de brechas',
            icon: Award,
            formatos: ['pdf', 'excel'],
        },
        {
            tipo: 'kpis-criticos',
            nombre: 'KPIs Críticos',
            descripcion: 'Análisis de KPIs en estado rojo o amarillo con planes de acción',
            icon: AlertTriangle,
            formatos: ['pdf', 'excel'],
        },
        {
            tipo: 'distribucion',
            nombre: 'Distribución por Rangos',
            descripcion: 'Distribución de empleados por rangos de desempeño (Excelente, Muy Bueno, etc.)',
            icon: PieChart,
            formatos: ['pdf', 'excel'],
        },
        {
            tipo: 'cumplimiento-metas',
            nombre: 'Cumplimiento de Metas',
            descripcion: 'Análisis de cumplimiento de metas por KPI, área y periodo',
            icon: Target,
            formatos: ['pdf', 'excel'],
        },
    ];

    const areas = [
        { value: 'todas', label: 'Todas las áreas' },
        { value: 'gerencia', label: 'Gerencia' },
        { value: 'administrativa', label: 'Administrativa' },
        { value: 'tecnica', label: 'Técnica' },
        { value: 'proyectos', label: 'Proyectos' },
        { value: 'comercial', label: 'Comercial' },
        { value: 'compras', label: 'Compras' },
    ];

    const reporteActual = tiposReporte.find(r => r.tipo === tipoReporte);

    const generarReporte = async () => {
        setGenerando(true);
        try {
            console.log('Generando reporte:', {
                tipo: tipoReporte,
                periodo,
                anio,
                formato,
                area: areaSeleccionada,
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            alert('Reporte generado exitosamente. La descarga comenzará automáticamente.');
        } catch (error) {
            console.error('Error al generar reporte:', error);
            alert('Error al generar el reporte');
        } finally {
            setGenerando(false);
        }
    };

    const reportesRecientes: ReporteGenerado[] = [
        { id: '1', nombre: 'Resumen_Ejecutivo_Q1_2026.pdf', tipo: 'Resumen Ejecutivo', formato: 'PDF', fecha: '2026-03-20', tamano: '2.4 MB' },
        { id: '2', nombre: 'Comparativo_Areas_Q1_2026.xlsx', tipo: 'Comparativo Áreas', formato: 'Excel', fecha: '2026-03-18', tamano: '1.8 MB' },
        { id: '3', nombre: 'Top_Performers_Q1_2026.pdf', tipo: 'Top Performers', formato: 'PDF', fecha: '2026-03-15', tamano: '1.2 MB' },
    ];

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#991b1b'];

    // ============================================
    // RENDERIZADO DE GRÁFICAS POR TIPO DE REPORTE
    // ============================================

    const renderVisualizaciones = () => {
        switch (tipoReporte) {
            case 'resumen-ejecutivo':
                return (
                    <div className="space-y-8">
                        {/* KPIs Principales */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                                <p className="text-sm opacity-90 mb-2">Promedio General</p>
                                <p className="text-4xl font-bold">91.3%</p>
                                <p className="text-xs opacity-75 mt-2">+1.8% vs trimestre anterior</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                                <p className="text-sm opacity-90 mb-2">KPIs Verdes</p>
                                <p className="text-4xl font-bold">17</p>
                                <p className="text-xs opacity-75 mt-2">94.4% del total</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
                                <p className="text-sm opacity-90 mb-2">KPIs Amarillos</p>
                                <p className="text-4xl font-bold">2</p>
                                <p className="text-xs opacity-75 mt-2">11.1% del total</p>
                            </div>
                            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
                                <p className="text-sm opacity-90 mb-2">KPIs Rojos</p>
                                <p className="text-4xl font-bold">1</p>
                                <p className="text-xs opacity-75 mt-2">5.6% del total</p>
                            </div>
                        </div>

                        {/* Evolución Trimestral */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Evolución de KPIs por Trimestre</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={datosEvolucion}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="periodo" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="verde" fill="#10b981" name="Verde" />
                                    <Bar yAxisId="left" dataKey="amarillo" fill="#f59e0b" name="Amarillo" />
                                    <Bar yAxisId="left" dataKey="rojo" fill="#ef4444" name="Rojo" />
                                    <Line yAxisId="right" type="monotone" dataKey="promedio" stroke="#3b82f6" strokeWidth={3} name="Promedio %" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Comparativo por Área */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Desempeño por Área</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={datosAreas}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="area" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="promedio" fill="#3b82f6" name="Promedio %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Distribución por Rangos */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Empleados por Rango</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPie>
                                    <Pie
                                        data={datosDistribucion}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(props) => {
                                            const { payload } = props;
                                            return `${payload.rango}: ${payload.porcentaje}%`;
                                        }}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="cantidad"
                                    >
                                        {datosDistribucion.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </RechartsPie>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            case 'comparativo-areas':
                return (
                    <div className="space-y-8">
                        {/* Gráfica de Radar */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Comparativo de KPIs por Área (Radar)</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={datosRadar}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="kpi" />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                    <Radar name="Gerencia" dataKey="Gerencia" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                    <Radar name="Administrativa" dataKey="Administrativa" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                    <Radar name="Técnica" dataKey="Técnica" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                    <Radar name="Proyectos" dataKey="Proyectos" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                    <Radar name="Comercial" dataKey="Comercial" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                                    <Legend />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Tabla comparativa */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Tabla Comparativa de Áreas</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-600">Área</th>
                                            <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">Promedio</th>
                                            <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">Total KPIs</th>
                                            <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">KPIs Rojos</th>
                                            <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">Empleados</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {datosAreas.map((area, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-gray-900">{area.area}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-bold ${area.promedio >= 90 ? 'text-green-600' :
                                                            area.promedio >= 75 ? 'text-blue-600' :
                                                                area.promedio >= 60 ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                        }`}>
                                                        {area.promedio}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-900">{area.totalKpis}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-bold ${area.kpisRojos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {area.kpisRojos}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-900">{area.empleados}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'tendencias':
                return (
                    <div className="space-y-8">
                        {/* Tendencias mensuales */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Tendencia Mensual por Área</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={datosMensuales}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis domain={[75, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Gerencia" stroke="#8b5cf6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Administrativa" stroke="#3b82f6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Técnica" stroke="#10b981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Proyectos" stroke="#f59e0b" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Comercial" stroke="#ef4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Compras" stroke="#06b6d4" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Área bajo la curva */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Evolución de Distribución de KPIs</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={datosEvolucion}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="periodo" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="verde" stackId="1" stroke="#10b981" fill="#10b981" name="Verde" />
                                    <Area type="monotone" dataKey="amarillo" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Amarillo" />
                                    <Area type="monotone" dataKey="rojo" stackId="1" stroke="#ef4444" fill="#ef4444" name="Rojo" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            case 'top-performers':
                return (
                    <div className="space-y-8">
                        {/* Top Performers */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Award className="w-6 h-6 text-green-600" />
                                Top 5 Performers
                            </h3>
                            <div className="space-y-3">
                                {topPerformers.map((emp, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                                        <div className="text-2xl font-bold text-green-600 w-8">#{index + 1}</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">{emp.nombre}</p>
                                            <p className="text-sm text-gray-600">{emp.area}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">{emp.promedio}%</p>
                                            <p className="text-xs text-gray-600">{emp.kpisVerdes} KPIs verdes</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Performers */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                Empleados que Requieren Apoyo
                            </h3>
                            <div className="space-y-3">
                                {bottomPerformers.map((emp, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">{emp.nombre}</p>
                                            <p className="text-sm text-gray-600">{emp.area}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-red-600">{emp.promedio}%</p>
                                            <p className="text-xs text-gray-600">{emp.kpisRojos} KPIs rojos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gráfica comparativa */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Desempeño</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[...topPerformers, ...bottomPerformers].sort((a, b) => b.promedio - a.promedio)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Bar dataKey="promedio" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            case 'kpis-criticos':
                return (
                    <div className="space-y-8">
                        {/* Alertas */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                KPIs en Estado Crítico
                            </h3>
                            <div className="space-y-4">
                                {kpisCriticos.map((kpi, index) => (
                                    <div key={index} className="bg-white rounded-xl p-4 border border-red-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-bold text-gray-900">{kpi.kpi}</p>
                                                <p className="text-sm text-gray-600">Área: {kpi.area}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${kpi.status === 'rojo' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {kpi.status === 'rojo' ? '🔴 CRÍTICO' : '🟡 ALERTA'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Valor Actual</p>
                                                <p className="font-bold text-red-600">{kpi.valor}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Meta</p>
                                                <p className="font-bold text-gray-900">{kpi.meta}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Umbral</p>
                                                <p className="font-bold text-yellow-600">{kpi.umbral}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'distribucion':
                return (
                    <div className="space-y-8">
                        {/* Pie Chart */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Empleados por Rango</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <RechartsPie>
                                    <Pie
                                        data={datosDistribucion}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={(props) => {
                                            const { payload } = props;
                                            return `${payload.rango}: ${payload.cantidad} (${payload.porcentaje}%)`;
                                        }}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="cantidad"
                                    >
                                        {datosDistribucion.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPie>
                            </ResponsiveContainer>
                        </div>

                        {/* Tabla de distribución */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Detalle de Distribución</h3>
                            <div className="space-y-2">
                                {datosDistribucion.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{item.rango}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{item.cantidad} empleados</p>
                                            <p className="text-sm text-gray-600">{item.porcentaje}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'cumplimiento-metas':
                return (
                    <div className="space-y-8">
                        {/* Gráfica de cumplimiento */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Cumplimiento por Tipo de KPI</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={cumplimientoTipo} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis dataKey="tipo" type="category" width={120} />
                                    <Tooltip />
                                    <Bar dataKey="cumplimiento" fill="#3b82f6" name="Cumplimiento %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className="p-8 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reportes de KPIs</h1>
                    <p className="text-gray-600 mt-1">
                        Genera reportes personalizados con visualizaciones avanzadas
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel izquierdo - Configuración */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tipo de reporte */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-600" />
                                Tipo de Reporte
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tiposReporte.map((reporte) => {
                                    const Icon = reporte.icon;
                                    return (
                                        <button
                                            key={reporte.tipo}
                                            onClick={() => setTipoReporte(reporte.tipo)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${tipoReporte === reporte.tipo
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${tipoReporte === reporte.tipo ? 'bg-blue-600' : 'bg-gray-100'
                                                    }`}>
                                                    <Icon className={`w-5 h-5 ${tipoReporte === reporte.tipo ? 'text-white' : 'text-gray-600'
                                                        }`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-semibold mb-1 ${tipoReporte === reporte.tipo ? 'text-blue-900' : 'text-gray-900'
                                                        }`}>
                                                        {reporte.nombre}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 leading-relaxed">{reporte.descripcion}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Filter className="w-6 h-6 text-blue-600" />
                                Filtros
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Periodo */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Periodo
                                    </label>
                                    <select
                                        value={periodo}
                                        onChange={(e) => setPeriodo(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                        <option value="Enero">Enero</option>
                                        <option value="Febrero">Febrero</option>
                                        <option value="Marzo">Marzo</option>
                                        <option value="Q1">Q1 (Ene-Mar)</option>
                                        <option value="Q2">Q2 (Abr-Jun)</option>
                                        <option value="Q3">Q3 (Jul-Sep)</option>
                                        <option value="Q4">Q4 (Oct-Dic)</option>
                                    </select>
                                </div>

                                {/* Año */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Año
                                    </label>
                                    <select
                                        value={anio}
                                        onChange={(e) => setAnio(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                        <option value="2026">2026</option>
                                        <option value="2025">2025</option>
                                        <option value="2024">2024</option>
                                    </select>
                                </div>

                                {/* Área (solo para reportes específicos) */}
                                {(tipoReporte === 'por-area' || tipoReporte === 'comparativo-areas') && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Área
                                        </label>
                                        <select
                                            value={areaSeleccionada}
                                            onChange={(e) => setAreaSeleccionada(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                        >
                                            {areas.map(area => (
                                                <option key={area.value} value={area.value}>
                                                    {area.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Formato */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Formato de salida
                                    </label>
                                    <div className="flex gap-3">
                                        {reporteActual?.formatos.includes('pdf') && (
                                            <button
                                                onClick={() => setFormato('pdf')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${formato === 'pdf'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <FileText className="w-5 h-5" />
                                                <span className="font-semibold">PDF</span>
                                            </button>
                                        )}
                                        {reporteActual?.formatos.includes('excel') && (
                                            <button
                                                onClick={() => setFormato('excel')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${formato === 'excel'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <FileSpreadsheet className="w-5 h-5" />
                                                <span className="font-semibold">Excel</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vista Previa con Toggle */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setShowVistaPrevia(!showVistaPrevia)}
                                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                    Vista Previa del Reporte
                                </h2>
                                {showVistaPrevia ? (
                                    <ChevronUp className="w-6 h-6 text-gray-600" />
                                ) : (
                                    <ChevronDown className="w-6 h-6 text-gray-600" />
                                )}
                            </button>

                            {showVistaPrevia && (
                                <div className="p-6 border-t border-gray-100">
                                    {renderVisualizaciones()}
                                </div>
                            )}
                        </div>

                        {/* Botón generar */}
                        <button
                            onClick={generarReporte}
                            disabled={generando}
                            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 shadow-lg"
                        >
                            {generando ? (
                                <>
                                    <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                                    Generando reporte...
                                </>
                            ) : (
                                <>
                                    <Download className="w-6 h-6" />
                                    Generar y Descargar Reporte
                                </>
                            )}
                        </button>
                    </div>

                    {/* Panel derecho - Resumen y Reportes Recientes */}
                    <div className="space-y-6">
                        {/* Resumen */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen</h3>

                            {reporteActual && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="p-2 bg-blue-600 rounded-lg">
                                                {reporteActual && <reporteActual.icon className="w-5 h-5 text-white" />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{reporteActual.nombre}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{reporteActual.descripcion}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Periodo:</span>
                                            <span className="font-semibold text-gray-900">{periodo} {anio}</span>
                                        </div>
                                        {(tipoReporte === 'por-area' || tipoReporte === 'comparativo-areas') && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Área:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {areas.find(a => a.value === areaSeleccionada)?.label}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Formato:</span>
                                            <span className="font-semibold text-gray-900 uppercase">{formato}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reportes recientes */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Reportes Recientes</h3>

                            <div className="space-y-3">
                                {reportesRecientes.map((reporte) => (
                                    <div
                                        key={reporte.id}
                                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                    {reporte.nombre}
                                                </h4>
                                                <p className="text-xs text-gray-600">
                                                    {reporte.tipo} • {reporte.formato}
                                                </p>
                                            </div>
                                            <button className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0">
                                                <Download className="w-4 h-4 text-blue-600" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{new Date(reporte.fecha).toLocaleDateString('es-ES')}</span>
                                            <span>{reporte.tamano}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { estadisticasService } from '../services/estadisticas.service';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  Activity,
  ArrowRight,
  Bell,
  FileText,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { areasService } from '../services/areas.service';
import { alertasService } from '../services/alertas.service';
import { empleadosService } from '../services/empleados.service';
import { evaluacionesService } from '../services/evaluaciones.service';

export interface KPIStats {
  promedioGeneral: number;
  kpisVerdes: number;
  kpisAmarillos: number;
  kpisRojos: number;
  porcentajeRojos: number;
  areasEnRiesgo: number;
  evaluacionesPendientes: number;
  empleadosEvaluados: number;
  totalEmpleados: number;
}

interface AreaResumen {
  nombre: string;
  promedio: number;
  kpisRojos: number;
  nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO';
  tendencia: 'up' | 'down' | 'stable';
}

interface AlertaActiva {
  id: string;
  titulo: string;
  nivel: 'BAJO' | 'MEDIO' | 'ALTO';
  area: string;
  tipo: string;
}

interface TopPerformer {
  nombre: string;
  area: string;
  promedio: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Define un estado inicial con ceros
  const initialStats: KPIStats = {
    promedioGeneral: 0,
    kpisVerdes: 0,
    kpisAmarillos: 0,
    kpisRojos: 0,
    porcentajeRojos: 0,
    areasEnRiesgo: 0,
    evaluacionesPendientes: 0,
    empleadosEvaluados: 0,
    totalEmpleados: 0,
  };

  // Pasa el estado inicial al hook. Nota que quitamos el undefined del tipo implícito.
  const [stats, setStats] = useState<KPIStats>(initialStats);

  // Estados
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const data = await estadisticasService.getGlobales();

        const nombrex = {
          promedioGeneral: data.desempenio.promedioGeneral === undefined ? 0 : data.desempenio.promedioGeneral,
          kpisVerdes: data.desempenio.kpisVerdes === undefined ? 0 : data.desempenio.kpisVerdes,
          kpisAmarillos: data.desempenio.kpisAmarillos === undefined ? 0 : data.desempenio.kpisAmarillos,
          kpisRojos: data.desempenio.kpisRojos === undefined ? 0 : data.desempenio.kpisRojos,
          porcentajeRojos: data.desempenio.porcentajeRojos === undefined ? 0 : data.desempenio.porcentajeRojos,
          areasEnRiesgo: data.riesgos.areasEnRiesgo === undefined ? 0 : data.riesgos.areasEnRiesgo,
          evaluacionesPendientes: data.evaluaciones.Pendientes === undefined ? 0 : data.evaluaciones.Pendientes,
          empleadosEvaluados: data.evaluaciones.completadas === undefined ? 0 : data.evaluaciones.completadas,
          totalEmpleados: data.evaluaciones.total === undefined ? 0 : data.evaluaciones.total,
        };
        // Mapear data a tu estructura actual
        setStats({
          promedioGeneral: nombrex.promedioGeneral,
          kpisVerdes: nombrex.kpisVerdes,
          kpisAmarillos: nombrex.kpisAmarillos,
          kpisRojos: nombrex.kpisRojos,
          porcentajeRojos: nombrex.porcentajeRojos,
          areasEnRiesgo: nombrex.areasEnRiesgo,
          evaluacionesPendientes: nombrex.evaluacionesPendientes,
          empleadosEvaluados: nombrex.empleadosEvaluados,
          totalEmpleados: nombrex.totalEmpleados,
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    cargarEstadisticas();
  }, []);



  const initialAreas: AreaResumen[] = [
    { nombre: 'Gerencia', promedio: 0, kpisRojos: 0, nivelRiesgo: 'BAJO', tendencia: 'stable' },
    { nombre: 'Administrativa', promedio: 0, kpisRojos: 0, nivelRiesgo: 'BAJO', tendencia: 'stable' },
    { nombre: 'Técnica', promedio: 0, kpisRojos: 0, nivelRiesgo: 'BAJO', tendencia: 'stable' },
    { nombre: 'Proyectos', promedio: 0, kpisRojos: 0, nivelRiesgo: 'BAJO', tendencia: 'stable' },
    { nombre: 'Comercial', promedio: 0, kpisRojos: 0, nivelRiesgo: 'BAJO', tendencia: 'stable' },
    { nombre: 'Compras', promedio: 0, kpisRojos: 0, nivelRiesgo: 'BAJO', tendencia: 'stable' },
  ];

  const [areas, setAreas] = useState<AreaResumen[]>(initialAreas);


  useEffect(() => {
    const cargarResumenAreas = async () => {
      try {
        const data = await areasService.getAll();

        const areasResumen = data.map((area: any) => ({
          nombre: area.nombre,
          promedio: area.promedio,
          kpisRojos: area.kpisRojos,
          nivelRiesgo: area.nivelRiesgo,
          tendencia: area.tendencia,
        }));

        setAreas(areasResumen);
      } catch (error) {
        console.error('Error al cargar resumen de áreas:', error);
      }
    };

    cargarResumenAreas();
  }, []);

  const InitialAlertas: AlertaActiva[] = [
    { id: '1', titulo: 'Tiempo de Respuesta crítico', nivel: 'ALTO', area: 'Técnica', tipo: 'kpi_critico' },
  ];

  const [alertas, setAlertas] = useState<AlertaActiva[]>(InitialAlertas);

  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        const data = await alertasService.getAll();

        const alertasActivas = data.filter((alerta: any) =>
          alerta.nivel === 'ALTO' || alerta.nivel === 'MEDIO').map((alerta: any) => ({
            id: alerta.id,
            titulo: alerta.titulo,
            nivel: alerta.nivel,
            area: alerta.area.nombre,
            tipo: alerta.tipo,
          }));
        setAlertas(alertasActivas);
      } catch (error) {
        console.error('Error al cargar alertas:', error);

      }
    };
    cargarAlertas();
  }, []);


  const InitialTopPerformers: TopPerformer[] = [
    { nombre: 'Sin nombre', area: 'Gerencia', promedio: 0 },
  ];
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>(InitialTopPerformers);

  useEffect(() => {
    const cargarTopPerformers = async () => {
      try {
        const data = await estadisticasService.getRankings();

        console.log('Datos de top performers:', data);
        const top: TopPerformer[] = data.topPerformers.map((emp: any) => ({
          nombre: emp.nombre,
          area: emp.area,
          promedio: emp.promedio,
        }));
        setTopPerformers(top);
      } catch (error) {
        console.error('Error al cargar top performers:', error);
      }
    };
    cargarTopPerformers();
  }, []);


  // Datos para gráficas

  const InitialDatosEvolucion = [
    { mes: 'Ago', promedio: 85.6 },
    { mes: 'Sep', promedio: 87.8 },
    { mes: 'Oct', promedio: 88.5 },
    { mes: 'Nov', promedio: 89.5 },
    { mes: 'Dic', promedio: 90.1 },
    { mes: 'Ene', promedio: 91.3 },
  ];
  const [datosEvolucion, setDatosEvolucion] = useState<any[]>(InitialDatosEvolucion);
  useEffect(() => {
    const cargarTendencias = async () => {
      try {
        const data = await estadisticasService.getTendencias(6);
        setDatosEvolucion(data); // Adaptar estructura si es necesario
      } catch (error) {
        console.error('Error:', error);
      }
    };

    cargarTendencias();
  }, []);



  const InitialDatosAreas = [
    { area: 'Ger', valor: 96.7 },
    { area: 'Adm', valor: 92.3 },
    { area: 'Tec', valor: 88.1 },
    { area: 'Pry', valor: 85.4 },
    { area: 'Com', valor: 83.2 },
    { area: 'Cmp', valor: 90.8 },
  ];

  const [datosAreas, setDatosAreas] = useState<any[]>(InitialDatosAreas);

  useEffect(() => {
    const cargarDesempenioAreas = async () => {
      try {
        //obtener los ids de todas las areas
        const data = await areasService.getAll();
        // Luego, para cada área, obtener sus estadísticas
        const areasData = data.map((area: any) => ({
          area: area.nombre,
          valor: area.promedioGlobal,
        }));

        setDatosAreas(areasData); // Adaptar estructura si es necesario
      } catch (error) {
        console.error('Error:', error);
      }
    };
    cargarDesempenioAreas();
  }, []);


  // Datos para vista de JEFE
  const InitialmiEquipo = {
    totalEmpleados: 0,
    evaluacionesPendientes: 0,
    promedioArea: 0,
    kpisRojos: 0,
  };

  const [miEquipo, setMiEquipo] = useState<{ totalEmpleados: number; evaluacionesPendientes: number; promedioArea: number; kpisRojos: number }>(InitialmiEquipo);
  useEffect(() => {
    const cargarDatosMiEquipo = async () => {
      try {
        //obtener el id del jefe - usuario actual (jefe)
        const UserId = user?.id;
        //obtener data del jefe
        const JefeData = await empleadosService.getById(UserId!);
        //obtener el id del area del jefe
        const areaId = JefeData.areaId;

        //obtenemos los datos del area
        const areaData = await areasService.getEstadisticas(areaId);

        //actualizamos el estado
        setMiEquipo({
          totalEmpleados: areaData.recursos.empleados,
          evaluacionesPendientes: areaData.evaluaciones.pendientes,
          promedioArea: areaData.evaluaciones.promedio,
          kpisRojos: areaData.recursos.kpisRojos,
        });
      } catch (error) {
        console.error('Error al cargar datos de mi equipo:', error);
      }
    };
    cargarDatosMiEquipo();
  }, [user]);

  // Datos para vista de EMPLEADO
  const InitialmiEvaluacion = {
    ultimaEvaluacion: {
      periodo: 'QX 20XX',
      promedio: 0,
      kpisRojos: 0,
      status: 'N/A',
    },
    promedioArea: 0,
    ranking: 1,
    totalEmpleados: 0,
  };

  const [miEvaluacion, setMiEvaluacion] = useState<{
    ultimaEvaluacion: { periodo: string; promedio: number; kpisRojos: number; status: string };
    promedioArea: number;
    ranking: number;
    totalEmpleados: number;
  }>(InitialmiEvaluacion);

  useEffect(() => {
    const cargarDatosMiEvaluacion = async () => {
      try {
        //obtener el id del empleado - usuario actual (empleado)
        const UserId = user?.id;
        //obtener la última evaluación del empleado
        const evaluaciones = await evaluacionesService.getByEmpleado(UserId!);


        const ultimaEvaluacion = evaluaciones.length > 0 ? evaluaciones[0] : null;

        const empleadoData = await empleadosService.getById(UserId!);

        const areaId = empleadoData.areaId;
        //obtener el promedio del area

        const rankingData = await estadisticasService.getByArea(areaId!);

        //actualizamos el estado
        setMiEvaluacion({
          ultimaEvaluacion: {
            periodo: ultimaEvaluacion?.periodo || 'N/A',
            promedio: ultimaEvaluacion?.promedioGeneral || 0,
            kpisRojos: ultimaEvaluacion?.kpisRojos || 0,
            status: ultimaEvaluacion?.status || 'N/A',
          },
          promedioArea: rankingData.desempenio.promedioArea || 0,
          ranking: rankingData.area.ranking || 0,
          totalEmpleados: rankingData.recursos.empleados,
        });
      } catch (error) {
        console.error('Error al cargar datos de mi evaluación:', error);
      }
    };
    cargarDatosMiEvaluacion();
  }, [user]);


  const getNivelRiesgoColor = (nivel: string) => {
    switch (nivel) {
      case 'ALTO':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'MEDIO':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'BAJO':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // ============================================
  // RENDERIZADO POR ROL
  // ============================================

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* KPI Cards Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-white/20">
              <TrendingUp className="w-4 h-4" />
              +1.8%
            </div>
          </div>
          <h3 className="text-sm opacity-90 mb-2">Promedio General</h3>
          <p className="text-4xl font-bold">{stats.promedioGeneral}%</p>
          <p className="text-xs opacity-75 mt-2">Basado en {stats.kpisVerdes + stats.kpisAmarillos + stats.kpisRojos} KPIs</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Distribución KPIs</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-lg font-bold text-green-600">{stats.kpisVerdes}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-lg font-bold text-yellow-600">{stats.kpisAmarillos}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-lg font-bold text-red-600">{stats.kpisRojos}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">Verde / Amarillo / Rojo</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Áreas en Riesgo</h3>
          <p className="text-4xl font-bold text-red-600">{stats.areasEnRiesgo}</p>
          <p className="text-xs text-gray-500 mt-2">Requieren atención inmediata</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Evaluaciones Pendientes</h3>
          <p className="text-4xl font-bold text-orange-600">{stats.evaluacionesPendientes}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.empleadosEvaluados}/{stats.totalEmpleados} completadas</p>
        </div>
      </div>

      {/* Alertas Críticas */}
      {alertas.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                Alertas Críticas ({alertas.length})
                <Bell className="w-5 h-5 text-red-600 animate-pulse" />
              </h3>
              <div className="space-y-2">
                {alertas.map((alerta) => (
                  <div key={alerta.id} className="bg-white rounded-xl p-4 border-2 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${alerta.nivel === 'ALTO' ? 'bg-red-100 text-red-700' :
                            alerta.nivel === 'MEDIO' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                          {alerta.nivel}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{alerta.titulo}</p>
                          <p className="text-sm text-gray-600">Área: {alerta.area}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/kpis')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Evolución Últimos 6 Meses
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={datosEvolucion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis domain={[80, 95]} />
              <Tooltip />
              <Area type="monotone" dataKey="promedio" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Comparativo Áreas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Desempeño por Área
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={datosAreas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis domain={[75, 100]} />
              <Tooltip />
              <Bar dataKey="valor" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers y Áreas en Riesgo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.map((emp, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="text-xl font-bold text-green-600 w-8">#{index + 1}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{emp.nombre}</p>
                  <p className="text-sm text-gray-600">{emp.area}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">{emp.promedio}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Áreas en Riesgo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-600" />
            Áreas que Requieren Atención
          </h3>
          <div className="space-y-3">
            {areas.filter(a => a.nivelRiesgo === 'MEDIO' || a.nivelRiesgo === 'ALTO').map((area, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{area.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border-2 ${getNivelRiesgoColor(area.nivelRiesgo)}`}>
                      {area.nivelRiesgo}
                    </span>
                    {area.kpisRojos > 0 && (
                      <span className="text-xs text-red-600 font-semibold">
                        {area.kpisRojos} KPIs rojos
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600">{area.promedio}%</p>
                  {getTendenciaIcon(area.tendencia)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/kpis')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 text-left transition-all shadow-lg hover:shadow-xl group"
        >
          <BarChart3 className="w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">Dashboard KPIs</h3>
          <p className="text-blue-100 mb-4">Vista completa de todos los KPIs</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            Ir al módulo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/kpis/reportes')}
          className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl p-6 text-left transition-all shadow-lg hover:shadow-xl group"
        >
          <FileText className="w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">Reportes</h3>
          <p className="text-green-100 mb-4">Genera reportes personalizados</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            Generar reporte
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/configuracion')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-6 text-left transition-all shadow-lg hover:shadow-xl group"
        >
          <Zap className="w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">Configuración</h3>
          <p className="text-purple-100 mb-4">Gestiona áreas, KPIs y más</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            Configurar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderJefeDashboard = () => (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          ¡Hola, {user?.nombre}!
        </h1>
        <p className="text-blue-100 text-lg">
          Bienvenido a tu panel de gestión de equipo
        </p>
      </div>

      {/* KPIs de mi área */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Mi Equipo</h3>
          <p className="text-4xl font-bold text-gray-900">{miEquipo.totalEmpleados}</p>
          <p className="text-xs text-gray-500 mt-2">Empleados activos</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
              <TrendingUp className="w-3 h-3" />
              +2.1%
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Promedio Área</h3>
          <p className="text-4xl font-bold text-green-600">{miEquipo.promedioArea}%</p>
          <p className="text-xs text-gray-500 mt-2">Excelente desempeño</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Pendientes</h3>
          <p className="text-4xl font-bold text-orange-600">{miEquipo.evaluacionesPendientes}</p>
          <p className="text-xs text-gray-500 mt-2">Evaluaciones por realizar</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">KPIs Críticos</h3>
          <p className="text-4xl font-bold text-red-600">{miEquipo.kpisRojos}</p>
          <p className="text-xs text-gray-500 mt-2">Requieren atención</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/kpis/evaluar')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-8 text-left transition-all shadow-lg hover:shadow-xl group"
        >
          <CheckCircle className="w-12 h-12 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Evaluar Empleados</h3>
          <p className="text-blue-100 mb-4 text-lg">Gestiona las evaluaciones de tu equipo</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            Comenzar evaluación
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/kpis')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 text-left transition-all shadow-lg hover:shadow-xl group"
        >
          <BarChart3 className="w-12 h-12 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Dashboard de KPIs</h3>
          <p className="text-purple-100 mb-4 text-lg">Vista detallada del desempeño</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            Ver dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Evolución del área */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Evolución de mi Área
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={datosEvolucion}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis domain={[85, 100]} />
            <Tooltip />
            <Area type="monotone" dataKey="promedio" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderEmpleadoDashboard = () => (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          ¡Hola, {user?.nombre}!
        </h1>
        <p className="text-purple-100 text-lg">
          Revisa tu desempeño y evaluaciones
        </p>
      </div>

      {/* Mi última evaluación */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Award className="w-7 h-7 text-blue-600" />
          Mi Última Evaluación
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score principal */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-8 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3" />
              <p className="text-sm opacity-90 mb-2">{miEvaluacion.ultimaEvaluacion.periodo}</p>
              <p className="text-5xl font-bold mb-2">{miEvaluacion.ultimaEvaluacion.promedio}%</p>
              <p className="text-lg font-semibold">Excelente</p>
            </div>
          </div>

          {/* Detalles */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Estado</p>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-yellow-100 text-yellow-700 border-2 border-yellow-300">
                  <Clock className="w-4 h-4" />
                  Pendiente validación
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">KPIs Rojos</p>
                <p className="text-3xl font-bold text-gray-900">{miEvaluacion.ultimaEvaluacion.kpisRojos}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Promedio del Área</p>
                <p className="text-3xl font-bold text-blue-600">{miEvaluacion.promedioArea}%</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Mi Ranking</p>
                <p className="text-3xl font-bold text-purple-600">#{miEvaluacion.ranking}</p>
                <p className="text-xs text-gray-500">de {miEvaluacion.totalEmpleados}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/kpis/mis-evaluaciones')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              Ver evaluación completa
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mi evolución */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Mi Evolución
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={datosEvolucion}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis domain={[85, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="promedio" stroke="#3b82f6" strokeWidth={3} name="Mi Promedio" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/kpis/mis-evaluaciones')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-8 text-left transition-all shadow-lg hover:shadow-xl group"
        >
          <FileText className="w-12 h-12 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Mis Evaluaciones</h3>
          <p className="text-blue-100 mb-4 text-lg">Consulta tu historial completo</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            Ver historial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/kpis')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 text-left transition-all shadow-lg hover:shadow-xl group"
        >
          <BarChart3 className="w-12 h-12 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Dashboard de KPIs</h3>
          <p className="text-purple-100 mb-4 text-lg">Vista general del desempeño</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            Ver dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );

  // Determinar qué dashboard mostrar según el rol
  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
      case 'rrhh':
        return renderAdminDashboard();
      case 'jefe':
        return renderJefeDashboard();
      case 'empleado':
        return renderEmpleadoDashboard();
      default:
        return renderEmpleadoDashboard();
    }
  };

  return (
    <Layout>
      <div className="p-8">
        {renderDashboard()}
      </div>
    </Layout>
  );
}
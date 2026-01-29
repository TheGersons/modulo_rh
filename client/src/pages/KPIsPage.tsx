import { useEffect, useState, /*useEffect*/ } from 'react';
import Layout from '../components/layout/Layout';
import { BarChart3, TrendingUp, /*TrendingDown,*/ Users, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { estadisticasService } from '../services/estadisticas.service';
import { areasService } from '../services/areas.service';
import { alertasService } from '../services/alertas.service';

interface KPIStats {
  promedioGeneral: number;
  totalKpis: number;
  kpisVerdes: number;
  kpisAmarillos: number;
  kpisRojos: number;
  porcentajeRojos: number;
  evaluacionesPendientes: number;
  empleadosEvaluados: number;
  totalEmpleados: number;
}

interface AreaResumen{
  nombre: string;
  promedioGlobal: number;
  kpisRojos: number;
  porcentajeRojos: number;
  nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO';
  totalKpis: number;
}

interface AlertaActiva {
  id: string;
  titulo: string;
  nivel: 'BAJO' | 'MEDIO' | 'ALTO';
  area: string;
}

export default function KPIsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, _setStats] = useState<KPIStats>({
    promedioGeneral: 0,
    totalKpis: 0,
    kpisVerdes: 0,
    kpisAmarillos: 0,
    kpisRojos: 0,
    porcentajeRojos: 0,
    evaluacionesPendientes: 0,
    empleadosEvaluados: 0,
    totalEmpleados: 0,
  });

  const [areas, _setAreas] = useState<AreaResumen[]> ( [
    { nombre: 'Gerencia', promedioGlobal: 0, kpisRojos: 0, porcentajeRojos: 0, nivelRiesgo: 'BAJO', totalKpis: 0 },
  ]);  ;

  const [alertas, _setAlertas] = useState<AlertaActiva[]>([
    { id: '1', titulo: 'Sin datos', nivel: 'BAJO', area: 'N/A' },
  ]);



  useEffect(() => {
    //cargaremos todos los datos en un solo llamado
    

    const cargarDatos = async () => {
      //primero las estadisticas globales
      try {
        //estadisticas globales para las cards principales
        const statsData = await estadisticasService.getGlobales();

        _setStats({
          promedioGeneral: statsData.desempenio.promedioGeneral,
          totalKpis: statsData.desempenio.totalKpisEvaluados,
          kpisVerdes: statsData.desempenio.kpisVerdes,
          kpisAmarillos: statsData.desempenio.kpisAmarillos,
          kpisRojos: statsData.desempenio.kpisRojos,
          porcentajeRojos: statsData.desempenio.porcentajeRojos,
          evaluacionesPendientes: statsData.evaluaciones.pendientes,
          empleadosEvaluados: statsData.evaluaciones.total,
          totalEmpleados: statsData.recursos.totalEmpleados
        });

        //Areas para la tabla comparativa
        const areasData = await areasService.getAll();

        const areasFormateadas: AreaResumen[] = areasData.map((area: any) => ({
          nombre: area.nombre,
          promedioGlobal: area.promedioGlobal,
          kpisRojos: area.kpisRojos,
          porcentajeRojos: area.porcentajeRojos,
          nivelRiesgo: area.nivelRiesgo,
          totalKpis: area.totalKpis,
        }));
        _setAreas(areasFormateadas);
        console.log('Areas formateadas:', areasFormateadas);

        //Alertas activas
        const alertasData = await alertasService.getActivas();

        _setAlertas(alertasData.map((alerta: any) => ({
          id: alerta.id,
          titulo: alerta.titulo,
          nivel: alerta.nivel,
          area: alerta.area.nombre,
        })));
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      }
    };
    cargarDatos();
  }, []);
  

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

  const getPromedioColor = (promedio: number) => {
    if (promedio >= 90) return 'text-green-600';
    if (promedio >= 75) return 'text-blue-600';
    if (promedio >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de KPIs</h1>
            <p className="text-gray-600 mt-1">
              Vista general del desempeño organizacional
            </p>
          </div>
        </div>

        {/* KPI Cards Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Promedio General */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700">
                <TrendingUp className="w-4 h-4" />
                +3.2%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Promedio General</h3>
            <p className="text-4xl font-bold text-gray-900">{stats.promedioGeneral}%</p>
            <p className="text-xs text-gray-500 mt-2">Basado en {stats.totalKpis} KPIs</p>
          </div>

          {/* Distribución por Estado */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-4">Distribución KPIs</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Verde
                </span>
                <span className="font-bold text-green-600">{stats.kpisVerdes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  Amarillo
                </span>
                <span className="font-bold text-yellow-600">{stats.kpisAmarillos}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Rojo
                </span>
                <span className="font-bold text-red-600">{stats.kpisRojos}</span>
              </div>
            </div>
          </div>

          {/* KPIs Críticos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">KPIs Críticos (Rojos)</h3>
            <p className="text-4xl font-bold text-red-600">{stats.kpisRojos}</p>
            <p className="text-xs text-gray-500 mt-2">{stats.porcentajeRojos}% del total</p>
          </div>

          {/* Evaluaciones Pendientes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Evaluaciones Pendientes</h3>
            <p className="text-4xl font-bold text-orange-600">{stats.evaluacionesPendientes}</p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.empleadosEvaluados}/{stats.totalEmpleados} empleados evaluados
            </p>
          </div>
        </div>

        {/* Alertas Activas */}
        {alertas.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Alertas Activas ({alertas.length})
                </h3>
                <div className="space-y-2">
                  {alertas.map((alerta) => (
                    <div key={alerta.id} className="bg-white rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            alerta.nivel === 'ALTO' ? 'bg-red-100 text-red-700' :
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
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
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

        {/* Desempeño por Área */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Desempeño por Área</h2>
            <p className="text-sm text-gray-600 mt-1">Comparativo de KPIs entre áreas</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Promedio
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Total KPIs
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    KPIs Rojos
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    % Rojos
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Nivel Riesgo
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {areas.map((area: AreaResumen, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {area.nombre[0]}
                        </div>
                        <span className="font-semibold text-gray-900">{area.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-2xl font-bold ${getPromedioColor(area.promedioGlobal)}`}>
                        {area.promedioGlobal.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-semibold text-gray-900">{area.totalKpis}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        area.kpisRojos > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {area.kpisRojos}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${
                        area.porcentajeRojos > 30 ? 'text-red-600' :
                        area.porcentajeRojos > 10 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {area.porcentajeRojos.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border-2 ${getNivelRiesgoColor(area.nivelRiesgo)}`}>
                        {area.nivelRiesgo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {user?.role === 'jefe' && (
            <button
              onClick={() => navigate('/kpis/evaluar')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-8 text-left transition-all shadow-lg hover:shadow-xl"
            >
              <CheckCircle className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Evaluar Empleados</h3>
              <p className="text-blue-100">Gestiona las evaluaciones de tu equipo</p>
            </button>
          )}

          <button
            onClick={() => navigate('/kpis/mis-evaluaciones')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 text-left transition-all shadow-lg hover:shadow-xl"
          >
            <Users className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Mis Evaluaciones</h3>
            <p className="text-purple-100">Consulta tus evaluaciones de desempeño</p>
          </button>

          <button
            onClick={() => navigate('/kpis/reportes')}
            className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl p-8 text-left transition-all shadow-lg hover:shadow-xl"
          >
            <BarChart3 className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Reportes</h3>
            <p className="text-green-100">Genera reportes personalizados</p>
          </button>
        </div>
      </div>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Search, Users, Clock, CheckCircle, AlertCircle, XCircle, Award, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { empleadosService } from '../services/empleados.service';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  puesto: string;
  ultimaEvaluacion?: {
    periodo: string;
    anio: number;
    promedio: number;
    kpisRojos: number;
    status: string;
    fechaEnvio: string;
  };
}

export default function EvaluarEmpleadosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      // 1. Obtener datos
      const areaId = await empleadosService.getById(user!.id).then(emp => emp.areaId);
      const empleados = await empleadosService.getByArea(areaId);
      
      let UltimasEvaluaciones = [];
      for (const emp of empleados) {
        // Asegúrate que 'evaluaciones' traiga el ID del empleado para poder buscarlo luego
        const evaluaciones = await empleadosService.getEstadisticas(emp.id);
        // Si la respuesta no trae el ID plano, inyectalo para facilitar la búsqueda:
        UltimasEvaluaciones.push({ ...evaluaciones, empleadoId: emp.id }); 
      }
  
      // 2. Mapear datos (CORRECCIÓN AQUÍ)
      // Quitamos los corchetes [] que rodeaban a empleados.map
      const listaEmpleadosFormateada: Empleado[] = empleados.map((emp: any) => {
        
        // Optimización: Buscamos la evaluación UNA sola vez por empleado
        const datosEvaluacion = UltimasEvaluaciones.find(ev => ev.empleadoId === emp.id);
        const stats = datosEvaluacion?.ultimaEvaluacion; // Ojo: revisa si tu API devuelve esto dentro de .ultimaEvaluacion o directo
        const nombre = emp.nombre;
        const apellido = emp.apellido;

        return {
          id: emp.id,
          nombre: nombre,
          apellido: apellido,
          puesto: emp.puesto,
          // Usamos el objeto 'stats' que encontramos arriba
          ultimaEvaluacion: stats ? {
            periodo: stats.periodo,
            anio: stats.anio,
            promedio: stats.promedio,
            kpisRojos: stats.kpisRojos,
            status: stats.status,
            fechaEnvio: stats.fechaEnvio,
          } : {
            // Valores por defecto si no hay evaluación
            periodo: '-',
            anio: new Date().getFullYear(),
            promedio: 0,
            kpisRojos: 0,
            status: 'Pendiente',
            fechaEnvio: '',
          },
        };
      });
  
      console.log('Empleados formateados:', listaEmpleadosFormateada);
      setEmpleados(listaEmpleadosFormateada);
  
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  const empleadosFiltrados = empleados.filter(emp => {
    // Filtro de búsqueda
    const matchSearch = `${emp.nombre} ${emp.apellido} ${emp.puesto}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    // Filtro de status
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'sin_evaluar') return !emp.ultimaEvaluacion;
    if (filtroStatus === 'borrador') return emp.ultimaEvaluacion?.status === 'borrador';
    if (filtroStatus === 'enviada') return emp.ultimaEvaluacion?.status === 'enviada';
    if (filtroStatus === 'validada') return emp.ultimaEvaluacion?.status === 'validada';
    
    return true;
  });

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 border-2 border-gray-200">
          <XCircle className="w-3.5 h-3.5" />
          Sin evaluar
        </span>
      );
    }

    const badges = {
      borrador: { 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
        icon: Clock, 
        label: 'Borrador' 
      },
      enviada: { 
        color: 'bg-blue-100 text-blue-700 border-blue-300', 
        icon: AlertCircle, 
        label: 'Pendiente validación' 
      },
      validada: { 
        color: 'bg-green-100 text-green-700 border-green-300', 
        icon: CheckCircle, 
        label: 'Validada' 
      },
      en_revision: { 
        color: 'bg-orange-100 text-orange-700 border-orange-300', 
        icon: AlertCircle, 
        label: 'En revisión' 
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.borrador;
    const Icon = badge.icon;

    return (
      <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 75) return 'from-blue-500 to-blue-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  // Estadísticas
  const sinEvaluar = empleados.filter(e => !e.ultimaEvaluacion).length;
  const conBorrador = empleados.filter(e => e.ultimaEvaluacion?.status === 'borrador').length;
  const enviadas = empleados.filter(e => e.ultimaEvaluacion?.status === 'enviada').length;
  const validadas = empleados.filter(e => e.ultimaEvaluacion?.status === 'validada').length;

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evaluar Empleados</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las evaluaciones de KPIs de tu equipo
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Empleados</p>
                <p className="text-3xl font-bold text-gray-900">{empleados.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sin Evaluar</p>
                <p className="text-3xl font-bold text-gray-900">{sinEvaluar}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Borradores</p>
                <p className="text-3xl font-bold text-yellow-600">{conBorrador}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Validadas</p>
                <p className="text-3xl font-bold text-green-600">{validadas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          {/* Búsqueda y Periodo */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o puesto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>

            {/* Periodo */}
            <div>
              <select
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-semibold"
              >
                <option value="Enero">Proximamente</option>
              </select>
            </div>

            {/* Año */}
            <div>
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-semibold"
              >
                <option value="2026">Proximamente</option>
              </select>
            </div>
          </div>

          {/* Filtros de estado */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Filtrar por estado:</span>
            {[
              { value: 'todos', label: 'Todos', count: empleados.length },
              { value: 'sin_evaluar', label: 'Sin evaluar', count: sinEvaluar },
              { value: 'Borrador', label: 'Borradores', count: conBorrador },
              { value: 'enviada', label: 'Enviadas', count: enviadas },
              { value: 'validada', label: 'Validadas', count: validadas },
            ].map((filtro) => (
              <button
                key={filtro.value}
                onClick={() => setFiltroStatus(filtro.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                  filtroStatus === filtro.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filtro.label}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  filtroStatus === filtro.value
                    ? 'bg-blue-700'
                    : 'bg-gray-200'
                }`}>
                  {filtro.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de empleados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Empleados de tu Área ({empleadosFiltrados.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando empleados...</p>
            </div>
          ) : empleadosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron empleados</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {empleadosFiltrados.map((empleado) => (
                <div
                  key={empleado.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Info del empleado */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {empleado.nombre[0]}{empleado.apellido[0]}
                      </div>

                      {/* Datos */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {empleado.nombre} {empleado.apellido}
                        </h3>
                        <p className="text-sm text-gray-600">{empleado.puesto}</p>
                        
                        {/* Info de última evaluación */}
                        {empleado.ultimaEvaluacion && (
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">
                              Última: {empleado.ultimaEvaluacion.periodo} {empleado.ultimaEvaluacion.anio}
                            </span>
                            {empleado.ultimaEvaluacion.kpisRojos > 0 && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                                <Target className="w-3 h-3" />
                                {empleado.ultimaEvaluacion.kpisRojos} KPIs rojos
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status y Score */}
                    <div className="flex items-center gap-4">
                      {/* Status Badge */}
                      {getStatusBadge(empleado.ultimaEvaluacion?.status)}

                      {/* Score (si existe) */}
                      {empleado.ultimaEvaluacion && (
                        <div className={`bg-gradient-to-br ${getScoreGradient(empleado.ultimaEvaluacion.promedio)} text-white rounded-xl p-4 text-center min-w-[100px]`}>
                          <Award className="w-5 h-5 mx-auto mb-1" />
                          <p className="text-2xl font-bold">{empleado.ultimaEvaluacion.promedio}%</p>
                        </div>
                      )}

                      {/* Botón de acción */}
                      <button
                        onClick={() => navigate(`/kpis/evaluar/${empleado.id}`)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors whitespace-nowrap"
                      >
                        {empleado.ultimaEvaluacion?.status === 'borrador' ? 'Continuar' : 
                         empleado.ultimaEvaluacion ? 'Ver/Editar' : 'Evaluar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
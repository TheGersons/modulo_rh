import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, Target, TrendingUp, AlertTriangle, CheckCircle,
  Clock, Award, BarChart3, ArrowRight, Activity, Zap, FileText,
  Building, FolderOpen, TrendingDown, Trophy, X, Info, Shield,
  ChevronDown, ChevronRight, BarChart2, Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import Layout from '../components/layout/Layout';
import { estadisticasService } from '../services/estadisticas.service';
import ModalPerfilEmpleado, {
  getPeriodoActual,
} from '../components/ModalPerfilEmpleado';
import type { EmpleadoEquipo } from '../components/ModalPerfilEmpleado';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface StatsGlobal {
  empleados: { total: number };
  areas: { total: number; principales: number; subAreas: number };
  kpis: { total: number };
  puestos: { total: number };
  ordenes: { total: number; activas: number; completadas: number; vencidas: number; porcentajeCompletadas: number };
  alertas: { activas: number };
  evaluaciones: { recientes: number };
}

interface StatsArea {
  area: { id: string; nombre: string; jefe: string };
  empleados: { total: number };
  kpis: { total: number };
  ordenes: { total: number; activas: number; completadas: number; vencidas: number };
  alertas: { activas: number };
  evaluaciones: { recientes: number };
  ranking: { empleado: string; promedio: number }[];
}

interface StatsEmpleado {
  empleado: { id: string; nombre: string; puesto: string; area: string };
  ordenes: { total: number; activas: number; completadas: number; vencidas: number; tasaCumplimiento: number };
  evaluaciones: { total: number; ultimoPromedio: number; ultimosKpisRojos: number };
}

interface Alerta {
  id: string;
  tipo: string;
  nivel: string;
  titulo: string;
  descripcion: string;
  accionSugerida?: string;
  status: string;
  fechaDeteccion: string;
  empleado?: {         // ← AGREGAR
    nombre: string;
    apellido: string;
    puesto?: { nombre: string };
  };
}

interface AreaRanking {
  id: string;
  nombre: string;
  promedio: number;
  empleados: number;
  kpisRojos: number;
  subAreasCount: number;
}

interface EmpleadoListItem {
  id: string;
  nombre: string;
  apellido: string;
  role: string;
  puesto: { id: string; nombre: string } | null;
  porcentajeCumplimiento: number;
  kpisAprobados: number;
  kpisTotal: number;
  alertasActivas: number;
  ordenesVencidas: number;
}

interface TendenciaData {
  mes: string;
  completadas: number;
  vencidas: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NIVEL_CONFIG: Record<string, { dot: string; bg: string; text: string; badge: string }> = {
  ALTO: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  MEDIO: { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  BAJO: { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
};

const formatTiempoRelativo = (fecha: string) => {
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins}m`;
  if (horas < 24) return `Hace ${horas}h`;
  return `Hace ${dias}d`;
};

const getTasaColor = (pct: number) => {
  if (pct >= 80) return 'from-green-500 to-emerald-500';
  if (pct >= 50) return 'from-yellow-500 to-amber-500';
  return 'from-red-500 to-rose-500';
};

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, iconBg, label, value, sub, onClick, highlight,
}: {
  icon: any; iconBg: string; label: string; value: string | number;
  sub?: React.ReactNode; onClick?: () => void; highlight?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
        } ${highlight ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {onClick && <ArrowRight className="w-4 h-4 text-gray-300" />}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold mb-2 ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      {sub && <div className="text-xs">{sub}</div>}
    </div>
  );
}

function OrdenesPanel({ ordenes, porcentaje }: {
  ordenes: { total: number; activas: number; completadas: number; vencidas: number };
  porcentaje?: number;
}) {
  const pct = porcentaje ?? (ordenes.total > 0 ? (ordenes.completadas / ordenes.total) * 100 : 0);
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total', val: ordenes.total, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
          { label: 'Activas', val: ordenes.activas, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Completadas', val: ordenes.completadas, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
          { label: 'Vencidas', val: ordenes.vencidas, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`p-4 rounded-xl border ${bg}`}>
            <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{val}</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Tasa de Cumplimiento
          </span>
          <span className={`text-xl font-bold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {pct.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full bg-gradient-to-r ${getTasaColor(pct)} transition-all duration-700`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{ordenes.completadas} de {ordenes.total} órdenes completadas</p>
      </div>
    </>
  );
}

function AlertasModal({ alertas, onClose, onResolver }: {
  alertas: Alerta[];
  onClose: () => void;
  onResolver: (id: string) => void;
}) {
  const [filtro, setFiltro] = useState<'todas' | 'ALTO' | 'MEDIO' | 'BAJO'>('todas');
  const filtradas = filtro === 'todas' ? alertas : alertas.filter(a => a.nivel === filtro);
  const counts = { ALTO: alertas.filter(a => a.nivel === 'ALTO').length, MEDIO: alertas.filter(a => a.nivel === 'MEDIO').length, BAJO: alertas.filter(a => a.nivel === 'BAJO').length };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Alertas Activas</h2>
              <p className="text-xs text-gray-500">{alertas.length} alertas pendientes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 px-6 py-3 border-b border-gray-100">
          {(['todas', 'ALTO', 'MEDIO', 'BAJO'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtro === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {f === 'todas' ? `Todas (${alertas.length})` : `${f} (${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {filtradas.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No hay alertas en este nivel</p>
            </div>
          ) : (
            filtradas.map((alerta) => {
              const cfg = NIVEL_CONFIG[alerta.nivel] ?? NIVEL_CONFIG['BAJO'];
              return (
                <div key={alerta.id} className={`rounded-xl p-4 border ${cfg.bg} ${alerta.nivel === 'ALTO' ? 'border-red-200' : alerta.nivel === 'MEDIO' ? 'border-yellow-200' : 'border-blue-200'} group`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className={`text-sm font-semibold ${cfg.text}`}>{alerta.titulo}</p>
                          {alerta.empleado && (
                            <p className="text-xs font-semibold text-blue-600 mt-0.5">
                              👤 {alerta.empleado.nombre} {alerta.empleado.apellido}
                              {alerta.empleado.puesto && ` · ${alerta.empleado.puesto.nombre}`}
                            </p>
                          )}

                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>{alerta.nivel}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{alerta.descripcion}</p>
                        {alerta.accionSugerida && (
                          <p className={`text-xs mt-1.5 font-medium ${cfg.text}`}>→ {alerta.accionSugerida}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formatTiempoRelativo(alerta.fechaDeteccion)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onResolver(alerta.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Marcar como resuelta"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <p className="text-xs text-gray-500">Haz hover sobre una alerta para resolverla</p>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isRRHH } = usePermissions();

  const esAdmin = user?.role === 'admin' || user?.role === 'rrhh';
  const esJefe = user?.role === 'jefe';
  const esEmpleado = !esAdmin && !esJefe;
  const puedeNavegarRanking = isAdmin || isRRHH;

  // Stats según rol
  const [statsGlobal, setStatsGlobal] = useState<StatsGlobal | null>(null);
  const [statsArea, setStatsArea] = useState<StatsArea | null>(null);
  const [statsEmpleado, setStatsEmpleado] = useState<StatsEmpleado | null>(null);

  // Datos globales (todos los roles)
  const [areasRanking, setAreasRanking] = useState<AreaRanking[]>([]);
  const [periodoRanking, setPeriodoRanking] = useState<string>('');
  const [tendencias, setTendencias] = useState<TendenciaData[]>([]);

  // Alertas
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [showAlertas, setShowAlertas] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Drilldown del Ranking de Áreas (admin/rrhh) ────────────────────────────
  const periodoActual = getPeriodoActual();
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedSubAreas, setExpandedSubAreas] = useState<Set<string>>(new Set());
  const [subAreasByArea, setSubAreasByArea] = useState<Record<string, AreaRanking[]>>({});
  const [empleadosBySubArea, setEmpleadosBySubArea] = useState<Record<string, EmpleadoListItem[]>>({});
  const [loadingSubAreas, setLoadingSubAreas] = useState<Set<string>>(new Set());
  const [loadingEmpleados, setLoadingEmpleados] = useState<Set<string>>(new Set());
  const [empleadoModal, setEmpleadoModal] = useState<EmpleadoEquipo | null>(null);
  const [loadingEmpleadoModal, setLoadingEmpleadoModal] = useState(false);

  useEffect(() => { cargarDashboard(); }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      // Ranking y tendencias — para todos los roles sin filtro (motivacional)
      const [rankingData, tendenciasData] = await Promise.all([
        estadisticasService.getRankingAreas(),
        estadisticasService.getTendencias(),
      ]);
      // El backend devuelve { periodo, ranking } — extraer ambos.
      if (rankingData && Array.isArray(rankingData.ranking)) {
        setAreasRanking(rankingData.ranking);
        setPeriodoRanking(rankingData.periodo ?? '');
      } else if (Array.isArray(rankingData)) {
        // Fallback por si el backend aún devuelve el array plano
        setAreasRanking(rankingData);
      }
      setTendencias(tendenciasData);

      // Stats y alertas según rol
      if (esAdmin) {
        const data = await estadisticasService.getDashboard();
        setStatsGlobal(data);
        await cargarAlertas();

      } else if (esJefe && user?.areaId) {
        const data = await estadisticasService.getByArea(user.areaId);
        setStatsArea(data);
        await cargarAlertas(user.areaId);

      } else if (user?.id) {
        const data = await estadisticasService.getByEmpleado(user.id);
        setStatsEmpleado(data);
        // Empleados ven stats globales de estructura (solo lectura)
        const global = await estadisticasService.getDashboard();
        setStatsGlobal(global);
        await cargarAlertas(undefined, user.id);
      }

    } catch (err: any) {
      console.error('Error al cargar dashboard:', err);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const cargarAlertas = async (areaId?: string, empleadoId?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ status: 'activa' });
      if (areaId) params.set('areaId', areaId);
      else if (empleadoId) params.set('empleadoId', empleadoId);
      const res = await fetch(`/api/alertas?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setAlertas(await res.json());
    } catch (e) {
      console.error('Error al cargar alertas:', e);
    }
  };

  const resolverAlerta = async (alertaId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/alertas/${alertaId}/resolver`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertas(prev => prev.filter(a => a.id !== alertaId));
    } catch (e) {
      console.error('Error al resolver alerta:', e);
    }
  };

  // ─── Drilldown handlers ─────────────────────────────────────────────────────
  const toggleArea = async (areaId: string) => {
    const next = new Set(expandedAreas);
    if (next.has(areaId)) {
      next.delete(areaId);
      setExpandedAreas(next);
      return;
    }
    next.add(areaId);
    setExpandedAreas(next);

    if (!subAreasByArea[areaId]) {
      setLoadingSubAreas(prev => new Set(prev).add(areaId));
      try {
        const subs = await estadisticasService.getSubAreasRanking(areaId);
        setSubAreasByArea(prev => ({ ...prev, [areaId]: subs }));
      } catch (e) {
        console.error('Error al cargar sub-áreas:', e);
      } finally {
        setLoadingSubAreas(prev => {
          const n = new Set(prev);
          n.delete(areaId);
          return n;
        });
      }
    }
  };

  const toggleSubArea = async (subAreaId: string) => {
    const next = new Set(expandedSubAreas);
    if (next.has(subAreaId)) {
      next.delete(subAreaId);
      setExpandedSubAreas(next);
      return;
    }
    next.add(subAreaId);
    setExpandedSubAreas(next);

    if (!empleadosBySubArea[subAreaId]) {
      setLoadingEmpleados(prev => new Set(prev).add(subAreaId));
      try {
        const emps = await estadisticasService.getEmpleadosDeArea(subAreaId, periodoActual);
        setEmpleadosBySubArea(prev => ({ ...prev, [subAreaId]: emps }));
      } catch (e) {
        console.error('Error al cargar empleados:', e);
      } finally {
        setLoadingEmpleados(prev => {
          const n = new Set(prev);
          n.delete(subAreaId);
          return n;
        });
      }
    }
  };

  const verPerfilEmpleado = async (empleadoId: string) => {
    setLoadingEmpleadoModal(true);
    try {
      const data = await estadisticasService.getEmpleadoFull(empleadoId, periodoActual);
      setEmpleadoModal(data);
    } catch (e) {
      console.error('Error al cargar perfil de empleado:', e);
    } finally {
      setLoadingEmpleadoModal(false);
    }
  };

  // ─── Loading / Error ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-500">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Error al cargar el dashboard</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button onClick={cargarDashboard} className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
              Reintentar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Valores según rol para las cards ─────────────────────────────────────

  const ordenesData = esAdmin
    ? statsGlobal?.ordenes
    : esJefe
      ? statsArea?.ordenes
      : statsEmpleado?.ordenes;

  const alertasCount = alertas.length;
  const kpisCount = esAdmin ? statsGlobal?.kpis.total : esJefe ? statsArea?.kpis.total : null;
  const empleadosCount = esAdmin
    ? statsGlobal?.empleados.total
    : esJefe
      ? statsArea?.empleados.total
      : statsGlobal?.empleados.total; // empleados ven total global (informativo)

  const labelScope = esAdmin ? 'Global' : esJefe ? `Área: ${statsArea?.area?.nombre ?? ''}` : 'Personal';

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="p-8 space-y-6">

        {/* ── Banner de bienvenida ── */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-white/20 text-blue-100 px-3 py-1 rounded-full font-medium uppercase tracking-wide">
                  {labelScope}
                </span>
                {esAdmin && <Shield className="w-4 h-4 text-yellow-300" />}
              </div>
              <h1 className="text-3xl font-bold mb-1">
                ¡Bienvenido, {user?.nombre || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-blue-200 text-sm">
                {new Date().toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {esEmpleado && statsEmpleado && (
                <p className="text-blue-200 text-sm mt-1">
                  {statsEmpleado.empleado.puesto} · {statsEmpleado.empleado.area}
                </p>
              )}
              <div className="flex items-center gap-6 mt-5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-blue-100">Sistema Operativo</span>
                </div>
                {ordenesData && ordenesData.activas > 0 && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-300" />
                    <span className="text-sm text-blue-100">{ordenesData.activas} Órdenes Activas</span>
                  </div>
                )}
                {alertasCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-300" />
                    <span className="text-sm text-blue-100">{alertasCount} Alertas pendientes</span>
                  </div>
                )}
              </div>
            </div>
            <Award className="w-24 h-24 text-blue-300/25 hidden md:block" />
          </div>
        </div>

        {/* ── Cards principales ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Empleados — todos lo ven, pero con scope distinto */}
          <StatCard
            icon={Users}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            label={esAdmin ? 'Empleados Activos' : esJefe ? 'Empleados en tu Área' : 'Total Empleados'}
            value={empleadosCount ?? 0}
            sub={
              esAdmin || esEmpleado
                ? <span className="text-gray-400 flex items-center gap-1"><Activity className="w-3 h-3" /> En el sistema</span>
                : <span className="text-blue-600">Bajo tu gestión</span>
            }
            onClick={esAdmin ? () => navigate('/empleados') : undefined}
          />

          {/* Estructura — todos lo ven (informativo) */}
          <StatCard
            icon={Building}
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
            label="Estructura Organizacional"
            value={statsGlobal?.areas.total ?? 0}
            sub={
              <div className="flex gap-3">
                <span className="text-purple-600 flex items-center gap-1"><Building className="w-3 h-3" /> {statsGlobal?.areas.principales} principales</span>
                <span className="text-gray-400 flex items-center gap-1"><FolderOpen className="w-3 h-3" /> {statsGlobal?.areas.subAreas} sub-áreas</span>
              </div>
            }
          />

          {/* KPIs — admin/jefe ven su scope, empleado no ve esta card */}
          {!esEmpleado ? (
            <StatCard
              icon={Target}
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
              label={esAdmin ? 'KPIs Configurados' : 'KPIs del Área'}
              value={kpisCount ?? 0}
              sub={<span className="text-blue-600 flex items-center gap-1"><Zap className="w-3 h-3" /> Sistema automático</span>}
              onClick={esAdmin ? () => navigate('/kpis') : undefined}
            />
          ) : (
            // Empleado ve su tasa de cumplimiento en lugar de KPIs
            <StatCard
              icon={TrendingUp}
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
              label="Mi Tasa de Cumplimiento"
              value={`${statsEmpleado?.ordenes.tasaCumplimiento.toFixed(1) ?? 0}%`}
              sub={
                <span className={`flex items-center gap-1 ${(statsEmpleado?.ordenes.tasaCumplimiento ?? 0) >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {(statsEmpleado?.ordenes.tasaCumplimiento ?? 0) >= 80 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {(statsEmpleado?.ordenes.tasaCumplimiento ?? 0) >= 80 ? 'Buen desempeño' : 'Hay oportunidades de mejora'}
                </span>
              }
            />
          )}

          {/* Alertas — con funcionalidad, scope por rol */}
          <StatCard
            icon={AlertTriangle}
            iconBg={alertasCount > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}
            label={esAdmin ? 'Alertas Activas' : esJefe ? 'Alertas del Área' : 'Mis Alertas'}
            value={alertasCount}
            highlight={alertasCount > 0}
            sub={
              alertasCount > 0
                ? <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Requieren atención — click para ver</span>
                : <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sin alertas activas</span>
            }
            onClick={alertasCount > 0 ? () => setShowAlertas(true) : undefined}
          />
        </div>

        {/* ── Panel de Órdenes ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              {esEmpleado ? 'Mis Órdenes de Trabajo' : 'Estado de Órdenes de Trabajo'}
            </h2>
            <button
              onClick={() => navigate(esEmpleado ? '/mis-ordenes' : '/ordenes')}
              className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {!ordenesData || ordenesData.total === 0 ? (
            <div className="text-center py-10">
              <Briefcase className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No hay órdenes de trabajo aún</p>
            </div>
          ) : (
            <OrdenesPanel
              ordenes={ordenesData}
              porcentaje={(ordenesData as any).porcentajeCompletadas ?? (ordenesData as any).tasaCumplimiento}
            />
          )}
        </div>

        {/* ── Ranking de empleados del área (solo jefe) ── */}
        {esJefe && statsArea?.ranking && statsArea.ranking.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Ranking de tu Equipo
            </h2>
            <div className="space-y-3">
              {statsArea.ranking.slice(0, 8).map((emp, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-200 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <p className="flex-1 text-sm font-medium text-gray-800">{emp.empleado}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getTasaColor(emp.promedio)}`}
                        style={{ width: `${Math.min(100, emp.promedio)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-12 text-right ${emp.promedio >= 80 ? 'text-green-600' : emp.promedio >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {emp.promedio}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Mi último desempeño (solo empleado) ── */}
        {esEmpleado && statsEmpleado && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
              <Award className="w-5 h-5 text-yellow-500" />
              Mi Desempeño
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <p className="text-xs text-blue-600 font-semibold mb-1">Evaluaciones Totales</p>
                <p className="text-3xl font-bold text-blue-700">{statsEmpleado.evaluaciones.total}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                <p className="text-xs text-green-600 font-semibold mb-1">Último Promedio</p>
                <p className="text-3xl font-bold text-green-700">{statsEmpleado.evaluaciones.ultimoPromedio}%</p>
              </div>
              <div className={`p-4 rounded-xl border text-center ${statsEmpleado.evaluaciones.ultimosKpisRojos > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                <p className={`text-xs font-semibold mb-1 ${statsEmpleado.evaluaciones.ultimosKpisRojos > 0 ? 'text-red-600' : 'text-gray-500'}`}>KPIs en Rojo</p>
                <p className={`text-3xl font-bold ${statsEmpleado.evaluaciones.ultimosKpisRojos > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {statsEmpleado.evaluaciones.ultimosKpisRojos}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tendencias + Ranking Global — todos los roles ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tendencias */}
          {tendencias.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Tendencias Globales
                </h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Últimos 6 meses</span>
              </div>
              <div className="space-y-4">
                {tendencias.map((mes, idx) => {
                  const total = mes.completadas + mes.vencidas;
                  const pct = total > 0 ? (mes.completadas / total) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600 capitalize">{mes.mes}</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-green-600"><TrendingUp className="w-3 h-3" />{mes.completadas}</span>
                          <span className="flex items-center gap-1 text-red-500"><TrendingDown className="w-3 h-3" />{mes.vencidas}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full bg-gradient-to-r ${getTasaColor(pct)} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                <Info className="w-3 h-3" /> Verde = completadas, Rojo = vencidas en ese mes
              </p>
            </div>
          )}

          {/* Ranking de Áreas Global */}
          {areasRanking.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Ranking de Áreas
                </h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Período {periodoRanking || new Date().toISOString().slice(0, 7)}</span>
              </div>
              <div className="space-y-3">
                {areasRanking.slice(0, 5).map((area, idx) => {
                  const expanded = expandedAreas.has(area.id);
                  const subs = subAreasByArea[area.id];
                  const cargandoSubs = loadingSubAreas.has(area.id);
                  return (
                    <div key={area.id ?? idx}>
                      <div
                        onClick={puedeNavegarRanking ? () => toggleArea(area.id) : undefined}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${puedeNavegarRanking ? 'cursor-pointer' : ''} ${esJefe && statsArea?.area?.nombre === area.nombre
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-100'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-200 text-gray-600' :
                            idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-gray-900 text-sm truncate">{area.nombre}</p>
                            {esJefe && statsArea?.area?.nombre === area.nombre && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">Tu área</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{area.empleados}</span>
                            {area.kpisRojos > 0 && (
                              <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3" />{area.kpisRojos} rojos</span>
                            )}
                            {area.subAreasCount > 0 && (
                              <span className="flex items-center gap-1"><Building className="w-3 h-3" />{area.subAreasCount} sub-área{area.subAreasCount > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${area.promedio >= 80 ? 'text-green-600' : area.promedio >= 50 ? 'text-blue-600' : 'text-red-600'}`}>
                            {area.promedio}%
                          </p>
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                            <div
                              className={`h-1.5 rounded-full bg-gradient-to-r ${getTasaColor(area.promedio)}`}
                              style={{ width: `${Math.min(100, area.promedio)}%` }}
                            />
                          </div>
                        </div>
                        {puedeNavegarRanking && (
                          <div className="flex-shrink-0 text-gray-400">
                            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        )}
                      </div>

                      {puedeNavegarRanking && expanded && (
                        <div className="mt-2 ml-6 space-y-2">
                          {cargandoSubs && (
                            <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando sub-áreas...
                            </div>
                          )}
                          {!cargandoSubs && subs && subs.length === 0 && (
                            <p className="text-xs text-gray-400 px-3 py-2">Sin sub-áreas</p>
                          )}
                          {!cargandoSubs && subs && subs.map((sub) => {
                            const subExpanded = expandedSubAreas.has(sub.id);
                            const emps = empleadosBySubArea[sub.id];
                            const cargandoEmps = loadingEmpleados.has(sub.id);
                            return (
                              <div key={sub.id}>
                                <div
                                  onClick={() => toggleSubArea(sub.id)}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:shadow-sm cursor-pointer transition-all"
                                >
                                  <Building className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{sub.nombre}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{sub.empleados} persona{sub.empleados !== 1 ? 's' : ''}</span>
                                      {sub.kpisRojos > 0 && (
                                        <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3" />{sub.kpisRojos} rojos</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-base font-bold ${sub.promedio >= 80 ? 'text-green-600' : sub.promedio >= 50 ? 'text-blue-600' : 'text-red-600'}`}>
                                      {sub.promedio}%
                                    </p>
                                  </div>
                                  <div className="text-gray-400 flex-shrink-0">
                                    {subExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </div>
                                </div>

                                {subExpanded && (
                                  <div className="mt-2 ml-6 space-y-1.5">
                                    {cargandoEmps && (
                                      <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando empleados...
                                      </div>
                                    )}
                                    {!cargandoEmps && emps && emps.length === 0 && (
                                      <p className="text-xs text-gray-400 px-3 py-2">Sin empleados</p>
                                    )}
                                    {!cargandoEmps && emps && emps.map((emp) => {
                                      const pct = emp.porcentajeCumplimiento;
                                      return (
                                        <div key={emp.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${emp.ordenesVencidas > 0 ? 'bg-red-500' : emp.alertasActivas > 0 ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                                            {emp.nombre[0]}{emp.apellido[0]}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 truncate">{emp.nombre} {emp.apellido}</p>
                                            {emp.puesto && (
                                              <p className="text-xs text-gray-400 truncate">{emp.puesto.nombre}</p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className="text-right">
                                              <p className={`text-sm font-semibold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {pct}%
                                              </p>
                                              <p className="text-xs text-gray-400">{emp.kpisAprobados}/{emp.kpisTotal} KPIs</p>
                                            </div>
                                            <button
                                              onClick={() => verPerfilEmpleado(emp.id)}
                                              disabled={loadingEmpleadoModal}
                                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                                              title="Ver perfil detallado"
                                            >
                                              <BarChart2 className="w-3.5 h-3.5" />
                                              Ver perfil
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {areasRanking.length > 5 && (
                <p className="text-xs text-center text-gray-400 mt-3">Top 5 de {areasRanking.length} áreas</p>
              )}
            </div>
          )}
        </div>

        {/* ── Accesos rápidos ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-yellow-500" />
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: esEmpleado ? 'Mis Evaluaciones' : 'Evaluaciones',
                icon: Award,
                color: 'from-blue-50 to-purple-50 border-blue-200 hover:border-blue-400',
                iconColor: 'text-blue-600',
                path: '/kpis/mis-evaluaciones',
              },
              {
                label: esEmpleado ? 'Mis Órdenes de Trabajo' : 'Órdenes de Trabajo',
                icon: Briefcase,
                color: 'from-green-50 to-teal-50 border-green-200 hover:border-green-400',
                iconColor: 'text-green-600',
                path: esEmpleado ? '/mis-ordenes' : '/ordenes',
              },
              ...(esAdmin ? [
                {
                  label: 'Empleados',
                  icon: Users,
                  color: 'from-indigo-50 to-blue-50 border-indigo-200 hover:border-indigo-400',
                  iconColor: 'text-indigo-600',
                  path: '/empleados',
                },
                {
                  label: 'KPIs',
                  icon: Target,
                  color: 'from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-400',
                  iconColor: 'text-yellow-600',
                  path: '/kpis',
                },
              ] : []),
              ...(esJefe ? [
                {
                  label: 'Solicitudes Pendientes',
                  icon: FileText,
                  color: 'from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-400',
                  iconColor: 'text-yellow-600',
                  path: '/solicitudes',
                },
              ] : []),
            ].map(({ label, icon: Icon, color, iconColor, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full p-4 bg-gradient-to-r ${color} border-2 rounded-xl transition-all group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                    <p className="font-medium text-gray-800 text-sm">{label}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 ${iconColor} group-hover:translate-x-1 transition-transform`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal de Alertas ── */}
      {showAlertas && (
        <AlertasModal
          alertas={alertas}
          onClose={() => setShowAlertas(false)}
          onResolver={resolverAlerta}
        />
      )}

      {/* ── Modal de Perfil del Empleado ── */}
      {empleadoModal && (
        <ModalPerfilEmpleado
          empleado={empleadoModal}
          periodo={periodoActual}
          onClose={() => setEmpleadoModal(null)}
          navigate={navigate}
        />
      )}
    </Layout>
  );
}
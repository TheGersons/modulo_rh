import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, User, CheckCircle, AlertTriangle, Info, Check } from 'lucide-react';

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

const NIVEL_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  ALTO: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
  MEDIO: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle },
  BAJO: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Info },
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

export default function Header() {
  const { user, logout } = useAuth();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [cargando, setCargando] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const alertasActivas = alertas.filter(a => a.status === 'activa');
  const count = alertasActivas.length;

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar alertas al montar y cada 60s
  useEffect(() => {
    if (user) {
      cargarAlertas();
      const interval = setInterval(cargarAlertas, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const cargarAlertas = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const esJefeOAdmin = user!.role === 'jefe' || user!.role === 'admin';
      const params = new URLSearchParams({ status: 'activa' });
      if (esJefeOAdmin && user!.areaId) {
        params.set('areaId', user!.areaId);
      } else {
        params.set('empleadoId', user!.id);
      }
      const res = await fetch(`/api/alertas?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setAlertas(data);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    }
  };

  const marcarComoResuelta = async (alertaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/alertas/${alertaId}/resolver`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertas(prev => prev.filter(a => a.id !== alertaId));
    } catch (error) {
      console.error('Error al resolver alerta:', error);
    }
  };

  const marcarTodasResueltas = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('accessToken');
      await Promise.all(
        alertasActivas.map(a =>
          fetch(`/api/alertas/${a.id}/resolver`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setAlertas([]);
    } catch (error) {
      console.error('Error al resolver alertas:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Título */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de KPIs</h1>
            <p className="text-sm text-gray-600 mt-1">Gestión de Recursos Humanos</p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-6">

            {/* Notificaciones */}
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setShowPanel(prev => !prev)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>

              {/* Panel desplegable */}
              {showPanel && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">

                  {/* Header del panel */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900 text-sm">Notificaciones</span>
                      {count > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                          {count} nuevas
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {count > 0 && (
                        <button
                          onClick={marcarTodasResueltas}
                          disabled={cargando}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                          title="Marcar todas como leídas"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Todas leídas
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista de alertas */}
                  <div className="max-h-[420px] overflow-y-auto">
                    {alertasActivas.length === 0 ? (
                      <div className="py-12 text-center">
                        <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-500">Todo al día</p>
                        <p className="text-xs text-gray-400 mt-1">No tienes notificaciones pendientes</p>
                      </div>
                    ) : (
                      alertasActivas.map((alerta) => {
                        const cfg = NIVEL_CONFIG[alerta.nivel] ?? NIVEL_CONFIG['BAJO'];
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={alerta.id}
                            className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors group`}
                          >
                            {/* Icono nivel */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 leading-tight">
                                {alerta.titulo}
                              </p>
                              {/* ← AGREGAR ESTO */}
                              {alerta.empleado && (
                                <p className="text-xs font-semibold text-blue-600 mt-0.5">
                                  👤 {alerta.empleado.nombre} {alerta.empleado.apellido}
                                  {alerta.empleado.puesto && ` · ${alerta.empleado.puesto.nombre}`}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                {alerta.descripcion}
                              </p>
                              {alerta.accionSugerida && (
                                <p className={`text-xs mt-1 font-medium ${cfg.color}`}>
                                  → {alerta.accionSugerida}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTiempoRelativo(alerta.fechaDeteccion)}
                              </p>
                            </div>

                            {/* Botón resolver */}
                            <button
                              onClick={(e) => marcarComoResuelta(alerta.id, e)}
                              className="p-1.5 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
                              title="Marcar como leída"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {alertasActivas.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                      <button
                        onClick={cargarAlertas}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Actualizar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info del usuario */}
            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
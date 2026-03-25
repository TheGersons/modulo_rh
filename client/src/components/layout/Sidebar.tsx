import {
    LayoutDashboard,
    Users,
    Target,
    Settings,
    ChevronDown,
    ChevronRight,
    Briefcase,
    ClipboardCheck,
    Award,
    Plus,
    Edit,
    Building,
    Lock,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

interface MenuItem {
    icon: any;
    label: string;
    path?: string;
    badge?: number;
    submenu?: MenuItem[];
    allowedRoles?: string[];
    exact?: boolean; // Si true, solo match exacto (no subrutas)
}

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userRole } = usePermissions();
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    const menuItems: MenuItem[] = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            path: '/dashboard',
            exact: true,
        },
        {
            icon: Target,
            label: 'KPIs',
            submenu: [
                {
                    icon: Target,
                    label: 'Vista General',
                    path: '/kpis',
                    exact: true,
                    allowedRoles: ['admin', 'jefe', 'rrhh'],
                },
                {
                    icon: ClipboardCheck,
                    label: 'Mis KPIs',
                    path: '/mis-kpis',
                    exact: true
                },
                {
                    icon: ClipboardCheck,
                    label: 'Revisión de Evidencias',
                    path: '/revision-evidencias',
                    allowedRoles: ['admin', 'jefe', 'rrhh']
                },
                {
                    icon: Edit,
                    label: 'Gestionar KPIs',
                    path: '/configuracion/kpis',
                    allowedRoles: ['admin', 'rrhh'],
                },
            ],
        },
        {
            icon: Briefcase,
            label: 'Órdenes de Trabajo',
            submenu: [
                {
                    icon: Briefcase,
                    label: 'Ver Órdenes',    // admin/jefe/rrhh ven todas
                    path: '/ordenes',
                    exact: true,
                    allowedRoles: ['admin', 'jefe', 'rrhh', 'empleado'],
                },
                {
                    icon: ClipboardCheck,
                    label: 'Mis Órdenes',   // empleado ve las suyas
                    path: '/mis-ordenes',
                    exact: true,
                },
                { icon: Plus, label: 'Nueva Orden', path: '/ordenes/crear' },
            ],
        },
        {
            icon: Users,
            label: 'Mi Equipo',
            path: '/mi-equipo',
            exact: true,
            allowedRoles: ['admin', 'jefe', 'rrhh'],
        },
        {
            icon: Award,
            label: 'Evaluaciones',
            submenu: [
                // 'Mis Evaluaciones' solo aparece en este menú (eliminado el duplicado de KPIs)
                { icon: ClipboardCheck, label: 'Mis Evaluaciones', path: '/kpis/mis-evaluaciones', exact: true },
                {
                    icon: Award,
                    label: 'Cerrar Periodo',
                    path: '/evaluaciones/cerrar-periodo',
                    exact: true,
                    allowedRoles: ['admin', 'rrhh'],
                },
            ],
        },
        {
            icon: Users,
            label: 'Empleados',
            path: '/empleados',
            exact: true,
            allowedRoles: ['admin', 'rrhh'],
        },
        {
            icon: Settings,
            label: 'Configuración',
            submenu: [
                {
                    icon: Building,
                    label: 'Áreas',
                    path: '/configuracion/areas',
                    allowedRoles: ['admin', 'rrhh'],
                },
                {
                    icon: Briefcase,
                    label: 'Puestos',
                    path: '/puestos',
                    exact: true,
                    allowedRoles: ['admin', 'rrhh'],
                },
                {
                    icon: Settings,
                    label: 'Preferencias',
                    path: '/configuracion',
                    exact: true,
                },
            ],
        },
        //vista confidencial solo para admin
        {
            icon: Lock,
            label: 'Asignacion de Revisores',
            path: '/asignacion-revisores',
            exact: true,
            allowedRoles: ['admin'],
        },
    ];

    // Filtrar items según permisos
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
        return items
            .map((item) => {
                if (item.allowedRoles) {
                    const hasPermission = item.allowedRoles.includes(userRole || '');
                    if (!hasPermission) return null;
                }
                if (item.submenu) {
                    const filteredSubmenu = filterMenuItems(item.submenu);
                    if (filteredSubmenu.length === 0) return null;
                    return { ...item, submenu: filteredSubmenu };
                }
                return item;
            })
            .filter((item): item is MenuItem => item !== null);
    };

    const filteredMenuItems = filterMenuItems(menuItems);

    /**
     * Determina si un ítem está activo.
     * Si `exact=true` → solo match exacto de pathname.
     * Si `exact=false/undefined` → match exacto O subrutas directas (path + '/').
     */
    const isActive = useCallback(
        (path?: string, exact?: boolean): boolean => {
            if (!path) return false;
            if (exact) return location.pathname === path;
            return location.pathname === path || location.pathname.startsWith(path + '/');
        },
        [location.pathname]
    );

    // Verifica si algún hijo del ítem está activo
    const hasActiveChild = useCallback(
        (item: MenuItem): boolean => {
            if (!item.submenu) return false;
            return item.submenu.some((subItem) => isActive(subItem.path, subItem.exact));
        },
        [isActive]
    );

    // Auto-expandir el menú padre cuando la URL cambia (ej: navegación directa por URL)
    useEffect(() => {
        const activeParent = filteredMenuItems.find((item) => hasActiveChild(item));
        if (activeParent) {
            setExpandedMenus((prev) =>
                prev.includes(activeParent.label) ? prev : [activeParent.label]
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const toggleMenu = (label: string) => {
        // Solo un menú abierto a la vez
        setExpandedMenus((prev) =>
            prev.includes(label) ? prev.filter((item) => item !== label) : [label]
        );
    };

    const handleNavigation = (item: MenuItem) => {
        if (item.submenu) {
            toggleMenu(item.label);
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <aside className="w-72 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 text-white flex flex-col">
            {/* Logo */}
            <div className="flex justify-center pt-2 px-4">
                <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 p-5 flex items-center gap-5 max-w-sm w-full border border-blue-50">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <img src="/logo-pd.svg" alt="Energía PD" className="w-15 h-15" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">Energía PD</h2>
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Sistema RH</p>
                    </div>
                </div>
            </div>

            {/* Menú */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const isExpanded = expandedMenus.includes(item.label);
                    const isItemActive = isActive(item.path, item.exact);
                    const hasChildActive = hasActiveChild(item);
                    const highlighted = isItemActive || hasChildActive;

                    return (
                        <div key={item.label}>
                            {/* Item principal */}
                            <button
                                onClick={() => handleNavigation(item)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${highlighted
                                    ? 'bg-white text-blue-700 shadow-lg'
                                    : 'text-blue-100 hover:bg-blue-600/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        className={`w-5 h-5 ${highlighted ? 'text-blue-700' : 'text-blue-200'}`}
                                    />
                                    <span className={`font-medium ${highlighted ? 'text-blue-900' : ''}`}>
                                        {item.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.badge && (
                                        <span
                                            className={`px-2 py-1 text-xs font-bold rounded-full ${highlighted
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-blue-600 text-white'
                                                }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                    {hasSubmenu &&
                                        (isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        ))}
                                </div>
                            </button>

                            {/* Submenú */}
                            {hasSubmenu && isExpanded && (
                                <div className="mt-2 ml-4 space-y-1">
                                    {item.submenu!.map((subItem) => {
                                        const SubIcon = subItem.icon;
                                        const isSubActive = isActive(subItem.path, subItem.exact);

                                        return (
                                            <button
                                                key={subItem.label}
                                                onClick={() => subItem.path && navigate(subItem.path)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isSubActive
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'text-blue-200 hover:bg-blue-600/20 hover:text-white'
                                                    }`}
                                            >
                                                <SubIcon
                                                    className={`w-4 h-4 ${isSubActive ? 'text-white' : ''}`}
                                                />
                                                <span
                                                    className={`text-sm font-medium ${isSubActive ? 'text-white' : ''}`}
                                                >
                                                    {subItem.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
import { LayoutDashboard, Users, BarChart3, Target, Settings, FileText, ChevronDown, ChevronRight, ClipboardList, Eye, ActivityIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
    icon: any;
    label: string;
    path?: string;
    badge?: number;
    submenu?: MenuItem[];
}

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['KPIs']);

    const menuItems: MenuItem[] = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            path: '/dashboard'
        },
        {
            icon: Target,
            label: 'KPIs',
            submenu: [
                { icon: BarChart3, label: 'Vista General', path: '/kpis' },
                { icon: ClipboardList, label: 'Evaluar Empleados', path: '/kpis/evaluar' },
                { icon: Eye, label: 'Mis Evaluaciones', path: '/kpis/mis-evaluaciones' },
                { icon: FileText, label: 'Reportes', path: '/kpis/reportes' },
                { icon: ActivityIcon, label: 'Planes de Acción', path: '/kpis/planes-accion' }
            ]
        },
        {
            icon: Users,
            label: 'Empleados',
            path: '/empleados',
            badge: 45
        },
        {
            icon: Settings,
            label: 'Configuración',
            submenu: [
                { icon: Users, label: 'Configuración', path: '/configuracion' },
                { icon: Target, label: 'Gestión de KPIs', path: '/configuracion/kpis' }
            ]
        },
    ];

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    const isActive = (path?: string) => {
        if (!path) return false;

        // Para la ruta exacta de /kpis (Vista General)
        if (path === '/kpis') {
            return location.pathname === '/kpis';
        }

        // Para otras rutas, verificar si comienza con el path
        return location.pathname.startsWith(path);
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
            {/*Encapsularemos el logo en un contenedor blanco redondeado a los bordes*/}

            {/* Contenedor padre para centrar y bajar el elemento (pt-10) */}
            <div className="flex justify-center pt-2 px-4">

                <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 p-5 flex items-center gap-5 max-w-sm w-full border border-blue-50">

                    {/* Logo con un fondo sutil para destacarlo */}
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <img
                            src="/logo-pd.svg"
                            alt="Energía PD"
                            className="w-15 h-15"
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">Energía PD</h2>
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Sistema RH</p>
                    </div>

                </div>
            </div>

            {/* Menú */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const isExpanded = expandedMenus.includes(item.label);
                    const isItemActive = isActive(item.path);

                    return (
                        <div key={item.label}>
                            {/* Item principal */}
                            <button
                                onClick={() => handleNavigation(item)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isItemActive
                                        ? 'bg-white text-blue-700 shadow-lg'
                                        : 'text-blue-100 hover:bg-blue-600/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${isItemActive ? 'text-blue-700' : 'text-blue-200'}`} />
                                    <span className={`font-medium ${isItemActive ? 'text-blue-900' : ''}`}>
                                        {item.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.badge && (
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${isItemActive
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-blue-600 text-white'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                    {hasSubmenu && (
                                        isExpanded
                                            ? <ChevronDown className="w-4 h-4" />
                                            : <ChevronRight className="w-4 h-4" />
                                    )}
                                </div>
                            </button>

                            {/* Submenú */}
                            {hasSubmenu && isExpanded && (
                                <div className="mt-2 ml-4 space-y-1">
                                    {item.submenu!.map((subItem) => {
                                        const SubIcon = subItem.icon;
                                        const isSubActive = isActive(subItem.path);

                                        return (
                                            <button
                                                key={subItem.label}
                                                onClick={() => subItem.path && navigate(subItem.path)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isSubActive
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-blue-200 hover:bg-blue-600/20 hover:text-white'
                                                    }`}
                                            >
                                                <SubIcon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{subItem.label}</span>
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
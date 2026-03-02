import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si se especifican roles permitidos, validar
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role?.toLowerCase();
        const hasPermission = allowedRoles.some(role => role.toLowerCase() === userRole);

        if (!hasPermission) {
            return (
                <div className="flex items-center justify-center h-screen bg-gray-50">
                    <div className="text-center max-w-md">
                        <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
                        <p className="text-gray-600 mb-6">
                            No tienes permisos para acceder a esta página.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}
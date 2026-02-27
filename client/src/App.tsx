import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import KPIsPage from './pages/KPIsPage';
import MisEvaluacionesPage from './pages/MisEvaluacionesPage';
import DetalleEvaluacionPage from './pages/DetalleEvaluacionPage';
import EmpleadosPage from './pages/EmpleadosPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import GestionKPIsPage from './pages/GestionKPIsPage';
import OrdenesTrabajoPage from './pages/OrdenesTrabajoPage';
import DetalleOrdenPage from './pages/DetalleOrdenPage';
import CrearOrdenPage from './pages/CrearOrdenPage';
import SolicitudesPage from './pages/SolicitudesPage';
import CerrarPeriodoPage from './pages/CerrarPeriodoPage';
import AreasPage from './pages/AreasPage';
import PuestosPage from './pages/PuestosPage';

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Private Routes - Todos los roles */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>

            <DashboardPage />

          </PrivateRoute>
        }
      />

      <Route
        path="/kpis"
        element={
          <PrivateRoute>
            <KPIsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/ordenes"
        element={
          <PrivateRoute>
            <Layout>
              <OrdenesTrabajoPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/ordenes/:id"
        element={
          <PrivateRoute>

            <DetalleOrdenPage />

          </PrivateRoute>
        }
      />

      {/* Crear Orden - TODOS pueden */}
      <Route
        path="/ordenes/crear"
        element={
          <PrivateRoute allowedRoles={['admin', 'jefe', 'empleado', 'rrhh']}>

            <CrearOrdenPage />

          </PrivateRoute>
        }
      />

      {/* Solicitudes - Solo admin y jefe pueden aprobar */}
      <Route
        path="/solicitudes"
        element={
          <PrivateRoute>

            <SolicitudesPage />

          </PrivateRoute>
        }
      />

      <Route
        path="/kpis/mis-evaluaciones"
        element={
          <PrivateRoute>

            <MisEvaluacionesPage />

          </PrivateRoute>
        }
      />

      <Route
        path="/kpis/mis-evaluaciones/:evaluacionId"
        element={
          <PrivateRoute>

            <DetalleEvaluacionPage />

          </PrivateRoute>
        }
      />

      {/* Cerrar Periodo - Solo admin y RRHH */}
      <Route
        path="/evaluaciones/cerrar-periodo"
        element={
          <PrivateRoute allowedRoles={['admin', 'rrhh']}>
            <Layout>
              <CerrarPeriodoPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Empleados - Todos pueden ver, solo admin y RRHH gestionan */}
      <Route
        path="/empleados"
        element={
          <PrivateRoute>

            <EmpleadosPage />

          </PrivateRoute>
        }
      />

      <Route
        path="/puestos"
        element={
          <PrivateRoute>
            <PuestosPage />
          </PrivateRoute>
        }
      />

      {/* Configuración - Todos pueden ver */}
      <Route
        path="/configuracion"
        element={
          <PrivateRoute>

            <ConfiguracionPage />

          </PrivateRoute>
        }
      />

      <Route
        path="/configuracion/areas"
        element={
          <PrivateRoute allowedRoles={['admin', 'rrhh']}>
            <AreasPage />
          </PrivateRoute>
        }
      />

      {/* Gestión de KPIs - Solo admin y jefe */}
      <Route
        path="/configuracion/kpis"
        element={
          <PrivateRoute allowedRoles={['admin', 'RRHH']}>
            <Layout>
              <div className="p-8">
                <GestionKPIsPage />
              </div>
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
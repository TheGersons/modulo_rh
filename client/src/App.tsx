import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import KPIsPage from './pages/KPIsPage';
import DetalleEvaluacionPage from './pages/DetalleEvaluacionPage';
import MisEvaluacionesPage from './pages/MisEvaluacionesPage';
import ReportesPage from './pages/ReportesPage';
import EmpleadosPage from './pages/EmpleadosPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import Layout from './components/layout/Layout';
import GestionKPIsPage from './pages/GestionKPIsPage';
import OrdenesTrabajoPage from './pages/OrdenesTrabajoPage';
import DetalleOrdenPage from './pages/DetalleOrdenPage';
import CrearOrdenPage from './pages/CrearOrdenPage';
import SolicitudesPage from './pages/SolicitudesPage';
import CerrarPeriodoPage from './pages/CerrarPeriodoPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      } />
      <Route path="/kpis" element={
        <PrivateRoute>
          <KPIsPage />
        </PrivateRoute>
      } />
      <Route path="/evaluaciones" element={
        <PrivateRoute>
          <MisEvaluacionesPage />
        </PrivateRoute>
      } />
      <Route path="/kpis/mis-evaluaciones/:evaluacionId" element={
        <PrivateRoute>
          <DetalleEvaluacionPage />
        </PrivateRoute>
      } />
      <Route path="/ordenes" element={
        <PrivateRoute>
          <Layout>
            <OrdenesTrabajoPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/configuracion/kpis" element={
        <PrivateRoute>
          <Layout>
            <div className="p-8">
              <GestionKPIsPage />
            </div>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/reportes" element={
        <PrivateRoute>
          <ReportesPage />
        </PrivateRoute>
      } />
      <Route path="/empleados" element={
        <PrivateRoute>
          <EmpleadosPage />
        </PrivateRoute>
      } />
      <Route path="/configuracion" element={
        <PrivateRoute>
          <ConfiguracionPage />
        </PrivateRoute>
      } />
      <Route path="/ordenes/:id" element={
        <PrivateRoute>
          <Layout>
            <DetalleOrdenPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/ordenes/crear" element={
        <PrivateRoute>
          <CrearOrdenPage />
        </PrivateRoute>
      } />
      <Route path="/solicitudes" element={
        <PrivateRoute>
          <SolicitudesPage />
        </PrivateRoute>
      } />
      <Route path="/evaluaciones/cerrar-periodo" element={
        <PrivateRoute>
          <CerrarPeriodoPage />
        </PrivateRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
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
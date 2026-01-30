import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import KPIsPage from './pages/KPIsPage';
import EvaluarEmpleadosPage from './pages/EvaluarEmpleadosPage';
import FormularioEvaluacionPage from './pages/FormularioEvaluacionPage';
import DetalleEvaluacionPage from './pages/DetalleEvaluacionPage';
import MisEvaluacionesPage from './pages/MisEvaluacionesPage';
import ReportesPage from './pages/ReportesPage';
import EmpleadosPage from './pages/EmpleadosPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import EditarPlanAccionPage from './pages/EditarPlanAccionPage';
import DetallePlanAccionPage from './pages/DetallePlanAccionPage';
import PlanesAccionPage from './pages/PlanesAccionPage';
import Layout from './components/layout/Layout';
import GestionKPIsPage from './pages/GestionKPIsPage';

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
      <Route path="/kpis/evaluar" element={
        <PrivateRoute>
          <EvaluarEmpleadosPage />
        </PrivateRoute>
      } />
      <Route path="/kpis/evaluar/:empleadoId" element={
        <PrivateRoute>
          <FormularioEvaluacionPage />
        </PrivateRoute>
      } />
      <Route path="/kpis/mis-evaluaciones" element={
        <PrivateRoute>
          <MisEvaluacionesPage />
        </PrivateRoute>
      } />
      <Route path="/kpis/mis-evaluaciones/:evaluacionId" element={
        <PrivateRoute>
          <DetalleEvaluacionPage />
        </PrivateRoute>
      } />
      <Route path="/kpis/planes-accion" element={
        <PrivateRoute>
          <Layout>
            <div className="p-8">
              <PlanesAccionPage />
            </div>
          </Layout>
        </PrivateRoute>} />
      <Route path="/kpis/planes-accion/:id" element={
        <PrivateRoute>
          <Layout>
            <div className="p-8">
              <DetallePlanAccionPage />
            </div>
          </Layout>
        </PrivateRoute>} />
      <Route path="/kpis/planes-accion/:id/editar" element={
        <PrivateRoute>
          <Layout>
            <div className="p-8">
              <EditarPlanAccionPage />
            </div>
          </Layout>
        </PrivateRoute>} />
      <Route path="/configuracion/kpis" element={
        <PrivateRoute>
          <Layout>
            <div className="p-8">
              <GestionKPIsPage />
            </div>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/kpis/reportes" element={
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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Upload,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  X,
  UserPlus,
  Save,
  AlertCircle,
} from 'lucide-react';
import { empleadosService } from '../services/empleados.service';
import { areasService } from '../services/areas.service';
import { puestosService } from '../services/puestos.service';
import { usePermissions } from '../hooks/usePermissions';
import Layout from '../components/layout/Layout';
import { ROLES, ROLE_LABELS } from '../constants/roles';
import * as XLSX from 'xlsx';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  role: string;
  activo: boolean;
  areaId?: string;
  puestoId?: string;
  area?: {
    id: string;
    nombre: string;
    areaPadreId?: string;
    areaPadre?: {
      id: string;
      nombre: string;
    };
  };
  puesto?: {
    id: string;
    nombre: string;
  };
}

interface Area {
  id: string;
  nombre: string;
  areaPadreId?: string;
}

export default function EmpleadosPage() {
  const navigate = useNavigate();
  const { isAdmin, isRRHH } = usePermissions();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroArea, setFiltroArea] = useState('todas');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const empleadosPorPagina = 10;

  // Estados para modal de empleado
  const [showModalEmpleado, setShowModalEmpleado] = useState(false);
  const [modoEdicionEmpleado, setModoEdicionEmpleado] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState<Empleado | null>(null);

  // Form states
  const [formNombre, setFormNombre] = useState('');
  const [formApellido, setFormApellido] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDni, setFormDni] = useState('');
  const [formPuestoId, setFormPuestoId] = useState('');
  const [formAreaId, setFormAreaId] = useState('');
  const [formSubAreaId, setFormSubAreaId] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('empleado');
  const [puestosDisponibles, setPuestosDisponibles] = useState<any[]>([]);
  const [guardandoEmpleado, setGuardandoEmpleado] = useState(false);
  const [errorEmpleado, setErrorEmpleado] = useState('');
  const [filtroSubArea, setFiltroSubArea] = useState('todas');

  const puedeGestionarEmpleados = isAdmin || isRRHH;
  const puedeVerDni = isAdmin || isRRHH;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [empleadosData, areasData] = await Promise.all([
        empleadosService.getAll(),
        areasService.getAll(),
      ]);
      setEmpleados(empleadosData);
      setAreas(areasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarPuestosPorArea = async (areaId: string) => {
    try {
      const data = await puestosService.getAll(areaId);
      setPuestosDisponibles(data);
    } catch (error) {
      console.error('Error al cargar puestos:', error);
      setPuestosDisponibles([]);
    }
  };

  const abrirModalCrearEmpleado = () => {
    setModoEdicionEmpleado(false);
    setEmpleadoEditar(null);
    setFormNombre('');
    setFormApellido('');
    setFormEmail('');
    setFormDni('');
    setFormPuestoId('');
    setFormAreaId('');
    setFormSubAreaId('');
    setFormPassword('');
    setFormRole('empleado');
    setPuestosDisponibles([]);
    setErrorEmpleado('');
    setShowModalEmpleado(true);
  };

  const abrirModalEditarEmpleado = (empleado: Empleado) => {
    setModoEdicionEmpleado(true);
    setEmpleadoEditar(empleado);
    setFormNombre(empleado.nombre);
    setFormApellido(empleado.apellido);
    setFormEmail(empleado.email);
    setFormDni(empleado.dni || '');
    setFormPuestoId(empleado.puestoId || '');
    setFormPassword('');
    setFormRole(empleado.role);
    setErrorEmpleado('');
    setShowModalEmpleado(true);

    // Determinar si es área principal o sub-área
    if (empleado.area) {
      const areaEmpleado = areas.find((a) => a.id === empleado.area!.id);
      if (areaEmpleado?.areaPadreId) {
        // Es sub-área
        setFormAreaId(areaEmpleado.areaPadreId);
        setFormSubAreaId(areaEmpleado.id);
        cargarPuestosPorArea(areaEmpleado.id);
      } else {
        // Es área principal
        setFormAreaId(empleado.area.id);
        setFormSubAreaId('');
        cargarPuestosPorArea(empleado.area.id);
      }
    }
  };

  const handleGuardarEmpleado = async () => {
    setErrorEmpleado('');

    if (!formNombre.trim() || !formApellido.trim() || !formEmail.trim()) {
      setErrorEmpleado('Nombre, apellido y email son requeridos');
      return;
    }

    if (!modoEdicionEmpleado && !formPassword) {
      setErrorEmpleado('La contraseña es requerida para nuevos empleados');
      return;
    }

    if (!formAreaId) {
      setErrorEmpleado('El área es requerida');
      return;
    }

    if (!formPuestoId) {
      setErrorEmpleado('El puesto es requerido');
      return;
    }

    try {
      setGuardandoEmpleado(true);

      const empleadoData: any = {
        nombre: formNombre.trim(),
        apellido: formApellido.trim(),
        email: formEmail.trim().toLowerCase(),
        dni: formDni.trim() || undefined,
        puestoId: formPuestoId,
        areaId: formSubAreaId || formAreaId,
        role: formRole,
        activo: true,
      };

      if (formPassword) {
        empleadoData.password = formPassword;
      }

      if (modoEdicionEmpleado && empleadoEditar) {
        await empleadosService.update(empleadoEditar.id, empleadoData);
        alert('Empleado actualizado exitosamente');
      } else {
        await empleadosService.create(empleadoData);
        alert('Empleado creado exitosamente');
      }

      setShowModalEmpleado(false);
      await cargarDatos();
    } catch (error: any) {
      console.error('Error al guardar empleado:', error);
      setErrorEmpleado(error.response?.data?.message || 'Error al guardar el empleado');
    } finally {
      setGuardandoEmpleado(false);
    }
  };

  const handleDesactivar = async (id: string, nombre: string, apellido: string, activo: boolean) => {
    const accion = activo ? 'desactivar' : 'reactivar';
    if (!confirm(`¿Estás seguro de ${accion} a ${nombre} ${apellido}?`)) {
      return;
    }

    try {
      await empleadosService.toggle(id);
      await cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert(`Error al ${accion} el empleado`);
    }
  };

  const handleImportarExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Datos importados:', jsonData);
        alert(`Se importaron ${jsonData.length} registros. (Función en desarrollo)`);
      } catch (error) {
        console.error('Error al importar Excel:', error);
        alert('Error al procesar el archivo Excel');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Filtrado
  // Filtrado
  const empleadosFiltrados = empleados.filter((empleado) => {
    // Filtro de búsqueda
    const cumpleBusqueda =
      busqueda === '' ||
      empleado.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (empleado.dni && empleado.dni.includes(busqueda));

    // Filtro de área
    let cumpleArea = true;
    if (filtroArea !== 'todas') {
      if (filtroSubArea !== 'todas') {
        // Si hay sub-área seleccionada, filtrar por sub-área
        cumpleArea = empleado.area?.id === filtroSubArea;
      } else {
        // Si solo hay área, filtrar por área o sus sub-áreas
        const areaEmpleado = empleado.area?.id;
        const areaPadreEmpleado = empleado.area?.areaPadreId;
        cumpleArea = areaEmpleado === filtroArea || areaPadreEmpleado === filtroArea;
      }
    }

    // Filtro de activos/inactivos
    const cumpleActivo = mostrarInactivos || empleado.activo;

    return cumpleBusqueda && cumpleArea && cumpleActivo;
  });

  // Paginación
  const totalPaginas = Math.ceil(empleadosFiltrados.length / empleadosPorPagina);
  const indexInicio = (paginaActual - 1) * empleadosPorPagina;
  const indexFin = indexInicio + empleadosPorPagina;
  const empleadosPaginados = empleadosFiltrados.slice(indexInicio, indexFin);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando empleados...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = {
    total: empleados.length,
    activos: empleados.filter((e) => e.activo).length,
    inactivos: empleados.filter((e) => !e.activo).length,
    conArea: empleados.filter((e) => e.area).length,
  };

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
            <p className="text-gray-600 mt-1">
              {empleadosFiltrados.length} de {empleados.length} empleados
            </p>
          </div>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              Importar Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportarExcel}
                className="hidden"
              />
            </label>

            <button
              onClick={abrirModalCrearEmpleado}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={!puedeGestionarEmpleados}
              title={!puedeGestionarEmpleados ? 'Solo admin/RRHH pueden crear empleados' : ''}
            >
              <UserPlus className="w-5 h-5" />
              Nuevo Empleado
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.activos}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactivos}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin Área Asignada</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.activos - stats.conArea}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />

            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                placeholder="Buscar por nombre, email o DNI..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro Área Principal */}
            <select
              value={filtroArea}
              onChange={(e) => {
                setFiltroArea(e.target.value);
                setFiltroSubArea('todas'); // Reset sub-área al cambiar área
                setPaginaActual(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
            >
              <option value="todas">Todas las áreas</option>
              {areas
                .filter((a) => !a.areaPadreId)
                .map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
            </select>

            {/* Filtro Sub-área (solo si hay área seleccionada) */}
            {filtroArea !== 'todas' && (
              <select
                value={filtroSubArea}
                onChange={(e) => { setFiltroSubArea(e.target.value); setPaginaActual(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
              >
                <option value="todas">Todas las sub-áreas</option>
                {areas
                  .filter((a) => a.areaPadreId === filtroArea)
                  .map((subArea) => (
                    <option key={subArea.id} value={subArea.id}>
                      {subArea.nombre}
                    </option>
                  ))}
              </select>
            )}

            {/* Toggle Inactivos */}
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={mostrarInactivos}
                onChange={(e) => { setMostrarInactivos(e.target.checked); setPaginaActual(1); }}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700 whitespace-nowrap">Inactivos</span>
            </label>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Puesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Área
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Estado
                </th>
                {puedeGestionarEmpleados && (
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {empleadosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={puedeGestionarEmpleados ? 6 : 5} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No se encontraron empleados</p>
                  </td>
                </tr>
              ) : (
                empleadosPaginados.map((empleado) => (
                  <tr
                    key={empleado.id}
                    className={`transition-colors ${empleado.activo ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${empleado.activo ? 'bg-blue-100' : 'bg-gray-200'
                            } rounded-full flex items-center justify-center`}
                        >
                          <span
                            className={`${empleado.activo ? 'text-blue-600' : 'text-gray-500'
                              } font-semibold`}
                          >
                            {empleado.nombre[0]}
                            {empleado.apellido[0]}
                          </span>
                        </div>
                        <div>
                          <p
                            className={`font-medium ${empleado.activo ? 'text-gray-900' : 'text-gray-500'
                              }`}
                          >
                            {empleado.nombre} {empleado.apellido}
                          </p>
                          {empleado.dni && puedeVerDni && <p className="text-sm text-gray-500">DNI: {empleado.dni}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{empleado.email}</td>

                    {/* Columna Puesto */}
                    <td className="px-6 py-4">
                      {empleado.puesto ? (
                        <span className="text-sm text-gray-900">{empleado.puesto.nombre}</span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Sin puesto</span>
                      )}
                    </td>

                    {/* Columna Área */}
                    <td className="px-6 py-4">
                      {empleado.area ? (
                        <div>
                          {empleado.area.areaPadre && (
                            <p className="text-xs text-gray-500 mb-1">
                              {empleado.area.areaPadre.nombre}
                            </p>
                          )}
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {empleado.area.nombre}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Sin área</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${empleado.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {empleado.activo ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </span>
                    </td>

                    {puedeGestionarEmpleados && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirModalEditarEmpleado(empleado)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDesactivar(
                                empleado.id,
                                empleado.nombre,
                                empleado.apellido,
                                empleado.activo
                              )
                            }
                            className={`p-2 rounded-lg transition-colors ${empleado.activo
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                              }`}
                            title={empleado.activo ? 'Desactivar' : 'Reactivar'}
                          >
                            {empleado.activo ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
              <button
                key={numero}
                onClick={() => setPaginaActual(numero)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${paginaActual === numero
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {numero}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Modal Crear/Editar Empleado */}
        {showModalEmpleado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {modoEdicionEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h3>
                <button
                  onClick={() => setShowModalEmpleado(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {errorEmpleado && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errorEmpleado}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formApellido}
                      onChange={(e) => setFormApellido(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* DNI */}
                {puedeVerDni && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNI / Identidad
                    </label>
                    <input
                      type="text"
                      value={formDni}
                      onChange={(e) => setFormDni(e.target.value)}
                      placeholder="0801199012345"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Área Principal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Área Principal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formAreaId}
                    onChange={(e) => {
                      setFormAreaId(e.target.value);
                      setFormSubAreaId('');
                      setFormPuestoId('');
                      setPuestosDisponibles([]);
                      if (e.target.value) {
                        cargarPuestosPorArea(e.target.value); // ← siempre cargar, sin condición
                      } else {
                        setPuestosDisponibles([]);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un área</option>
                    {areas
                      .filter((a) => !a.areaPadreId)
                      .map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.nombre}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Sub-área (solo si el área tiene sub-áreas) */}
                {formAreaId && areas.filter((a) => a.areaPadreId === formAreaId).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-área
                    </label>
                    <select
                      value={formSubAreaId}
                      onChange={(e) => {
                        setFormSubAreaId(e.target.value);
                        setFormPuestoId('');
                        if (e.target.value) {
                          cargarPuestosPorArea(e.target.value);
                        } else {
                          cargarPuestosPorArea(formAreaId);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Usar área principal</option>
                      {areas
                        .filter((a) => a.areaPadreId === formAreaId)
                        .map((subArea) => (
                          <option key={subArea.id} value={subArea.id}>
                            {subArea.nombre}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Opcional: Selecciona una sub-área específica
                    </p>
                  </div>
                )}

                {/* Puesto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puesto <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formPuestoId}
                    onChange={(e) => setFormPuestoId(e.target.value)}
                    disabled={!formAreaId}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {!formAreaId ? 'Primero selecciona un área' : 'Selecciona un puesto'}
                    </option>
                    {puestosDisponibles.map((puesto) => (
                      <option key={puesto.id} value={puesto.id}>
                        {puesto.nombre}
                      </option>
                    ))}
                  </select>
                  {puestosDisponibles.length === 0 && formAreaId && (
                    <p className="text-xs text-amber-600 mt-1">
                      No hay puestos para esta área. Crea puestos primero.
                    </p>
                  )}
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña {!modoEdicionEmpleado && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={
                      modoEdicionEmpleado ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {modoEdicionEmpleado && (
                    <p className="text-xs text-gray-500 mt-1">
                      Dejar vacío si no deseas cambiar la contraseña
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModalEmpleado(false)}
                  disabled={guardandoEmpleado}
                  className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEmpleado}
                  disabled={guardandoEmpleado}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {guardandoEmpleado ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {modoEdicionEmpleado ? 'Actualizar' : 'Crear'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
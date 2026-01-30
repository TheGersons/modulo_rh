import { useState, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { empleadosService } from '../services/empleados.service';
import * as XLSX from 'xlsx';
import {
  Search,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Mail,
  Briefcase,
  Building,
  Filter,
  Download,
  Upload,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Empleado {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  puesto: string;
  area: string;
  role: string;
  activo: boolean;
  createdAt: string;
}
interface EmployeeToolbarProps {
  onRefresh?: () => void;
}
// Definimos la interfaz para las props (opcional pero recomendado en TS)
interface EmployeeToolbarProps {
  onRefresh?: () => void;
}

// ESTE COMPONENTE DEBE IR FUERA DE LA FUNCIÓN EmpleadosPage
export const EmployeeToolbar = ({ onRefresh }: EmployeeToolbarProps) => { 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Función que simula el clic en el input oculto
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Función que procesa el archivo Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });

        // Leer la primera hoja
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        const data = XLSX.utils.sheet_to_json(sheet);

        // MAPEO DE DATOS
        const empleadosFormateados = data.map((row: any) => ({
          dni: String(row['DNI'] || row['dni'] || ''), 
          nombre: row['Nombre'] || row['nombre'],
          apellido: row['Apellido'] || row['apellido'],
          email: row['Email'] || row['Correo'] || row['email'],
          role: (row['Rol'] || row['role'] || 'empleado').toLowerCase(),
          puesto: row['Puesto'] || row['puesto'],
          // Si usas la lógica de AreasService, agrégala aquí como vimos antes
          areaId: row['AreaId'] || row['areaId'] || null, 
          password: String(row['Password'] || row['DNI'] || '123456'),
          activo: true
        }));

        if (empleadosFormateados.length === 0) {
          alert("El archivo parece estar vacío o no tiene el formato correcto.");
          return;
        }

        // Enviar al Backend
        const response = await empleadosService.createBulk(empleadosFormateados);

        alert(`Proceso finalizado.\nExitosos: ${response.success}\nErrores: ${response.errors.length}`);

        if (onRefresh) onRefresh(); 

      } catch (error) {
        console.error("Error importando:", error);
        alert("Hubo un error al procesar el archivo.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  // EL RETURN QUE FALTABA
  return (
    <div className="flex items-center gap-3">
      {/* Input oculto */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".xlsx, .xls"
      />

      <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
        <Download className="w-5 h-5" />
        Exportar
      </button>
      
      <button 
        onClick={handleImportClick}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <Upload className="w-5 h-5" />
        {loading ? 'Procesando...' : 'Importar'}
      </button>
      
      <button
        // onClick={handleCrear} // Pásalo como prop si lo necesitas
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
      >
        <UserPlus className="w-5 h-5" />
        Nuevo Empleado
      </button>
    </div>
  );
};

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([
    {
      id: '1',
      dni: '0801-1990-12345',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@energiapd.com',
      puesto: 'Gerente de Operaciones',
      area: 'Gerencia',
      role: 'empleado',
      activo: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      dni: '0801-1988-54321',
      nombre: 'Sandra',
      apellido: 'Gómez',
      email: 'sandra.gomez@energiapd.com',
      puesto: 'Coordinadora',
      area: 'Gerencia',
      role: 'empleado',
      activo: true,
      createdAt: '2024-02-20',
    },
    {
      id: '3',
      dni: '0801-1992-67890',
      nombre: 'Carlos',
      apellido: 'Méndez',
      email: 'carlos.mendez@energiapd.com',
      puesto: 'Jefe de Gerencia',
      area: 'Gerencia',
      role: 'jefe',
      activo: true,
      createdAt: '2023-11-10',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroArea, setFiltroArea] = useState('todas');
  const [filtroRole, setFiltroRole] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'crear' | 'editar'>('crear');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);

  const empleadosFiltrados = empleados.filter(emp => {
    const matchSearch = `${emp.dni} ${emp.nombre} ${emp.apellido} ${emp.email} ${emp.puesto}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchArea = filtroArea === 'todas' || emp.area === filtroArea;
    const matchRole = filtroRole === 'todos' || emp.role === filtroRole;
    const matchEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activos' && emp.activo) ||
      (filtroEstado === 'inactivos' && !emp.activo);

    return matchSearch && matchArea && matchRole && matchEstado;
  });

  const areas = ['todas', 'Gerencia', 'Administrativa', 'Técnica', 'Proyectos', 'Comercial', 'Compras'];
  const roles = ['todos', 'admin', 'jefe', 'empleado', 'rrhh'];

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-700 border-purple-300',
      jefe: 'bg-blue-100 text-blue-700 border-blue-300',
      empleado: 'bg-gray-100 text-gray-700 border-gray-300',
      rrhh: 'bg-green-100 text-green-700 border-green-300',
    };
    return badges[role as keyof typeof badges] || badges.empleado;
  };

  const handleCrear = () => {
    setModalMode('crear');
    setEmpleadoSeleccionado(null);
    setShowModal(true);
  };

  const handleEditar = (empleado: Empleado) => {
    setModalMode('editar');
    setEmpleadoSeleccionado(empleado);
    setShowModal(true);
  };

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      console.log('Eliminar empleado:', id);
      // TODO: Implementar eliminación
    }
  };

  const handleToggleEstado = (id: string) => {
    setEmpleados(prev => prev.map(emp =>
      emp.id === id ? { ...emp, activo: !emp.activo } : emp
    ));
  };



  return (
    <Layout>
      <div className="p-8 space-y-8">

        {/* Header y Botones de Acción */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los empleados de la organización
            </p>
          </div>

          <EmployeeToolbar onRefresh={() => {
            // Aquí puedes recargar la lista de empleados desde el backend si lo deseas
            console.log('Refrescar lista de empleados');
          }} />
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-green-600">
                  {empleados.filter(e => e.activo).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Jefes</p>
                <p className="text-3xl font-bold text-purple-600">
                  {empleados.filter(e => e.role === 'jefe').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Building className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Áreas</p>
                <p className="text-3xl font-bold text-orange-600">6</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre, email o puesto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          {/* Filtros adicionales */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Filtros:</span>
            </div>

            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm font-semibold"
            >
              {areas.map(area => (
                <option key={area} value={area}>
                  {area === 'todas' ? 'Todas las áreas' : area}
                </option>
              ))}
            </select>

            <select
              value={filtroRole}
              onChange={(e) => setFiltroRole(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm font-semibold"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'todos' ? 'Todos los roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm font-semibold"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Tabla de empleados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Puesto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {empleado.dni}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                          {empleado.nombre[0]}{empleado.apellido[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {empleado.nombre} {empleado.apellido}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {empleado.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{empleado.puesto}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        {empleado.area}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border-2 ${getRoleBadge(empleado.role)}`}>
                        {empleado.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleEstado(empleado.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 transition-colors ${empleado.activo
                          ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                          }`}
                      >
                        {empleado.activo ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {empleado.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditar(empleado)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => console.log('Ver', empleado.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(empleado.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {empleadosFiltrados.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron empleados</p>
            </div>
          )}
        </div>

        {/* Paginación (placeholder) */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {empleadosFiltrados.length} de {empleados.length} empleados
          </p>
        </div>
      </div>

      {/* Modal (placeholder - se implementaría formulario completo) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {modalMode === 'crear' ? 'Nuevo Empleado' : 'Editar Empleado'}
            </h2>

            <p className="text-gray-600 mb-6">
              Formulario de {modalMode === 'crear' ? 'creación' : 'edición'} (implementar con campos completos)
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  console.log('Guardar empleado');
                  setShowModal(false);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

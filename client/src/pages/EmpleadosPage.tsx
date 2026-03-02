import { useState, useEffect } from 'react';
import { Users, Upload, Search, Filter, CheckCircle, XCircle, UserPlus, Edit } from 'lucide-react';
import { empleadosService } from '../services/empleados.service';
import { areasService } from '../services/areas.service';
import Layout from '../components/layout/Layout';
import * as XLSX from 'xlsx';
import { usePermissions } from '../hooks/usePermissions';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  puesto?: string;
  areaId?: string;
  role: string;
  activo: boolean;
  area?: { nombre: string, id: string };
}

interface Area {
  id: string;
  nombre: string;
}

interface EmpleadoImport {
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  puesto?: string;
  area?: string;
  password?: string;
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroArea, setFiltroArea] = useState<string>('todas');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [empleadosPorPagina, setEmpleadosPorPagina] = useState(10);
  const { can } = usePermissions();
  const puedeGestionarEmpleados = can('gestionar_empleados');

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [datosImport, setDatosImport] = useState<EmpleadoImport[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState<Empleado | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDni, setEditDni] = useState('');
  const [editPuesto, setEditPuesto] = useState('');
  const [editAreaId, setEditAreaId] = useState('');
  const [editActivo, setEditActivo] = useState(true);
  const [editando, setEditando] = useState(false);
  const [errorEdit, setErrorEdit] = useState('');

  const abrirModalEditar = (empleado: Empleado) => {
    setEmpleadoEditar(empleado);
    setEditNombre(empleado.nombre);
    setEditApellido(empleado.apellido);
    setEditEmail(empleado.email);
    setEditDni(empleado.dni || '');
    setEditPuesto(empleado.puesto || '');
    setEditAreaId(empleado.area?.id || '');
    setEditActivo(empleado.activo);
    setErrorEdit('');
    setShowEditModal(true);
  };

  const handleGuardarEdicion = async () => {
    setErrorEdit('');

    if (!editNombre.trim() || !editApellido.trim() || !editEmail.trim()) {
      setErrorEdit('Nombre, apellido y email son requeridos');
      return;
    }

    try {
      setEditando(true);

      await empleadosService.update(empleadoEditar!.id, {
        nombre: editNombre.trim(),
        apellido: editApellido.trim(),
        email: editEmail.trim().toLowerCase(),
        dni: editDni.trim() || undefined,
        puesto: editPuesto.trim() || undefined,
        areaId: editAreaId || undefined,
        activo: editActivo,
      });

      alert('Empleado actualizado exitosamente');
      setShowEditModal(false);
      setEmpleadoEditar(null);
      await cargarDatos();
    } catch (error: any) {
      console.error('Error al actualizar empleado:', error);
      setErrorEdit(error.response?.data?.message || 'Error al actualizar el empleado');
    } finally {
      setEditando(false);
    }
  };

  // AGREGAR: Función para desactivar empleado
  const handleDesactivar = async (id: string, nombre: string, apellido: string, activo: boolean) => {
    const accion = activo ? 'desactivar' : 'reactivar';
    const mensaje = activo
      ? `¿Estás seguro de desactivar a ${nombre} ${apellido}?\n\nEl empleado será marcado como inactivo y no aparecerá en las listas principales.`
      : `¿Reactivar a ${nombre} ${apellido}?`;

    if (!confirm(mensaje)) {
      return;
    }

    try {
      await empleadosService.update(id, { activo: !activo });
      alert(`Empleado ${activo ? 'desactivado' : 'reactivado'} exitosamente`);
      await cargarDatos();
    } catch (error: any) {
      console.error(`Error al ${accion} empleado:`, error);
      alert(error.response?.data?.message || `Error al ${accion} el empleado`);
    }
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Mapear columnas del Excel
        const empleadosMapeados: EmpleadoImport[] = json.map((row) => ({
          nombre: row['Nombre'] || row['nombre'] || '',
          apellido: row['Apellido'] || row['apellido'] || '',
          email: row['Email'] || row['email'] || row['Correo'] || '',
          dni: row['DNI'] || row['dni'] || row['Identidad'] || '',
          puesto: row['Puesto'] || row['puesto'] || row['Cargo'] || '',
          area: row['Area'] || row['area'] || row['Área'] || '',
          password: row['Password'] || row['password'] || 'Energia2026',
        }));

        setDatosImport(empleadosMapeados);
        setShowImportModal(true);
      } catch (error) {
        console.error('Error al procesar archivo:', error);
        alert('Error al leer el archivo. Verifica que sea un Excel válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const procesarImportacion = async () => {
    setImporting(true);
    setImportResult({ success: 0, errors: [] });

    let successCount = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < datosImport.length; i++) {
      const empleado = datosImport[i];

      try {
        // Validaciones
        if (!empleado.nombre || !empleado.apellido || !empleado.email) {
          errors.push({ row: i + 2, error: 'Faltan datos obligatorios (nombre, apellido, email)' });
          continue;
        }

        // Buscar área por nombre
        let areaId: string | undefined;
        if (empleado.area) {
          const areaNormalizada = empleado.area.toLowerCase().trim();
          const areaEncontrada = areas.find((a) =>
            a.nombre.toLowerCase().includes(areaNormalizada) || areaNormalizada.includes(a.nombre.toLowerCase())
          );
          areaId = areaEncontrada?.id;

          if (!areaEncontrada) {
            console.warn(`⚠️ Área "${empleado.area}" no encontrada para ${empleado.nombre} ${empleado.apellido}`);
          }
        }

        // Crear empleado
        await empleadosService.create({
          nombre: empleado.nombre.trim(),
          apellido: empleado.apellido.trim(),
          email: empleado.email.trim().toLowerCase(),
          password: empleado.password || 'Energia2026',
          dni: empleado.dni?.trim(),
          puesto: empleado.puesto?.trim(),
          areaId,
          role: 'empleado',
          activo: true,
        });

        successCount++;
        console.log(`✅ ${i + 1}/${datosImport.length}: ${empleado.nombre} ${empleado.apellido}`);
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
        errors.push({ row: i + 2, error: errorMsg });
        console.error(`❌ Error fila ${i + 2}:`, errorMsg);
      }
    }

    setImportResult({ success: successCount, errors });
    setImporting(false);

    if (errors.length === 0) {
      setTimeout(() => {
        setShowImportModal(false);
        setDatosImport([]);
        cargarDatos();
      }, 2000);
    }
  };

  const descargarPlantilla = () => {
    const plantilla = [
      {
        Nombre: 'Juan',
        Apellido: 'Pérez',
        Email: 'juan.perez@empresa.com',
        DNI: '0801199012345',
        Puesto: 'Desarrollador',
        Area: 'Área técnica',
        Password: 'Energia2026',
      },
      {
        Nombre: 'María',
        Apellido: 'López',
        Email: 'maria.lopez@empresa.com',
        DNI: '0801199054321',
        Puesto: 'Contadora',
        Area: 'Área administrativa',
        Password: 'Energia2026',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(plantilla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
    XLSX.writeFile(wb, 'plantilla_empleados.xlsx');
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    const matchSearch =
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchArea = filtroArea === 'todas' || emp.areaId === filtroArea;

    const matchActivo = mostrarInactivos ? true : emp.activo;

    return matchSearch && matchArea && matchActivo;
  });

  const totalPaginas = Math.ceil(empleadosFiltrados.length / empleadosPorPagina);
  const indexInicio = (paginaActual - 1) * empleadosPorPagina;
  const indexFin = indexInicio + empleadosPorPagina;
  const empleadosPaginados = empleadosFiltrados.slice(indexInicio, indexFin);

  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filtroArea]);

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

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
            <p className="text-gray-600 mt-1">
              {empleados.filter(e => e.activo).length} empleados activos
            </p>
          </div>

          <div className="flex gap-3">
            {/* Botón Nuevo Empleado - todos pueden ver */}
            <button
              onClick={() => alert('Crear empleado (por implementar)')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!puedeGestionarEmpleados}
              title={!puedeGestionarEmpleados ? 'Solo admin/RRHH pueden crear empleados' : ''}
            >
              <UserPlus className="w-5 h-5" />
              Nuevo Empleado
            </button>

            {puedeGestionarEmpleados && (
              <>
                <button
                  onClick={descargarPlantilla}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Descargar Plantilla
                </button>

                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Importar Excel
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, apellido o email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro de Área */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas las áreas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* AGREGAR: Toggle mostrar inactivos */}
            {puedeGestionarEmpleados && (
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={mostrarInactivos}
                  onChange={(e) => setMostrarInactivos(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar inactivos</span>
              </label>
            )}
          </div>
        </div>

        {/* Info de resultados */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            Mostrando {empleadosFiltrados.length > 0 ? indexInicio + 1 : 0} -{' '}
            {Math.min(indexFin, empleadosFiltrados.length)} de {empleadosFiltrados.length} empleados
            {mostrarInactivos && (
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                Incluyendo inactivos
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <label className="font-medium">Mostrar:</label>
            <select
              value={empleadosPorPagina}
              onChange={(e) => {
                setEmpleadosPorPagina(Number(e.target.value));
                setPaginaActual(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Puesto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Área</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  {puedeGestionarEmpleados && (
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
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
                          <div className={`w-10 h-10 ${empleado.activo ? 'bg-blue-100' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                            <span className={`${empleado.activo ? 'text-blue-600' : 'text-gray-500'} font-semibold`}>
                              {empleado.nombre[0]}
                              {empleado.apellido[0]}
                            </span>
                          </div>
                          <div>
                            <p className={`font-medium ${empleado.activo ? 'text-gray-900' : 'text-gray-500'}`}>
                              {empleado.nombre} {empleado.apellido}
                            </p>
                            {empleado.dni && <p className="text-sm text-gray-500">DNI: {empleado.dni}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{empleado.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{empleado.puesto || '-'}</td>
                      <td className="px-6 py-4">
                        {empleado.area ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {empleado.area.nombre}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Sin área</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {empleado.activo ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      {puedeGestionarEmpleados && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirModalEditar(empleado)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDesactivar(empleado.id, empleado.nombre, empleado.apellido, empleado.activo)}
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
        </div>

        {/* Controles de Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                // Mostrar solo algunas páginas
                if (
                  numero === 1 ||
                  numero === totalPaginas ||
                  (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                ) {
                  return (
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
                  );
                } else if (numero === paginaActual - 2 || numero === paginaActual + 2) {
                  return (
                    <span key={numero} className="text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Modal de Importación */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Importar Empleados ({datosImport.length})
              </h3>

              {!importResult ? (
                <>
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Áreas disponibles:</strong> {areas.map((a) => a.nombre).join(', ')}
                    </p>
                  </div>

                  <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">#</th>
                          <th className="px-4 py-2 text-left font-semibold">Nombre</th>
                          <th className="px-4 py-2 text-left font-semibold">Email</th>
                          <th className="px-4 py-2 text-left font-semibold">Puesto</th>
                          <th className="px-4 py-2 text-left font-semibold">Área</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {datosImport.map((emp, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2">
                              {emp.nombre} {emp.apellido}
                            </td>
                            <td className="px-4 py-2">{emp.email}</td>
                            <td className="px-4 py-2">{emp.puesto || '-'}</td>
                            <td className="px-4 py-2">{emp.area || '-'}</td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setDatosImport([]);
                      }}
                      disabled={importing}
                      className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={procesarImportacion}
                      disabled={importing}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {importing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Importar {datosImport.length} Empleados
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  {importResult.errors.length === 0 ? (
                    <>
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-green-900 mb-2">¡Importación Exitosa!</h4>
                      <p className="text-green-700">
                        {importResult.success} empleados importados correctamente
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Importación Completada con Errores</h4>
                      <p className="text-gray-600 mb-4">
                        ✅ {importResult.success} exitosos | ❌ {importResult.errors.length} errores
                      </p>

                      <div className="max-h-64 overflow-y-auto bg-red-50 rounded-lg p-4 text-left">
                        {importResult.errors.map((err, idx) => (
                          <div key={idx} className="text-sm text-red-700 mb-2">
                            <strong>Fila {err.row}:</strong> {err.error}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setShowImportModal(false);
                          setDatosImport([]);
                          setImportResult(null);
                          cargarDatos();
                        }}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Cerrar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {showEditModal && empleadoEditar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Editar Empleado
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {errorEdit && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errorEdit}</p>
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
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editApellido}
                      onChange={(e) => setEditApellido(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* DNI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI / Identidad
                  </label>
                  <input
                    type="text"
                    value={editDni}
                    onChange={(e) => setEditDni(e.target.value)}
                    placeholder="0801199012345"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Puesto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puesto
                  </label>
                  <input
                    type="text"
                    value={editPuesto}
                    onChange={(e) => setEditPuesto(e.target.value)}
                    placeholder="Ej: Desarrollador, Gerente"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Área */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Área
                  </label>
                  <select
                    value={editAreaId}
                    onChange={(e) => setEditAreaId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sin área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editActivo}
                      onChange={(e) => setEditActivo(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Empleado activo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={editando}
                  className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEdicion}
                  disabled={editando}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {editando ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Guardar Cambios
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
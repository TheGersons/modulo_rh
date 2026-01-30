import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Upload, FileText, X, AlertTriangle } from 'lucide-react';
import { planesAccionService } from '../services/planes-accion.service';

interface PlanAccion {
  id: string;
  status: string;
  descripcionProblema: string | null;
  accionesCorrectivas: string | null;
  recursosNecesarios: string | null;
  metasEspecificas: string | null;
  kpi: {
    indicador: string;
  };
}

export default function EditarPlanAccionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<PlanAccion | null>(null);

  // Formulario
  const [descripcionProblema, setDescripcionProblema] = useState('');
  const [accionesCorrectivas, setAccionesCorrectivas] = useState('');
  const [recursosNecesarios, setRecursosNecesarios] = useState('');
  const [metasEspecificas, setMetasEspecificas] = useState('');
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<Array<{ nombre: string; url: string }>>([]);

  useEffect(() => {
    cargarPlan();
  }, [id]);

  const cargarPlan = async () => {
    try {
      setLoading(true);
      const data = await planesAccionService.getById(id!);
      setPlan(data);

      // Cargar datos existentes
      setDescripcionProblema(data.descripcionProblema || '');
      setAccionesCorrectivas(data.accionesCorrectivas || '');
      setRecursosNecesarios(data.recursosNecesarios || '');
      setMetasEspecificas(data.metasEspecificas || '');
    } catch (error) {
      console.error('Error al cargar plan:', error);
      alert('Error al cargar el plan');
      navigate('/kpis/planes-accion');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!plan) return;

    try {
      setSaving(true);

      const archivosUrls = archivosAdjuntos.map(a => a.url);

      await planesAccionService.update(plan.id, {
        descripcionProblema,
        accionesCorrectivas,
        recursosNecesarios,
        metasEspecificas,
        archivosAdjuntos: archivosUrls.length > 0 ? JSON.stringify(archivosUrls) : undefined,
      });

      alert('Plan guardado exitosamente');
      navigate(`/kpis/planes-accion/${plan.id}`);
    } catch (error) {
      console.error('Error al guardar plan:', error);
      alert('Error al guardar el plan');
    } finally {
      setSaving(false);
    }
  };

  const handleEnviar = async () => {
    if (!plan) return;

    // Validaciones
    if (!descripcionProblema.trim()) {
      alert('Debes completar la descripción del problema');
      return;
    }

    if (!accionesCorrectivas.trim()) {
      alert('Debes completar las acciones correctivas');
      return;
    }

    if (!metasEspecificas.trim()) {
      alert('Debes completar las metas específicas');
      return;
    }

    if (window.confirm('¿Estás seguro de enviar este plan para revisión? No podrás editarlo después.')) {
      try {
        setSaving(true);

        // Primero guardar
        const archivosUrls = archivosAdjuntos.map(a => a.url);
        await planesAccionService.update(plan.id, {
          descripcionProblema,
          accionesCorrectivas,
          recursosNecesarios,
          metasEspecificas,
          archivosAdjuntos: archivosUrls.length > 0 ? JSON.stringify(archivosUrls) : undefined,
        });

        // Luego enviar
        await planesAccionService.enviar(plan.id);

        alert('Plan enviado exitosamente para revisión');
        navigate(`/kpis/planes-accion/${plan.id}`);
      } catch (error: any) {
        console.error('Error al enviar plan:', error);
        alert(error.response?.data?.message || 'Error al enviar el plan');
      } finally {
        setSaving(false);
      }
    }
  };

  const isFormularioCompleto = () => {
    return (
      descripcionProblema.trim().length > 0 &&
      accionesCorrectivas.trim().length > 0 &&
      metasEspecificas.trim().length > 0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan no encontrado</h3>
        <button onClick={() => navigate('/kpis/planes-accion')} className="text-blue-600 hover:underline">
          Volver a la lista
        </button>
      </div>
    );
  }

  if (plan.status !== 'borrador') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No se puede editar</h3>
        <p className="text-gray-600 mb-4">Solo se pueden editar planes en estado borrador</p>
        <button
          onClick={() => navigate(`/kpis/planes-accion/${plan.id}`)}
          className="text-blue-600 hover:underline"
        >
          Ver detalles del plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/kpis/planes-accion/${plan.id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Plan de Acción</h1>
            <p className="text-gray-600 mt-1">{plan.kpi.indicador}</p>
          </div>
        </div>
      </div>

      {/* Alerta de campos requeridos */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Campos Obligatorios</p>
            <p className="text-sm text-blue-700">
              Debes completar la descripción del problema, acciones correctivas y metas específicas antes de enviar
              el plan.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Descripción del Problema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Descripción del Problema <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Explica detalladamente qué salió mal y por qué el KPI está en estado crítico.
            </p>
            <textarea
              value={descripcionProblema}
              onChange={(e) => setDescripcionProblema(e.target.value)}
              placeholder="Ej: El indicador de tiempo de respuesta al cliente no cumplió la meta debido a..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{descripcionProblema.length} caracteres</p>
          </div>

          {/* Acciones Correctivas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Acciones Correctivas <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Describe las acciones específicas que implementarás para resolver el problema.
            </p>
            <textarea
              value={accionesCorrectivas}
              onChange={(e) => setAccionesCorrectivas(e.target.value)}
              placeholder="Ej: 1) Implementar un sistema de respuesta automática. 2) Capacitar al equipo en..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{accionesCorrectivas.length} caracteres</p>
          </div>

          {/* Recursos Necesarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">3. Recursos Necesarios (Opcional)</label>
            <p className="text-sm text-gray-600 mb-3">
              Indica si necesitas recursos adicionales (herramientas, capacitación, apoyo, etc.)
            </p>
            <textarea
              value={recursosNecesarios}
              onChange={(e) => setRecursosNecesarios(e.target.value)}
              placeholder="Ej: Necesito acceso a software de gestión de tickets, capacitación en..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{recursosNecesarios.length} caracteres</p>
          </div>

          {/* Metas Específicas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              4. Metas Específicas <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Define objetivos medibles y alcanzables que demuestren la mejora del KPI.
            </p>
            <textarea
              value={metasEspecificas}
              onChange={(e) => setMetasEspecificas(e.target.value)}
              placeholder="Ej: Reducir el tiempo de respuesta de 45min a 30min en las próximas 2 semanas..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{metasEspecificas.length} caracteres</p>
          </div>

          {/* Archivos Adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">5. Archivos Adjuntos (Opcional)</label>
            <p className="text-sm text-gray-600 mb-3">
              Puedes adjuntar documentos de apoyo (evidencias, cronogramas, etc.)
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="file-upload-plan"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const nuevosArchivos = files.map(f => ({
                    nombre: f.name,
                    url: `https://storage.cloud.com/planes/${f.name}`,
                  }));
                  setArchivosAdjuntos([...archivosAdjuntos, ...nuevosArchivos]);
                }}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
              />
              <label htmlFor="file-upload-plan" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="text-blue-600 font-medium">Haz clic para subir</span> o arrastra archivos aquí
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG, XLSX (máx. 10MB)</p>
              </label>
            </div>

            {archivosAdjuntos.length > 0 && (
              <div className="mt-4 space-y-2">
                {archivosAdjuntos.map((archivo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{archivo.nombre}</span>
                    </div>
                    <button
                      onClick={() => setArchivosAdjuntos(archivosAdjuntos.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isFormularioCompleto() ? (
              <span className="text-green-600 font-medium">✓ Formulario completo</span>
            ) : (
              <span className="text-gray-500">Completa los campos obligatorios</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/kpis/planes-accion/${plan.id}`)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              onClick={handleGuardar}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Borrador'}
            </button>

            <button
              onClick={handleEnviar}
              disabled={!isFormularioCompleto() || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isFormularioCompleto() && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              {saving ? 'Enviando...' : 'Guardar y Enviar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { useAppVersion } from '../hooks/useAppVersion';

export default function NuevaVersionBanner() {
  const { hayNueva } = useAppVersion();
  const [oculto, setOculto] = useState(false);

  if (!hayNueva || oculto) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white rounded-xl shadow-2xl p-4 max-w-sm flex items-start gap-3">
      <RefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Nueva versión disponible</p>
        <p className="text-xs text-blue-100 mt-0.5">
          Para evitar errores al subir evidencias, recarga la página.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 text-xs font-medium bg-white text-blue-700 rounded-lg hover:bg-blue-50"
          >
            Recargar ahora
          </button>
          <button
            onClick={() => setOculto(true)}
            className="px-3 py-1.5 text-xs font-medium border border-blue-400 rounded-lg hover:bg-blue-700"
          >
            Más tarde
          </button>
        </div>
      </div>
      <button
        onClick={() => setOculto(true)}
        className="p-1 text-blue-200 hover:text-white"
        title="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { X, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import {
    ordenesTrabajoService,
    type OrdenTrabajo,
} from '../services/ordenes-trabajo.service';

interface Props {
    orden: OrdenTrabajo;
    onClose: () => void;
    onSuccess: (ordenActualizada: OrdenTrabajo) => void;
}

function toDatetimeLocal(iso: string): string {
    const d = new Date(iso);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60_000);
    return local.toISOString().slice(0, 16);
}

function formatFechaLarga(iso: string): string {
    return new Date(iso).toLocaleString('es-HN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ModalEditarFechaLimite({ orden, onClose, onSuccess }: Props) {
    const [nuevaFecha, setNuevaFecha] = useState<string>(toDatetimeLocal(orden.fechaLimite));
    const [motivo, setMotivo] = useState<string>('');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const minDatetime = (() => {
        const ahora = new Date(Date.now() + 60_000);
        const off = ahora.getTimezoneOffset();
        const local = new Date(ahora.getTime() - off * 60_000);
        return local.toISOString().slice(0, 16);
    })();

    const guardar = async () => {
        setError(null);
        if (!nuevaFecha) {
            setError('Debes elegir una nueva fecha límite.');
            return;
        }
        const nuevaDate = new Date(nuevaFecha);
        if (isNaN(nuevaDate.getTime())) {
            setError('La fecha seleccionada no es válida.');
            return;
        }
        if (nuevaDate <= new Date()) {
            setError('La nueva fecha debe ser posterior al momento actual.');
            return;
        }

        try {
            setGuardando(true);
            const actualizada = await ordenesTrabajoService.editarFechaLimite(
                orden.id,
                nuevaDate.toISOString(),
                motivo.trim() || undefined,
            );
            onSuccess(actualizada);
        } catch (e: any) {
            setError(
                e?.response?.data?.message ??
                    'No se pudo editar la fecha límite. Intenta de nuevo.',
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Editar fecha límite</h2>
                            <p className="text-sm text-gray-500">{orden.titulo}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                        <div className="flex justify-between gap-3">
                            <span className="text-gray-500">Fecha actual:</span>
                            <span className="font-medium text-gray-900 text-right">
                                {formatFechaLarga(orden.fechaLimite)}
                            </span>
                        </div>
                        {orden.fechaLimiteOriginal && orden.fechaLimiteOriginal !== orden.fechaLimite && (
                            <div className="flex justify-between gap-3">
                                <span className="text-gray-500">Original:</span>
                                <span className="text-gray-700 text-right">
                                    {formatFechaLarga(orden.fechaLimiteOriginal)}
                                </span>
                            </div>
                        )}
                        {orden.fechaExtendida && (
                            <div className="flex justify-between gap-3">
                                <span className="text-gray-500">Última edición:</span>
                                <span className="text-gray-700 text-right">
                                    {formatFechaLarga(orden.fechaExtendida)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Nueva fecha límite *
                        </label>
                        <input
                            type="datetime-local"
                            value={nuevaFecha}
                            min={minDatetime}
                            onChange={(e) => setNuevaFecha(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Motivo (opcional)
                        </label>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows={3}
                            placeholder="Ej. el empleado necesita más tiempo por carga adicional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p>
                            Se actualizará la fecha de la orden y de todas sus tareas. Las evidencias ya
                            subidas mantendrán su estado original (dentro o fuera de tiempo).
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        disabled={guardando}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardar}
                        disabled={guardando}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
}

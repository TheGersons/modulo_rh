import { useEffect, useState } from 'react';
import { APP_VERSION, fetchServerVersion } from '../utils/version';

const POLL_MS = 2 * 60 * 1000; // 2 min

/**
 * Detecta si el servidor publicó una nueva versión del frontend.
 * Hace polling cada 2 min y también re-verifica cuando la pestaña recupera el foco.
 */
export function useAppVersion(): { hayNueva: boolean; nuevaVersion: string | null } {
  const [nuevaVersion, setNuevaVersion] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const verificar = async () => {
      const remota = await fetchServerVersion();
      if (!activo) return;
      if (remota && remota !== APP_VERSION) {
        setNuevaVersion(remota);
      }
    };

    verificar();
    const interval = setInterval(verificar, POLL_MS);
    const onFocus = () => verificar();
    window.addEventListener('focus', onFocus);

    return () => {
      activo = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return { hayNueva: nuevaVersion !== null, nuevaVersion };
}

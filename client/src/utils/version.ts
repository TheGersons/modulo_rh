// Versión del bundle inyectada por Vite en build (define en vite.config.ts).
// En modo dev, __APP_VERSION__ no está definido por Vite, así que cae a 'dev'.
export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

interface VersionResp {
  version: string;
  builtAt?: string;
}

/**
 * Lee /version.json del servidor (sin cache). Devuelve null si no se puede.
 * En dev (donde no hay version.json) devuelve null y el caller no debe bloquear.
 */
export async function fetchServerVersion(): Promise<string | null> {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as VersionResp;
    return data.version ?? null;
  } catch {
    return null;
  }
}

/**
 * True si el servidor tiene una versión distinta a la del bundle actual.
 * Cuando no hay version.json (dev/local) devuelve false.
 */
export async function hayNuevaVersion(): Promise<boolean> {
  const remota = await fetchServerVersion();
  if (!remota) return false;
  return remota !== APP_VERSION;
}

/**
 * Pre-flight: si hay nueva versión, alerta al usuario y recarga la página.
 * Devuelve `true` cuando es seguro continuar (versión OK), `false` si se
 * forzó la recarga y la operación debe abortarse.
 */
export async function preflightVersion(
  mensaje = 'Hay una nueva versión disponible. Para evitar errores, debemos recargar antes de continuar.',
): Promise<boolean> {
  if (!(await hayNuevaVersion())) return true;
  alert(mensaje);
  window.location.reload();
  return false;
}

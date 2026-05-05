export const ROLES = ['admin', 'rrhh', 'jefe', 'empleado', 'auditor'] as const;
export type Role = (typeof ROLES)[number];

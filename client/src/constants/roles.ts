export const ROLES = ['admin', 'rrhh', 'jefe', 'empleado', 'auditor'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  rrhh: 'Recursos Humanos',
  jefe: 'Jefe',
  empleado: 'Empleado',
  auditor: 'Auditor',
};

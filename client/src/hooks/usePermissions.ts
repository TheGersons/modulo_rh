import { useAuth } from "../contexts/AuthContext";

export const usePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();

  const can = (action: string): boolean => {
    const permissions: Record<string, string[]> = {
      crear_orden: ["admin", "jefe", "empleado", "rrhh"], // TODOS
      aprobar_solicitud: ["admin", "jefe"],
      cerrar_periodo: ["admin", "rrhh"], // Solo admin y RRHH
      gestionar_kpis: ["admin", "jefe"],
      gestionar_empleados: ["admin", "rrhh"],
      asignar_revisores: ["admin"],
    };

    return permissions[action]?.includes(userRole || "") || false;
  };

  const isAdmin = userRole === "admin";
  const isJefe = userRole === "jefe";
  const isEmpleado = userRole === "empleado";
  const isRRHH = userRole === "rrhh";

  return {
    can,
    isAdmin,
    isJefe,
    isEmpleado,
    isRRHH,
    userRole,
  };
};

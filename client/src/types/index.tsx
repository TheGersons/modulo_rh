export interface User {
  id: string;
  email: string;
  role: string;
  nombre: string;
  areaId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface KPIData {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
}

export interface AreaData {
  name: string;
  performance: number;
  employees: number;
  manager: string;
}
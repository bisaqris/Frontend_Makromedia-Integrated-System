export type Role = 'SALES' | 'FINANCE' | 'PROJECT_MANAGER' | 'PRODUKSI' | 'DIREKTUR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

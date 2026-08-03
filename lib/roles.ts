import { Role } from '@/types/user';

export const ALL_ROLES: Role[] = [
  'SALES',
  'FINANCE',
  'PROJECT_MANAGER',
  'PRODUKSI',
  'DIREKTUR',
];

export const ROLE_LABELS: Record<Role, string> = {
  SALES: 'Sales & Marketing',
  FINANCE: 'Finance & Accounting',
  PROJECT_MANAGER: 'Project Manager',
  PRODUKSI: 'Tim Produksi',
  DIREKTUR: 'Direktur / Management',
};

/**
  * Method untuk cek apakah role user ada dalam role yg diijinkan
  */
export function hasAccess(userRole: Role | null | undefined, allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
}

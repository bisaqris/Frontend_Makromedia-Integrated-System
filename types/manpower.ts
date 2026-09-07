export type ManpowerStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_LEAVE' | 'INACTIVE';

export interface Skill {
  id: string;
  name: string;
  status?: 'ACTIVE' | 'INACTIVE';
  usedBy?: number; 
  category?: string;
  createdAt?: string;
}

export interface CreateSkillDTO {
  name: string;
  status?: 'ACTIVE' | 'INACTIVE';
  category?: string;
}

export type UpdateSkillDTO = Partial<CreateSkillDTO>;
export interface Manpower {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  dailyRate: number;
  status: ManpowerStatus;
  skills: Skill[];
  avatarUrl?: string;
  currentProjectId?: string;
  currentProjectName?: string;
  createdAt?: string;
}


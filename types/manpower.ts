export type ManpowerStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_LEAVE' | 'INACTIVE';
export type EmploymentStatus = 'Fulltime' | 'Parttime' | 'Internship' | 'Freelance';
export type EmployeeStatus = 'Active' | 'Inactive';
export type Gender = 'Male' | 'Female';

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

export interface Position {
  id: string;
  name: string;
  status?: 'ACTIVE' | 'INACTIVE';
  usedBy?: number; 
  category?: string;
  createdAt?: string;
}

export interface CreatePositionDTO {
  name: string;
  status?: 'ACTIVE' | 'INACTIVE';
  category?: string;
}

export type UpdatePositionDTO = Partial<CreatePositionDTO>;
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

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  gender: Gender;
  role: string;
  position: string;
  email: string;
  phone: string;
  joinDate: string;
  employmentStatus: EmploymentStatus;
  status: EmployeeStatus;
  skills: string[];
  province: string;
  city: string;
  subdistrict: string;
  village: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}
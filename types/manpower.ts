export type ManpowerStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_LEAVE' | 'INACTIVE';
export type EmploymentStatus = 'Fulltime' | 'Parttime' | 'Internship' | 'Freelance';
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

/**
 * Data karyawan (manpower) sebagaimana dipakai halaman List/Detail/Edit Employee.
 * Satu sumber untuk seluruh halaman, diakses lewat manpowerService.
 */
export interface ManpowerRecord {
  id: string;
  fullName: string;
  gender: Gender;
  dateOfBirth?: string;
  email?: string;
  phoneNumber: string;
  position: string;
  employmentStatus: EmploymentStatus;
  skills: string[];
  province: string;
  city: string;
  subdistrict: string;
  village: string;
  detailAddress: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  joinDate: string;
}

export type CreateManpowerDTO = Omit<ManpowerRecord, 'id' | 'joinDate'> & {
  joinDate?: string;
};

export type UpdateManpowerDTO = Partial<CreateManpowerDTO>;
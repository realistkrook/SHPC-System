export enum UserRole {
  Admin = 'admin',
  Student = 'student',
  WhanauLeader = 'whanau_leader',
  Teacher = 'teacher',
}

export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface House {
  id: string;
  name: string;
  color: string;
  textColor: string;
  points: number;
  published_points?: number;
  published_at?: string | null;
}

export enum PointRequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface PointRequest {
  id: string;
  teacher_id: string | null;
  teacher_name?: string;
  house_id: string;
  house_name?: string;
  points: number;
  reason: string;
  status: PointRequestStatus;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
}

export interface StaffAccountInput {
  full_name: string;
  email: string;
  role: UserRole.Admin | UserRole.Teacher | UserRole.WhanauLeader;
  password: string;
}


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
  id: string; // foreign key to auth.users.id
  full_name: string;
  role: UserRole;
}

export interface House {
  id: string; // e.g., "raukawa"
  name: string; // e.g., "Raukawa"
  color: string; // e.g., "bg-purple-600"
  textColor: string; // e.g., "text-purple-600"
  points: number;
}

export enum PointRequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface PointRequest {
  id: string;
  teacher_id: string;
  teacher_name?: string; // populated for UI
  house_id: string;
  house_name?: string; // populated for UI
  points: number;
  reason: string;
  status: PointRequestStatus;
  submitted_at: Date;
  reviewed_by: string | null;
  reviewed_by_name?: string; // populated for UI
}

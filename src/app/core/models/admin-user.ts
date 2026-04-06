
export interface TeacherSummary {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  courseCount: number;
  createdAt: string;
}

export interface CreateTeacherDto {
  name: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  tempPassword: string;
}

export interface UpdateTeacherDto {
  name: string;
  phoneNumber?: string;
  bio?: string;
}

export interface StudentSummary {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  enrollmentCount: number;
  createdAt: string;
}

export interface StudentEnrollment {
  id: number;
  courseId: number;
  courseTitle: string;
  type: string;
  status: string;
  enrolledAt: string;
  expiresAt?: string;
}

export interface StudentPayment {
  id: number;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference?: string;
  paidAt?: string;
}

export interface StudentAttendance {
  id: number;
  lessonId: number;
  lessonTitle: string;
  attendedAt: string;
}

export interface StudentDetail {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  enrollments: StudentEnrollment[];
  payments: StudentPayment[];
  attendance: StudentAttendance[];
}

export interface ManualEnrollDto {
  courseId: number;
  type: string;
  expiresAt?: string;
}
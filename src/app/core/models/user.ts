export interface UserProfileModel {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export interface TeacherCourseModel {
  id: number;
  title: string;
  thumbnailUrl?: string;
  price: number;
  enrollmentCount: number;
}

export interface TeacherProfileModel {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  courses: TeacherCourseModel[];
}

export interface UpdateProfileDto {
  name: string;
  phoneNumber?: string;
  bio?: string;
}

export interface UpdateAvatarDto {
  avatarUrl: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
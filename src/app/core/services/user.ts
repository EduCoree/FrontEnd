import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  UserProfileModel,
  TeacherProfileModel,
  UpdateProfileDto,
  UpdateAvatarDto,
  ChangePasswordDto,
} from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = '/api/users';

  getMe() {
    return this.http.get<UserProfileModel>(`${this.base}/me`);
  }

  updateProfile(dto: UpdateProfileDto) {
    return this.http.put<UserProfileModel>(`${this.base}/me`, dto);
  }

  updateAvatar(dto: UpdateAvatarDto) {
    return this.http.put<UserProfileModel>(`${this.base}/me/avatar`, dto);
  }

  changePassword(dto: ChangePasswordDto) {
    return this.http.put<boolean>(`${this.base}/me/password`, dto);
  }

  getTeacherProfile(id: string) {
    return this.http.get<TeacherProfileModel>(`${this.base}/teachers/${id}/profile`);
  }
}
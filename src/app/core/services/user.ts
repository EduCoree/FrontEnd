import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  UserProfileModel,
  TeacherProfileModel,
  UpdateProfileDto,
  UpdateAvatarDto,
  ChangePasswordDto,
} from '../models/user';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/users`;

  getMe() {
    return this.http.get<UserProfileModel>(`${this.apiUrl}/me`);
  }

  updateProfile(dto: UpdateProfileDto) {
    return this.http.put<UserProfileModel>(`${this.apiUrl}/me`, dto);
  }

  updateAvatar(dto: UpdateAvatarDto) {
    return this.http.put<UserProfileModel>(`${this.apiUrl}/me/avatar`, dto);
  }

  changePassword(dto: ChangePasswordDto) {
    return this.http.put<boolean>(`${this.apiUrl}/me/password`, dto);
  }

  getTeacherProfile(id: string) {
    return this.http.get<TeacherProfileModel>(`${this.apiUrl}/teachers/${id}/profile`);
  }
}
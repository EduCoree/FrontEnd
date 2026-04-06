// src/app/core/services/admin-user.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  TeacherSummary,
  CreateTeacherDto,
  UpdateTeacherDto,
  StudentSummary,
  StudentDetail,
  ManualEnrollDto,
  StudentEnrollment,
} from '../models/admin-user';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/admin/users`;

  // Teachers 
  getTeachers(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<TeacherSummary[]>(`${this.base}/teachers`, { params });
  }

  createTeacher(dto: CreateTeacherDto) {
    return this.http.post<TeacherSummary>(`${this.base}/teachers`, dto);
  }

  updateTeacher(id: string, dto: UpdateTeacherDto) {
    return this.http.put<TeacherSummary>(`${this.base}/teachers/${id}`, dto);
  }

  activateTeacher(id: string) {
    return this.http.put<boolean>(`${this.base}/teachers/${id}/activate`, {});
  }

  deactivateTeacher(id: string) {
    return this.http.put<boolean>(`${this.base}/teachers/${id}/deactivate`, {});
  }

  //Students 
  getStudents(search?: string, isActive?: boolean) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', String(isActive));
    return this.http.get<StudentSummary[]>(`${this.base}/students`, { params });
  }

  getStudent(id: string) {
    return this.http.get<StudentDetail>(`${this.base}/students/${id}`);
  }

  activateStudent(id: string) {
    return this.http.put<boolean>(`${this.base}/students/${id}/activate`, {});
  }

  deactivateStudent(id: string) {
    return this.http.put<boolean>(`${this.base}/students/${id}/deactivate`, {});
  }

  enrollStudent(id: string, dto: ManualEnrollDto) {
    return this.http.post<StudentEnrollment>(`${this.base}/students/${id}/enroll`, dto);
  }
}
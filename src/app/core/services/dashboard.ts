import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminDashboard,
  TrendPoint,
  TopCourse,
  TeacherDashboard,
  StudentDashboard,
} from '../models/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // ── Admin ───────────────────────────────────────────
  getAdminDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.api}/api/admin/dashboard`);
  }

  getEnrollmentsTrend(days: number = 30): Observable<TrendPoint[]> {
    const params = new HttpParams().set('days', days);
    return this.http.get<TrendPoint[]>(`${this.api}/api/admin/dashboard/enrollments-trend`, { params });
  }

  getRevenueTrend(days: number = 30): Observable<TrendPoint[]> {
    const params = new HttpParams().set('days', days);
    return this.http.get<TrendPoint[]>(`${this.api}/api/admin/dashboard/revenue-trend`, { params });
  }

  getTopCourses(): Observable<TopCourse[]> {
    return this.http.get<TopCourse[]>(`${this.api}/api/admin/dashboard/top-courses`);
  }

  // ── Teacher ─────────────────────────────────────────
  getTeacherDashboard(): Observable<TeacherDashboard> {
    return this.http.get<TeacherDashboard>(`${this.api}/api/teacher/dashboard`);
  }

  // ── Student ─────────────────────────────────────────
  getStudentDashboard(): Observable<StudentDashboard> {
    return this.http.get<StudentDashboard>(`${this.api}/api/student/dashboard`);
  }
}
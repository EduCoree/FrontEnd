import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseFilterDto } from '../models/course';

@Injectable({ providedIn: 'root' })
export class PublicCourseService {

  private baseUrl = `${environment.apiUrl}/api/courses`;

  constructor(private http: HttpClient) {}

  // GET /api/courses
  getAllCourses(filter?: CourseFilterDto, page = 1, pageSize = 10): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', page)
      .set('pageSize', pageSize);

    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter?.level) params = params.set('level', filter.level);
    if (filter?.pricingType) params = params.set('pricingType', filter.pricingType);

    return this.http.get<any>(this.baseUrl, { params });
  }

  // GET /api/courses/:id
  getCourseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // GET /api/courses/my-courses
  getMyCoursesWithEnrollment(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/my-courses`);
  }
}